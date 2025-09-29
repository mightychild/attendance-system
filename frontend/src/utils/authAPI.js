import API from './api';

// User registration (Signup)
export const signup = async (userData) => {
  try {
    const response = await API.post('/auth/signup', userData);
    return response.data; // { status: 'success', token: '...', data: { user: {...} } }
  } catch (error) {
    // Let the component handle the specific error message
    throw error.response?.data || { message: 'An error occurred during signup' };
  }
};

// User login
export const login = async (credentials) => {
  try {
    const response = await API.post('/auth/login', credentials);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'An error occurred during login' };
  }
};

// Get current user 
export const getCurrentUser = () => {
  const user = localStorage.getItem('attendanceUser');
  return user ? JSON.parse(user) : null;
};