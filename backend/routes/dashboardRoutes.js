const express = require('express');
const { getDashboardStats } = require('../controllers/dashboardController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/stats', protect, restrictTo('super-admin'), getDashboardStats);

module.exports = router;