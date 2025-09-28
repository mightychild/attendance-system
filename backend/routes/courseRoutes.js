const express = require('express');
const {
  getAllCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  getCoursesByLecturer,
  getCourseStats
} = require('../controllers/courseController');


const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes (protected but no role restriction)
router.get('/', protect, getAllCourses);
router.get('/:id', protect, getCourse);
router.get('/lecturer/:lecturerId', protect, getCoursesByLecturer);
router.get('/stats', protect, restrictTo('super-admin'), getCourseStats);

// Super Admin only routes
router.use(protect, restrictTo('super-admin'));
router.post('/', createCourse);
router.patch('/:id', updateCourse);
router.delete('/:id', deleteCourse);

module.exports = router;