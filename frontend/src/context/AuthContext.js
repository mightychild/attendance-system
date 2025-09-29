import React, { createContext, useState, useContext, useEffect } from 'react';
import { getCurrentUser } from '../utils/authAPI';

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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkLoggedIn = async () => {
      const token = localStorage.getItem('attendanceToken');
      const userData = getCurrentUser();

      if (token && userData) {
        setUser(userData);
      }
      setIsLoading(false);
    };

    checkLoggedIn();
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('attendanceToken', token);
    localStorage.setItem('attendanceUser', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('attendanceToken');
    localStorage.removeItem('attendanceUser');
    setUser(null);
  };

  const updateUser = (userData) => {
    localStorage.setItem('attendanceUser', JSON.stringify(userData));
    setUser(userData);
  };

  const value = {
    user,
    isLoading,
    login,
    logout,
    updateUser,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};