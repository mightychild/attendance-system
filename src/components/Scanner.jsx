import React, { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Scanner() {
  const [scanResult, setScanResult] = useState(null);
  const [isError, setIsError] = useState(false);
  const [cameraPermission, setCameraPermission] = useState('prompt'); // 'prompt', 'granted', 'denied'
  const navigate = useNavigate();
  const scannerRef = React.useRef(null);

  const checkCameraPermission = async () => {
    try {
      const permission = await navigator.permissions.query({ name: 'camera' });
      setCameraPermission(permission.state);
      
      permission.onchange = () => {
        setCameraPermission(permission.state);
      };
    } catch (error) {
      console.log("Permission API not supported, using fallback");
    }
  };

  const onScanSuccess = async (decodedText) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const res = await axios.post('http://localhost:5000/api/attendance/scan', {
        qrData: decodedText
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setScanResult(`Attendance recorded for ${res.data.studentName}`);
      setIsError(false);
      
      if (scannerRef.current) {
        scannerRef.current.stop().catch(error => {
          console.log("Scanner stop error:", error);
        });
      }
    } catch (err) {
      setScanResult('Error: ' + (err.response?.data?.error || 'Invalid QR code'));
      setIsError(true);
    }
  };

  const startScanner = () => {
    if (scannerRef.current) return;

    const scanner = new Html5QrcodeScanner('reader', {
      qrbox: { width: 250, height: 250 },
      fps: 5,
      aspectRatio: 1.777778 // 16:9
    }, false); // verbose = false

    scanner.render(
      onScanSuccess,
      (error) => {
        if (error.includes('NotAllowedError')) {
          setCameraPermission('denied');
          setScanResult('Camera access denied. Please enable camera permissions.');
          setIsError(true);
        } else {
          setScanResult(`Scanner error: ${error}`);
          setIsError(true);
        }
      }
    );
    scannerRef.current = scanner;
  };

  const requestCameraAccess = () => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(() => {
        setCameraPermission('granted');
        startScanner();
      })
      .catch(err => {
        setCameraPermission('denied');
        setScanResult('Could not access camera: ' + err.message);
        setIsError(true);
      });
  };

  useEffect(() => {
    checkCameraPermission();
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(error => {
          console.log("Scanner cleanup error:", error);
        });
      }
    };
  }, []);

  useEffect(() => {
    if (cameraPermission === 'granted') {
      startScanner();
    }
  }, [cameraPermission]);

  return (
    <div className="scanner-container">
      <h2 className="scanner-title">Scan Your QR Code</h2>
      
      {cameraPermission === 'denied' ? (
        <div className="permission-denied">
          <p className="scan-error">
            Camera access was denied. Please enable camera permissions in your browser settings.
          </p>
          <button 
            onClick={requestCameraAccess}
            className="btn btn-primary mt-4"
          >
            Try Again
          </button>
        </div>
      ) : cameraPermission === 'granted' ? (
        <>
          <div id="reader"></div>
          {scanResult && (
            <div className={`scan-result ${isError ? 'scan-error' : 'scan-success'}`}>
              {scanResult}
            </div>
          )}
        </>
      ) : (
        <div className="permission-prompt">
          <button 
            onClick={requestCameraAccess}
            className="btn btn-primary"
          >
            Allow Camera Access
          </button>
        </div>
      )}
    </div>
  );
}

export default Scanner;