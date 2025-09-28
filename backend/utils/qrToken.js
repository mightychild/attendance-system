const jwt = require('jsonwebtoken');

// Sign QR token with user-specific secret
const signQRToken = (userId, qrSecret) => {
  const payload = { 
    id: userId,
    iat: Math.floor(Date.now() / 1000) // issued at time
  };
  
  return jwt.sign(payload, qrSecret, {
    expiresIn: process.env.QR_TOKEN_EXPIRES_IN || '60s' // Short-lived token
  });
};

// Verify QR token with a provided secret
const verifyQRToken = (token, qrSecret) => { // NOW ACCEPTS THE SECRET PARAMETER
  try {
    const decoded = jwt.verify(token, qrSecret); // VERIFIES WITH THE USER'S SECRET
    return { valid: true, expired: false, decoded };
  } catch (error) {
    return {
      valid: false,
      expired: error.name === 'TokenExpiredError',
      decoded: null,
      error: error.message
    };
  }
};

module.exports = { signQRToken, verifyQRToken };