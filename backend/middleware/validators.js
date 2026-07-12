const Joi = require('joi');

// ---------------------------------------------------------------------------
// Reusable helpers
// ---------------------------------------------------------------------------
const objectId = Joi.string().regex(/^[0-9a-fA-F]{24}$/).message('Invalid ObjectId');

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------
const signup = Joi.object({
  name: Joi.string().trim().min(1).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(128).required(),
  department: objectId.allow(null, ''),
});

const login = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const forgotPassword = Joi.object({
  email: Joi.string().email().required(),
});

// ---------------------------------------------------------------------------
// Employee
// ---------------------------------------------------------------------------
const promoteEmployee = Joi.object({
  role: Joi.string().valid('Employee', 'DeptHead', 'AssetManager', 'Admin').required(),
});

// ---------------------------------------------------------------------------
// Department
// ---------------------------------------------------------------------------
const createDepartment = Joi.object({
  name: Joi.string().trim().min(1).max(100).required(),
  parent: objectId.allow(null, ''),
  head: objectId.allow(null, ''),
  status: Joi.string().valid('Active', 'Inactive'),
});

const updateDepartment = Joi.object({
  name: Joi.string().trim().min(1).max(100),
  parent: objectId.allow(null, ''),
  head: objectId.allow(null, ''),
  status: Joi.string().valid('Active', 'Inactive'),
}).min(1);

// ---------------------------------------------------------------------------
// Category
// ---------------------------------------------------------------------------
const createCategory = Joi.object({
  name: Joi.string().trim().min(1).max(100).required(),
  customFields: Joi.alternatives().try(
    Joi.array().items(Joi.string().trim()),
    Joi.object()
  ).default([]),
});

const updateCategory = Joi.object({
  name: Joi.string().trim().min(1).max(100),
  customFields: Joi.alternatives().try(
    Joi.array().items(Joi.string().trim()),
    Joi.object()
  ),
}).min(1);

// ---------------------------------------------------------------------------
// Asset
// ---------------------------------------------------------------------------
const createAsset = Joi.object({
  name: Joi.string().trim().min(1).max(200).required(),
  category: objectId.required(),
  serialNumber: Joi.string().trim().allow(null, ''),
  qrCode: Joi.string().allow(null, ''),
  acquisitionDate: Joi.date().iso().allow(null),
  acquisitionCost: Joi.number().min(0).default(0),
  condition: Joi.string().valid('New', 'Good', 'Fair', 'Poor', 'Damaged'),
  location: Joi.string().trim().allow(''),
  department: objectId.allow(null, ''),
  status: Joi.string().valid(
    'Available', 'Allocated', 'Reserved', 'UnderMaintenance', 'Lost', 'Retired', 'Disposed'
  ),
  isBookable: Joi.boolean(),
  photoUrl: Joi.string().uri().allow(null, ''),
  documentUrls: Joi.array().items(Joi.string().uri()),
});

const updateAsset = Joi.object({
  name: Joi.string().trim().min(1).max(200),
  category: objectId,
  serialNumber: Joi.string().trim().allow(null, ''),
  qrCode: Joi.string().allow(null, ''),
  acquisitionDate: Joi.date().iso().allow(null),
  acquisitionCost: Joi.number().min(0),
  condition: Joi.string().valid('New', 'Good', 'Fair', 'Poor', 'Damaged'),
  location: Joi.string().trim().allow(''),
  department: objectId.allow(null, ''),
  status: Joi.string().valid(
    'Available', 'Allocated', 'Reserved', 'UnderMaintenance', 'Lost', 'Retired', 'Disposed'
  ),
  isBookable: Joi.boolean(),
  photoUrl: Joi.string().uri().allow(null, ''),
  documentUrls: Joi.array().items(Joi.string().uri()),
}).min(1);

// ---------------------------------------------------------------------------
// Allocation
// ---------------------------------------------------------------------------
const createAllocation = Joi.object({
  asset: objectId.required(),
  employee: objectId.required(),
  expectedReturnDate: Joi.date().iso().allow(null),
});

const returnAllocation = Joi.object({
  conditionCheckIn: Joi.string().valid('New', 'Good', 'Fair', 'Poor', 'Damaged'),
});

// ---------------------------------------------------------------------------
// Transfer
// ---------------------------------------------------------------------------
const createTransfer = Joi.object({
  asset: objectId.required(),
  toUser: objectId.required(),
});

// ---------------------------------------------------------------------------
// Booking
// ---------------------------------------------------------------------------
const createBooking = Joi.object({
  asset: objectId.required(),
  startTime: Joi.date().iso().required(),
  endTime: Joi.date().iso().greater(Joi.ref('startTime')).required(),
});

const rescheduleBooking = Joi.object({
  startTime: Joi.date().iso().required(),
  endTime: Joi.date().iso().greater(Joi.ref('startTime')).required(),
});

// ---------------------------------------------------------------------------
// Maintenance
// ---------------------------------------------------------------------------
const createMaintenance = Joi.object({
  asset: objectId.required(),
  issue: Joi.string().trim().min(1).max(1000).required(),
  priority: Joi.string().valid('Low', 'Medium', 'High', 'Critical'),
  photoUrl: Joi.string().uri().allow(null, ''),
});

// ---------------------------------------------------------------------------
// Validation middleware factory
// ---------------------------------------------------------------------------
const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    const messages = error.details.map((d) => d.message);
    return res.status(400).json({ success: false, message: 'Validation failed', errors: messages });
  }
  req.body = value; // use sanitized value
  next();
};

module.exports = {
  validate,
  schemas: {
    signup,
    login,
    forgotPassword,
    promoteEmployee,
    createDepartment,
    updateDepartment,
    createCategory,
    updateCategory,
    createAsset,
    updateAsset,
    createAllocation,
    returnAllocation,
    createTransfer,
    createBooking,
    rescheduleBooking,
    createMaintenance,
  },
};
