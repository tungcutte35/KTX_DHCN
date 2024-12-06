import { api } from '../auth/api';

export const getRegistrationByAdmin = async (token) => {
  if (!token) {
    // eslint-disable-next-line no-undef
    console.error('No token found');
    throw new Error('No token found');
  }

  try {
    const response = await api.get(`/registrations/getRegistrations`, {
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

export const updateRegistrationByAdmin = async (
  token,
  id,
  registrationData
) => {
  if (!token) {
    // eslint-disable-next-line no-undef
    console.error('No token found');
    throw new Error('No token found');
  }

  try {
    const response = await api.put(
      `/registrations/updateRegistration/${id}`,
      registrationData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    // eslint-disable-next-line no-undef
    console.error('Error during updateRegistrationByAdmin API call:', error);
    throw error;
  }
};

export const addRegistrationByAdmin = async (token, registrationData) => {
  if (!token) {
    // eslint-disable-next-line no-undef
    console.error('No token found');
    throw new Error('No token found');
  }

  try {
    const response = await api.post(
      `/registrations/addRegistration`,
      registrationData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    // eslint-disable-next-line no-undef
    console.error('Error during updateRegistrationByAdmin API call:', error);
    throw error;
  }
};
