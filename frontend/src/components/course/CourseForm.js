import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  MenuItem,
  Grid,
  FormControl,
  InputLabel,
  Select,
  Chip,
  OutlinedInput
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';
import { createCourse, updateCourse } from '../../utils/courseAPI';
import { getUsers } from '../../utils/userAPI';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday',];
const SEMESTERS = ['First Semester', 'Second Semester'];
const CURRENT_YEAR = new Date().getFullYear();
const ACADEMIC_YEARS = [
  `${CURRENT_YEAR-1}-${CURRENT_YEAR}`,
  `${CURRENT_YEAR}-${CURRENT_YEAR+1}`,
  `${CURRENT_YEAR+1}-${CURRENT_YEAR+2}`
];

const CourseForm = ({ course, onSave, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lecturers, setLecturers] = useState([]);
  const [formData, setFormData] = useState({
    courseCode: '',
    courseName: '',
    description: '',
    credits: 3,
    lecturer: '',
    schedule: {
      days: [],
      startTime: '09:00',
      endTime: '10:30',
      room: ''
    },
    semester: 'Fall',
    academicYear: ACADEMIC_YEARS[0],
    maxStudents: 30
  });

  useEffect(() => {
    if (course) {
      setFormData(course);
    }
    fetchLecturers();
  }, [course]);

  const fetchLecturers = async () => {
    try {
      const response = await getUsers({ role: 'lecturer' });
      setLecturers(response.data.users);
    } catch (err) {
      console.error('Failed to fetch lecturers:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (course) {
        await updateCourse(course._id, formData);
      } else {
        await createCourse(formData);
      }
      onSave(); // This will trigger the stats refresh in the parent component
    } catch (err) {
      setError(err.message || 'Failed to save course');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleScheduleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      schedule: { ...prev.schedule, [name]: value }
    }));
  };

  const handleDaysChange = (event) => {
    const { value } = event.target;
    setFormData(prev => ({
      ...prev,
      schedule: { ...prev.schedule, days: typeof value === 'string' ? value.split(',') : value }
    }));
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom color="primary.main">
        {course ? 'Edit Course' : 'Create New Course'}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Course Code"
              name="courseCode"
              value={formData.courseCode}
              onChange={handleChange}
              required
              placeholder="e.g., CS101"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Course Name"
              name="courseName"
              value={formData.courseName}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
            />
          </Grid>

          {/* Lecturer and Credits */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth required>
              <InputLabel>Lecturer</InputLabel>
              <Select
                name="lecturer"
                value={formData.lecturer}
                onChange={handleChange}
                label="Lecturer"
              >
                {lecturers.map((lecturer) => (
                  <MenuItem key={lecturer._id} value={lecturer._id}>
                    {lecturer.firstName} {lecturer.lastName} ({lecturer.email})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="Credits"
              name="credits"
              value={formData.credits}
              onChange={handleChange}
              required
              inputProps={{ min: 1, max: 6 }}
            />
          </Grid>

          {/* Schedule */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Schedule
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Days</InputLabel>
              <Select
                multiple
                name="days"
                value={formData.schedule.days}
                onChange={handleDaysChange}
                input={<OutlinedInput label="Days" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </Box>
                )}
              >
                {DAYS_OF_WEEK.map((day) => (
                  <MenuItem key={day} value={day}>
                    {day}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              type="time"
              label="Start Time"
              name="startTime"
              value={formData.schedule.startTime}
              onChange={handleScheduleChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              type="time"
              label="End Time"
              name="endTime"
              value={formData.schedule.endTime}
              onChange={handleScheduleChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Room"
              name="room"
              value={formData.schedule.room}
              onChange={handleScheduleChange}
              placeholder="e.g., Room 101"
            />
          </Grid>

          {/* Semester and Capacity */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth required>
              <InputLabel>Semester</InputLabel>
              <Select
                name="semester"
                value={formData.semester}
                onChange={handleChange}
                label="Semester"
              >
                {SEMESTERS.map((semester) => (
                  <MenuItem key={semester} value={semester}>
                    {semester}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth required>
              <InputLabel>Academic Year</InputLabel>
              <Select
                name="academicYear"
                value={formData.academicYear}
                onChange={handleChange}
                label="Academic Year"
              >
                {ACADEMIC_YEARS.map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="Maximum Students"
              name="maxStudents"
              value={formData.maxStudents}
              onChange={handleChange}
              required
              inputProps={{ min: 1, max: 300 }}
            />
          </Grid>
        </Grid>

        {/* Actions */}
        <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            onClick={onCancel}
            startIcon={<CancelIcon />}
          >
            Cancel
          </Button>
          <LoadingButton
            type="submit"
            variant="contained"
            loading={loading}
            startIcon={<SaveIcon />}
          >
            {course ? 'Update Course' : 'Create Course'}
          </LoadingButton>
        </Box>
      </Box>
    </Paper>
  );
};

export default CourseForm;