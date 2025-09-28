import React from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent } from '@mui/material';
import {
  People as PeopleIcon,
  Class as ClassIcon,
  Assessment as AssessmentIcon,
  QrCodeScanner as ScanIcon,
} from '@mui/icons-material';
import DashboardLayout from '../layout/DashboardLayout';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  const getAdminStats = () => [
    { title: 'Total Users', value: '0', icon: <PeopleIcon />, color: '#00e5ff' },
    { title: 'Total Courses', value: '0', icon: <ClassIcon />, color: '#69f0ae' },
    { title: 'Active Lectures', value: '0', icon: <ScanIcon />, color: '#ff3d00' },
    { title: 'Reports Generated', value: '0', icon: <AssessmentIcon />, color: '#ffca28' },
  ];

  const getLecturerStats = () => [
    { title: 'My Courses', value: '0', icon: <ClassIcon />, color: '#00e5ff' },
    { title: 'Today\'s Attendance', value: '0', icon: <ScanIcon />, color: '#69f0ae' },
    { title: 'Total Students', value: '0', icon: <PeopleIcon />, color: '#ff3d00' },
    { title: 'Attendance Rate', value: '0%', icon: <AssessmentIcon />, color: '#ffca28' },
  ];

  const getStudentStats = () => [
    { title: 'Enrolled Courses', value: '0', icon: <ClassIcon />, color: '#00e5ff' },
    { title: 'Total Attendance', value: '0', icon: <AssessmentIcon />, color: '#69f0ae' },
    { title: 'Attendance Rate', value: '0%', icon: <AssessmentIcon />, color: '#ff3d00' },
    { title: 'Recent Classes', value: '0', icon: <ClassIcon />, color: '#ffca28' },
  ];

  const getStats = () => {
    switch (user?.role) {
      case 'super-admin': return getAdminStats();
      case 'lecturer': return getLecturerStats();
      case 'student': return getStudentStats();
      default: return [];
    }
  };

  const getWelcomeMessage = () => {
    switch (user?.role) {
      case 'super-admin':
        return 'Manage the entire attendance system, users, and courses';
      case 'lecturer':
        return 'Take attendance and manage your courses';
      case 'student':
        return 'View your attendance records and course information';
      default:
        return 'Welcome to the Attendance System';
    }
  };

  return (
    <DashboardLayout>
      <Box>
        <Typography variant="h4" component="h1" gutterBottom color="primary.main">
          Dashboard
        </Typography>
        <Typography variant="body1" paragraph sx={{ mb: 4 }}>
          {getWelcomeMessage()}
        </Typography>

        <Grid container spacing={3}>
          {getStats().map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card 
                sx={{ 
                  backgroundColor: 'background.paper',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6,
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ color: stat.color, mr: 2 }}>
                      {stat.icon}
                    </Box>
                    <Typography variant="h6" component="div">
                      {stat.title}
                    </Typography>
                  </Box>
                  <Typography variant="h4" component="div" color="primary.main">
                    {stat.value}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Paper sx={{ p: 3, mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Quick Actions
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user?.role === 'super-admin' && 'Create new courses, manage user accounts, or generate system reports.'}
            {user?.role === 'lecturer' && 'Start a new attendance session or view your course reports.'}
            {user?.role === 'student' && 'Check your recent attendance or view course details.'}
          </Typography>
        </Paper>
      </Box>
    </DashboardLayout>
  );
};

export default Dashboard;