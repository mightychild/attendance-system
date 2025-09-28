import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import DashboardLayout from '../../layout/DashboardLayout';

const StudentAttendance = () => {
  return (
    <DashboardLayout>
      <Box>
        <Typography variant="h4" component="h1" gutterBottom color="primary.main">
          My Attendance
        </Typography>
        <Paper sx={{ p: 3 }}>
          <Typography variant="body1">
            Attendance history and statistics will be displayed here. 
            Students can view their attendance percentage for each course and see which classes they attended/missed.
          </Typography>
        </Paper>
      </Box>
    </DashboardLayout>
  );
};

export default StudentAttendance;