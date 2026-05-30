import apiClient from './apiClient.js';

export const authService = {
  register: async (payload) => {
    const response = await apiClient.post('/auth/register', payload);
    return response.data;
  },

  login: async (payload) => {
    const response = await apiClient.post('/auth/login', payload);
    return response.data;
  },

  getProfile: async () => {
    const response = await apiClient.get('/auth/profile');
    return response.data;
  },

  getProfileUser: async () => {
    const response = await apiClient.get('/auth/profile');
    return response.data.user;
  },

  updateProfile: async (payload) => {
    const response = await apiClient.put('/auth/profile', payload);
    return response.data;
  },

  changePassword: async (payload) => {
    const response = await apiClient.patch('/auth/profile/password', payload);
    return response.data;
  },

  logout: async () => {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  }
};
