import React from 'react';
import { useLocation } from 'react-router-dom';

// Generate QR Code
function QRCodePage() {
  const location = useLocation();
  const qrCode = location.state?.qrCode;

  return (
    <div className="qrcode-container">
      <h2>Your Attendance QR Code</h2>
      {qrCode && (
        <div className="qrcode-image">
          <img src={qrCode} alt="Student QR Code" />
        </div>
      )}
    </div>
  );
}

export default QRCodePage;
