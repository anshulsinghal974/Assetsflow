const router = require('express').Router();
const transferController = require('../controllers/transferController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { validate, schemas } = require('../middleware/validators');

// All transfer routes require authentication
router.use(authMiddleware);

// List — any authenticated user
router.get('/', transferController.listTransfers);

// Create transfer request — any authenticated user
router.post(
  '/',
  roleMiddleware('Admin', 'AssetManager', 'DeptHead', 'Employee'),
  validate(schemas.createTransfer),
  transferController.createTransfer
);

// Approve / Reject — Admin or Asset Manager
router.patch('/:id/approve', roleMiddleware('Admin', 'AssetManager', 'DeptHead'), transferController.approveTransfer);
router.patch('/:id/reject', roleMiddleware('Admin', 'AssetManager', 'DeptHead'), transferController.rejectTransfer);

module.exports = router;
