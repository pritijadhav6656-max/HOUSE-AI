import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('house_ai_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('house_ai_token') || null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const clearAuth = useCallback(() => {
    localStorage.removeItem('house_ai_token');
    localStorage.removeItem('house_ai_user');
    setToken(null);
    setUser(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    const activeToken = localStorage.getItem('house_ai_token');
    if (!activeToken) {
      setLoading(false);
      return;
    }
    try {
      const res = await api.get('/auth/me');
      if (res.data?.success && res.data?.user) {
        setUser(res.data.user);
        localStorage.setItem('house_ai_user', JSON.stringify(res.data.user));
      } else {
        clearAuth();
      }
    } catch {
      clearAuth();
    } finally {
      setLoading(false);
    }
  }, [clearAuth]);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  useEffect(() => {
    const handleExpired = () => {
      clearAuth();
      showToast('Your session expired. Please sign in again.', 'warning');
    };
    window.addEventListener('house-ai-session-expired', handleExpired);
    return () => window.removeEventListener('house-ai-session-expired', handleExpired);
  }, [clearAuth, showToast]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data?.success) {
      localStorage.setItem('house_ai_token', res.data.token);
      localStorage.setItem('house_ai_user', JSON.stringify(res.data.user));
      setToken(res.data.token);
      setUser(res.data.user);
    }
    return res.data;
  };

  const register = async (payload) => {
    const res = await api.post('/auth/register', payload);
    if (res.data?.success) {
      localStorage.setItem('house_ai_token', res.data.token);
      localStorage.setItem('house_ai_user', JSON.stringify(res.data.user));
      setToken(res.data.token);
      setUser(res.data.user);
    }
    return res.data;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore network errors during logout cleanup
    }
    clearAuth();
    showToast('You have been signed out of HOUSE AI.', 'info');
  };

  const updateLocalUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('house_ai_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: Boolean(user && token),
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
        refreshProfile,
        updateLocalUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
