import axios from 'axios';
import Cookies from 'js-cookie';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

export const api_service = axios.create({
  baseURL: import.meta.env.VITE_API_SERVICE_URL,
});

export const api_auth = axios.create({
  baseURL: import.meta.env.VITE_API_AUTH_URL,
});

// Request interceptor to attach token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('No token found in cookies');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('Token expired or invalid, logging out...');

      Cookies.remove('token');

      // Use window.location.href for redirection
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);
