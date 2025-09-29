import API from './api';

export const getUsers = async (params = {}) => {
  try {
    const response = await API.get('/admin/users', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error.response?.data || { message: 'Failed to fetch users' };
  }
};

export const createUser = async (userData) => {
  try {
    const response = await API.post('/admin/users', userData);
    return response.data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error.response?.data || { message: 'Failed to create user' };
  }
};

export const updateUserStatus = async (userId, isActive) => {
  try {
    const response = await API.patch(`/admin/users/${userId}/status`, { isActive });
    return response.data;
  } catch (error) {
    console.error('Error updating user status:', error);
    throw error.response?.data || { message: 'Failed to update user status' };
  }
};

export const deleteUser = async (userId) => {
  try {
    const response = await API.delete(`/admin/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error.response?.data || { message: 'Failed to delete user' };
  }
};

// Update User Profile
export const updateUserProfile = async (userId, userData) => {
  try {
    const response = await API.patch(`/users/${userId}/profile`, userData);
    return response.data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error.response?.data || { message: 'Failed to update profile' };
  }
};