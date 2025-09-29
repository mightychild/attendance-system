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
  Button
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  TrendingUp as TrendingUpIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import DashboardLayout from '../../layout/DashboardLayout';
import { getDashboardStats } from '../../utils/statsAPI';

const AdminReports = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await getDashboardStats();
      setStats(data);
    } catch (err) {
      setError(err.message || 'Failed to load statistics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStats();
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
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1" color="primary.main">
            System Reports & Analytics
          </Typography>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={refreshing}
          >
            Refresh
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {stats ? (
          <Grid container spacing={3}>
            {/* User Statistics */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <PeopleIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6">User Statistics</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography>Total Users:</Typography>
                    <Typography fontWeight="bold">{stats.userStats.totalUsers}</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography>Super Admins:</Typography>
                    <Typography fontWeight="bold">{stats.userStats.superAdmins}</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography>Lecturers:</Typography>
                    <Typography fontWeight="bold">{stats.userStats.lecturers}</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography>Students:</Typography>
                    <Typography fontWeight="bold">{stats.userStats.students}</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography>Inactive Users:</Typography>
                    <Typography fontWeight="bold" color="error.main">
                      {stats.userStats.inactiveUsers}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Course Statistics */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <SchoolIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6">Course Statistics</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography>Total Courses:</Typography>
                    <Typography fontWeight="bold">{stats.courseStats.totalCourses}</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography>Total Capacity:</Typography>
                    <Typography fontWeight="bold">{stats.courseStats.totalCapacity}</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography>Total Enrollment:</Typography>
                    <Typography fontWeight="bold">{stats.courseStats.totalEnrollment}</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography>Average per Course:</Typography>
                    <Typography fontWeight="bold">
                      {Math.round(stats.courseStats.averageEnrollment)}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography>Utilization Rate:</Typography>
                    <Typography fontWeight="bold">
                      {Math.round((stats.courseStats.totalEnrollment / stats.courseStats.totalCapacity) * 100)}%
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Recent Activity */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <TrendingUpIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6">Recent Activity (Last 7 Days)</Typography>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" p={2} bgcolor="grey.50" borderRadius={1}>
                        <Typography>New Users:</Typography>
                        <Typography variant="h6" color="primary.main">
                          {stats.recentActivity.recentUsers}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" p={2} bgcolor="grey.50" borderRadius={1}>
                        <Typography>New Courses:</Typography>
                        <Typography variant="h6" color="primary.main">
                          {stats.recentActivity.recentCourses}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        ) : (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <AssessmentIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No data available
            </Typography>
            <Typography variant="body2" color="text.secondary">
              System statistics will appear here once data is available.
            </Typography>
          </Paper>
        )}
      </Box>
    </DashboardLayout>
  );
};

export default AdminReports;