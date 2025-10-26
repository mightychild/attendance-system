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
  DialogContent
  DialogActions
} from '@mui/material';
import {
  Class as ClassIcon,
  Assessment as AssessmentIcon,
  Add as AddIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  BarChart as BarChartIcon,
  QrCode as QrCodeIcon
} from '@mui/icons-material';
import DashboardLayout from '../layout/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { getStudentEnrollments, enrollInCourse, dropEnrollment } from '../utils/enrollmentAPI';
import { getCourses } from '../utils/courseAPI';
import StudentIDCard from '../components/student/StudentIDCard';
import ConfirmationDialog from '../components/common/ConfirmationDialog';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [enrollments, setEnrollments] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    enrollmentId: null,
    courseId: null,
    action: null,
    title: '',
    message: '',
    type: 'warning'
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch student's enrollments
      const enrollmentsResponse = await getStudentEnrollments(user._id);
      setEnrollments(enrollmentsResponse.data.enrollments);

      // Fetch available courses (not enrolled in)
      const coursesResponse = await getCourses();
      const enrolledCourseIds = enrollmentsResponse.data.enrollments.map(e => e.course._id);
      const available = coursesResponse.data.courses.filter(
        course => !enrolledCourseIds.includes(course._id) && course.isActive
      );
      setAvailableCourses(available);

    } catch (err) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showConfirmation = (enrollmentId, courseId, action, title, message, type = 'warning') => {
    setConfirmDialog({
      open: true,
      enrollmentId,
      courseId,
      action,
      title,
      message,
      type
    });
  };

  const handleConfirm = async () => {
    const { enrollmentId, courseId, action } = confirmDialog;
    
    try {
      if (action === 'enroll') {
        // Optimistic update: add to enrollments immediately
        const courseToEnroll = availableCourses.find(c => c._id === courseId);
        const newEnrollment = {
          _id: `temp-${Date.now()}`,
          course: courseToEnroll,
          enrollmentDate: new Date(),
          status: 'enrolled',
          attendancePercentage: 0,
          totalClasses: 0,
          classesAttended: 0
        };
        
        setEnrollments(prev => [...prev, newEnrollment]);
        setAvailableCourses(prev => prev.filter(course => course._id !== courseId));
        
        // Call API
        const response = await enrollInCourse(courseId);
        
        // Replace temporary enrollment with real one
        setEnrollments(prev => 
          prev.map(e => e._id === newEnrollment._id ? response.data.enrollment : e)
        );
        
        setSuccess('Enrolled in course successfully!');
        
      } else if (action === 'drop') {
        // Find the enrollment before removing it
        const enrollmentToDrop = enrollments.find(e => e._id === enrollmentId);
        
        // Optimistic update: remove immediately
        setEnrollments(prev => prev.filter(e => e._id !== enrollmentId));
        setAvailableCourses(prev => [...prev, enrollmentToDrop.course]);
        
        // Call API
        await dropEnrollment(enrollmentId);
        setSuccess('Course dropped successfully!');
      }
    } catch (err) {
      setError(err.message || `Failed to ${action} course`);
      // Revert optimistic update on error
      fetchData();
    } finally {
      setConfirmDialog({ 
        open: false, 
        enrollmentId: null, 
        courseId: null, 
        action: null, 
        title: '', 
        message: '', 
        type: 'warning' 
      });
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const handleEnroll = (course) => {
    showConfirmation(
      null,
      course._id,
      'enroll',
      'Enroll in Course',
      `Are you sure you want to enroll in ${course.courseCode} - ${course.courseName}?`,
      'info'
    );
  };

  const handleDrop = (enrollmentId) => {
    const enrollment = enrollments.find(e => e._id === enrollmentId);
    showConfirmation(
      enrollmentId,
      null,
      'drop',
      'Drop Course',
      `Are you sure you want to drop ${enrollment.course.courseCode} - ${enrollment.course.courseName}? This action cannot be undone.`,
      'warning'
    );
  };

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
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom color="primary.main">
              Student Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your courses and track your attendance
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setEnrollDialogOpen(true)}
            disabled={refreshing}
          >
            Enroll in Course
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

        <Alert severity="info" sx={{ mb: 3 }}>
          Welcome, {user?.firstName}! Here you can manage your course enrollments and track your attendance.
        </Alert>

        {/* Tabs */}
        <Paper sx={{ mb: 2 }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="My Courses" />
            <Tab label="Attendance Overview" />
            <Tab label="Available Courses" />
            <Tab label="My ID Card" />
          </Tabs>
        </Paper>

        {/* My Courses Tab */}
        {activeTab === 0 && (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              Your Enrolled Courses ({enrollments.length})
            </Typography>
            
            {enrollments.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <ClassIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No courses enrolled yet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Browse available courses and enroll to get started.
                </Typography>
                <Button 
                  variant="contained" 
                  sx={{ mt: 2 }}
                  onClick={() => setActiveTab(2)}
                >
                  Browse Courses
                </Button>
              </Paper>
            ) : (
              <Grid container spacing={3}>
                {enrollments.map((enrollment) => (
                  <Grid item xs={12} md={6} key={enrollment._id}>
                    <Card sx={{ height: '100%' }}>
                      <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                          <Box>
                            <Typography variant="h6" component="h2" gutterBottom>
                              {enrollment.course.courseCode}
                            </Typography>
                            <Typography variant="body1" color="text.primary" gutterBottom>
                              {enrollment.course.courseName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {formatSchedule(enrollment.course.schedule)}
                            </Typography>
                          </Box>
                          <Chip
                            label={`${enrollment.attendancePercentage}%`}
                            color={getAttendanceColor(enrollment.attendancePercentage)}
                            size="small"
                          />
                        </Box>

                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                          <Typography variant="body2">
                            <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main', mr: 0.5 }} />
                            {enrollment.classesAttended} attended
                          </Typography>
                          <Typography variant="body2">
                            <ScheduleIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
                            {enrollment.totalClasses} total
                          </Typography>
                        </Box>

                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="caption" color="text.secondary">
                            Enrolled: {new Date(enrollment.enrollmentDate).toLocaleDateString()}
                          </Typography>
                          <Button
                            size="small"
                            color="error"
                            onClick={() => handleDrop(enrollment._id)}
                            disabled={refreshing}
                          >
                            Drop Course
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}

        {/* Attendance Overview Tab */}
        {activeTab === 1 && (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              Attendance Summary
            </Typography>

            {enrollments.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <BarChartIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No attendance data available
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Enroll in courses to start tracking your attendance.
                </Typography>
              </Paper>
            ) : (
              <Grid container spacing={3}>
                {enrollments.map((enrollment) => (
                  <Grid item xs={12} key={enrollment._id}>
                    <Paper sx={{ p: 3 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h6">
                          {enrollment.course.courseCode} - {enrollment.course.courseName}
                        </Typography>
                        <Chip
                          label={`${enrollment.attendancePercentage}%`}
                          color={getAttendanceColor(enrollment.attendancePercentage)}
                        />
                      </Box>

                      <Box display="flex" alignItems="center" gap={3} mb={2}>
                        <Typography variant="body2">
                          <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main', mr: 0.5 }} />
                          {enrollment.classesAttended} classes attended
                        </Typography>
                        <Typography variant="body2">
                          <CancelIcon sx={{ fontSize: 16, color: 'error.main', mr: 0.5 }} />
                          {enrollment.totalClasses - enrollment.classesAttended} classes missed
                        </Typography>
                        <Typography variant="body2">
                          <ScheduleIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
                          {enrollment.totalClasses} total classes
                        </Typography>
                      </Box>

                      {/* Progress bar */}
                      <Box sx={{ width: '100%', bgcolor: 'grey.200', borderRadius: 1, height: 8 }}>
                        <Box
                          sx={{
                            width: `${enrollment.attendancePercentage}%`,
                            bgcolor: getAttendanceColor(enrollment.attendancePercentage) + '.main',
                            height: 8,
                            borderRadius: 1
                          }}
                        />
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}

        {/* Available Courses Tab */}
        {activeTab === 2 && (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              Available Courses ({availableCourses.length})
            </Typography>

            {availableCourses.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <ClassIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No available courses
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {enrollments.length > 0 
                    ? "You're enrolled in all available courses!" 
                    : "No courses are currently available for enrollment."
                  }
                </Typography>
              </Paper>
            ) : (
              <Grid container spacing={3}>
                {availableCourses.map((course) => (
                  <Grid item xs={12} md={6} key={course._id}>
                    <Card sx={{ height: '100%' }}>
                      <CardContent>
                        <Typography variant="h6" component="h2" gutterBottom>
                          {course.courseCode}
                        </Typography>
                        <Typography variant="body1" color="text.primary" gutterBottom>
                          {course.courseName}
                        </Typography>
                        
                        {course.description && (
                          <Typography variant="body2" color="text.secondary" paragraph>
                            {course.description}
                          </Typography>
                        )}

                        <Box mb={2}>
                          <Typography variant="body2">
                            <strong>Schedule:</strong> {formatSchedule(course.schedule)}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Credits:</strong> {course.credits}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Lecturer:</strong> {course.lecturer?.firstName} {course.lecturer?.lastName}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Enrollment:</strong> {course.currentEnrollment}/{course.maxStudents} students
                          </Typography>
                        </Box>

                        <Button
                          variant="contained"
                          fullWidth
                          onClick={() => handleEnroll(course)}
                          disabled={refreshing || course.currentEnrollment >= course.maxStudents}
                        >
                          {course.currentEnrollment >= course.maxStudents ? 'Course Full' : 'Enroll Now'}
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}

        {/* My ID Card Tab */}
        {activeTab === 3 && (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              My Student ID Card
            </Typography>
            <StudentIDCard />
          </Box>
        )}

        {/* Enrollment Dialog */}
        <Dialog open={enrollDialogOpen} onClose={() => setEnrollDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Enroll in a Course</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Select a course from the available courses tab to enroll.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEnrollDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => setActiveTab(2)} variant="contained">
              Browse Courses
            </Button>
          </DialogActions>
        </Dialog>

        {/* Confirmation Dialog */}
        <ConfirmationDialog
          open={confirmDialog.open}
          onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
          onConfirm={handleConfirm}
          title={confirmDialog.title}
          message={confirmDialog.message}
          type={confirmDialog.type}
          confirmText="Confirm"
          cancelText="Cancel"
        />

      </Box>
    </DashboardLayout>
  );
};

export default StudentDashboard;