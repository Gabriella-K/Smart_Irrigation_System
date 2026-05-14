import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiMe } from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiMe().then(res => {
      if (res?.user) setUser(res.user);
      setLoading(false);
    });
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('si_token', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('si_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
