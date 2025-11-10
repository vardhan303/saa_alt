import React from 'react';
import { useAuth } from '../hooks/useAuth.js';

export default function ProtectedRoute({ children, fallback = null, loadingFallback = null }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return loadingFallback || <div className="p-4 text-sm text-gray-500">Checking session...</div>;
  if (!isAuthenticated) return fallback || null;
  return <>{children}</>;
}
