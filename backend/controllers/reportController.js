const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { Parser } = require('json2csv');

// @desc    Download attendance report for a course
// @route   GET /api/reports/attendance/:courseId
// @access  Private (Lecturer)
exports.downloadAttendanceReport = catchAsync(async (req, res, next) => {
  const { courseId } = req.params;
  const { format = 'csv' } = req.query;

  // Check if user is the lecturer for this course
  const course = await Course.findById(courseId);
  if (!course) {
    return next(new AppError('Course not found', 404));
  }

  if (course.lecturer.toString() !== req.user._id.toString()) {
    return next(new AppError('You are not authorized to access this report', 403));
  }

  // Get all enrollments with attendance data
  const enrollments = await Enrollment.find({ course: courseId, status: 'enrolled' })
    .populate('student', 'firstName lastName universityId email')
    .sort({ 'student.lastName': 1 });

  if (format === 'csv') {
    // Prepare data for CSV
    const reportData = enrollments.map(enrollment => {
      const student = enrollment.student;
      return {
        studentId: student.universityId,
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        totalClasses: enrollment.totalClasses,
        classesAttended: enrollment.classesAttended,
        attendancePercentage: `${enrollment.attendancePercentage}%`,
        status: enrollment.attendancePercentage >= 75 ? 'Satisfactory' : 'Needs Improvement'
      };
    });

    // Convert to CSV
    const json2csvParser = new Parser();
    const csv = json2csvParser.parse(reportData);

    // Set headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=attendance-report-${course.courseCode}.csv`);
    
    res.send(csv);
  } else {
    // JSON format
    res.status(200).json({
      status: 'success',
      data: {
        course: {
          code: course.courseCode,
          name: course.courseName
        },
        enrollments: enrollments.map(enrollment => ({
          student: enrollment.student,
          totalClasses: enrollment.totalClasses,
          classesAttended: enrollment.classesAttended,
          attendancePercentage: enrollment.attendancePercentage,
          attendance: enrollment.attendance
        }))
      }
    });
  }
});

// @desc    Get course performance statistics
// @route   GET /api/reports/performance/:courseId
// @access  Private (Lecturer)
exports.getCoursePerformanceReport = catchAsync(async (req, res, next) => {
  const { courseId } = req.params;

  const course = await Course.findById(courseId);
  if (!course) {
    return next(new AppError('Course not found', 404));
  }

  if (course.lecturer.toString() !== req.user._id.toString()) {
    return next(new AppError('You are not authorized to access this report', 403));
  }

  const enrollments = await Enrollment.find({ course: courseId, status: 'enrolled' });

  const performanceStats = {
    totalStudents: enrollments.length,
    averageAttendance: enrollments.reduce((sum, e) => sum + e.attendancePercentage, 0) / enrollments.length,
    excellentStudents: enrollments.filter(e => e.attendancePercentage >= 80).length,
    goodStudents: enrollments.filter(e => e.attendancePercentage >= 60 && e.attendancePercentage < 80).length,
    needsImprovement: enrollments.filter(e => e.attendancePercentage < 60).length,
    attendanceDistribution: {
      '90-100%': enrollments.filter(e => e.attendancePercentage >= 90).length,
      '80-89%': enrollments.filter(e => e.attendancePercentage >= 80 && e.attendancePercentage < 90).length,
      '70-79%': enrollments.filter(e => e.attendancePercentage >= 70 && e.attendancePercentage < 80).length,
      '60-69%': enrollments.filter(e => e.attendancePercentage >= 60 && e.attendancePercentage < 70).length,
      'Below 60%': enrollments.filter(e => e.attendancePercentage < 60).length
    }
  };

  res.status(200).json({
    status: 'success',
    data: {
      course: {
        code: course.courseCode,
        name: course.courseName
      },
      performance: performanceStats
    }
  });
});