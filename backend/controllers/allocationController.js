const mongoose = require('mongoose');
const Allocation = require('../models/Allocation');
const Asset = require('../models/Asset');
const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');

// ---------------------------------------------------------------------------
// POST /api/allocations — Create allocation
//
// *** RULE #1 — No double-allocation ***
// Before inserting, atomically check for an existing Active allocation on
// the target asset.  Uses a Mongoose transaction so that the read-then-write
// is serialized — no race condition can create two Active allocations.
//
// Additional safety net: the Allocation model has a partial unique index
// on { asset: 1 } where status === 'Active', so even if a transaction
// isn't supported (e.g., standalone Mongo), the DB will reject the dupe.
// ---------------------------------------------------------------------------
exports.createAllocation = asyncHandler(async (req, res) => {
  const { asset: assetId, employee: employeeId, expectedReturnDate } = req.body;

  // Validate that asset and employee exist
  const [asset, employee] = await Promise.all([
    Asset.findById(assetId),
    User.findById(employeeId),
  ]);
  if (!asset) return res.status(404).json({ success: false, message: 'Asset not found.' });
  if (!employee) return res.status(404).json({ success: false, message: 'Employee not found.' });

  // --- Atomic double-allocation check (transaction) ---
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Check for existing Active allocation on this asset
    const existing = await Allocation.findOne({ asset: assetId, status: 'Active' })
      .populate('employee', 'name email')
      .session(session);

    if (existing) {
      await session.abortTransaction();
      session.endSession();
      return res.status(409).json({
        success: false,
        message: 'Asset is already allocated.',
        heldBy: { _id: existing.employee._id, name: existing.employee.name, email: existing.employee.email },
      });
    }

    // Create the allocation within the transaction
    const [allocation] = await Allocation.create(
      [{
        asset: assetId,
        employee: employeeId,
        expectedReturnDate: expectedReturnDate || null,
      }],
      { session }
    );

    // Update asset status to Allocated
    await Asset.findByIdAndUpdate(assetId, { status: 'Allocated' }, { session });

    await session.commitTransaction();
    session.endSession();

    const populated = await Allocation.findById(allocation._id)
      .populate('asset', 'assetTag name')
      .populate('employee', 'name email');

    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    // Handle the partial-unique-index duplicate key error as a 409
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Asset is already allocated (concurrent request detected).',
      });
    }
    throw err; // re-throw for centralized error handler
  }
});

// ---------------------------------------------------------------------------
// PATCH /api/allocations/:id/return — Return an allocated asset
// ---------------------------------------------------------------------------
exports.returnAllocation = asyncHandler(async (req, res) => {
  const allocation = await Allocation.findById(req.params.id);
  if (!allocation) {
    return res.status(404).json({ success: false, message: 'Allocation not found.' });
  }
  if (allocation.status !== 'Active' && allocation.status !== 'Overdue') {
    return res.status(400).json({ success: false, message: 'Allocation is not active.' });
  }

  allocation.status = 'Returned';
  allocation.actualReturnDate = new Date();
  if (req.body.conditionCheckIn) {
    allocation.conditionCheckIn = req.body.conditionCheckIn;
  }
  await allocation.save();

  // Set asset back to Available
  await Asset.findByIdAndUpdate(allocation.asset, { status: 'Available' });

  const populated = await Allocation.findById(allocation._id)
    .populate('asset', 'assetTag name')
    .populate('employee', 'name email');

  res.status(200).json({ success: true, data: populated });
});

// ---------------------------------------------------------------------------
// GET /api/allocations — List allocations (filterable)
//
// Rule #4: Overdue is computed — if expectedReturnDate < now and status is
// Active, we mark it as Overdue in the response (derived, not persisted).
// ---------------------------------------------------------------------------
exports.listAllocations = asyncHandler(async (req, res) => {
  const { employee, department, status, page = 1, limit = 20 } = req.query;

  const filter = {};
  if (employee) filter.employee = employee;
  if (status) filter.status = status;

  // If filtering by department, find users in that department first
  if (department) {
    const usersInDept = await User.find({ department }).select('_id');
    filter.employee = { $in: usersInDept.map((u) => u._id) };
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [allocations, total] = await Promise.all([
    Allocation.find(filter)
      .populate('asset', 'assetTag name status')
      .populate('employee', 'name email department')
      .sort({ allocatedDate: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Allocation.countDocuments(filter),
  ]);

  // Rule #4 — Compute overdue status on the fly
  const now = new Date();
  const enriched = allocations.map((a) => {
    const obj = a.toObject();
    if (obj.status === 'Active' && obj.expectedReturnDate && new Date(obj.expectedReturnDate) < now) {
      obj.status = 'Overdue';
    }
    return obj;
  });

  res.status(200).json({
    success: true,
    data: enriched,
    pagination: { page: Number(page), limit: Number(limit), total },
  });
});
