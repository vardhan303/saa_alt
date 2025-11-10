
import React from 'react';
import { AuthProvider } from '../features/auth/AuthContext.jsx';
import { SocketProvider } from '../features/auth/SocketProvider.jsx';

// Placeholder provider composition component
export default function AppProviders({ children }) {
  return (
    <AuthProvider>
      <SocketProvider>{children}</SocketProvider>
    </AuthProvider>
  );
}

