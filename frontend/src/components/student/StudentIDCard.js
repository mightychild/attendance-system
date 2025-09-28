import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Button
} from '@mui/material';
import { QRCodeSVG } from 'qrcode.react';
import { getMyQRCode } from '../../utils/studentAPI';
import { useAuth } from '../../context/AuthContext';

const StudentIDCard = () => {
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const fetchQRCode = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getMyQRCode();
      setQrData(response.data);
    } catch (err) {
      setError(err.message || 'Failed to load QR code');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQRCode();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
        <Button onClick={fetchQRCode} sx={{ ml: 2 }} size="small">
          Retry
        </Button>
      </Alert>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom color="primary.main">
        Student ID Card
      </Typography>

      <Card sx={{ maxWidth: 400, mx: 'auto', mb: 2 }}>
        <CardContent>
          <Box display="flex" justifyContent="center" mb={2}>
            {qrData && qrData.qrCode && (
              <QRCodeSVG
                value={qrData.qrCode}
                size={200}
                level="H"
                includeMargin
              />
            )}
          </Box>

          {qrData && qrData.user && (
            <Box textAlign="center">
              <Typography variant="h6" gutterBottom>
                {qrData.user.firstName} {qrData.user.lastName}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                ID: {qrData.user.universityId}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Secure QR Code • Expires in 60 seconds
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      <Button variant="outlined" onClick={fetchQRCode} fullWidth>
        Refresh QR Code
      </Button>
    </Paper>
  );
};

export default StudentIDCard;