import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Principal from './pages/Principal';
import Tienda from './pages/Tienda';
import ResetPassword from './pages/ResetPassword';
import Admin from './pages/Admin';

function getHomeRedirect() {
  const token = localStorage.getItem('access_token');
  if (!token) return '/login';
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user?.id) {
      const prefs = JSON.parse(localStorage.getItem(`prefs_${user.id}`)) || {};
      if (prefs.manualLogin) return '/login';
    }
  } catch { /* ignore */ }
  return '/principal';
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            <Route path="/principal" element={
              <ProtectedRoute>
                <Principal />
              </ProtectedRoute>
            } />

            <Route path="/tienda" element={
              <ProtectedRoute>
                <Tienda />
              </ProtectedRoute>
            } />

            <Route path="/admin" element={
              <ProtectedRoute requiredRole="admin">
                <Admin />
              </ProtectedRoute>
            } />

            <Route path="/" element={<Navigate to={getHomeRedirect()} replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
