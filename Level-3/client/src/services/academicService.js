import api from './api.js';

export const academicService = {
  list: async () => {
    const res = await api.get('/academic');
    return res.data.data;
  },
  createYear: async (payload) => {
    const res = await api.post('/academic/years', payload);
    return res.data.data;
  },
  createDepartment: async (payload) => {
    const res = await api.post('/academic/departments', payload);
    return res.data.data;
  },
  createSection: async (payload) => {
    const res = await api.post('/academic/sections', payload);
    return res.data.data;
  },
  createSubject: async (payload) => {
    const res = await api.post('/academic/subjects', payload);
    return res.data.data;
  }
};
