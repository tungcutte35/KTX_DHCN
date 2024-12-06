import { api } from '../auth/api';

export const getRoomPaymentDetailsByAdmin = async (token) => {
  if (!token) {
    // eslint-disable-next-line no-undef
    console.error('No token found');
    throw new Error('No token found');
  }

  try {
    const response = await api.get(`/payments/getRoomPaymentDetails`, {
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

export const getUtilityPaymentsByRoomByAdmin = async (token) => {
  if (!token) {
    // eslint-disable-next-line no-undef
    console.error('No token found');
    throw new Error('No token found');
  }

  try {
    const response = await api.get(`/payments/getUtilityPayments`, {
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

export const createUtilityPaymentsByAdmin = async (token, data) => {
  if (!token) {
    // eslint-disable-next-line no-undef
    console.error('No token found');
    throw new Error('No token found');
  }

  try {
    const response = await api.post(`/payments/createUtilityPayments`, data, {
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

export const createUtilityPaymentsForRoomByAdmin = async (token, data) => {
  if (!token) {
    // eslint-disable-next-line no-undef
    console.error('No token found');
    throw new Error('No token found');
  }

  try {
    const response = await api.post(
      `/payments/createUtilityPaymentForRoom`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    // eslint-disable-next-line no-undef
    console.error('Error during getEquipByRoom API call:', error);
    throw error;
  }
};

export const getDashboardByAdmin = async (token) => {
  if (!token) {
    // eslint-disable-next-line no-undef
    console.error('No token found');
    throw new Error('No token found');
  }

  try {
    const response = await api.get(`payments/getDashboard`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    // eslint-disable-next-line no-undef
    console.error('Error during getDashboard API call:', error);
    throw error;
  }
};
