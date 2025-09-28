import API from './api';

export const getCourses = async (params = {}) => {
  try {
    const response = await API.get('/courses', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching courses:', error);
    throw error.response?.data || { message: 'Failed to fetch courses' };
  }
};

export const getCourse = async (courseId) => {
  try {
    const response = await API.get(`/courses/${courseId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching course:', error);
    throw error.response?.data || { message: 'Failed to fetch course' };
  }
};

export const createCourse = async (courseData) => {
  try {
    const response = await API.post('/courses', courseData);
    return response.data;
  } catch (error) {
    console.error('Error creating course:', error);
    throw error.response?.data || { message: 'Failed to create course' };
  }
};

export const updateCourse = async (courseId, courseData) => {
  try {
    const response = await API.patch(`/courses/${courseId}`, courseData);
    return response.data;
  } catch (error) {
    console.error('Error updating course:', error);
    throw error.response?.data || { message: 'Failed to update course' };
  }
};

export const deleteCourse = async (courseId) => {
  try {
    const response = await API.delete(`/courses/${courseId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting course:', error);
    throw error.response?.data || { message: 'Failed to delete course' };
  }
};

// NEW FUNCTION: Get courses by lecturer ID
export const getLecturerCourses = async (lecturerId) => {
  try {
    const response = await API.get(`/courses/lecturer/${lecturerId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching lecturer courses:', error);
    throw error.response?.data || { message: 'Failed to fetch lecturer courses' };
  }
};