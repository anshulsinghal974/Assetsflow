const router = require('express').Router();
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/authMiddleware');

// Dashboard KPIs — any authenticated user
router.get('/kpis', authMiddleware, dashboardController.getKPIs);

module.exports = router;
