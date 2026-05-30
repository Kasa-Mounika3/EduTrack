import apiClient, { getApiErrorMessage } from './apiClient.js';

export const parentService = {
  getParents: async () => {
    const response = await apiClient.get('/parents');
    return response.data.data || [];
  },

  createParent: async (parent) => {
    const response = await apiClient.post('/parents', parent);
    return response.data.data;
  },

  updateParent: async (id, parent) => {
    const response = await apiClient.put(`/parents/${id}`, parent);
    return response.data.data;
  },

  deleteParent: async (id) => {
    const response = await apiClient.delete(`/parents/${id}`);
    return response.data;
  }
};

export { getApiErrorMessage };
