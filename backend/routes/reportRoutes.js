const express = require('express');
const {
  downloadAttendanceReport,
  getCoursePerformanceReport
} = require('../controllers/reportController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/attendance/:courseId', restrictTo('lecturer'), downloadAttendanceReport);
router.get('/performance/:courseId', restrictTo('lecturer'), getCoursePerformanceReport);

module.exports = router;