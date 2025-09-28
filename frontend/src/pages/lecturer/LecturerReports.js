import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  Download as DownloadIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon
} from '@mui/icons-material';
import DashboardLayout from '../../layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { getLecturerCourses } from '../../utils/courseAPI';
import { getCoursePerformanceReport, downloadAttendanceReport } from '../../utils/reportAPI';

const LecturerReports = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [performanceStats, setPerformanceStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoadingCourses(true);
        const response = await getLecturerCourses(user._id);
        setCourses(response.data.courses);

        if (response.data.courses.length > 0) {
          setSelectedCourse(response.data.courses[0]);
        }
      } catch (err) {
        setError('Failed to load courses');
      } finally {
        setLoadingCourses(false);
        setLoading(false);
      }
    };

    if (user?._id) {
      fetchCourses();
    }
  }, [user]);

  useEffect(() => {
    if (selectedCourse) {
      fetchPerformanceStats();
    }
  }, [selectedCourse]);

  const fetchPerformanceStats = async () => {
    try {
      setLoading(true);
      const response = await getCoursePerformanceReport(selectedCourse._id);
      setPerformanceStats(response.data.performance);
    } catch (err) {
      setError('Failed to load performance statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async (format) => {
    if (!selectedCourse) return;

    try {
      setDownloading(true);
      const response = await downloadAttendanceReport(selectedCourse._id, format);
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attendance-report-${selectedCourse.courseCode}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Failed to download report');
    } finally {
      setDownloading(false);
    }
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
          Attendance Reports
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Course Selection */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Select Course for Reports
          </Typography>
          {loadingCourses ? (
            <CircularProgress />
          ) : (
            <FormControl fullWidth>
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
          )}
        </Paper>

        {selectedCourse && performanceStats && (
          <Grid container spacing={3}>
            {/* Performance Overview */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <TrendingUpIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6">Performance Overview</Typography>
                  </Box>
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

            {/* Attendance Distribution */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <PeopleIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6">Attendance Distribution</Typography>
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    {Object.entries(performanceStats.attendanceDistribution).map(([range, count]) => (
                      <Box key={range} display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="body2">{range}</Typography>
                        <Typography variant="h6">{count}</Typography>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Report Actions */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <AssessmentIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6">Generate Reports</Typography>
                  </Box>
                  <Box display="flex" gap={2}>
                    <Button
                      variant="contained"
                      startIcon={<DownloadIcon />}
                      onClick={() => handleDownloadReport('csv')}
                      disabled={downloading}
                    >
                      Download CSV Report
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<DownloadIcon />}
                      onClick={() => handleDownloadReport('json')}
                      disabled={downloading}
                    >
                      Download JSON Report
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {!selectedCourse && !loading && (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <AssessmentIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No course selected
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Please select a course to view reports and generate attendance data.
            </Typography>
          </Paper>
        )}
      </Box>
    </DashboardLayout>
  );
};

export default LecturerReports;