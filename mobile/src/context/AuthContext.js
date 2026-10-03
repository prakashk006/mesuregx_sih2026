import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginApi, getProfileApi } from '../services/api';
import {
  getStoredToken,
  setStoredToken,
  getStoredUser,
  setStoredUser,
  saveCachedAssignments,
} from '../services/offlineStorage';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function initAuth() {
      try {
        const storedToken = await getStoredToken();
        const storedUser = await getStoredUser();

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(storedUser);

          // Background profile refresh if online
          getProfileApi()
            .then((res) => {
              if (res.data?.user) {
                setUser(res.data.user);
                setStoredUser(res.data.user);
              }
            })
            .catch(() => {
              // Silently ignore if offline
            });
        }
      } catch (e) {
        console.error('Failed to restore mobile session:', e);
      } finally {
        setLoading(false);
      }
    }
    initAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await loginApi(email, password);
      const authToken = res.data?.token;
      const authUser = res.data?.user;

      if (!authToken || !authUser) {
        throw new Error('Invalid response from verification server.');
      }

      // Restrict mobile app to field-capable roles
      if (!['OFFICER', 'GATC', 'ADMIN'].includes(authUser.role)) {
        throw new Error('This mobile app is exclusively for Field Officers and Authorized GATCs.');
      }

      setToken(authToken);
      setUser(authUser);

      await setStoredToken(authToken);
      await setStoredUser(authUser);
      await saveCachedAssignments([]); // Invalidate stale assignments cache on new login

      return authUser;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login failed.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setToken(null);
    setUser(null);
    await setStoredToken(null);
    await setStoredUser(null);
    await saveCachedAssignments([]); // Clear cached assignments on logout
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        loading,
        error,
        login,
        logout,
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
