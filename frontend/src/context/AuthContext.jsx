import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(() => {
    return localStorage.getItem('userType') || null;
  });
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    const storedUserType = localStorage.getItem('userType');

    if (token && userData) {
      setUser(JSON.parse(userData));
      if (storedUserType) setUserType(storedUserType);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    // apply theme to document
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const { token, user: userData } = response.data;

      localStorage.setItem('token', token);
      if (userData.userType) {
        localStorage.setItem('userType', userData.userType);
        setUserType(userData.userType);
      } else {
        localStorage.removeItem('userType');
        setUserType(null);
      }
      localStorage.setItem('user', JSON.stringify(userData));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      setUser(userData);
      toast.success('Login successful!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Login failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post('/api/auth/register', userData);
      toast.success('Registration successful! Please login.');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Registration failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userType');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setUserType(null);
    toast.info('Logged out successfully');
  };

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const value = {
    user,
    userType,
    loading,
    theme,
    toggleTheme,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
