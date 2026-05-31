import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://edutrack-c38t.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sms_l3_token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  return config;
});

export const getApiError = (error) => {
  return error.response?.data?.message || error.message || 'Something went wrong';
};

export default api;
