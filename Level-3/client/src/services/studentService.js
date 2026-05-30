import api from './api.js';

export const studentService = {
  list: async (params = {}) => {
    const response = await api.get('/students', { params });
    return {
      students: response.data.data || [],
      meta: response.data.meta || {}
    };
  },
  getById: async (id) => {
    const response = await api.get(`/students/${id}`);
    return response.data.data;
  },
  create: async (payload) => {
    const response = await api.post('/students', payload);
    return response.data.data?.student || response.data.data;
  },
  update: async (id, payload) => {
    const response = await api.put(`/students/${id}`, payload);
    return response.data.data;
  },
  updateAttendance: async (id, attendance, subjectId) => {
    const response = await api.patch(`/students/${id}/attendance`, { attendance, subjectId });
    return response.data.data;
  },
  updateGrades: async (id, payload) => {
    const response = await api.patch(`/students/${id}/grades`, payload);
    return response.data.data;
  },
  remove: async (id) => {
    const response = await api.delete(`/students/${id}`);
    return response.data;
  }
};
