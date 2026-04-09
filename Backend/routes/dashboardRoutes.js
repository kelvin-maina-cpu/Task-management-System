const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const dashboardController = require('../controllers/dashboardController');

// All routes require authentication
router.use(authMiddleware);

router.get('/stats', dashboardController.getDashboardStats);
router.get('/activity', dashboardController.getRecentActivity);
router.get('/initial-data', dashboardController.getInitialData);

module.exports = router;

