import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppProviders from './AppProviders.jsx';
import AppRoutes from './routes.jsx';

export default function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <AppProviders>
        <AppRoutes />
      </AppProviders>
    </BrowserRouter>
  );
}
