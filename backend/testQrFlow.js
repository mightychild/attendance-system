// testQrFlow.js
require('dotenv').config();
const mongoose = require('mongoose');
const { signQRToken, verifyQRToken } = require('./utils/qrToken');

// Simple test without DB
const testQRLogic = () => {
  console.log("🧪 Testing QR Token Generation & Verification...");
  
  // 1. Simulate a user with a secret
  const testUserId = "test_user_id_123";
  const testUserSecret = "test_secret_abc123"; // This would be the user's qrSecret
  
  // 2. Generate a Token for this user
  const generatedToken = signQRToken(testUserId, testUserSecret);
  console.log("✅ Token Generated:", generatedToken);
  
  // 3. Verify the Token WITH THE CORRECT SECRET (Should PASS)
  const result1 = verifyQRToken(generatedToken, testUserSecret);
  console.log("\n1. Verification with CORRECT secret:");
  console.log("   Valid:", result1.valid);
  console.log("   Expired:", result1.expired);
  console.log("   User ID from token:", result1.decoded?.id);
  
  // 4. Verify the Token WITH A WRONG SECRET (Should FAIL)
  const result2 = verifyQRToken(generatedToken, "wrong_secret_xyz");
  console.log("\n2. Verification with WRONG secret:");
  console.log("   Valid:", result2.valid);
  console.log("   Expired:", result2.expired);
  
  // 5. Test expiration? (Optional - wait for 2 seconds if token expiry is 1s)
  console.log("\n✅ QR Token logic test completed.");
};

testQRLogic();