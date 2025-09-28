const AttendanceSession = require('../models/AttendanceSession');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { verifyQRToken } = require('../utils/qrToken');
const jwt = require('jsonwebtoken');

// @desc    Start a new attendance session
// @route   POST /api/attendance/session
// @access  Private (Lecturer)
exports.startSession = catchAsync(async (req, res, next) => {
  const { courseId, duration = 30 } = req.body;
  
  // Validate course exists and lecturer teaches it
  const course = await Course.findById(courseId);
  if (!course) {
    return next(new AppError('Course not found', 404));
  }
  
  if (course.lecturer.toString() !== req.user._id.toString()) {
    return next(new AppError('You are not the lecturer for this course', 403));
  }
  
  // Check if there's already an active session for this course
  const existingSession = await AttendanceSession.findOne({
    course: courseId,
    status: 'active'
  });
  
  if (existingSession) {
    return next(new AppError('An active attendance session already exists for this course', 400));
  }
  
  // Create new session
  const newSession = await AttendanceSession.create({
    lecturer: req.user._id,
    course: courseId,
    duration: parseInt(duration)
  });
  
  // Populate course info
  await newSession.populate('course', 'courseCode courseName');
  
  res.status(201).json({
    status: 'success',
    data: {
      session: newSession
    }
  });
});

// @desc    Get current active session for a course
// @route   GET /api/attendance/session/:courseId
// @access  Private (Lecturer)
exports.getSession = catchAsync(async (req, res, next) => {
  const { courseId } = req.params;
  
  const session = await AttendanceSession.findOne({
    course: courseId,
    status: 'active'
  })
  .populate('course', 'courseCode courseName')
  .populate('attendees.student', 'firstName lastName universityId');
  
  if (!session) {
    return res.status(200).json({
      status: 'success',
      data: {
        session: null
      }
    });
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      session
    }
  });
});

// @desc    End an attendance session
// @route   PATCH /api/attendance/session/:sessionId/end
// @access  Private (Lecturer)
exports.endSession = catchAsync(async (req, res, next) => {
  const { sessionId } = req.params;
  
  const session = await AttendanceSession.findById(sessionId);
  
  if (!session) {
    return next(new AppError('Session not found', 404));
  }
  
  if (session.lecturer.toString() !== req.user._id.toString()) {
    return next(new AppError('You are not authorized to end this session', 403));
  }
  
  if (session.status === 'completed') {
    return next(new AppError('Session is already completed', 400));
  }
  
  session.status = 'completed';
  session.endTime = new Date();
  await session.save();
  
  res.status(200).json({
    status: 'success',
    data: {
      session
    }
  });
});

// @desc    Get session details
// @route   GET /api/attendance/session/details/:sessionId
// @access  Private (Lecturer)
exports.getSessionDetails = catchAsync(async (req, res, next) => {
  const { sessionId } = req.params;
  
  const session = await AttendanceSession.findById(sessionId)
    .populate('course', 'courseCode courseName')
    .populate('lecturer', 'firstName lastName')
    .populate('attendees.student', 'firstName lastName universityId');
  
  if (!session) {
    return next(new AppError('Session not found', 404));
  }
  
  // Verify lecturer owns this session
  if (session.lecturer._id.toString() !== req.user._id.toString()) {
    return next(new AppError('You are not authorized to view this session', 403));
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      session
    }
  });
});

