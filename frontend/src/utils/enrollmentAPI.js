import API from './api';

export const enrollInCourse = async (courseId) => {
  try {
    const response = await API.post('/enrollments', { courseId });
    return response.data;
  } catch (error) {
    console.error('Error enrolling in course:', error);
    throw error.response?.data || { message: 'Failed to enroll in course' };
  }
};

export const getStudentEnrollments = async (studentId) => {
  try {
    const response = await API.get(`/enrollments/student/${studentId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching student enrollments:', error);
    throw error.response?.data || { message: 'Failed to fetch enrollments' };
  }
};

export const getCourseEnrollments = async (courseId) => {
  try {
    const response = await API.get(`/enrollments/course/${courseId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching course enrollments:', error);
    throw error.response?.data || { message: 'Failed to fetch course enrollments' };
  }
};

export const dropEnrollment = async (enrollmentId) => {
  try {
    const response = await API.patch(`/enrollments/${enrollmentId}/drop`);
    return response.data;
  } catch (error) {
    console.error('Error dropping enrollment:', error);
    throw error.response?.data || { message: 'Failed to drop course' };
  }
};

export const markAttendance = async (enrollmentId, date, present) => {
  try {
    const response = await API.post(`/enrollments/${enrollmentId}/attendance`, {
      date,
      present
    });
    return response.data;
  } catch (error) {
    console.error('Error marking attendance:', error);
    throw error.response?.data || { message: 'Failed to mark attendance' };
  }
};

export const getStudentCourseAttendance = async (studentId, courseId) => {
  try {
    const response = await API.get(`/enrollments/student/${studentId}/course/${courseId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching attendance:', error);
    throw error.response?.data || { message: 'Failed to fetch attendance' };
  }
};