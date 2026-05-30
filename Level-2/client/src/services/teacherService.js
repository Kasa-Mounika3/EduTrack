import apiClient, { getApiErrorMessage } from './apiClient.js';

export const teacherService = {
  getTeachers: async () => {
    const response = await apiClient.get('/teachers');
    return response.data.data || [];
  },

  createTeacher: async (teacher) => {
    const response = await apiClient.post('/teachers', teacher);
    return response.data.data;
  },

  updateTeacher: async (id, teacher) => {
    const response = await apiClient.put(`/teachers/${id}`, teacher);
    return response.data.data;
  },

  deleteTeacher: async (id) => {
    const response = await apiClient.delete(`/teachers/${id}`);
    return response.data;
  }
};

export { getApiErrorMessage };
