import Cookies from 'js-cookie';
import { api, api_auth } from './api';

export const login = async (studentId, password) => {
  try {
    const response = await api_auth.post('/login', {
      studentId,
      password,
    });
    return response.data;
  } catch (error) {
    // eslint-disable-next-line no-undef
    console.error('Error during login API call:', error);
    throw error;
  }
};

export const fetchInfoUser = async (token) => {
  if (!token) {
    // eslint-disable-next-line no-undef
    console.error('No token found');
    throw new Error('No token found');
  }

  try {
    const response = await api.get('/auth/info', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    // eslint-disable-next-line no-undef
    console.error('Error during fetchInfoUser API call:', error);
    throw error;
  }
};

export const sendOTP = async (phoneNumber) => {
  try {
    const response = await api_auth.post('/send-otp', {
      phoneNumber,
    });
    return response.data;
  } catch (error) {
    // eslint-disable-next-line no-undef
    console.error('Error during sendOTP API call:', error);
    throw error;
  }
};

export const verifyOTP = async (otp, phoneNumber) => {
  try {
    const response = await api_auth.post('/verify-otp', {
      otp,
      phoneNumber,
    });
    return response.data;
  } catch (error) {
    // eslint-disable-next-line no-undef
    console.error('Error during verifyOTP API call:', error);
    throw error;
  }
};

export const register = async (data) => {
  try {
    const response = await api_auth.post('/register', data);
    return response.data;
  } catch (error) {
    // eslint-disable-next-line no-undef
    console.error('Error during register API call:', error);
    throw error;
  }
};

// ... (existing imports and API URL constants)

export const updateStudent = async (studentData) => {
  const token = Cookies.get('token');
  if (!token) {
    console.error('No token found');
    throw new Error('No token found');
  }

  try {
    const response = await api.put('/students/updateStudent', studentData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    // eslint-disable-next-line no-undef
    console.error('Error during updateStudent API call:', error);
    throw error;
  }
};

export const changPasswordByStudent = async (data) => {
  const token = Cookies.get('token');
  if (!token) {
    // eslint-disable-next-line no-undef
    console.error('No token found');
    throw new Error('No token found');
  }

  try {
    const response = await api_auth.put('/changePassword', data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    // eslint-disable-next-line no-undef
    console.error('Error during changPasswordByStudent API call:', error);
    throw error;
  }
};

export const forgotPasswordByStudent = async (data) => {
  try {
    const response = await api_auth.post('/forgotPassword', data);
    return response.data;
  } catch (error) {
    // eslint-disable-next-line no-undef
    console.error('Error during changPasswordByStudent API call:', error);
    throw error;
  }
};
export const resetPasswordByStudent = async (data) => {
  try {
    const response = await api_auth.put('/resetPassword', data);
    return response.data;
  } catch (error) {
    // eslint-disable-next-line no-undef
    console.error('Error during changPasswordByStudent API call:', error);
    throw error;
  }
};
