const router = require('express').Router();
const categoryController = require('../controllers/categoryController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { validate, schemas } = require('../middleware/validators');

// All category routes require authentication
router.use(authMiddleware);

// Read — any authenticated user
router.get('/', categoryController.listCategories);
router.get('/:id', categoryController.getCategory);

// Write — Admin only
router.post('/', roleMiddleware('Admin'), validate(schemas.createCategory), categoryController.createCategory);
router.put('/:id', roleMiddleware('Admin'), validate(schemas.updateCategory), categoryController.updateCategory);
router.delete('/:id', roleMiddleware('Admin'), categoryController.deleteCategory);

module.exports = router;
