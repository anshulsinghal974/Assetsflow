const router = require('express').Router();
const allocationController = require('../controllers/allocationController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { validate, schemas } = require('../middleware/validators');

// All allocation routes require authentication
router.use(authMiddleware);

// List — any authenticated user (filtered by own allocations for Employee)
router.get('/', allocationController.listAllocations);

// Create — Admin, Asset Manager, or Dept Head
router.post(
  '/',
  roleMiddleware('Admin', 'AssetManager', 'DeptHead'),
  validate(schemas.createAllocation),
  allocationController.createAllocation
);

// Return — Admin, Asset Manager, Dept Head, or the allocated Employee
router.patch(
  '/:id/return',
  roleMiddleware('Admin', 'AssetManager', 'DeptHead', 'Employee'),
  validate(schemas.returnAllocation),
  allocationController.returnAllocation
);

module.exports = router;
