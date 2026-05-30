import apiClient, { getApiErrorMessage } from './apiClient.js';

export const announcementService = {
  getAnnouncements: async () => {
    const response = await apiClient.get('/announcements');
    return response.data.data || [];
  },

  createAnnouncement: async (announcement) => {
    const response = await apiClient.post('/announcements', announcement);
    return response.data.data;
  }
};

export { getApiErrorMessage };