// @desc    Scan QR code for attendance
// @route   POST /api/attendance/scan
// @access  Private (Lecturer)
exports.scanQRCode = catchAsync(async (req, res, next) => {
  const { qrCodeData, sessionId } = req.body;

  if (!qrCodeData || !sessionId) {
    return next(new AppError('QR code data and session ID are required', 400));
  }

  // Parse QR code data
  let qrData;
  try {
    qrData = JSON.parse(qrCodeData);
  } catch (error) {
    return next(new AppError('Invalid QR code format', 400));
  }

  // Verify QR code data contains the token
  if (!qrData.token) {
    return next(new AppError('Invalid QR code data: Token missing', 400));
  }

  // Decode token without verification first to get user ID
  let decodedToken;
  try {
    decodedToken = jwt.decode(qrData.token);
  } catch (error) {
    return next(new AppError('Invalid QR token format', 400));
  }

  if (!decodedToken || !decodedToken.id) {
    return next(new AppError('Invalid QR token data', 400));
  }

  // Find user by ID from token with QR secret
  const user = await User.findById(decodedToken.id).select('+qrSecret');
  if (!user || !user.universityId || !user.isActive) {
    return next(new AppError('User not found or inactive', 404));
  }

  // VERIFY THE TOKEN WITH THE USER'S SPECIFIC SECRET
  const verificationResult = verifyQRToken(qrData.token, user.qrSecret);

  if (!verificationResult.valid) {
    const message = verificationResult.expired ? 
      'QR code has expired. Please ask the user to show their QR code again.' : 
      'Invalid QR code signature.';
    return next(new AppError(message, 400));
  }

  // Get session
  const session = await AttendanceSession.findById(sessionId);
  if (!session) {
    return next(new AppError('Attendance session not found', 404));
  }

  // Verify lecturer owns this session
  if (session.lecturer.toString() !== req.user._id.toString()) {
    return next(new AppError('You are not authorized for this session', 403));
  }

  // Check if session is active
  if (session.status !== 'active') {
    return next(new AppError('This attendance session is not active', 400));
  }

  // For students, check if they are enrolled in the course
  if (user.role === 'student') {
    const enrollment = await Enrollment.findOne({
      student: user._id,
      course: session.course,
      status: 'enrolled'
    });

    if (!enrollment) {
      return next(new AppError('Student is not enrolled in this course', 400));
    }
  }

  // Check if user already scanned in
  const alreadyScanned = session.attendees.find(attendee => 
    attendee.student.toString() === user._id.toString()
  );

  if (alreadyScanned) {
    return next(new AppError('User already marked present', 400));
  }

  // Add user to attendees
  await session.addAttendee(user._id);

  // Update enrollment attendance for students
  if (user.role === 'student') {
    const enrollment = await Enrollment.findOne({
      student: user._id,
      course: session.course,
      status: 'enrolled'
    });

    if (enrollment) {
      const today = new Date().toISOString().split('T')[0];
      enrollment.markAttendance(new Date(today), true, req.user._id);
      await enrollment.save();
    }
  }

  // Get updated session
  const updatedSession = await AttendanceSession.findById(sessionId)
    .populate('attendees.student', 'firstName lastName universityId');

  res.status(200).json({
    status: 'success',
    message: 'Attendance marked successfully',
    data: {
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        universityId: user.universityId,
        role: user.role
      },
      session: updatedSession
    }
  });
});

// @desc    Manually mark attendance
// @route   POST /api/attendance/manual
// @access  Private (Lecturer)
exports.manualAttendance = catchAsync(async (req, res, next) => {
  const { studentId, sessionId, present = true } = req.body;

  if (!studentId || !sessionId) {
    return next(new AppError('Student ID and session ID are required', 400));
  }

  // Get session
  const session = await AttendanceSession.findById(sessionId);
  if (!session) {
    return next(new AppError('Attendance session not found', 404));
  }

  // Verify lecturer owns this session
  if (session.lecturer.toString() !== req.user._id.toString()) {
    return next(new AppError('You are not authorized for this session', 403));
  }

  // Get student
  const student = await User.findById(studentId);
  if (!student || !student.universityId) {
    return next(new AppError('Invalid student or student has no university ID', 400));
  }

  // Check if student is enrolled
  const enrollment = await Enrollment.findOne({
    student: studentId,
    course: session.course,
    status: 'enrolled'
  });

  if (!enrollment) {
    return next(new AppError('Student is not enrolled in this course', 400));
  }

  // Add or update attendance
  if (present) {
    // Remove existing record if any
    session.attendees = session.attendees.filter(attendee => 
      attendee.student.toString() !== studentId
    );
    
    session.attendees.push({
      student: studentId,
      markedManually: true,
      scannedAt: new Date()
    });
  } else {
    // Remove student from attendees if marking absent
    session.attendees = session.attendees.filter(attendee => 
      attendee.student.toString() !== studentId
    );
  }

  await session.save();

  // Update enrollment
  const today = new Date().toISOString().split('T')[0];
  enrollment.markAttendance(new Date(today), present, req.user._id);
  await enrollment.save();

  // Get updated session
  const updatedSession = await AttendanceSession.findById(sessionId)
    .populate('attendees.student', 'firstName lastName universityId');

  res.status(200).json({
    status: 'success',
    message: `Attendance ${present ? 'marked' : 'updated'} successfully`,
    data: {
      session: updatedSession
    }
  });
});