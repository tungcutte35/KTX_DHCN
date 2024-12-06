import { api } from './api';

export const fetchRooms = async () => {
  try {
    const response = await api.get('/room/rooms');
    return response.data;
  } catch (error) {
    // eslint-disable-next-line no-undef
    console.error('Error during fetchRooms API call:', error);
    throw error;
  }
};

export const registerRoom = async (roomId, token, desc) => {
  if (!token) {
    console.error('No token found');
    throw new Error('No token found');
  }

  try {
    const response = await api.put(`/students/selectRoom/${roomId}`, desc, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error during registerRoom API call:', error);
    throw error;
  }
};

export const getMemberRoom = async (token, navigate) => {
  if (!token) {
    console.error('No token found');
    throw new Error('No token found');
  }

  try {
    const response = await api.get('/students/getStudentsByRoom', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error during getMemberRoom API call:', error);
    throw error;
  }
};
