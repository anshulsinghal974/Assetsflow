const Department = require('../models/Department');
const asyncHandler = require('../middleware/asyncHandler');

// ---------------------------------------------------------------------------
// POST /api/departments
// ---------------------------------------------------------------------------
exports.createDepartment = asyncHandler(async (req, res) => {
  const department = await Department.create(req.body);
  res.status(201).json({ success: true, data: department });
});

// ---------------------------------------------------------------------------
// GET /api/departments
// ---------------------------------------------------------------------------
exports.listDepartments = asyncHandler(async (req, res) => {
  const { status, search } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (search) filter.name = { $regex: search, $options: 'i' };

  const departments = await Department.find(filter)
    .populate('parent', 'name')
    .populate('head', 'name email')
    .sort({ name: 1 });

  res.status(200).json({ success: true, data: departments });
});

// ---------------------------------------------------------------------------
// GET /api/departments/:id
// ---------------------------------------------------------------------------
exports.getDepartment = asyncHandler(async (req, res) => {
  const department = await Department.findById(req.params.id)
    .populate('parent', 'name')
    .populate('head', 'name email');

  if (!department) {
    return res.status(404).json({ success: false, message: 'Department not found.' });
  }
  res.status(200).json({ success: true, data: department });
});

// ---------------------------------------------------------------------------
// PUT /api/departments/:id
// ---------------------------------------------------------------------------
exports.updateDepartment = asyncHandler(async (req, res) => {
  const department = await Department.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })
    .populate('parent', 'name')
    .populate('head', 'name email');

  if (!department) {
    return res.status(404).json({ success: false, message: 'Department not found.' });
  }
  res.status(200).json({ success: true, data: department });
});

// ---------------------------------------------------------------------------
// DELETE /api/departments/:id
// ---------------------------------------------------------------------------
exports.deleteDepartment = asyncHandler(async (req, res) => {
  const department = await Department.findByIdAndDelete(req.params.id);
  if (!department) {
    return res.status(404).json({ success: false, message: 'Department not found.' });
  }
  res.status(200).json({ success: true, message: 'Department deleted.' });
});
