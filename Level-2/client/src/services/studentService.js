import apiClient, { getApiErrorMessage } from './apiClient.js';

// Each function maps directly to one backend REST endpoint.
export const studentService = {
  getStudents: async (params = {}) => {
    const response = await apiClient.get('/students', { params });
    return {
      students: response.data.data || [],
      meta: response.data.meta || {}
    };
  },
  list: async (params = {}) => {
    return studentService.getStudents(params);
  },

  getStudentById: async (id) => {
    const response = await apiClient.get(`/students/${id}`);
    return response.data.data;
  },
  getById: async (id) => {
    return studentService.getStudentById(id);
  },

  createStudent: async (student) => {
    const response = await apiClient.post('/students', student);
    return response.data.data;
  },
  create: async (student) => {
    return studentService.createStudent(student);
  },

  updateStudent: async (id, student) => {
    const response = await apiClient.put(`/students/${id}`, student);
    return response.data.data;
  },
  update: async (id, student) => {
    return studentService.updateStudent(id, student);
  },

  updateAttendance: async (id, attendance, subjectId) => {
    const response = await apiClient.patch(`/students/${id}/attendance`, { attendance, subjectId });
    return response.data.data;
  },

  updateGrades: async (id, payload) => {
    const response = await apiClient.patch(`/students/${id}/grades`, payload);
    return response.data.data;
  },

  deleteStudent: async (id) => {
    const response = await apiClient.delete(`/students/${id}`);
    return response.data;
  },
  remove: async (id) => {
    return studentService.deleteStudent(id);
  }
};

export { getApiErrorMessage };
