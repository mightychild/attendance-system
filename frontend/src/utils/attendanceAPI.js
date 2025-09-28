import API from './api';

export const startSession = async (courseId, duration = 30) => {
  try {
    const response = await API.post('/attendance/session', {
      courseId,
      duration
    });
    return response.data;
  } catch (error) {
    console.error('Error starting session:', error);
    throw error.response?.data || { message: 'Failed to start session' };
  }
};

export const getSession = async (courseId) => {
  try {
    const response = await API.get(`/attendance/session/${courseId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting session:', error);
    throw error.response?.data || { message: 'Failed to get session' };
  }
};

export const endSession = async (sessionId) => {
  try {
    const response = await API.patch(`/attendance/session/${sessionId}/end`);
    return response.data;
  } catch (error) {
    console.error('Error ending session:', error);
    throw error.response?.data || { message: 'Failed to end session' };
  }
};

export const getSessionDetails = async (sessionId) => {
  try {
    const response = await API.get(`/attendance/session/details/${sessionId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting session details:', error);
    throw error.response?.data || { message: 'Failed to get session details' };
  }
};

export const scanQRCode = async (scanData) => {
  try {
    const response = await API.post('/attendance/scan', scanData);
    return response.data;
  } catch (error) {
    console.error('Error scanning QR code:', error);
    
    // Provide more specific error messages for the new QR security system
    let errorMessage = 'Failed to scan QR code';
    
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
      
      // Handle specific error cases from the new QR token system
      if (errorMessage.includes('expired')) {
        errorMessage = 'QR code has expired. Please ask the student to show their QR code again.';
      } else if (errorMessage.includes('Invalid QR code signature')) {
        errorMessage = 'Invalid QR code signature. The student may need to refresh their ID card.';
      } else if (errorMessage.includes('Token missing')) {
        errorMessage = 'Invalid QR code format. Please scan a valid student ID card.';
      } else if (errorMessage.includes('Student not found')) {
        errorMessage = 'Student not found or inactive. Please contact administration.';
      } else if (errorMessage.includes('not enrolled')) {
        errorMessage = 'Student is not enrolled in this course.';
      } else if (errorMessage.includes('already marked')) {
        errorMessage = 'Student attendance has already been recorded for this session.';
      }
      
    } else if (error.response?.data?.error) {
      errorMessage = error.response.data.error;
    } else if (error.message.includes('Network Error')) {
      errorMessage = 'Network error. Please check your connection.';
    } else if (error.message.includes('timeout')) {
      errorMessage = 'Request timeout. Please try again.';
    }
    
    throw new Error(errorMessage);
  }
};

export const manualAttendance = async (attendanceData) => {
  try {
    const response = await API.post('/attendance/manual', attendanceData);
    return response.data;
  } catch (error) {
    console.error('Error marking manual attendance:', error);
    throw error.response?.data || { message: 'Failed to mark attendance' };
  }
};