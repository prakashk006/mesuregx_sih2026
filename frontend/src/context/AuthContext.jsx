import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('mesuregx_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('mesuregx_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verifySession() {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data?.data?.user) {
            setUser(res.data.data.user);
            localStorage.setItem('mesuregx_user', JSON.stringify(res.data.data.user));
          }
        } catch (err) {
          console.warn('Session verification error:', err.message);
        }
      }
      setLoading(false);
    }
    verifySession();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: receivedToken, user: receivedUser } = res.data.data;
    setToken(receivedToken);
    setUser(receivedUser);
    localStorage.setItem('mesuregx_token', receivedToken);
    localStorage.setItem('mesuregx_user', JSON.stringify(receivedUser));
    return receivedUser;
  };

  const register = async (formData) => {
    return await api.post('/auth/register', formData);
  };

  const logout = async () => {
    try {
      if (token) await api.post('/auth/logout');
    } catch {
      // ignore
    } finally {
      setToken(null);
      setUser(null);
      localStorage.removeItem('mesuregx_token');
      localStorage.removeItem('mesuregx_user');
      window.location.href = '/login';
    }
  };

  const refreshUser = async () => {
    if (token) {
      const res = await api.get('/auth/me');
      if (res.data?.data?.user) {
        setUser(res.data.data.user);
        localStorage.setItem('mesuregx_user', JSON.stringify(res.data.data.user));
      }
    }
  };

  const isBusiness = user?.role === 'BUSINESS_OWNER';
  const isOfficer = user?.role === 'OFFICER';
  const isGatc = user?.role === 'GATC';
  const isAdmin = user?.role === 'ADMIN';

  const registerGatc = async (formData) => {
    return await api.post('/auth/register-gatc', formData);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        loading,
        login,
        register,
        registerGatc,
        logout,
        refreshUser,
        isBusiness,
        isOfficer,
        isGatc,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

