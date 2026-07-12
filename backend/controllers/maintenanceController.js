const MaintenanceRequest = require('../models/MaintenanceRequest');
const Asset = require('../models/Asset');
const asyncHandler = require('../middleware/asyncHandler');

// ---------------------------------------------------------------------------
// POST /api/maintenance — Raise a maintenance request
// Note: Asset status does NOT change when a request is raised — only when
// it is Approved (Rule #3).
// ---------------------------------------------------------------------------
exports.createMaintenance = asyncHandler(async (req, res) => {
  const { asset: assetId, issue, priority, photoUrl } = req.body;

  const asset = await Asset.findById(assetId);
  if (!asset) return res.status(404).json({ success: false, message: 'Asset not found.' });

  const request = await MaintenanceRequest.create({
    asset: assetId,
    raisedBy: req.user._id,
    issue,
    priority: priority || 'Medium',
    photoUrl: photoUrl || null,
  });

  const populated = await MaintenanceRequest.findById(request._id)
    .populate('asset', 'assetTag name')
    .populate('raisedBy', 'name email');

  res.status(201).json({ success: true, data: populated });
});

// ---------------------------------------------------------------------------
// PATCH /api/maintenance/:id/approve
//
// *** RULE #3 — Asset → UnderMaintenance only when maintenance is Approved ***
// ---------------------------------------------------------------------------
exports.approveMaintenance = asyncHandler(async (req, res) => {
  const request = await MaintenanceRequest.findById(req.params.id);
  if (!request) return res.status(404).json({ success: false, message: 'Maintenance request not found.' });

  if (request.status !== 'Pending') {
    return res.status(400).json({ success: false, message: `Request is already ${request.status}.` });
  }

  request.status = 'Approved';
  request.approvedBy = req.user._id;
  await request.save();

  // Rule #3 — transition asset to UnderMaintenance
  await Asset.findByIdAndUpdate(request.asset, { status: 'UnderMaintenance' });

  const populated = await MaintenanceRequest.findById(request._id)
    .populate('asset', 'assetTag name')
    .populate('raisedBy', 'name email')
    .populate('approvedBy', 'name email');

  res.status(200).json({ success: true, data: populated });
});

// ---------------------------------------------------------------------------
// PATCH /api/maintenance/:id/reject
// ---------------------------------------------------------------------------
exports.rejectMaintenance = asyncHandler(async (req, res) => {
  const request = await MaintenanceRequest.findById(req.params.id);
  if (!request) return res.status(404).json({ success: false, message: 'Maintenance request not found.' });

  if (request.status !== 'Pending') {
    return res.status(400).json({ success: false, message: `Request is already ${request.status}.` });
  }

  request.status = 'Rejected';
  request.approvedBy = req.user._id;
  await request.save();

  const populated = await MaintenanceRequest.findById(request._id)
    .populate('asset', 'assetTag name')
    .populate('raisedBy', 'name email');

  res.status(200).json({ success: true, data: populated });
});

// ---------------------------------------------------------------------------
// PATCH /api/maintenance/:id/resolve
//
// *** RULE #3 — Asset → Available only when maintenance is Resolved ***
// ---------------------------------------------------------------------------
exports.resolveMaintenance = asyncHandler(async (req, res) => {
  const request = await MaintenanceRequest.findById(req.params.id);
  if (!request) return res.status(404).json({ success: false, message: 'Maintenance request not found.' });

  if (request.status !== 'Approved') {
    return res.status(400).json({ success: false, message: 'Only Approved requests can be resolved.' });
  }

  request.status = 'Resolved';
  await request.save();

  // Rule #3 — transition asset back to Available
  await Asset.findByIdAndUpdate(request.asset, { status: 'Available' });

  const populated = await MaintenanceRequest.findById(request._id)
    .populate('asset', 'assetTag name')
    .populate('raisedBy', 'name email')
    .populate('approvedBy', 'name email');

  res.status(200).json({ success: true, data: populated });
});

// ---------------------------------------------------------------------------
// GET /api/maintenance — List maintenance requests
// ---------------------------------------------------------------------------
exports.listMaintenance = asyncHandler(async (req, res) => {
  const { asset, status, priority, page = 1, limit = 20 } = req.query;

  const filter = {};
  if (asset) filter.asset = asset;
  if (status) filter.status = status;
  if (priority) filter.priority = priority;

  const skip = (Number(page) - 1) * Number(limit);

  const [requests, total] = await Promise.all([
    MaintenanceRequest.find(filter)
      .populate('asset', 'assetTag name')
      .populate('raisedBy', 'name email')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    MaintenanceRequest.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: requests,
    pagination: { page: Number(page), limit: Number(limit), total },
  });
});
