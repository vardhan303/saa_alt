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
      const res = await fetch(`${API_BASE}/auth/me`, { credentials: 'include' });
      if (res.status === 401) {
        setUser(null);
        return;
      }
      if (!res.ok) throw new Error(`Failed /auth/me: ${res.status}`);
      const data = await res.json();
      if (data?.authenticated) {
        // Ensure user.id is set for frontend
        setUser({
          ...data.user,
          id:
            data.user.sub ||
            data.user.googleId ||
            data.user.id ||
            data.user._id
        });
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Auth fetchMe error', err);
      setError(err.message);
      setUser(null);
    }
  }, []);

  const login = useCallback(() => {
    window.location.href = `${API_BASE}/auth/google`;
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, { method: 'GET', credentials: 'include' });
    } catch (err) {
      console.warn('Logout error (ignored)', err);
    }
    setUser(null);
    // Optionally force a reload or navigate
  }, []);

  const refresh = useCallback(async () => {
    await fetchMe();
  }, [fetchMe]);

  const updateProfile = useCallback(async (fields) => {
    const payload = {
      university: fields.university,
      currentSem: fields.currentSem,
      currentCGPA: fields.currentCGPA,
      universityEmail: fields.universityEmail
    };
    // Remove undefined keys
    Object.keys(payload).forEach(k => payload[k] === undefined && delete payload[k]);
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.error || 'Failed to update profile');
    }
    const data = await res.json();
    if (data?.user) {
      // Update in-place; JWT refresh already handled by server via cookie
      setUser(prev => ({ ...(prev || {}), ...data.user }));
      return data.user;
    }
    return null;
  }, []);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    // If redirected back with login=success ensure we fetch fresh user
    const url = new URL(window.location.href);
    const fromLogin = url.searchParams.get('login') === 'success';
    fetchMe().finally(() => setLoading(false));
    if (fromLogin) {
      // Clean query param for aesthetics
      url.searchParams.delete('login');
      window.history.replaceState({}, document.title, url.pathname + url.search + url.hash);
    }
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
