import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  School as SchoolIcon,
  QrCode as QrCodeIcon
} from '@mui/icons-material';
import DashboardLayout from '../../layout/DashboardLayout';
import StudentIDCard from '../../components/student/StudentIDCard';
import { useAuth } from '../../context/AuthContext';

const StudentProfile = () => {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <Box>
        <Typography variant="h4" component="h1" gutterBottom color="primary.main">
          My Profile
        </Typography>

        <Grid container spacing={3}>
          {/* Personal Information */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom color="primary.main">
                Personal Information
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PersonIcon sx={{ mr: 2, color: 'primary.main' }} />
                <Box>
                  <Typography variant="body1" fontWeight="bold">
                    {user?.firstName} {user?.lastName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Full Name
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <EmailIcon sx={{ mr: 2, color: 'primary.main' }} />
                <Box>
                  <Typography variant="body1" fontWeight="bold">
                    {user?.email}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Email Address
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SchoolIcon sx={{ mr: 2, color: 'primary.main' }} />
                <Box>
                  <Typography variant="body1" fontWeight="bold">
                    {user?.universityId}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Student ID
                  </Typography>
                </Box>
              </Box>

              <Chip
                label={user?.role}
                color="primary"
                variant="outlined"
                sx={{ mt: 1 }}
              />
            </Paper>
          </Grid>

          {/* ID Card */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom color="primary.main">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <QrCodeIcon sx={{ mr: 1 }} />
                  Student ID Card
                </Box>
              </Typography>
              <StudentIDCard />
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </DashboardLayout>
  );
};

export default StudentProfile;