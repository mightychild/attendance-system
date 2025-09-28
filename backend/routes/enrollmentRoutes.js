const express = require('express');
const {
  enrollInCourse,
  getStudentEnrollments,
  getCourseEnrollments,
  dropEnrollment,
  markAttendance,
  getStudentCourseAttendance
} = require('../controllers/enrollmentController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

// Protect all routes
router.use(protect);

// Student routes
router.post('/', restrictTo('student'), enrollInCourse);
router.get('/student/:studentId', getStudentEnrollments);
router.get('/student/:studentId/course/:courseId', getStudentCourseAttendance);
router.patch('/:enrollmentId/drop', dropEnrollment);

// Lecturer and Admin routes
router.get('/course/:courseId', restrictTo('lecturer', 'super-admin'), getCourseEnrollments);
router.post('/:enrollmentId/attendance', restrictTo('lecturer', 'super-admin'), markAttendance);

module.exports = router;