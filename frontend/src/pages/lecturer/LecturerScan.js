import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Alert,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Class as ClassIcon,
  QrCodeScanner as ScanIcon,
  PlayArrow as PlayArrowIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import DashboardLayout from '../../layout/DashboardLayout';
import QRScanner from '../../components/attendance/QRScanner';
import SessionView from '../../components/attendance/SessionView';
import { useAuth } from '../../context/AuthContext';
import { getLecturerCourses } from '../../utils/courseAPI';
import { getCourseEnrollments } from '../../utils/enrollmentAPI';
import { startSession, getSession, endSession } from '../../utils/attendanceAPI';

const LecturerScan = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [scannerOpen, setScannerOpen] = useState(false);
  const [activeSession, setActiveSession] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(false);

  const fetchCourses = async () => {
    try {
      setLoadingCourses(true);
      setError('');
      const response = await getLecturerCourses(user._id);
      setCourses(response.data.courses);

      if (response.data.courses.length > 0 && !selectedCourse) {
        setSelectedCourse(response.data.courses[0]);
      }

    } catch (err) {
      setError(err.message || 'Failed to load courses');
    } finally {
      setLoadingCourses(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?._id) {
      fetchCourses();
    }
  }, [user]);

  const fetchEnrollments = async () => {
    if (!selectedCourse) return;

    try {
      setRefreshing(true);
      const response = await getCourseEnrollments(selectedCourse._id);
      setEnrollments(response.data.enrollments);

    } catch (err) {
      setError(err.message || 'Failed to load enrollments');
    } finally {
      setRefreshing(false);
    }
  };

  const handleStartSession = async () => {
    if (!selectedCourse) {
      setError('Please select a course first.');
      return;
    }

    try {
      setSessionLoading(true);
      setError('');
      const response = await startSession(selectedCourse._id, 30);
      setActiveSession(response.data.session);
      setSuccess(`Attendance session started for ${selectedCourse.courseCode}!`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to start session');
    } finally {
      setSessionLoading(false);
    }
  };

  const handleCheckSession = async () => {
    if (!selectedCourse) return;
    
    try {
      setSessionLoading(true);
      setError('');
      const response = await getSession(selectedCourse._id);
      setActiveSession(response.data.session || null);
    } catch (err) {
      setActiveSession(null);
    } finally {
      setSessionLoading(false);
    }
  };

  const handleSessionEnded = () => {
    setActiveSession(null);
    setScannerOpen(false);
  };

  const handleAttendanceMarked = (student) => {
    if (activeSession) {
      handleCheckSession();
    }
  };

  useEffect(() => {
    if (selectedCourse) {
      fetchEnrollments();
      handleCheckSession();
    } else {
      setActiveSession(null);
    }
  }, [selectedCourse]);

  if (loading) {
    return (
      <DashboardLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Loading your courses...</Typography>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom color="primary.main">
              Take Attendance
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Start an attendance session and scan student QR codes
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => {
              fetchCourses();
              fetchEnrollments();
              handleCheckSession();
            }}
            disabled={refreshing}
          >
            Refresh
          </Button>
        </Box>

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

        {/* Active Session Display */}
        {activeSession && (
          <Box sx={{ mb: 3 }}>
            <SessionView
              session={activeSession}
              onSessionEnded={handleSessionEnded}
              onRefresh={handleCheckSession}
            />
          </Box>
        )}

        {/* Course Selection and Session Start */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Start Attendance Session
          </Typography>
          {loadingCourses ? (
            <CircularProgress />
          ) : (
            <>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Select Course</InputLabel>
                <Select
                  value={selectedCourse?._id || ''}
                  onChange={(e) => setSelectedCourse(courses.find(c => c._id === e.target.value))}
                  label="Select Course"
                >
                  {courses.map((course) => (
                    <MenuItem key={course._id} value={course._id}>
                      {course.courseCode} - {course.courseName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Box display="flex" gap={2} alignItems="center">
                <Button
                  variant="contained"
                  onClick={handleStartSession}
                  disabled={!selectedCourse || sessionLoading || activeSession}
                  startIcon={sessionLoading ? <CircularProgress size={20} /> : <PlayArrowIcon />}
                  size="large"
                >
                  {sessionLoading ? 'Starting...' : 'Start Attendance Session'}
                </Button>
                
                {selectedCourse && activeSession && (
                  <Button
                    variant="contained"
                    color="secondary"
                    startIcon={<ScanIcon />}
                    onClick={() => setScannerOpen(true)}
                    disabled={refreshing || enrollments.length === 0}
                    size="large"
                  >
                    Start Scanning QR Codes
                  </Button>
                )}
              </Box>
            </>
          )}
        </Paper>

        {/* Quick Stats */}
        {selectedCourse && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <ClassIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h4">{selectedCourse.currentEnrollment}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Enrolled Students
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <ScanIcon sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
                  <Typography variant="h4">
                    {activeSession?.attendees?.length || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Present Today
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary.main">
                    {selectedCourse.courseCode}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Current Course
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* QR Scanner Dialog */}
        <QRScanner
          open={scannerOpen}
          onClose={() => setScannerOpen(false)}
          session={activeSession}
          onAttendanceMarked={handleAttendanceMarked}
        />
      </Box>
    </DashboardLayout>
  );
};

export default LecturerScan;