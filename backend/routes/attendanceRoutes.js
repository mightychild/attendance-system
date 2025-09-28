const express = require('express');
const {
  startSession,
  getSession,
  endSession,
  getSessionDetails,
  scanQRCode,
  manualAttendance
} = require('../controllers/attendanceController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

// Protect all routes
router.use(protect);

// Lecturer routes
router.use(restrictTo('lecturer'));

router.post('/session', startSession);
router.get('/session/:courseId', getSession);
router.patch('/session/:sessionId/end', endSession);
router.get('/session/details/:sessionId', getSessionDetails);
router.post('/scan', scanQRCode);
router.post('/manual', manualAttendance);

module.exports = router;