import apiClient, { getApiErrorMessage } from './apiClient.js';

export const courseService = {
  getCourses: async (params = {}) => {
    const response = await apiClient.get('/courses', { params });
    return {
      courses: response.data.data || [],
      meta: response.data.meta || {}
    };
  },

  createCourse: async (course) => {
    const response = await apiClient.post('/courses', course);
    return response.data.data;
  },

  getCourseStudents: async (id) => {
    const response = await apiClient.get(`/courses/${id}/students`);
    return response.data.data || [];
  }
};

export { getApiErrorMessage };
