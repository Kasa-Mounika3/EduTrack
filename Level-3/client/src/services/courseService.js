import api from './api.js';

export const courseService = {
  list: async (params = {}) => {
    const response = await api.get('/courses', { params });
    return {
      courses: response.data.data || [],
      meta: response.data.meta || {}
    };
  },
  create: async (payload) => {
    const response = await api.post('/courses', payload);
    return response.data.data;
  }
};
