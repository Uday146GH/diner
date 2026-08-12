import { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is already logged in on page load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  async function checkAuthStatus() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      const response = await api.get('/auth/me');
      setUser(response.data.user);
    } catch (err) {
      // User not logged in or token expired
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function register(email, password, fullName) {
    try {
      setError(null);
      const response = await api.post('/auth/register', {
        email,
        password,
        fullName
      });
      setUser(response.data.user);
      localStorage.setItem('token', response.data.accessToken);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Registration failed';
      setError(errorMsg);
      throw err;
    }
  }

  async function login(email, password) {
    try {
      setError(null);
      const response = await api.post('/auth/login', {
        email,
        password
      });
      setUser(response.data.user);
      localStorage.setItem('token', response.data.accessToken);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Login failed';
      setError(errorMsg);
      throw err;
    }
  }

  async function logout() {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      localStorage.removeItem('token');
    }
  }

  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
