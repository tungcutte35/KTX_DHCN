import { api } from '../auth/api';

export const getEquipmentsRoomByAdmin = async (token, roomName) => {
  if (!token) {
    // eslint-disable-next-line no-undef
    console.error('No token found');
    throw new Error('No token found');
  }

  if (!roomName) {
    // eslint-disable-next-line no-undef
    console.error('No room name provided');
    throw new Error('No room name provided');
  }

  try {
    const response = await api.get(`/equipments/getEquipByRoom/${roomName}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    // eslint-disable-next-line no-undef
    console.error('Error during getEquipByRoom API call:', error);
    throw error;
  }
};

export const getRoomsAvailableRoomByAdmin = async (token, gender) => {
  if (!token) {
    // eslint-disable-next-line no-undef
    console.error('No token found');
    throw new Error('No token found');
  }

  try {
    const response = await api.get(`/room/getRoomsAvailable/${gender}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    // eslint-disable-next-line no-undef
    console.error('Error during getEquipByRoom API call:', error);
    throw error;
  }
};
