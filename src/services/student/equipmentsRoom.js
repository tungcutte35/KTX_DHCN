import { api } from '../auth/api';

export const getEquipmentsRoom = async (token) => {
  if (!token) {
    // eslint-disable-next-line no-undef
    console.error('No token found');
    throw new Error('No token found');
  }

  try {
    const response = await api.get('/equipments/getEquipByRoom', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    // eslint-disable-next-line no-undef
    console.error('Error during getMemberRoom API call:', error);
    throw error;
  }
};
