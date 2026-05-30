import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { authService } from '../services/authService.js';
import { getApiError } from '../services/api.js';

export const AuthContext = createContext(null);

const getStoredUser = () => {
  const user = localStorage.getItem('sms_l3_user');
  return user ? JSON.parse(user) : null;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getStoredUser);
  const [token, setToken] = useState(localStorage.getItem('sms_l3_token'));
  const [loading, setLoading] = useState(Boolean(localStorage.getItem('sms_l3_token')));
  const [error, setError] = useState('');

  const saveSession = (session) => {
    localStorage.setItem('sms_l3_token', session.token);
    localStorage.setItem('sms_l3_user', JSON.stringify(session.user));
    setToken(session.token);
    setUser(session.user);
  };

  const logout = useCallback(() => {
    localStorage.removeItem('sms_l3_token');
    localStorage.removeItem('sms_l3_user');
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
        const profile = await authService.profile();
        const nextUser = profile.user || profile;
        localStorage.setItem('sms_l3_user', JSON.stringify(nextUser));
        setUser(nextUser);
      } catch (err) {
        setError(getApiError(err));
        logout();
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [token, logout]);

  const register = async (payload) => {
    setError('');
    const session = await authService.register(payload);
    saveSession(session);
  };

  const login = async (payload) => {
    setError('');
    const session = await authService.login(payload);
    saveSession(session);
  };

  const refreshProfile = useCallback(async () => {
    const profile = await authService.fullProfile();
    localStorage.setItem('sms_l3_user', JSON.stringify(profile.user));
    setUser(profile.user);
    return profile;
  }, []);

  const updateProfile = useCallback(async (payload) => {
    const profile = await authService.updateProfile(payload);
    localStorage.setItem('sms_l3_user', JSON.stringify(profile.user));
    setUser(profile.user);
    return profile;
  }, []);

  const changePassword = useCallback(async (payload) => {
    return authService.changePassword(payload);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      error,
      isAuthenticated: Boolean(token && user),
      isAdmin: user?.role === 'admin',
      isTeacher: user?.role === 'teacher',
      register,
      login,
      logout,
      refreshProfile,
      updateProfile,
      changePassword,
      setError
    }),
    [user, token, loading, error, logout, refreshProfile, updateProfile, changePassword]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
