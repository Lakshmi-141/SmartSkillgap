import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('smartskill_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('smartskill_token') || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await axiosInstance.get('/auth/me');
          if (res.data?.success && res.data?.user) {
            setUser(res.data.user);
            localStorage.setItem('smartskill_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.error('Session verification error:', err);
          if (err.response?.status === 401 || err.response?.status === 403) {
            logout();
          }
        }
      }
      setLoading(false);
    };
    initAuth();
  }, [token]);

  const login = async (email, password) => {
    setError(null);
    try {
      const res = await axiosInstance.post('/auth/login', { email, password });
      if (res.data?.success) {
        setToken(res.data.token);
        setUser(res.data.user);
        localStorage.setItem('smartskill_token', res.data.token);
        localStorage.setItem('smartskill_user', JSON.stringify(res.data.user));
        return { success: true, user: res.data.user };
      }
      return { success: false, message: res.data?.message || 'Login failed.' };
    } catch (err) {
      const serverMessage = err.response?.data?.message;
      let msg = serverMessage;
      if (!msg) {
        if (err.response?.status === 502 || err.response?.status === 503 || err.response?.status === 504) {
          msg = 'Authentication server is temporarily unavailable. Please check backend connection.';
        } else if (err.response?.status === 404) {
          msg = 'Backend API route not found. Please check API URL settings.';
        } else if (!err.response && err.message === 'Network Error') {
          msg = 'Unable to reach the authentication server. Please check your network connection.';
        } else {
          msg = err.message || 'Invalid email or password.';
        }
      }
      setError(msg);
      return { success: false, message: msg };
    }
  };

  const register = async (name, email, password) => {
    setError(null);
    try {
      const res = await axiosInstance.post('/auth/register', { name, email, password });
      if (res.data?.success) {
        setToken(res.data.token);
        setUser(res.data.user);
        localStorage.setItem('smartskill_token', res.data.token);
        localStorage.setItem('smartskill_user', JSON.stringify(res.data.user));
        return { success: true, user: res.data.user };
      }
      return { success: false, message: res.data?.message || 'Registration failed.' };
    } catch (err) {
      const serverMessage = err.response?.data?.message;
      let msg = serverMessage;
      if (!msg) {
        if (err.response?.status === 502 || err.response?.status === 503 || err.response?.status === 504) {
          msg = 'Authentication server is temporarily unavailable. Please check backend connection.';
        } else if (err.response?.status === 404) {
          msg = 'Backend API route not found. Please check API URL settings.';
        } else if (!err.response && err.message === 'Network Error') {
          msg = 'Unable to reach the authentication server. Please check your network connection.';
        } else {
          msg = err.message || 'Registration failed. Please try again.';
        }
      }
      setError(msg);
      return { success: false, message: msg };
    }
  };

  const logout = async () => {
    try {
      await axiosInstance.post('/auth/logout').catch(() => {});
    } catch (e) {
      // Ignore network errors during logout
    } finally {
      setToken(null);
      setUser(null);
      localStorage.removeItem('smartskill_token');
      localStorage.removeItem('smartskill_user');
    }
  };

  const refreshUser = async () => {
    if (!token) return;
    try {
      const res = await axiosInstance.get('/auth/me');
      if (res.data?.success && res.data?.user) {
        setUser(res.data.user);
        localStorage.setItem('smartskill_user', JSON.stringify(res.data.user));
      }
    } catch (err) {
      console.error('Error refreshing user profile:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        login,
        register,
        logout,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
