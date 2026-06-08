import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage.jsx';
import PrincipalPage from './pages/PrincipalPage.jsx';
import TiendaPage from './pages/TiendaPage.jsx';
import ResetPasswordPage from './pages/ResetPasswordPage.jsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/principal" element={<PrincipalPage />} />
        <Route path="/tienda" element={<TiendaPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
