import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  TextField,
  MenuItem,
  Alert,
  CircularProgress,
  Tooltip,
  Typography,
  TablePagination
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { getCourses, deleteCourse } from '../../utils/courseAPI';
import ConfirmationDialog from '../common/ConfirmationDialog';

const CourseList = ({ onEditCourse }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCourses, setTotalCourses] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    courseId: null,
    courseName: '',
    action: null,
    title: '',
    message: '',
    type: 'warning'
  });

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        search: searchTerm,
        semester: semesterFilter !== 'all' ? semesterFilter : undefined,
        year: yearFilter !== 'all' ? yearFilter : undefined
      };

      const response = await getCourses(params);
      setCourses(response.data.courses);
      setTotalCourses(response.total);
    } catch (err) {
      setError(err.message || 'Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [page, rowsPerPage, searchTerm, semesterFilter, yearFilter]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const showConfirmation = (courseId, courseName, action, title, message, type = 'warning') => {
    setConfirmDialog({
      open: true,
      courseId,
      courseName,
      action,
      title,
      message,
      type
    });
  };

  const handleConfirm = async () => {
    const { courseId, action } = confirmDialog;
    
    try {
      if (action === 'delete') {
        // Optimistic update: remove course immediately
        setCourses(prevCourses => prevCourses.filter(course => course._id !== courseId));
        
        await deleteCourse(courseId);
        setError(''); // Clear any previous errors
      }
    } catch (err) {
      setError(err.message || 'Failed to delete course');
      // Revert optimistic update on error
      fetchCourses();
    } finally {
      setConfirmDialog({ 
        open: false, 
        courseId: null, 
        courseName: '', 
        action: null, 
        title: '', 
        message: '', 
        type: 'warning' 
      });
    }
  };

  const handleDeleteCourse = (courseId, courseCode, courseName) => {
    showConfirmation(
      courseId,
      courseName,
      'delete',
      'Delete Course',
      `Are you sure you want to delete "${courseCode} - ${courseName}"? This action cannot be undone.`,
      'delete'
    );
  };

  const getStatusColor = (isActive) => {
    return isActive ? 'success' : 'error';
  };

  const getEnrollmentStatus = (course) => {
    if (course.currentEnrollment >= course.maxStudents) return 'error';
    if (course.currentEnrollment >= course.maxStudents * 0.8) return 'warning';
    return 'success';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
          <TextField
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
            sx={{ minWidth: 200 }}
          />
          <TextField
            select
            label="Semester"
            value={semesterFilter}
            onChange={(e) => setSemesterFilter(e.target.value)}
            sx={{ minWidth: 120 }}
          >
            <MenuItem value="all">All Semesters</MenuItem>
            <MenuItem value="Spring">First Semester</MenuItem>
            <MenuItem value="Summer">Second Semester</MenuItem>
          </TextField>
          <TextField
            select
            label="Academic Year"
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            sx={{ minWidth: 140 }}
          >
            <MenuItem value="all">All Years</MenuItem>
            <MenuItem value="2023-2024">2023-2024</MenuItem>
            <MenuItem value="2024-2025">2024-2025</MenuItem>
            <MenuItem value="2025-2026">2025-2026</MenuItem>
          </TextField>
        </Box>
      </Paper>

      {/* Courses Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Course Code</TableCell>
              <TableCell>Course Name</TableCell>
              <TableCell>Lecturer</TableCell>
              <TableCell>Schedule</TableCell>
              <TableCell>Enrollment</TableCell>
              <TableCell>Semester</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {courses.map((course) => (
              <TableRow key={course._id}>
                <TableCell>
                  <Typography variant="body2" fontWeight="bold">
                    {course.courseCode}
                  </Typography>
                </TableCell>
                <TableCell>{course.courseName}</TableCell>
                <TableCell>
                  {course.lecturer ? (
                    <Box display="flex" alignItems="center">
                      <PersonIcon sx={{ mr: 1, fontSize: 20, color: 'primary.main' }} />
                      <Typography variant="body2">
                        {course.lecturer.firstName} {course.lecturer.lastName}
                      </Typography>
                    </Box>
                  ) : (
                    'Not assigned'
                  )}
                </TableCell>
                <TableCell>
                  {course.schedule ? (
                    <Typography variant="body2">
                      {course.schedule.days?.join(', ')} {course.schedule.startTime}-{course.schedule.endTime}
                    </Typography>
                  ) : (
                    'Not scheduled'
                  )}
                </TableCell>
                <TableCell>
                  <Chip
                    label={`${course.currentEnrollment}/${course.maxStudents}`}
                    color={getEnrollmentStatus(course)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {course.semester} {course.academicYear}
                </TableCell>
                <TableCell>
                  <Chip
                    label={course.isActive ? 'Active' : 'Inactive'}
                    color={getStatusColor(course.isActive)}
                    size="small"
                  />
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="Edit Course">
                    <IconButton
                      color="primary"
                      onClick={() => onEditCourse(course)}
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete Course">
                    <IconButton
                      color="error"
                      onClick={() => handleDeleteCourse(course._id, course.courseCode, course.courseName)}
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={totalCourses}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
        onConfirm={handleConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
        confirmText="Delete"
        cancelText="Cancel"
      />

      {courses.length === 0 && !loading && (
        <Paper sx={{ p: 4, textAlign: 'center', mt: 2 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No courses found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchTerm || semesterFilter !== 'all' || yearFilter !== 'all'
              ? 'Try adjusting your search filters'
              : 'No courses have been created yet'
            }
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default CourseList;