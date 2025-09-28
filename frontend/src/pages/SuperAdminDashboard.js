import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Alert,
  Button,
  Tabs,
  Tab,
  CircularProgress,
  Chip,
  IconButton
} from '@mui/material';
import {
  People as PeopleIcon,
  Class as ClassIcon,
  Assessment as AssessmentIcon,
  Add as AddIcon,
  School as SchoolIcon,
  Group as GroupIcon,
  Refresh as RefreshIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import DashboardLayout from '../layout/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import CourseList from '../components/course/CourseList';
import CourseForm from '../components/course/CourseForm';
import StatsCard from '../components/dashboard/StatsCard';
import { getDashboardStats } from '../utils/statsAPI';

const SuperAdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [refreshCourses, setRefreshCourses] = useState(0);
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState('');

  // Fetch stats with proper error handling
  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      setStatsError('');
      console.log('🔄 Fetching dashboard stats...');
      
      const data = await getDashboardStats();
      setStats(data);
      console.log('✅ Dashboard stats loaded successfully');
      
    } catch (err) {
      console.error('❌ Error fetching stats:', err);
      setStatsError('Failed to load statistics. Please try again.');
    } finally {
      setLoadingStats(false);
    }
  };

  // Fetch stats on component mount and when refresh is triggered
  useEffect(() => {
    fetchStats();
  }, [refreshCourses]);

  const handleCreateCourse = () => {
    setEditingCourse(null);
    setShowCourseForm(true);
  };

  const handleEditCourse = (course) => {
    setEditingCourse(course);
    setShowCourseForm(true);
  };

  const handleSaveCourse = () => {
    setShowCourseForm(false);
    setEditingCourse(null);
    setRefreshCourses(prev => prev + 1); // Refresh stats after course changes
  };

  const handleCancelCourse = () => {
    setShowCourseForm(false);
    setEditingCourse(null);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleRefreshStats = () => {
    setRefreshCourses(prev => prev + 1);
  };

  // Stats cards data
  const statsCards = [
    {
      title: 'Total Users',
      value: stats?.userStats?.totalUsers ?? 0,
      icon: <PeopleIcon />,
      color: '#00e5ff',
      subtitle: `${stats?.userStats?.lecturers ?? 0} lecturers, ${stats?.userStats?.students ?? 0} students`
    },
    {
      title: 'Total Courses',
      value: stats?.courseStats?.totalCourses ?? 0,
      icon: <ClassIcon />,
      color: '#69f0ae',
      subtitle: `${stats?.courseStats?.totalEnrollment ?? 0} students enrolled`
    },
    {
      title: 'Active Lecturers',
      value: stats?.userStats?.lecturers ?? 0,
      icon: <SchoolIcon />,
      color: '#ff3d00',
      subtitle: `${stats?.userStats?.inactiveUsers ?? 0} inactive users`
    },
    {
      title: 'Enrollment Rate',
      value: stats?.courseStats?.totalCapacity ? 
        `${Math.round((stats.courseStats.totalEnrollment / stats.courseStats.totalCapacity) * 100)}%` : '0%',
      icon: <GroupIcon />,
      color: '#ffca28',
      subtitle: `${stats?.courseStats?.totalEnrollment ?? 0}/${stats?.courseStats?.totalCapacity ?? 0} seats filled`
    }
  ];

  // Show loading state
  if (loadingStats && !stats) {
    return (
      <DashboardLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px" flexDirection="column">
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>Loading dashboard statistics...</Typography>
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
              Super Admin Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage the entire attendance system, users, and courses
            </Typography>
          </Box>
          <Box display="flex" gap={1}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefreshStats}
              disabled={loadingStats}
            >
              Refresh
            </Button>
            {!showCourseForm && (
              <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateCourse}>
                New Course
              </Button>
            )}
          </Box>
        </Box>

        {/* Error Alert */}
        {statsError && (
          <Alert 
            severity="warning" 
            sx={{ mb: 2 }}
            action={
              <Button color="inherit" size="small" onClick={handleRefreshStats}>
                Retry
              </Button>
            }
          >
            {statsError}
          </Alert>
        )}

        <Alert severity="info" sx={{ mb: 3 }}>
          Welcome, {user?.firstName} {user?.lastName}! You have full system access.
        </Alert>

        {/* Stats Section */}
        {!showCourseForm && (
          <>
            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {statsCards.map((stat, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <StatsCard
                    title={stat.title}
                    value={stat.value}
                    icon={stat.icon}
                    color={stat.color}
                    subtitle={stat.subtitle}
                  />
                </Grid>
              ))}
            </Grid>

            {/* Recent Activity */}
            {stats?.recentActivity && (stats.recentActivity.recentUsers > 0 || stats.recentActivity.recentCourses > 0) && (
              <Paper sx={{ p: 2, mb: 3 }}>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <ScheduleIcon color="primary" />
                  <Typography variant="h6">Recent Activity</Typography>
                </Box>
                <Box display="flex" gap={3}>
                  <Chip 
                    label={`${stats.recentActivity.recentUsers} new users`} 
                    color="primary" 
                    variant="outlined" 
                  />
                  <Chip 
                    label={`${stats.recentActivity.recentCourses} new courses`} 
                    color="secondary" 
                    variant="outlined" 
                  />
                </Box>
              </Paper>
            )}

            {/* Tabs */}
            <Paper sx={{ mb: 2 }}>
              <Tabs value={activeTab} onChange={handleTabChange}>
                <Tab label="Course Management" />
                <Tab label="User Management" />
                <Tab label="Reports" />
              </Tabs>
            </Paper>

            {/* Course Management Tab */}
            {activeTab === 0 && (
              <CourseList
                onEditCourse={handleEditCourse}
                onCreateCourse={handleCreateCourse}
                key={refreshCourses}
              />
            )}

            {/* User Management Tab */}
            {activeTab === 1 && (
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6" color="primary.main" gutterBottom>
                  User Management
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Manage all system users including lecturers and students.
                </Typography>
                <Button 
                  variant="outlined" 
                  sx={{ mt: 2 }}
                  onClick={() => window.location.href = '/admin/users'}
                >
                  Go to User Management
                </Button>
              </Paper>
            )}

            {/* Reports Tab */}
            {activeTab === 2 && (
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" color="primary.main" gutterBottom>
                  System Reports
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2">User Statistics</Typography>
                    <Typography variant="body2">
                      Total Users: {stats?.userStats?.totalUsers}
                    </Typography>
                    <Typography variant="body2">
                      Lecturers: {stats?.userStats?.lecturers}
                    </Typography>
                    <Typography variant="body2">
                      Students: {stats?.userStats?.students}
                    </Typography>
                    <Typography variant="body2">
                      Inactive Users: {stats?.userStats?.inactiveUsers}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2">Course Statistics</Typography>
                    <Typography variant="body2">
                      Total Courses: {stats?.courseStats?.totalCourses}
                    </Typography>
                    <Typography variant="body2">
                      Total Enrollment: {stats?.courseStats?.totalEnrollment}
                    </Typography>
                    <Typography variant="body2">
                      Total Capacity: {stats?.courseStats?.totalCapacity}
                    </Typography>
                    <Typography variant="body2">
                      Average per Course: {Math.round(stats?.courseStats?.averageEnrollment || 0)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ mt: 2 }}>
                      System Security
                    </Typography>
                    <Typography variant="body2" color="success.main">
                      ✓ QR Code Security: Enabled (Token-based with 60s expiration)
                    </Typography>
                    <Typography variant="body2" color="success.main">
                      ✓ Student Identity Verification: Active
                    </Typography>
                    <Typography variant="body2" color="success.main">
                      ✓ Replay Attack Protection: Enabled
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            )}
          </>
        )}

        {/* Course Form */}
        {showCourseForm && (
          <CourseForm
            course={editingCourse}
            onSave={handleSaveCourse}
            onCancel={handleCancelCourse}
          />
        )}

        {/* Debug Info */}
        {/* <Paper sx={{ p: 2, mt: 4, bgcolor: 'grey.100' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="caption" color="text.secondary">
              <strong>User:</strong> {user?.email} | <strong>Role:</strong> {user?.role}
            </Typography>
            {stats?.lastUpdated && (
              <Typography variant="caption" color="text.secondary">
                Last updated: {new Date(stats.lastUpdated).toLocaleTimeString()}
              </Typography>
            )}
          </Box>
        </Paper> */}
      </Box>
    </DashboardLayout>
  );
};

export default SuperAdminDashboard;