import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      api.get('/auth/profile')
        .then(res => {
          const userData = res.data;
          // Ensure boolean flags
          userData.isAdmin = userData.isAdmin !== undefined ? userData.isAdmin : (userData.is_admin === 1 || userData.is_admin === true);
          userData.isProfessional = userData.isProfessional !== undefined ? userData.isProfessional : (userData.is_professional === 1 || userData.is_professional === true);
          userData.role = userData.role || 'user';
          setUser(userData);
        })
        .catch(() => {
          localStorage.removeItem('token');
          delete api.defaults.headers.common['Authorization'];
          setToken(null);
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token, user } = res.data;
    localStorage.setItem('token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setToken(token);
    setUser(user);
    return user;
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    const { token, user } = res.data;
    localStorage.setItem('token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setToken(token);
    setUser(user);
    return user;
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (data) => {
    const res = await api.put('/auth/profile', data);
    const profileRes = await api.get('/auth/profile');
    const userData = profileRes.data;
    userData.isAdmin = userData.isAdmin !== undefined ? userData.isAdmin : (userData.is_admin === 1 || userData.is_admin === true);
    userData.isProfessional = userData.isProfessional !== undefined ? userData.isProfessional : (userData.is_professional === 1 || userData.is_professional === true);
    userData.role = userData.role || 'user';
    setUser(userData);
    return res.data;
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);