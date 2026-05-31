import apiClient from './apiClient.js';

export const academicService = {
  list: async () => {
    const res = await apiClient.get('/academic');
    return res.data.data;
  },
  createYear: async (payload) => {
    const res = await apiClient.post('/academic/years', payload);
    return res.data.data;
  },
  createDepartment: async (payload) => {
    const res = await apiClient.post('/academic/departments', payload);
    return res.data.data;
  },
  createSection: async (payload) => {
    const res = await apiClient.post('/academic/sections', payload);
    return res.data.data;
  },
  createSubject: async (payload) => {
    const res = await apiClient.post('/academic/subjects', payload);
    return res.data.data;
  }
};
