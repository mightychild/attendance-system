const express = require('express');
const { 
  getStudentQRCode, 
  getMyQRCode, 
  verifyQRCode 
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Protect all routes
router.use(protect);

// Correct order: specific routes before parameterized routes
router.get('/me/qrcode', getMyQRCode); // Get current user's QR code
router.get('/:userId/qrcode', getStudentQRCode); // Get specific user's QR code (for admins/lecturers)
router.post('/verify-qr', verifyQRCode); // Verify QR code

module.exports = router;