import React from 'react';

export default function Header({ userName, onMenuClick, onProfileClick, userPhoto }) {
  const avatarStyle = {
    backgroundImage: `url("${userPhoto || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'}")`,
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  };

  return (
    <header className="bg-gradient-to-r from-primary to-red-800/90 backdrop-blur-md bg-opacity-90 text-white flex items-center justify-between whitespace-nowrap px-10 py-5 shadow-lg sticky top-0 z-50 border-b border-white/10">
      <div
        id="logo-sidebar-trigger"
        onClick={onMenuClick}
        className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity"
      >
        <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
          <img src="/imgs/yameharte.png" alt="Logo" className="h-8 w-auto object-contain" />
        </div>
        <div>
          <h1 className="text-2xl font-black leading-tight tracking-[-0.015em]">CBTis 258</h1>
          <p className="text-xs font-semibold text-white/90 uppercase tracking-widest">Un motivo de orgullo</p>
        </div>
      </div>
      
      <div className="flex flex-1 justify-end gap-8 items-center">
        <div
          onClick={onProfileClick}
          className="flex items-center gap-4 bg-black/10 py-2 px-4 rounded-full border border-white/20 shadow-sm cursor-pointer hover:bg-black/20 transition-colors"
        >
          <span className="text-sm font-bold hidden sm:block" id="user-name-nav">
            {userName || '—'}
          </span>
          <div
            id="header-user-photo"
            className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border-2 border-white/50 bg-slate-300"
            style={avatarStyle}
          ></div>
        </div>
      </div>
    </header>
  );
}
