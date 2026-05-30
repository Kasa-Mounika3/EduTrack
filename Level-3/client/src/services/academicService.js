import api from './api.js';

export const academicService = {
  list: async () => {
    const res = await api.get('/academics');
    return res.data.data;
  },
  createYear: async (payload) => {
    const res = await api.post('/academics/years', payload);
    return res.data.data;
  },
  createDepartment: async (payload) => {
    const res = await api.post('/academics/departments', payload);
    return res.data.data;
  },
  createSection: async (payload) => {
    const res = await api.post('/academics/sections', payload);
    return res.data.data;
  },
  createSubject: async (payload) => {
    const res = await api.post('/academics/subjects', payload);
    return res.data.data;
  }
};
