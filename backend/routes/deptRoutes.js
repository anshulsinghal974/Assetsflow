const router = require('express').Router();
const deptController = require('../controllers/deptController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { validate, schemas } = require('../middleware/validators');

// All department routes require authentication
router.use(authMiddleware);

// Read — any authenticated user
router.get('/', deptController.listDepartments);
router.get('/:id', deptController.getDepartment);

// Write — Admin only
router.post('/', roleMiddleware('Admin'), validate(schemas.createDepartment), deptController.createDepartment);
router.put('/:id', roleMiddleware('Admin'), validate(schemas.updateDepartment), deptController.updateDepartment);
router.delete('/:id', roleMiddleware('Admin'), deptController.deleteDepartment);

module.exports = router;
