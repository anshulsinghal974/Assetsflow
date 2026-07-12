const router = require('express').Router();
const maintenanceController = require('../controllers/maintenanceController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { validate, schemas } = require('../middleware/validators');

// All maintenance routes require authentication
router.use(authMiddleware);

// List — any authenticated user
router.get('/', maintenanceController.listMaintenance);

// Raise — any authenticated user
router.post(
  '/',
  roleMiddleware('Admin', 'AssetManager', 'DeptHead', 'Employee'),
  validate(schemas.createMaintenance),
  maintenanceController.createMaintenance
);

// Approve / Reject — Admin or Asset Manager
router.patch('/:id/approve', roleMiddleware('Admin', 'AssetManager'), maintenanceController.approveMaintenance);
router.patch('/:id/reject', roleMiddleware('Admin', 'AssetManager'), maintenanceController.rejectMaintenance);

// Resolve — Admin or Asset Manager
router.patch('/:id/resolve', roleMiddleware('Admin', 'AssetManager'), maintenanceController.resolveMaintenance);

module.exports = router;
