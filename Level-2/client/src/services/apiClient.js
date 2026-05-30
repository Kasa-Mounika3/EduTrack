import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach the JWT token to every protected API request.
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('sms_token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  return config;
});

export const getApiErrorMessage = (error) => {
  return error.response?.data?.message || error.message || 'Something went wrong';
};

export default apiClient;
