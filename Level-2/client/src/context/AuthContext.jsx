import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { authService } from '../services/authService.js';
import { getApiErrorMessage } from '../services/apiClient.js';

export const AuthContext = createContext(null);

const getStoredUser = () => {
  const storedUser = localStorage.getItem('sms_user');
  return storedUser ? JSON.parse(storedUser) : null;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getStoredUser);
  const [token, setToken] = useState(localStorage.getItem('sms_token'));
  const [loading, setLoading] = useState(Boolean(localStorage.getItem('sms_token')));
  const [error, setError] = useState('');

  const saveSession = (authData) => {
    localStorage.setItem('sms_token', authData.token);
    localStorage.setItem('sms_user', JSON.stringify(authData.user));
    setToken(authData.token);
    setUser(authData.user);
  };

  const clearSession = useCallback(() => {
    localStorage.removeItem('sms_token');
    localStorage.removeItem('sms_user');
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    const loadProfile = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const profile = await authService.getProfile();
        localStorage.setItem('sms_user', JSON.stringify(profile.user));
        setUser(profile.user);
      } catch (err) {
        clearSession();
        setError(getApiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [token, clearSession]);

  const register = async (payload) => {
    setError('');
    const authData = await authService.register(payload);
    saveSession(authData);
    return authData.user;
  };

  const login = async (payload) => {
    setError('');
    const authData = await authService.login(payload);
    saveSession(authData);
    return authData.user;
  };

  const logout = async () => {
    try {
      if (token) {
        await authService.logout();
      }
    } catch (err) {
      // The client still removes the token even if the optional logout request fails.
    } finally {
      clearSession();
    }
  };

  const updateProfile = async (payload) => {
    const profile = await authService.updateProfile(payload);
    localStorage.setItem('sms_user', JSON.stringify(profile.user));
    setUser(profile.user);
    return profile;
  };

  const changePassword = async (payload) => authService.changePassword(payload);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      error,
      isAuthenticated: Boolean(token && user),
      isAdmin: user?.role === 'admin',
      isTeacher: user?.role === 'teacher',
      isStudent: user?.role === 'student',
      isParent: user?.role === 'parent',
      register,
      login,
      logout,
      updateProfile,
      changePassword,
      setError
    }),
    [user, token, loading, error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
