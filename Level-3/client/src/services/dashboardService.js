import api from './api.js';

export const dashboardService = {
  summary: async () => {
    const response = await api.get('/dashboard');
    return response.data.data;
  }
};
