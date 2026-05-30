import apiClient from './apiClient.js';

export const academicService = {
  list: async () => {
    const res = await apiClient.get('/academics');
    return res.data.data;
  },
  createYear: async (payload) => {
    const res = await apiClient.post('/academics/years', payload);
    return res.data.data;
  },
  createDepartment: async (payload) => {
    const res = await apiClient.post('/academics/departments', payload);
    return res.data.data;
  },
  createSection: async (payload) => {
    const res = await apiClient.post('/academics/sections', payload);
    return res.data.data;
  },
  createSubject: async (payload) => {
    const res = await apiClient.post('/academics/subjects', payload);
    return res.data.data;
  }
};
