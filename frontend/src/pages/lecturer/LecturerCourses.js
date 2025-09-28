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
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import DashboardLayout from '../../layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { getLecturerCourses } from '../../utils/courseAPI';

const LecturerCourses = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await getLecturerCourses(user._id);
        setCourses(response.data.courses);
      } catch (err) {
        setError(err.message || 'Failed to load courses');
      } finally {
        setLoading(false);
      }
    };

    if (user?._id) {
      fetchCourses();
    }
  }, [user]);

  const formatSchedule = (schedule) => {
    if (!schedule || !schedule.days || schedule.days.length === 0) return 'Not scheduled';
    return `${schedule.days.join(', ')} ${schedule.startTime}-${schedule.endTime}`;
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

        {courses.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <ClassIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No courses assigned
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Contact administration to get assigned to courses.
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {courses.map((course) => (
              <Grid item xs={12} md={6} key={course._id}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                      <Typography variant="h6" component="h2">
                        {course.courseCode}
                      </Typography>
                      <Chip
                        label={course.isActive ? 'Active' : 'Inactive'}
                        color={course.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </Box>
                    
                    <Typography variant="body1" color="text.primary" gutterBottom>
                      {course.courseName}
                    </Typography>

                    {course.description && (
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {course.description}
                      </Typography>
                    )}

                    <Box mb={2}>
                      <Box display="flex" alignItems="center" mb={1}>
                        <ScheduleIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          {formatSchedule(course.schedule)}
                          {course.schedule?.room && ` • ${course.schedule.room}`}
                        </Typography>
                      </Box>
                      
                      <Box display="flex" alignItems="center" mb={1}>
                        <PeopleIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          {course.currentEnrollment} / {course.maxStudents} students
                        </Typography>
                      </Box>
                    </Box>

                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        {course.semester} {course.academicYear}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {course.credits} credits
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

export default LecturerCourses;