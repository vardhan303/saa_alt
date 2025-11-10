import React, { createContext, useCallback, useEffect, useRef, useState } from 'react';

const AuthContext = createContext(null);

// With Vite proxy configured, we can use relative URLs
// This avoids CORS issues by letting the dev server proxy requests
const API_BASE = ''; // Empty string means use relative URLs

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const initRef = useRef(false);

  const fetchMe = useCallback(async () => {
    try {
      setError(null);
      
      // Check localStorage for static auth
      const storedUser = localStorage.getItem('auth_user');
      const storedToken = localStorage.getItem('auth_token');
      
      if (storedUser && storedToken) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        return;
      }
      
      setUser(null);
    } catch (err) {
      console.error('Auth fetchMe error', err);
      setError(err.message);
      setUser(null);
    }
  }, []);

  const login = useCallback(() => {
    window.location.href = '/login';
  }, []);

  const logout = useCallback(async () => {
    // Clear localStorage
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_token');
    setUser(null);
    window.location.href = '/login';
  }, []);

  const refresh = useCallback(async () => {
    await fetchMe();
  }, [fetchMe]);

  const updateProfile = useCallback(async (fields) => {
    // Update user in localStorage
    const currentUser = JSON.parse(localStorage.getItem('auth_user') || '{}');
    const updatedUser = { ...currentUser, ...fields };
    localStorage.setItem('auth_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    return updatedUser;
  }, []);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    fetchMe().finally(() => setLoading(false));
  }, [fetchMe]);

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    refresh,
    refreshUser: refresh,
    updateProfile,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
