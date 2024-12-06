import { api } from '../auth/api';
import Cookies from 'js-cookie';

export const getStudentsByStatus = async (token) => {
  if (!token) {
    // eslint-disable-next-line no-undef
    console.error('No token found');
    throw new Error('No token found');
  }

  try {
    const response = await api.get(
      '/students/getStudentsIndorm',

      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    // eslint-disable-next-line no-undef
    console.error('Error during getStudentsByStatus API call:', error);
    throw error;
  }
};

export const updateStudentBtAdmin = async (studentId, studentData) => {
  const token = Cookies.get('token');
  if (!token) {
    // eslint-disable-next-line no-undef
    console.error('No token found');
    throw new Error('No token found');
  }

  if (!studentId || !studentData) {
    // eslint-disable-next-line no-undef
    console.error('Student ID or data missing');
    throw new Error('Student ID or data missing');
  }

  try {
    const response = await api.put(
      `/students/updateStudent/${studentId}`,
      studentData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    // eslint-disable-next-line no-undef
    console.error('Error during updateStudent API call:', error);
    throw error;
  }
};

export const addStudentByAdmin = async (studentData) => {
  const token = Cookies.get('token');
  if (!token) {
    console.error('No token found');
    throw new Error('No token found');
  }

  if (!studentData || !studentData.studentId) {
    console.error('Student data or ID missing');
    throw new Error('Student data or ID missing');
  }

  try {
    const response = await api.post('/students/addStudent', studentData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error during addStudent API call:', error);
    throw error;
  }
};

export const approveAllByAdmin = async () => {
  const token = Cookies.get('token');
  if (!token) {
    console.error('No token found');
    throw new Error('No token found');
  }

  try {
    const response = await api.put('/students/approveAll', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error during addStudent API call:', error);
    throw error;
  }
};

export const approveStudentByAdmin = async (studentId) => {
  const token = Cookies.get('token');
  if (!token) {
    console.error('No token found');
    throw new Error('No token found');
  }

  try {
    const response = await api.put(`/students/approve/${studentId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error during addStudent API call:', error);
    throw error;
  }
};

export const getStudentsByRoomByAdmin = async (roomId) => {
  const token = Cookies.get('token');
  if (!token) {
    // eslint-disable-next-line no-undef
    console.error('No token found');
    throw new Error('No token found');
  }

  try {
    const response = await api.get(`/students/getStudentsByRoom/${roomId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    // eslint-disable-next-line no-undef
    console.error('Error during addStudent API call:', error);
    throw error;
  }
};
export const deleteStudentByAdmin = async (studentId, studentDescription) => {
  const token = Cookies.get('token');
  if (!token) {
    // eslint-disable-next-line no-undef
    console.error('No token found');
    throw new Error('No token found');
  }

  try {
    const response = await api.put(
      `/students/deleteStudent/${studentId}`,
      studentDescription,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    // eslint-disable-next-line no-undef
    console.error('Error during deleteStudent API call:', error);
    throw error;
  }
};

export const rejectStudentByAdmin = async (studentId, studentDescription) => {
  const token = Cookies.get('token');
  if (!token) {
    // eslint-disable-next-line no-undef
    console.error('No token found');
    throw new Error('No token found');
  }

  try {
    const response = await api.put(
      `/students/rejectStudent/${studentId}`,
      studentDescription,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    // eslint-disable-next-line no-undef
    console.error('Error during rejectStudent API call:', error);
    throw error;
  }
};

export const getStudentHistoriesByIdByAdmin = async (studentId) => {
  const token = Cookies.get('token');
  if (!token) {
    // eslint-disable-next-line no-undef
    console.error('No token found');
    throw new Error('No token found');
  }

  try {
    const response = await api.get(
      `/students/getStudentHistoriesById/${studentId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    // eslint-disable-next-line no-undef
    console.error('Error during getStudentHistoriesById API call:', error);
    throw error;
  }
};
