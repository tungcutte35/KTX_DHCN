import { api } from '../auth/api';

export const getContractsByStudentId = async (token) => {
  if (!token) {
    // eslint-disable-next-line no-undef
    console.error('No token found');
    throw new Error('No token found');
  }

  try {
    const response = await api.get('/contracts/getContractsByStudentId', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    // eslint-disable-next-line no-undef
    console.error('Error during getContractsByStudentId API call:', error);
    throw error;
  }
};
