import { api } from '../auth/api';

export const fetchRoomsForRegister = async (token) => {
  try {
    const response = await api.get('/room/getRoomsForRegister', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    // eslint-disable-next-line no-undef
    console.error('Error during fetchRooms API call:', error);
    throw error;
  }
};

export const registerRoom = async (roomId, token, navigate) => {
  if (!token) {
    console.error('No token found');
    throw new Error('No token found');
  }

  try {
    const response = await api.put(
      `/students/selectRoom/${roomId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
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
