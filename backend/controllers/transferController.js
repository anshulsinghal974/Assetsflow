const TransferRequest = require('../models/TransferRequest');
const Allocation = require('../models/Allocation');
const Asset = require('../models/Asset');
const asyncHandler = require('../middleware/asyncHandler');

// ---------------------------------------------------------------------------
// POST /api/transfers — Request a transfer
// The requester is the currently-authenticated user. fromUser is the current
// holder of the asset (looked up from the Active allocation).
// ---------------------------------------------------------------------------
exports.createTransfer = asyncHandler(async (req, res) => {
  const { asset: assetId, toUser } = req.body;

  // Find the current active allocation to determine fromUser
  const activeAlloc = await Allocation.findOne({ asset: assetId, status: 'Active' });
  if (!activeAlloc) {
    return res.status(400).json({
      success: false,
      message: 'Asset is not currently allocated — cannot transfer.',
    });
  }

  const transfer = await TransferRequest.create({
    asset: assetId,
    fromUser: activeAlloc.employee,
    toUser,
    requestedBy: req.user._id,
  });

  const populated = await TransferRequest.findById(transfer._id)
    .populate('asset', 'assetTag name')
    .populate('fromUser', 'name email')
    .populate('toUser', 'name email')
    .populate('requestedBy', 'name email');

  res.status(201).json({ success: true, data: populated });
});

// ---------------------------------------------------------------------------
// PATCH /api/transfers/:id/approve — Approve & reallocate
// Ends current allocation, creates a new one for toUser, updates asset.
// ---------------------------------------------------------------------------
exports.approveTransfer = asyncHandler(async (req, res) => {
  const transfer = await TransferRequest.findById(req.params.id);
  if (!transfer) {
    return res.status(404).json({ success: false, message: 'Transfer request not found.' });
  }
  if (transfer.status !== 'Requested') {
    return res.status(400).json({ success: false, message: `Transfer is already ${transfer.status}.` });
  }

  // End the existing allocation
  await Allocation.findOneAndUpdate(
    { asset: transfer.asset, status: 'Active' },
    { status: 'Returned', actualReturnDate: new Date() }
  );

  // Create a new allocation for toUser
  await Allocation.create({
    asset: transfer.asset,
    employee: transfer.toUser,
  });

  // Update transfer
  transfer.status = 'Reallocated';
  transfer.approvedBy = req.user._id;
  await transfer.save();

  // Asset stays Allocated (just a different holder)
  await Asset.findByIdAndUpdate(transfer.asset, { status: 'Allocated' });

  const populated = await TransferRequest.findById(transfer._id)
    .populate('asset', 'assetTag name')
    .populate('fromUser', 'name email')
    .populate('toUser', 'name email')
    .populate('approvedBy', 'name email');

  res.status(200).json({ success: true, data: populated });
});

// ---------------------------------------------------------------------------
// PATCH /api/transfers/:id/reject
// ---------------------------------------------------------------------------
exports.rejectTransfer = asyncHandler(async (req, res) => {
  const transfer = await TransferRequest.findById(req.params.id);
  if (!transfer) {
    return res.status(404).json({ success: false, message: 'Transfer request not found.' });
  }
  if (transfer.status !== 'Requested') {
    return res.status(400).json({ success: false, message: `Transfer is already ${transfer.status}.` });
  }

  transfer.status = 'Rejected';
  transfer.approvedBy = req.user._id;
  await transfer.save();

  const populated = await TransferRequest.findById(transfer._id)
    .populate('asset', 'assetTag name')
    .populate('fromUser', 'name email')
    .populate('toUser', 'name email');

  res.status(200).json({ success: true, data: populated });
});

// ---------------------------------------------------------------------------
// GET /api/transfers — List transfer requests
// ---------------------------------------------------------------------------
exports.listTransfers = asyncHandler(async (req, res) => {
  const { status, asset, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (asset) filter.asset = asset;

  const skip = (Number(page) - 1) * Number(limit);

  const [transfers, total] = await Promise.all([
    TransferRequest.find(filter)
      .populate('asset', 'assetTag name')
      .populate('fromUser', 'name email')
      .populate('toUser', 'name email')
      .populate('requestedBy', 'name email')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    TransferRequest.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: transfers,
    pagination: { page: Number(page), limit: Number(limit), total },
  });
});
