// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login        from './pages/Login';
import Register     from './pages/Register';
import AppShell     from './components/AppShell';
import Dashboard    from './pages/Dashboard';
import Requests     from './pages/Requests';
import MapView      from './pages/MapView';
import AdminPanel   from './pages/AdminPanel';

// Requires login
const Private = ({ children, adminOnly }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
};

function AppRoutes() {
  const { user } = useAuth();
  const home = user ? (user.role === 'admin' ? '/admin' : '/dashboard') : '/login';

  return (
    <Routes>
      <Route path="/"         element={<Navigate to={home} replace />} />
      <Route path="/login"    element={!user ? <Login />    : <Navigate to={home} replace />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to={home} replace />} />

      {/* All authenticated pages live inside the shell (sidebar + topbar) */}
      <Route path="/" element={<Private><AppShell /></Private>}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="requests"  element={<Requests />} />
        <Route path="map"       element={<MapView />} />
        <Route path="admin"     element={<Private adminOnly><AdminPanel /></Private>} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1e293b',
              color: '#e2e8f0',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#22c55e', secondary: '#0f172a' } },
            error:   { iconTheme: { primary: '#ef4444', secondary: '#0f172a' } },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}
