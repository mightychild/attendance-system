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
  Tabs,
  Tab,
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  IconButton,
  Tooltip,
  TextField,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  FormControl,
  InputLabel,
  Select,
  Menu
} from '@mui/material';
import {
  Class as ClassIcon,
  QrCodeScanner as ScanIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as UncheckedIcon,
  Today as TodayIcon,
  Close as CloseIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Person as PersonIcon,
  PlayArrow as PlayArrowIcon,
  Download as DownloadIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';
import DashboardLayout from '../layout/DashboardLayout';
import QRScanner from '../components/attendance/QRScanner';
import SessionView from '../components/attendance/SessionView';
import { useAuth } from '../context/AuthContext';
import { getLecturerCourses } from '../utils/courseAPI';
import { getCourseEnrollments } from '../utils/enrollmentAPI';
import { startSession, getSession, endSession } from '../utils/attendanceAPI';
import { downloadAttendanceReport, getCoursePerformanceReport } from '../utils/reportAPI';

const LecturerDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [performanceStats, setPerformanceStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loadingPerformance, setLoadingPerformance] = useState(false);
  const [downloadingReport, setDownloadingReport] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [scannerOpen, setScannerOpen] = useState(false);
  const [activeSession, setActiveSession] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [reportMenuAnchor, setReportMenuAnchor] = useState(null);

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

  const fetchPerformanceStats = async () => {
    if (!selectedCourse) return;

    try {
      setLoadingPerformance(true);
      const response = await getCoursePerformanceReport(selectedCourse._id);
      setPerformanceStats(response.data.performance);
    } catch (err) {
      console.error('Failed to load performance stats:', err);
    } finally {
      setLoadingPerformance(false);
    }
  };

  const handleDownloadReport = async (format) => {
    if (!selectedCourse) return;

    try {
      setDownloadingReport(true);
      setReportMenuAnchor(null);
      
      const response = await downloadAttendanceReport(selectedCourse._id, format);
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attendance-report-${selectedCourse.courseCode}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      setSuccess(`Report downloaded successfully!`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to download report');
    } finally {
      setDownloadingReport(false);
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
      fetchPerformanceStats();
    } else {
      setActiveSession(null);
      setPerformanceStats(null);
    }
  }, [selectedCourse]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const getAttendanceColor = (percentage) => {
    if (percentage >= 80) return 'success';
    if (percentage >= 60) return 'warning';
    return 'error';
  };

  const formatSchedule = (schedule) => {
    if (!schedule || !schedule.days || schedule.days.length === 0) return 'No schedule';
    return `${schedule.days.join(', ')} ${schedule.startTime}-${schedule.endTime}`;
  };

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
              Lecturer Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your courses and track student attendance
            </Typography>
          </Box>
          <Box display="flex" gap={1}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => {
                fetchCourses();
                fetchEnrollments();
                handleCheckSession();
                fetchPerformanceStats();
              }}
              disabled={refreshing}
            >
              Refresh
            </Button>
            {selectedCourse && activeSession && (
              <Button
                variant="contained"
                startIcon={<ScanIcon />}
                onClick={() => setScannerOpen(true)}
                disabled={refreshing || enrollments.length === 0}
              >
                Take Attendance (QR Scan)
              </Button>
            )}
          </Box>
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

        <Alert severity="info" sx={{ mb: 3 }}>
          Welcome, {user?.firstName}! Manage your courses and track student attendance here.
        </Alert>

        {activeSession && (
          <Box sx={{ mb: 3 }}>
            <SessionView
              session={activeSession}
              onSessionEnded={handleSessionEnded}
              onRefresh={handleCheckSession}
            />
          </Box>
        )}

        <Paper sx={{ p: 2, mb: 3 }}>
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
                >
                  {sessionLoading ? 'Starting...' : 'Start Attendance Session'}
                </Button>
                
                {selectedCourse && (
                  <>
                    <Button
                      variant="outlined"
                      startIcon={<DownloadIcon />}
                      onClick={(e) => setReportMenuAnchor(e.currentTarget)}
                      disabled={downloadingReport}
                    >
                      {downloadingReport ? <CircularProgress size={20} /> : 'Download Report'}
                    </Button>
                    <Menu
                      anchorEl={reportMenuAnchor}
                      open={Boolean(reportMenuAnchor)}
                      onClose={() => setReportMenuAnchor(null)}
                    >
                      <MenuItem onClick={() => handleDownloadReport('csv')}>
                        Download as CSV
                      </MenuItem>
                      <MenuItem onClick={() => handleDownloadReport('json')}>
                        Download as JSON
                      </MenuItem>
                    </Menu>
                  </>
                )}
              </Box>
            </>
          )}
        </Paper>

        <Paper sx={{ mb: 2 }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="Course Overview" />
          </Tabs>
        </Paper>

        {activeTab === 0 && (
          <Box>
            {!selectedCourse ? (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <ClassIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  {courses.length === 0 ? 'No courses assigned' : 'Select a course to view details'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {courses.length === 0 
                    ? 'Contact administration to get assigned to courses.' 
                    : 'Choose a course from the selection above.'
                  }
                </Typography>
              </Paper>
            ) : (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom color="primary.main">
                        Course Information
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        <strong>Code:</strong> {selectedCourse.courseCode}
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        <strong>Name:</strong> {selectedCourse.courseName}
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        <strong>Schedule:</strong> {formatSchedule(selectedCourse.schedule)}
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        <strong>Room:</strong> {selectedCourse.schedule?.room || 'Not specified'}
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        <strong>Credits:</strong> {selectedCourse.credits}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom color="primary.main">
                        Enrollment Statistics
                      </Typography>
                      <Box display="flex" justifyContent="space-around" textAlign="center">
                        <Box>
                          <PeopleIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                          <Typography variant="h4">{selectedCourse.currentEnrollment}</Typography>
                          <Typography variant="body2">Enrolled</Typography>
                        </Box>
                        <Box>
                          <ClassIcon sx={{ fontSize: 40, color: 'secondary.main' }} />
                          <Typography variant="h4">{selectedCourse.maxStudents}</Typography>
                          <Typography variant="body2">Capacity</Typography>
                        </Box>
                        <Box>
                          <AssessmentIcon sx={{ fontSize: 40, color: 'success.main' }} />
                          <Typography variant="h4">
                            {Math.round((selectedCourse.currentEnrollment / selectedCourse.maxStudents) * 100)}%
                          </Typography>
                          <Typography variant="body2">Full</Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12}>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Quick Actions
                    </Typography>
                    <Box display="flex" gap={2} flexWrap="wrap">
                      {!activeSession ? (
                        <Button
                          variant="contained"
                          startIcon={sessionLoading ? <CircularProgress size={16} /> : <PlayArrowIcon />}
                          onClick={handleStartSession}
                          disabled={sessionLoading}
                        >
                          {sessionLoading ? 'Starting...' : 'Start Attendance Session'}
                        </Button>
                      ) : (
                        <Button
                          variant="contained"
                          startIcon={<ScanIcon />}
                          onClick={() => setScannerOpen(true)}
                          disabled={enrollments.length === 0}
                        >
                          Take QR Attendance
                        </Button>
                      )}
                      <Button
                        variant="outlined"
                        startIcon={<AssessmentIcon />}
                        onClick={() => setActiveTab(2)}
                      >
                        View Reports
                      </Button>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            )}
          </Box>
        )}

        {activeTab === 1 && selectedCourse && (
          <Box>

            {enrollments.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <PeopleIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No students enrolled
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Students can enroll through their student dashboard.
                </Typography>
              </Paper>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Student ID</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell align="center">Classes Attended</TableCell>
                      <TableCell align="center">Total Classes</TableCell>
                      <TableCell align="center">Attendance</TableCell>
                      <TableCell align="center">Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {enrollments.map((enrollment) => (
                      <TableRow key={enrollment._id}>
                        <TableCell>{enrollment.student.universityId}</TableCell>
                        <TableCell>
                          {enrollment.student.firstName} {enrollment.student.lastName}
                        </TableCell>
                        <TableCell>{enrollment.student.email}</TableCell>
                        <TableCell align="center">{enrollment.classesAttended}</TableCell>
                        <TableCell align="center">{enrollment.totalClasses}</TableCell>
                        <TableCell align="center">
                          <Chip
                            label={`${enrollment.attendancePercentage}%`}
                            color={getAttendanceColor(enrollment.attendancePercentage)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={enrollment.attendancePercentage >= 75 ? 'Satisfactory' : 'Needs Improvement'}
                            color={enrollment.attendancePercentage >= 75 ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}

        {activeTab === 2 && selectedCourse && (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              Attendance Reports - {selectedCourse.courseCode}
            </Typography>

            {loadingPerformance ? (
              <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
              </Box>
            ) : performanceStats ? (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom color="primary.main">
                        Performance Overview
                      </Typography>
                      <Box textAlign="center" py={3}>
                        <Typography variant="h3" color="primary.main" gutterBottom>
                          {Math.round(performanceStats.averageAttendance)}%
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Average Class Attendance
                        </Typography>
                      </Box>
                      <Grid container spacing={2} sx={{ mt: 2 }}>
                        <Grid item xs={6}>
                          <Box textAlign="center">
                            <Typography variant="h4" color="success.main">
                              {performanceStats.excellentStudents}
                            </Typography>
                            <Typography variant="body2">Excellent (80-100%)</Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box textAlign="center">
                            <Typography variant="h4" color="warning.main">
                              {performanceStats.goodStudents}
                            </Typography>
                            <Typography variant="body2">Good (60-79%)</Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box textAlign="center">
                            <Typography variant="h4" color="error.main">
                              {performanceStats.needsImprovement}
                            </Typography>
                            <Typography variant="body2">Needs Improvement</Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box textAlign="center">
                            <Typography variant="h4" color="primary.main">
                              {performanceStats.totalStudents}
                            </Typography>
                            <Typography variant="body2">Total Students</Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom color="primary.main">
                        Attendance Distribution
                      </Typography>
                      <Box sx={{ mt: 2 }}>
                        {Object.entries(performanceStats.attendanceDistribution).map(([range, count]) => (
                          <Box key={range} display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                            <Typography variant="body2">{range}</Typography>
                            <Chip label={count} size="small" />
                          </Box>
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12}>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Export Reports
                    </Typography>
                    <Box display="flex" gap={2}>
                      <Button
                        variant="contained"
                        startIcon={<DownloadIcon />}
                        onClick={() => handleDownloadReport('csv')}
                        disabled={downloadingReport}
                      >
                        Download CSV Report
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<DownloadIcon />}
                        onClick={() => handleDownloadReport('json')}
                        disabled={downloadingReport}
                      >
                        Download JSON Report
                      </Button>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            ) : (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <AssessmentIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No attendance data available
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Take attendance to generate reports.
                </Typography>
              </Paper>
            )}
          </Box>
        )}

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

export default LecturerDashboard;