import { api } from '../auth/api';

export const getAllEquipmentsListByAdmin = async (token) => {
  if (!token) {
    // eslint-disable-next-line no-undef
    console.error('No token found');
    throw new Error('No token found');
  }

  try {
    const response = await api.get(`/equipments/getAllEquipments`, {
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

export const addEquipmentsListByAdmin = async (token, addEquipments) => {
  if (!token) {
    // eslint-disable-next-line no-undef
    console.error('No token found');
    throw new Error('No token found');
  }

  try {
    const response = await api.post(
      '/equipments/addEquipments',
      addEquipments,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    // eslint-disable-next-line no-undef
    console.error('Error during addEquipments API call:', error);
    throw error;
  }
};

export const updateEquipmentsListByAdmin = async (
  token,
  editEquipments,
  keyEquipments
) => {
  if (!token) {
    // eslint-disable-next-line no-undef
    console.error('No token found');
    throw new Error('No token found');
  }

  try {
    const response = await api.put(
      `/equipments/updateEquipment/${keyEquipments}`,
      editEquipments,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    // eslint-disable-next-line no-undef
    console.error('Error during addEquipments API call:', error);
    throw error;
  }
};
