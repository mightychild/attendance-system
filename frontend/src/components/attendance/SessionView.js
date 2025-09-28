import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  CircularProgress,
  Alert,
  IconButton
} from '@mui/material';
import {
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  PlayArrow as StartIcon,
  Stop as StopIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { getSessionDetails, endSession } from '../../utils/attendanceAPI';

const SessionView = ({ session, onSessionEnded, onRefresh }) => {
  const [sessionDetails, setSessionDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [ending, setEnding] = useState(false);
  const [error, setError] = useState('');

  const fetchSessionDetails = async () => {
    if (!session) return;
    
    try {
      setLoading(true);
      setError('');
      const response = await getSessionDetails(session._id);
      setSessionDetails(response.data.session);
    } catch (err) {
      setError(err.message || 'Failed to load session details');
    } finally {
      setLoading(false);
    }
  };

  const handleEndSession = async () => {
    if (!session) return;
    
    try {
      setEnding(true);
      setError('');
      await endSession(session._id);
      if (onSessionEnded) {
        onSessionEnded();
      }
    } catch (err) {
      setError(err.message || 'Failed to end session');
    } finally {
      setEnding(false);
    }
  };

  useEffect(() => {
    fetchSessionDetails();
    
    // Refresh session details every 10 seconds
    const interval = setInterval(fetchSessionDetails, 10000);
    
    return () => clearInterval(interval);
  }, [session]);

  if (!session) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          No active session
        </Typography>
      </Paper>
    );
  }

  const presentCount = sessionDetails?.attendees?.length || 0;
  const totalStudents = sessionDetails?.course?.currentEnrollment || 0;
  const absentCount = totalStudents - presentCount;

  return (
    <Paper sx={{ p: 3 }}>
      {/* Session Header */}
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
        <Box>
          <Typography variant="h6" gutterBottom color="primary.main">
            Active Attendance Session
          </Typography>
          <Typography variant="body1" gutterBottom>
            {session.course.courseCode} - {session.course.courseName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Started: {new Date(session.startTime).toLocaleTimeString()}
          </Typography>
        </Box>
        
        <Box display="flex" gap={1}>
          <IconButton onClick={onRefresh} disabled={loading}>
            <RefreshIcon />
          </IconButton>
          <Button
            variant="contained"
            color="error"
            startIcon={ending ? <CircularProgress size={16} /> : <StopIcon />}
            onClick={handleEndSession}
            disabled={ending}
          >
            End Session
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Statistics */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">
                {presentCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Present
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="error.main">
                {absentCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Absent
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary.main">
                {totalStudents}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Enrolled
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Attendees List */}
      <Typography variant="h6" gutterBottom>
        Present Students ({presentCount})
      </Typography>
      
      {loading ? (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      ) : sessionDetails?.attendees?.length > 0 ? (
        <List>
          {sessionDetails.attendees.map((attendee, index) => (
            <React.Fragment key={attendee.student._id}>
              <ListItem>
                <ListItemIcon>
                  <PersonIcon color="success" />
                </ListItemIcon>
                <ListItemText
                  primary={`${attendee.student.firstName} ${attendee.student.lastName}`}
                  secondary={`ID: ${attendee.student.universityId} • Scanned: ${new Date(attendee.scannedAt).toLocaleTimeString()}`}
                />
                <Chip
                  label={attendee.markedManually ? 'Manual' : 'QR Scan'}
                  size="small"
                  color={attendee.markedManually ? 'primary' : 'success'}
                />
              </ListItem>
              {index < sessionDetails.attendees.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
          No students have been marked present yet.
        </Typography>
      )}
    </Paper>
  );
};

export default SessionView;