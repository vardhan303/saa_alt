import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    // Configure Vite to proxy API requests to the backend server
    proxy: {
      '/auth': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        withCredentials: true
      },
      '/health': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      },
      '/debug': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      },
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        withCredentials: true
      }
    }
  }
});
