import axios from 'axios';

// Create a base instance with default config
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api', // Points to our backend
});

// Request interceptor: adds auth token to every request if it exists
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('attendanceToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: handles common errors globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token is invalid or expired
      localStorage.removeItem('attendanceToken');
      localStorage.removeItem('attendanceUser');
      window.location.href = '/login'; // Redirect to login
    }
    return Promise.reject(error);
  }
);

export default API;