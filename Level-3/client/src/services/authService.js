import api from './api.js';

export const authService = {
  register: async (payload) => {
    const response = await api.post('/auth/register', payload);
    return response.data.data;
  },
  login: async (payload) => {
    const response = await api.post('/auth/login', payload);
    return response.data.data;
  },
  profile: async () => {
    const response = await api.get('/auth/profile');
    return response.data.data;
  },
  fullProfile: async () => {
    const response = await api.get('/users/me');
    return response.data.data;
  },
  updateProfile: async (payload) => {
    const response = await api.put('/users/me', payload);
    return response.data.data;
  },
  changePassword: async (payload) => {
    const response = await api.patch('/users/me/password', payload);
    return response.data;
  }
};
