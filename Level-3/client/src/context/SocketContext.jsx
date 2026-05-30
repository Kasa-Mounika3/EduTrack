import { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { API_BASE_URL, getApiError } from '../services/api.js';
import { realtimeService } from '../services/realtimeService.js';
import { useAuth } from '../hooks/useAuth.js';
import { useData } from '../hooks/useData.js';

export const SocketContext = createContext(null);

const SOCKET_URL = API_BASE_URL.replace('/api', '');

export const SocketProvider = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const { fetchStudents } = useData();
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [connectionError, setConnectionError] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [toast, setToast] = useState('');

  const showUpdateToast = useCallback((message) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 3500);
  }, []);

  const loadNotifications = useCallback(async () => {
    try {
      const result = await realtimeService.getNotifications();
      setNotifications(result.notifications);
      setUnreadCount(result.meta.unread || 0);
    } catch (error) {
      setConnectionError(getApiError(error));
    }
  }, []);

  const loadUsers = useCallback(async () => {
    try {
      const result = await realtimeService.getUsers();
      setUsers(result.users);
      setOnlineUsers(result.onlineUsers);
    } catch (error) {
      setConnectionError(getApiError(error));
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      setConnected(false);
      return;
    }

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      setConnectionError('');
    });

    socket.on('connect_error', (error) => {
      setConnected(false);
      setConnectionError(error.message);
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    socket.on('onlineUsers', (userIds) => {
      setOnlineUsers(userIds);
    });

    socket.on('receiveNotification', (notification) => {
      setNotifications((current) => [notification, ...current]);
      setUnreadCount((count) => count + 1);
      showUpdateToast(`${notification.title}: ${notification.message}`);
    });

    socket.on('receiveMessage', (message) => {
      setMessages((current) => [...current, message]);
      showUpdateToast(`New message from ${message.sender?.name || 'Someone'}`);
    });

    const refreshDashboardData = (payload) => {
      window.dispatchEvent(new CustomEvent('edutrack:dashboard-update', { detail: payload }));
      fetchStudents({ limit: 5 });
      if (payload?.type?.includes('attendance')) {
        showUpdateToast('Attendance was updated');
      } else if (payload?.type?.includes('grade') || payload?.student?.marks !== undefined) {
        showUpdateToast('Academic record was updated');
      } else if (payload?.type?.includes('teacher') || payload?.type?.includes('parent') || payload?.type?.includes('student')) {
        showUpdateToast('Directory data was updated');
      }
    };

    socket.on('dashboardUpdate', refreshDashboardData);
    socket.on('studentActivity', refreshDashboardData);

    loadNotifications();
    loadUsers();

    return () => {
      socket.off('connect');
      socket.off('connect_error');
      socket.off('disconnect');
      socket.off('onlineUsers');
      socket.off('receiveNotification');
      socket.off('receiveMessage');
      socket.off('dashboardUpdate', refreshDashboardData);
      socket.off('studentActivity', refreshDashboardData);
      socket.disconnect();
    };
  }, [fetchStudents, isAuthenticated, loadNotifications, loadUsers, showUpdateToast, token]);

  const joinRoom = useCallback((roomName) => {
    socketRef.current?.emit('joinRoom', roomName);
  }, []);

  const sendNotification = useCallback((payload) => {
    socketRef.current?.emit('sendNotification', payload, (response) => {
      if (!response?.success) {
        setConnectionError(response?.message || 'Notification failed');
      }
    });
  }, []);

  const loadMessages = useCallback(async (userId) => {
    const history = await realtimeService.getMessages(userId);
    setMessages(history);
  }, []);

  const sendMessage = useCallback((payload) => {
    socketRef.current?.emit('sendMessage', payload, (response) => {
      if (!response?.success) {
        setConnectionError(response?.message || 'Message failed');
      }
    });
  }, []);

  const markRead = useCallback(async () => {
    await realtimeService.markNotificationsRead();
    setUnreadCount(0);
    setNotifications((current) => current.map((item) => ({ ...item, read: true })));
  }, []);

  const value = useMemo(
    () => ({
      connected,
      connectionError,
      notifications,
      unreadCount,
      messages,
      users,
      onlineUsers,
      toast,
      joinRoom,
      sendNotification,
      loadMessages,
      sendMessage,
      markRead,
      loadUsers
    }),
    [
      connected,
      connectionError,
      notifications,
      unreadCount,
      messages,
      users,
      onlineUsers,
      toast,
      joinRoom,
      sendNotification,
      loadMessages,
      sendMessage,
      markRead,
      loadUsers
    ]
  );

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};
