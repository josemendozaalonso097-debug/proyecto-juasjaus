import React from 'react';

export default function Header({ userName, onMenuClick, onProfileClick, userPhoto }) {
  const avatarStyle = {
    backgroundImage: `url("${userPhoto || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ffffff'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E"}")`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    border: '2px solid rgba(255,255,255,0.5)',
    cursor: 'pointer'
  };

  return (
    <header className="cab-header" id="header-container">
      <div className="header-content">
        <div 
          id="logo-sidebar-trigger" 
          className="logo-section cursor-pointer hover:opacity-90 transition-opacity"
          onClick={onMenuClick}
        >
          <img src="/imgs/yameharte.png" alt="Logo" className="logo" style={{ height: '50px', width: 'auto' }} />
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0, lineHeight: 1 }}>CBTis 258</h1>
            <h2 style={{ fontSize: '12px', fontWeight: 400, margin: 0, opacity: 0.9 }}>"Un motivo de orgullo"</h2>
          </div>
        </div>

        <div className="flex-1 flex justify-end items-center gap-4">
          <span className="text-sm font-bold hidden sm:block">
            {userName || '—'}
          </span>
          <div 
            onClick={onProfileClick}
            style={avatarStyle}
            title="Ver Perfil"
          />
        </div>
      </div>
    </header>
  );
}
