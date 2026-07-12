const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');

// ---------------------------------------------------------------------------
// GET /api/employees — Employee Directory
// ---------------------------------------------------------------------------
exports.listEmployees = asyncHandler(async (req, res) => {
  const { department, role, status, search, page = 1, limit = 20 } = req.query;

  const filter = {};
  if (department) filter.department = department;
  if (role) filter.role = role;
  if (status) filter.status = status;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [employees, total] = await Promise.all([
    User.find(filter)
      .populate('department', 'name')
      .sort({ name: 1 })
      .skip(skip)
      .limit(Number(limit)),
    User.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: employees,
    pagination: { page: Number(page), limit: Number(limit), total },
  });
});

// ---------------------------------------------------------------------------
// GET /api/employees/:id
// ---------------------------------------------------------------------------
exports.getEmployee = asyncHandler(async (req, res) => {
  const employee = await User.findById(req.params.id).populate('department', 'name');
  if (!employee) {
    return res.status(404).json({ success: false, message: 'Employee not found.' });
  }
  res.status(200).json({ success: true, data: employee });
});

// ---------------------------------------------------------------------------
// PATCH /api/employees/:id/promote — Admin only
// Rule #5: roles change ONLY via this endpoint.
// ---------------------------------------------------------------------------
exports.promoteEmployee = asyncHandler(async (req, res) => {
  const { role } = req.body;

  const employee = await User.findById(req.params.id);
  if (!employee) {
    return res.status(404).json({ success: false, message: 'Employee not found.' });
  }

  employee.role = role;
  await employee.save();

  res.status(200).json({ success: true, data: employee });
});
