import React, { createContext, useContext, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './hooks/useAuth';

const SocketContext = createContext(null);

export function useSocket() {
  return useContext(SocketContext);
}

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const socketRef = useRef(null);

  useEffect(() => {
    // Only connect if user is authenticated
    if (!user) return;
    // Connect to backend socket.io server
    // Use window.location.origin for frontend, fallback to localhost:5000 for dev
    const SOCKET_SERVER_URL = window.location.hostname === 'localhost'
      ? 'http://localhost:5000'
      : window.location.origin.replace(':5173', ':5000');
    const socket = io(SOCKET_SERVER_URL, {
      withCredentials: true,
      transports: ['websocket'],
      query: { userId: user.id },
    });
    socketRef.current = socket;

    // Join rooms for hackathons user manages
    if (user.managedHackathonIds && Array.isArray(user.managedHackathonIds)) {
      user.managedHackathonIds.forEach(hid => {
        socket.emit('joinHackathonRoom', hid);
      });
    }
    // Join personal room for registration updates
    socket.emit('joinUserRoom', user.id);

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
    });
    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    // Clean up on unmount
    return () => {
      socket.disconnect();
    };
  }, [user]);

  return (
    <SocketContext.Provider value={socketRef.current}>
      {children}
    </SocketContext.Provider>
  );
}
