import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import DashboardLayout from '../../layout/DashboardLayout';
import CourseList from '../../components/course/CourseList';
import CourseForm from '../../components/course/CourseForm';
import { useAuth } from '../../context/AuthContext';

const AdminCourses = () => {
  const { user } = useAuth();
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [refreshCourses, setRefreshCourses] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
    setRefreshCourses(prev => prev + 1);
    setSuccess('Course saved successfully!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleCancelCourse = () => {
    setShowCourseForm(false);
    setEditingCourse(null);
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
          <Box>
            <Typography variant="h4" component="h1" gutterBottom color="primary.main">
              Manage Courses
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Create, edit, and manage all courses in the system
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateCourse}
            disabled={showCourseForm}
          >
            Add New Course
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

        {!showCourseForm ? (
          <CourseList
            onEditCourse={handleEditCourse}
            onCreateCourse={handleCreateCourse}
            key={refreshCourses}
          />
        ) : (
          <CourseForm
            course={editingCourse}
            onSave={handleSaveCourse}
            onCancel={handleCancelCourse}
          />
        )}

        {/* Debug Info */}
        {/* <Paper sx={{ p: 2, mt: 4, bgcolor: 'grey.100' }}>
          <Typography variant="caption" color="text.secondary">
            <strong>Admin:</strong> {user?.email} | <strong>Role:</strong> {user?.role}
          </Typography>
        </Paper> */}
      </Box>
    </DashboardLayout>
  );
};

export default AdminCourses;