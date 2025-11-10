import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';
import { OrbitProgress } from '../shared/ui';
import LoginForm from '../features/auth/components/LoginForm';
import AdminLogin from '../features/auth/components/AdminLogin';
import ProtectedRoute from '../features/auth/components/ProtectedRoute';
// import DashboardPage from '../pages/Dashboard';
import ProfilePage from '../pages/Profile';
import HackathonManagement from '../pages/Hackathons';
import ParticipantDashboard from '../pages/Hackathons/ParticipantDashboard';
import { AdminPage } from '../pages/Admin';
import { TeamSubmissionPage } from '../pages/TeamSubmission';
import DevpostHackathons from '../pages/DevpostHackathons';
import NotFoundPage from '../pages/NotFoundPage';

export default function AppRoutes() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <OrbitProgress variant="track-disc" speedPlus="-3" easing="ease-in-out" size="lg" />
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/login" 
        element={
          isAuthenticated ? <Navigate to="/" replace /> : <LoginForm />
        } 
      />
      
      {/* Admin Routes */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminPage />} />
      
      {/* Protected Routes */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute fallback={<Navigate to="/login" replace />}>
            <ProfilePage />
          </ProtectedRoute>
        } 
      />
      
      <Route 
  // path="/dashboard" 
        element={
          <ProtectedRoute fallback={<Navigate to="/login" replace />}>
            {/* <DashboardPage /> */}
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute fallback={<Navigate to="/login" replace />}>
            <ProfilePage />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/hackathons" 
        element={
          <ProtectedRoute fallback={<Navigate to="/login" replace />}>
            <HackathonManagement />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/my-hackathons" 
        element={
          <ProtectedRoute fallback={<Navigate to="/login" replace />}>
            <ParticipantDashboard />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/devpost-hackathons" 
        element={<DevpostHackathons />} 
      />
      
      <Route 
        path="/teams/:teamId/submission" 
        element={
          <ProtectedRoute fallback={<Navigate to="/login" replace />}>
            <TeamSubmissionPage />
          </ProtectedRoute>
        } 
      />
      
      {/* Catch-all route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
