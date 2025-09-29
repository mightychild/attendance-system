import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Paper,
  Grid
} from '@mui/material';
import {
  QrCodeScanner as ScannerIcon,
  Close as CloseIcon,
  VideocamOff as CameraOffIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { scanQRCode } from '../../utils/attendanceAPI';
import jsQR from 'jsqr';

const QRScanner = ({ open, onClose, session, onAttendanceMarked }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [scanning, setScanning] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [stream, setStream] = useState(null);
  const [recentScans, setRecentScans] = useState([]);
  const animationFrame = useRef(null);

  const startCamera = async () => {
    try {
      setCameraError('');
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setScanning(true);
        scanFrame();
      }
    } catch (err) {
      console.error('Camera error:', err);
      setCameraError('Camera access denied. Please allow camera permissions and refresh the page.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current);
    }
    setScanning(false);
  };

  const scanFrame = () => {
    if (!scanning || !videoRef.current || !canvasRef.current || loading) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);

      if (code) {
        handleQRCodeDetected(code.data);
      }
    }

    if (scanning && !loading) {
      animationFrame.current = requestAnimationFrame(scanFrame);
    }
  };

  const handleQRCodeDetected = async (qrData) => {
    if (loading) return;
    
    setScanning(false);
    setLoading(true);
    setError('');

    try {
      const response = await scanQRCode({
        qrCodeData: qrData, // This contains the token object
        sessionId: session._id
      });

      // Add to recent scans
      const newScan = {
        student: response.data.student,
        timestamp: new Date(),
        success: true
      };
      
      setRecentScans(prev => [newScan, ...prev.slice(0, 4)]); // Keep last 5 scans
      setSuccess(`Attendance marked for ${response.data.student.firstName} ${response.data.student.lastName}`);
      
      if (onAttendanceMarked) {
        onAttendanceMarked(response.data.student);
      }

      // Auto-clear success message after 2 seconds
      setTimeout(() => {
        setSuccess('');
      }, 2000);

    } catch (err) {
      console.error('Scan error:', err);
      
      // Add failed scan to recent scans
      const failedScan = {
        error: err.message,
        timestamp: new Date(),
        success: false
      };
      
      setRecentScans(prev => [failedScan, ...prev.slice(0, 4)]);
      
      // Show specific error messages
      let errorMessage = err.message || 'Failed to scan QR code';
      if (errorMessage.includes('expired')) {
        errorMessage = 'QR code expired. Please ask the student to show their code again.';
      } else if (errorMessage.includes('Invalid QR code signature')) {
        errorMessage = 'Invalid QR code. Please ensure the student is using the correct ID.';
      }
      
      setError(errorMessage);
      
      // Auto-clear error message after 3 seconds
      setTimeout(() => {
        setError('');
      }, 3000);
    } finally {
      setLoading(false);
      // Resume scanning immediately
      setScanning(true);
      if (!animationFrame.current) {
        scanFrame();
      }
    }
  };

  useEffect(() => {
    if (open) {
      startCamera();
      setRecentScans([]);
    } else {
      stopCamera();
      setRecentScans([]);
      setError('');
      setSuccess('');
    }

    return () => {
      stopCamera();
    };
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <ScannerIcon />
            <Box>
              <Typography variant="h6">QR Attendance Scanner</Typography>
              <Typography variant="body2" color="text.secondary">
                {session?.course?.courseCode} - {session?.course?.courseName}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            {/* Scanner Section */}
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Scanner Active - Point camera at student QR codes
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                  {error}
                </Alert>
              )}

              {success && (
                <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
                  {success}
                </Alert>
              )}

              <Box sx={{ position: 'relative', width: '100%', height: '400px', backgroundColor: 'black', borderRadius: 1 }}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    transform: 'scaleX(-1)'
                  }}
                />
                
                {/* Scanner overlay */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '250px',
                    height: '250px',
                    border: '3px solid rgba(255, 255, 255, 0.7)',
                    borderRadius: '12px',
                    pointerEvents: 'none',
                    boxShadow: '0 0 0 4000px rgba(0, 0, 0, 0.3)'
                  }}
                />

                {loading && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'rgba(0, 0, 0, 0.7)',
                      borderRadius: '8px'
                    }}
                  >
                    <CircularProgress sx={{ color: 'white' }} />
                    <Typography variant="body2" sx={{ color: 'white', ml: 2 }}>
                      Processing...
                    </Typography>
                  </Box>
                )}

                {cameraError && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'column',
                      color: 'white',
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      borderRadius: '8px',
                      p: 3
                    }}
                  >
                    <CameraOffIcon sx={{ fontSize: 48, mb: 2 }} />
                    <Typography variant="body1" align="center" gutterBottom>
                      Camera Not Available
                    </Typography>
                    <Typography variant="body2" align="center">
                      {cameraError}
                    </Typography>
                    <Button 
                      variant="contained" 
                      sx={{ mt: 2 }}
                      onClick={startCamera}
                    >
                      Retry Camera
                    </Button>
                  </Box>
                )}
              </Box>

              <canvas ref={canvasRef} style={{ display: 'none' }} />

              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  Scanner is continuously active. Point at student QR codes one after another.
                </Typography>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            {/* Recent Scans Section */}
            <Paper sx={{ p: 2, height: '100%' }}>
              <Typography variant="subtitle1" gutterBottom>
                Recent Scans ({recentScans.length})
              </Typography>
              
              {recentScans.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  No scans yet. QR codes will appear here as they are scanned.
                </Typography>
              ) : (
                <List dense sx={{ maxHeight: '400px', overflow: 'auto' }}>
                  {recentScans.map((scan, index) => (
                    <ListItem key={index} divider>
                      <ListItemIcon>
                        {scan.success ? (
                          <CheckCircleIcon color="success" />
                        ) : (
                          <ErrorIcon color="error" />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={scan.success ? 
                          `${scan.student.firstName} ${scan.student.lastName}` : 
                          'Scan Failed'
                        }
                        secondary={
                          scan.success ? 
                            `ID: ${scan.student.universityId}` : 
                            scan.error
                        }
                      />
                      <Chip
                        label={scan.success ? 'Success' : 'Failed'}
                        color={scan.success ? 'success' : 'error'}
                        size="small"
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {scanning ? '🟢 Scanner Active' : '🔴 Scanner Paused'}
          </Typography>
          <Box>
            <Button onClick={onClose} sx={{ mr: 1 }}>
              Close Scanner
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                if (scanning) {
                  stopCamera();
                } else {
                  startCamera();
                }
              }}
              disabled={!!cameraError}
            >
              {scanning ? 'Pause Scanner' : 'Resume Scanner'}
            </Button>
          </Box>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default QRScanner;