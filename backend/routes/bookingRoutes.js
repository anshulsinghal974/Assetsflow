const router = require('express').Router();
const bookingController = require('../controllers/bookingController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { validate, schemas } = require('../middleware/validators');

// All booking routes require authentication
router.use(authMiddleware);

// List — any authenticated user
router.get('/', bookingController.listBookings);

// Create — any authenticated user (Employee can book for self, DeptHead for dept)
router.post(
  '/',
  roleMiddleware('Admin', 'AssetManager', 'DeptHead', 'Employee'),
  validate(schemas.createBooking),
  bookingController.createBooking
);

// Cancel — any authenticated user (own bookings)
router.patch(
  '/:id/cancel',
  roleMiddleware('Admin', 'AssetManager', 'DeptHead', 'Employee'),
  bookingController.cancelBooking
);

// Reschedule — any authenticated user (own bookings)
router.patch(
  '/:id/reschedule',
  roleMiddleware('Admin', 'AssetManager', 'DeptHead', 'Employee'),
  validate(schemas.rescheduleBooking),
  bookingController.rescheduleBooking
);

module.exports = router;
