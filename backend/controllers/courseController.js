const Course = require('../models/Course');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

// @desc    Get all courses
// @route   GET /api/courses
// @access  Private
exports.getAllCourses = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10, search, semester, year, lecturer } = req.query;
  
  let query = { isActive: true };
  
  // Search functionality
  if (search) {
    query.$or = [
      { courseCode: { $regex: search, $options: 'i' } },
      { courseName: { $regex: search, $options: 'i' } }
    ];
  }
  
  // Filter by semester
  if (semester) query.semester = semester;
  
  // Filter by academic year
  if (year) query.academicYear = year;
  
  // Filter by lecturer
  if (lecturer) query.lecturer = lecturer;

  const courses = await Course.find(query)
    .populate('lecturer', 'firstName lastName email')
    .sort({ courseCode: 1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Course.countDocuments(query);

  res.status(200).json({
    status: 'success',
    results: courses.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    data: {
      courses
    }
  });
});

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Private
exports.getCourse = catchAsync(async (req, res, next) => {
  const course = await Course.findById(req.params.id)
    .populate('lecturer', 'firstName lastName email')
    .populate('students', 'firstName lastName email universityId');

  if (!course) {
    return next(new AppError('No course found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      course
    }
  });
});

// @desc    Create new course (Super Admin only)
// @route   POST /api/courses
// @access  Private (Super Admin)
exports.createCourse = catchAsync(async (req, res, next) => {
  // Extract ONLY the fields we allow from req.body
  const {
    courseCode,
    courseName,
    description,
    credits,
    lecturer,
    schedule,
    semester,
    academicYear,
    maxStudents
  } = req.body;

  // Check if course code already exists
  const existingCourse = await Course.findOne({ courseCode });
  if (existingCourse) {
    return next(new AppError('Course with this code already exists', 400));
  }

  // Verify lecturer exists and is actually a lecturer
  const lecturerUser = await User.findById(lecturer);
  if (!lecturerUser || lecturerUser.role !== 'lecturer') {
    return next(new AppError('Assigned user must be a lecturer', 400));
  }

  // Create the new course - ONLY with the explicitly allowed fields
  const newCourse = await Course.create({
    courseCode: courseCode.toUpperCase(),
    courseName,
    description,
    credits,
    lecturer,
    schedule,
    semester,
    academicYear,
    maxStudents
  });

  // Populate lecturer info in response
  await newCourse.populate('lecturer', 'firstName lastName email');

  res.status(201).json({
    status: 'success',
    data: {
      course: newCourse
    }
  });
});

// @desc    Update course
// @route   PATCH /api/courses/:id
// @access  Private (Super Admin)
exports.updateCourse = catchAsync(async (req, res, next) => {
  // Extract ONLY the fields we allow from req.body
  const {
    courseName,
    description,
    credits,
    lecturer,
    schedule,
    semester,
    academicYear,
    maxStudents,
    isActive
  } = req.body;

  const course = await Course.findByIdAndUpdate(
    req.params.id,
    { 
      courseName,
      description,
      credits,
      lecturer,
      schedule,
      semester,
      academicYear,
      maxStudents,
      isActive
    }, // Only update the allowed fields
    { new: true, runValidators: true }
  ).populate('lecturer', 'firstName lastName email');

  if (!course) {
    return next(new AppError('No course found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      course
    }
  });
});

// @desc    Delete course (soft delete)
// @route   DELETE /api/courses/:id
// @access  Private (Super Admin)
exports.deleteCourse = catchAsync(async (req, res, next) => {
  const course = await Course.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );

  if (!course) {
    return next(new AppError('No course found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: null,
    message: 'Course deactivated successfully'
  });
});

// @desc    Get courses by lecturer
// @route   GET /api/courses/lecturer/:lecturerId
// @access  Private
exports.getCoursesByLecturer = catchAsync(async (req, res, next) => {
  const courses = await Course.find({
    lecturer: req.params.lecturerId,
    isActive: true
  }).populate('lecturer', 'firstName lastName email');

  res.status(200).json({
    status: 'success',
    results: courses.length,
    data: {
      courses
    }
  });
});

// @desc    Get course statistics
// @route   GET /api/courses/stats
// @access  Private (Super Admin)
exports.getCourseStats = catchAsync(async (req, res, next) => {
  try {
    const totalCourses = await Course.countDocuments({ isActive: true });
    
    // Get enrollment statistics
    const enrollmentStats = await Course.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalCapacity: { $sum: '$maxStudents' },
          totalEnrollment: { $sum: '$currentEnrollment' },
          averageEnrollment: { $avg: '$currentEnrollment' }
        }
      }
    ]);

    const stats = enrollmentStats[0] || {
      totalCapacity: 0,
      totalEnrollment: 0,
      averageEnrollment: 0
    };

    res.status(200).json({
      status: 'success',
      data: {
        totalCourses,
        totalCapacity: stats.totalCapacity,
        totalEnrollment: stats.totalEnrollment,
        averageEnrollment: stats.averageEnrollment
      }
    });
  } catch (error) {
    console.error('Course stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch course statistics'
    });
  }
});