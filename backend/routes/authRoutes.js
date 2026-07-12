const router = require('express').Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const { validate, schemas } = require('../middleware/validators');

// Public routes
router.post('/signup', validate(schemas.signup), authController.signup);
router.post('/login', validate(schemas.login), authController.login);
router.post('/logout', authController.logout);
router.post('/forgot-password', validate(schemas.forgotPassword), authController.forgotPassword);

// Protected route
router.get('/me', authMiddleware, authController.getMe);

module.exports = router;
