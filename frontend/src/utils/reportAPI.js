import API from './api';

export const downloadAttendanceReport = async (courseId, format = 'csv') => {
  try {
    const response = await API.get(`/reports/attendance/${courseId}`, {
      params: { format },
      responseType: 'blob' // Important for file downloads
    });
    return response;
  } catch (error) {
    console.error('Error downloading report:', error);
    throw error.response?.data || { message: 'Failed to download report' };
  }
};

export const getCoursePerformanceReport = async (courseId) => {
  try {
    const response = await API.get(`/reports/performance/${courseId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching performance report:', error);
    throw error.response?.data || { message: 'Failed to fetch performance report' };
  }
};