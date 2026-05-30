import api from './api.js';

export const realtimeService = {
  getNotifications: async () => {
    const response = await api.get('/notifications');
    return {
      notifications: response.data.data || [],
      meta: response.data.meta || {}
    };
  },
  sendNotification: async (payload) => {
    const response = await api.post('/notifications', payload);
    return {
      notification: response.data.data,
      ...(response.data.meta || {})
    };
  },
  markNotificationsRead: async () => {
    const response = await api.patch('/notifications/read');
    return response.data;
  },
  getMessages: async (userId) => {
    const response = await api.get('/messages', { params: { user: userId } });
    return response.data.data || [];
  },
  getUsers: async () => {
    const response = await api.get('/users');
    return {
      users: response.data.data || [],
      onlineUsers: response.data.meta?.onlineUsers || []
    };
  }
};
