import React from 'react';

export default function Footer({ onLogout }) {
  return (
    <footer className="footer" id="footer-container">
      <div className="footer-content">
        <p>&copy; 2024 CBTis 258. Todos los derechos reservados.</p>
        <div className="footer-links">
          <a href="#" onClick={(e) => { e.preventDefault(); onLogout(); }} id="logout-btn">
            Cerrar Sesión
          </a>
        </div>
      </div>
    </footer>
  );
}
