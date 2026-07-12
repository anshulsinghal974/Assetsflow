const Asset = require('../models/Asset');
const Allocation = require('../models/Allocation');
const ResourceBooking = require('../models/ResourceBooking');
const MaintenanceRequest = require('../models/MaintenanceRequest');
const asyncHandler = require('../middleware/asyncHandler');

// ---------------------------------------------------------------------------
// POST /api/assets — Create asset (tag auto-generated atomically, Rule #6)
// ---------------------------------------------------------------------------
exports.createAsset = asyncHandler(async (req, res) => {
  // assetTag is generated in the Asset model's pre-save hook via Counter
  const asset = new Asset(req.body);
  await asset.save();

  const populated = await Asset.findById(asset._id)
    .populate('category', 'name')
    .populate('department', 'name');

  res.status(201).json({ success: true, data: populated });
});

// ---------------------------------------------------------------------------
// GET /api/assets — List / search / filter assets
// ---------------------------------------------------------------------------
exports.listAssets = asyncHandler(async (req, res) => {
  const {
    status, category, department, isBookable, condition,
    search, page = 1, limit = 20,
  } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (category) filter.category = category;
  if (department) filter.department = department;
  if (isBookable !== undefined) filter.isBookable = isBookable === 'true';
  if (condition) filter.condition = condition;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { assetTag: { $regex: search, $options: 'i' } },
      { serialNumber: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [assets, total] = await Promise.all([
    Asset.find(filter)
      .populate('category', 'name')
      .populate('department', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Asset.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: assets,
    pagination: { page: Number(page), limit: Number(limit), total },
  });
});

// ---------------------------------------------------------------------------
// GET /api/assets/:id
// ---------------------------------------------------------------------------
exports.getAsset = asyncHandler(async (req, res) => {
  const asset = await Asset.findById(req.params.id)
    .populate('category', 'name')
    .populate('department', 'name');

  if (!asset) {
    return res.status(404).json({ success: false, message: 'Asset not found.' });
  }
  res.status(200).json({ success: true, data: asset });
});

// ---------------------------------------------------------------------------
// PUT /api/assets/:id
// ---------------------------------------------------------------------------
exports.updateAsset = asyncHandler(async (req, res) => {
  // Prevent overwriting the auto-generated assetTag
  delete req.body.assetTag;

  const asset = await Asset.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })
    .populate('category', 'name')
    .populate('department', 'name');

  if (!asset) {
    return res.status(404).json({ success: false, message: 'Asset not found.' });
  }
  res.status(200).json({ success: true, data: asset });
});

// ---------------------------------------------------------------------------
// DELETE /api/assets/:id
// ---------------------------------------------------------------------------
exports.deleteAsset = asyncHandler(async (req, res) => {
  const asset = await Asset.findByIdAndDelete(req.params.id);
  if (!asset) {
    return res.status(404).json({ success: false, message: 'Asset not found.' });
  }
  res.status(200).json({ success: true, message: 'Asset deleted.' });
});

// ---------------------------------------------------------------------------
// GET /api/assets/:id/history — aggregated history for one asset
// Returns allocation, booking, and maintenance records.
// ---------------------------------------------------------------------------
exports.getAssetHistory = asyncHandler(async (req, res) => {
  const assetId = req.params.id;

  // Verify asset exists
  const asset = await Asset.findById(assetId);
  if (!asset) {
    return res.status(404).json({ success: false, message: 'Asset not found.' });
  }

  const [allocations, bookings, maintenance] = await Promise.all([
    Allocation.find({ asset: assetId })
      .populate('employee', 'name email')
      .sort({ allocatedDate: -1 }),
    ResourceBooking.find({ asset: assetId })
      .populate('bookedBy', 'name email')
      .sort({ startTime: -1 }),
    MaintenanceRequest.find({ asset: assetId })
      .populate('raisedBy', 'name email')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 }),
  ]);

  res.status(200).json({
    success: true,
    data: { allocations, bookings, maintenance },
  });
});
