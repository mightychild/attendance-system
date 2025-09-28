import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Class as ClassIcon,
  People as PeopleIcon,
  Schedule as ScheduleIcon,
  School as SchoolIcon
} from '@mui/icons-material';
import DashboardLayout from '../../layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { getStudentEnrollments } from '../../utils/enrollmentAPI';

const StudentCourses = () => {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        setLoading(true);
        const response = await getStudentEnrollments(user._id);
        setEnrollments(response.data.enrollments);
      } catch (err) {
        setError(err.message || 'Failed to load your courses');
      } finally {
        setLoading(false);
      }
    };

    if (user?._id) {
      fetchEnrollments();
    }
  }, [user]);

  const formatSchedule = (schedule) => {
    if (!schedule || !schedule.days || schedule.days.length === 0) return 'Not scheduled';
    return `${schedule.days.join(', ')} ${schedule.startTime}-${schedule.endTime}`;
  };

  const getAttendanceColor = (percentage) => {
    if (percentage >= 80) return 'success';
    if (percentage >= 60) return 'warning';
    return 'error';
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box>
        <Typography variant="h4" component="h1" gutterBottom color="primary.main">
          My Courses
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {enrollments.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <ClassIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No courses enrolled
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Browse available courses and enroll to get started.
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {enrollments.map((enrollment) => (
              <Grid item xs={12} md={6} key={enrollment._id}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                      <Typography variant="h6" component="h2">
                        {enrollment.course.courseCode}
                      </Typography>
                      <Chip
                        label={`${enrollment.attendancePercentage}%`}
                        color={getAttendanceColor(enrollment.attendancePercentage)}
                        size="small"
                      />
                    </Box>
                    
                    <Typography variant="body1" color="text.primary" gutterBottom>
                      {enrollment.course.courseName}
                    </Typography>

                    <Box mb={2}>
                      <Box display="flex" alignItems="center" mb={1}>
                        <SchoolIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          Lecturer: {enrollment.course.lecturer?.firstName} {enrollment.course.lecturer?.lastName}
                        </Typography>
                      </Box>

                      <Box display="flex" alignItems="center" mb={1}>
                        <ScheduleIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          {formatSchedule(enrollment.course.schedule)}
                          {enrollment.course.schedule?.room && ` • ${enrollment.course.schedule.room}`}
                        </Typography>
                      </Box>
                      
                      <Box display="flex" alignItems="center" mb={1}>
                        <PeopleIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          Credits: {enrollment.course.credits}
                        </Typography>
                      </Box>
                    </Box>

                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Enrolled: {new Date(enrollment.enrollmentDate).toLocaleDateString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {enrollment.classesAttended}/{enrollment.totalClasses} classes
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </DashboardLayout>
  );
};

export default StudentCourses;