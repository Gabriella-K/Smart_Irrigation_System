// AuthContext.jsx — Global authentication state for Smart Irrigation System
// Uses React Context + Provider pattern (a structural design pattern) so any
// component can access the current user without prop-drilling.

import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiMe, apiLogout } from './api';

const AuthContext = createContext(null);

/**
 * AuthProvider wraps the entire app and exposes:
 *   user     — the currently logged-in user object, or null
 *   loading  — true while the initial /me check is in flight
 *   login()  — store the token and set the user
 *   logout() — call the server logout endpoint, clear storage, reset user
 */
export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, verify any existing token and restore the user session
  useEffect(() => {
    apiMe().then(res => {
      if (res?.user) setUser(res.user);
      setLoading(false);
    });
  }, []);

  /**
   * Called after a successful login or signup.
   * Stores the JWT and sets the user in context.
   * @param {object} userData  The user object returned by the server.
   * @param {string} token     The JWT to persist in localStorage.
   */
  const login = (userData, token) => {
    localStorage.setItem('si_token', token);
    setUser(userData);
  };

  /**
   * Logs the user out:
   *   1. Notifies the server to blacklist the token.
   *   2. Removes the token from localStorage (handled inside apiLogout).
   *   3. Clears the in-memory user state.
   */
  const logout = async () => {
    await apiLogout();   // server-side blacklist + clears localStorage
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/** Custom hook — components call useAuth() instead of useContext(AuthContext) directly. */
export function useAuth() {
  return useContext(AuthContext);
}
