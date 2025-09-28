const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

// @desc    Enroll student in course
// @route   POST /api/enrollments
// @access  Private (Student)
exports.enrollInCourse = catchAsync(async (req, res, next) => {
  const { courseId } = req.body;
  const studentId = req.user._id;

  // Check if course exists and is active
  const course = await Course.findById(courseId);
  if (!course || !course.isActive) {
    return next(new AppError('Course not found or inactive', 404));
  }

  // Check if course is full
  if (course.currentEnrollment >= course.maxStudents) {
    return next(new AppError('Course is full', 400));
  }

  // Check if student is already enrolled
  const existingEnrollment = await Enrollment.findOne({
    student: studentId,
    course: courseId,
    status: 'enrolled'
  });

  if (existingEnrollment) {
    return next(new AppError('Student is already enrolled in this course', 400));
  }

  // Create enrollment
  const enrollment = await Enrollment.create({
    student: studentId,
    course: courseId
  });

  // Update course enrollment count
  course.currentEnrollment += 1;
  await course.save();

  // Populate references
  await enrollment.populate('course', 'courseCode courseName');
  await enrollment.populate('student', 'firstName lastName email universityId');

  res.status(201).json({
    status: 'success',
    data: {
      enrollment
    }
  });
});

// @desc    Get student's enrollments
// @route   GET /api/enrollments/student/:studentId
// @access  Private
exports.getStudentEnrollments = catchAsync(async (req, res, next) => {
  const { studentId } = req.params;

  // Check if user has permission (student viewing their own enrollments or admin)
  if (req.user.role !== 'super-admin' && req.user.role !== 'lecturer' && req.user._id.toString() !== studentId) {
    return next(new AppError('You do not have permission to view these enrollments', 403));
  }

  const enrollments = await Enrollment.find({ student: studentId, status: 'enrolled' })
    .populate('course', 'courseCode courseName credits lecturer schedule')
    .populate('course.lecturer', 'firstName lastName')
    .sort({ enrollmentDate: -1 });

  res.status(200).json({
    status: 'success',
    results: enrollments.length,
    data: {
      enrollments
    }
  });
});

// @desc    Get course enrollments
// @route   GET /api/enrollments/course/:courseId
// @access  Private (Lecturer or Super Admin)
exports.getCourseEnrollments = catchAsync(async (req, res, next) => {
  const { courseId } = req.params;

  // Check if user has permission (lecturer of the course or admin)
  const course = await Course.findById(courseId);
  if (req.user.role !== 'super-admin' && req.user._id.toString() !== course.lecturer.toString()) {
    return next(new AppError('You do not have permission to view these enrollments', 403));
  }

  const enrollments = await Enrollment.find({ course: courseId, status: 'enrolled' })
    .populate('student', 'firstName lastName email universityId')
    .sort({ enrollmentDate: 1 });

  res.status(200).json({
    status: 'success',
    results: enrollments.length,
    data: {
      enrollments
    }
  });
});

// @desc    Drop course enrollment
// @route   PATCH /api/enrollments/:enrollmentId/drop
// @access  Private (Student or Super Admin)
exports.dropEnrollment = catchAsync(async (req, res, next) => {
  const { enrollmentId } = req.params;

  const enrollment = await Enrollment.findById(enrollmentId);
  if (!enrollment) {
    return next(new AppError('Enrollment not found', 404));
  }

  // Check permission
  if (req.user.role !== 'super-admin' && req.user._id.toString() !== enrollment.student.toString()) {
    return next(new AppError('You do not have permission to drop this enrollment', 403));
  }

  enrollment.status = 'dropped';
  await enrollment.save();

  // Update course enrollment count
  await Course.findByIdAndUpdate(enrollment.course, {
    $inc: { currentEnrollment: -1 }
  });

  res.status(200).json({
    status: 'success',
    data: {
      enrollment
    }
  });
});

// @desc    Mark attendance
// @route   POST /api/enrollments/:enrollmentId/attendance
// @access  Private (Lecturer or Super Admin)
exports.markAttendance = catchAsync(async (req, res, next) => {
  const { enrollmentId } = req.params;
  const { date, present } = req.body;

  const enrollment = await Enrollment.findById(enrollmentId);
  if (!enrollment) {
    return next(new AppError('Enrollment not found', 404));
  }

  // Check if user has permission (lecturer of the course or admin)
  const course = await Course.findById(enrollment.course);
  if (req.user.role !== 'super-admin' && req.user._id.toString() !== course.lecturer.toString()) {
    return next(new AppError('You do not have permission to mark attendance for this course', 403));
  }

  enrollment.markAttendance(new Date(date), present, req.user._id);
  await enrollment.save();

  res.status(200).json({
    status: 'success',
    data: {
      enrollment
    }
  });
});

// @desc    Get student attendance for course
// @route   GET /api/enrollments/student/:studentId/course/:courseId
// @access  Private
exports.getStudentCourseAttendance = catchAsync(async (req, res, next) => {
  const { studentId, courseId } = req.params;

  // Check permission
  if (req.user.role !== 'super-admin' && req.user.role !== 'lecturer' && req.user._id.toString() !== studentId) {
    return next(new AppError('You do not have permission to view this attendance', 403));
  }

  const enrollment = await Enrollment.findOne({
    student: studentId,
    course: courseId,
    status: 'enrolled'
  }).populate('course', 'courseCode courseName');

  if (!enrollment) {
    return next(new AppError('Enrollment not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      enrollment
    }
  });
});