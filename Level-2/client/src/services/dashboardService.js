import apiClient, { getApiErrorMessage } from './apiClient.js';

export const dashboardService = {
  getDashboard: async () => {
    const response = await apiClient.get('/dashboard');
    return response.data.data;
  }
};

export { getApiErrorMessage };
