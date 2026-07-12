const router = require('express').Router();
const employeeController = require('../controllers/employeeController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { validate, schemas } = require('../middleware/validators');

// All employee routes require authentication
router.use(authMiddleware);

// GET /api/employees — directory (any authenticated user)
router.get('/', employeeController.listEmployees);

// GET /api/employees/:id
router.get('/:id', employeeController.getEmployee);

// PATCH /api/employees/:id/promote — Admin only (Rule #5)
router.patch(
  '/:id/promote',
  roleMiddleware('Admin'),
  validate(schemas.promoteEmployee),
  employeeController.promoteEmployee
);

module.exports = router;
