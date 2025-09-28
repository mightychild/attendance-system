import API from './api';

export const getMyQRCode = async () => {
  try {
    const response = await API.get('/students/me/qrcode');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch QR code' };
  }
};

export const getStudentQRCode = async (studentId) => {
  try {
    const response = await API.get(`/students/${studentId}/qrcode`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch QR code' };
  }
};

export const verifyQRCode = async (qrCodeData) => {
  try {
    const response = await API.post('/students/verify-qr', { qrCodeData });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to verify QR code' };
  }
};