import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Login from './pages/Login';
import Principal from './pages/Principal';
import Tienda from './pages/Tienda';
import ResetPassword from './pages/ResetPassword';

function App() {
  const token = localStorage.getItem('access_token');

  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/principal" element={<Principal />} />
          <Route path="/tienda" element={<Tienda />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route 
            path="/" 
            element={token ? <Navigate to="/principal" replace /> : <Navigate to="/login" replace />} 
          />
          {/* Fallback redirection */}
          <Route 
            path="*" 
            element={<Navigate to="/" replace />} 
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
