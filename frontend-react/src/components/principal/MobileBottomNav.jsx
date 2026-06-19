import React from 'react';

export default function MobileBottomNav({ onOpenSidebar, onNavigateTienda }) {
  return (
    <nav className="mob-nav fixed bottom-0 left-0 right-0 z-45 flex justify-around items-center px-4 h-20 bg-white/92 dark:bg-[#1a1c20]/92 backdrop-blur-md border-t border-slate-100 dark:border-[#3c1e1e]/20 shadow-lg rounded-t-3xl">
      <a href="#" className="flex flex-col items-center justify-center w-full h-full text-[#af101a] relative">
        <span className="absolute w-16 h-10 bg-[#af101a]/8 rounded-full z-[-1]" />
        <span className="material-symbols-outlined mb-1">dashboard</span>
        <span className="text-[10px] font-bold uppercase tracking-wider">Panel</span>
      </a>
      <button
        onClick={onNavigateTienda}
        className="flex flex-col items-center justify-center w-full h-full text-slate-500 dark:text-[#9b7a78] cursor-pointer border-none bg-transparent"
      >
        <span className="material-symbols-outlined mb-1">shopping_bag</span>
        <span className="text-[10px] font-bold uppercase tracking-wider">Tienda</span>
      </button>
      <button
        onClick={onOpenSidebar}
        className="flex flex-col items-center justify-center w-full h-full text-slate-500 dark:text-[#9b7a78] cursor-pointer border-none bg-transparent"
      >
        <span className="material-symbols-outlined mb-1">settings</span>
        <span className="text-[10px] font-bold uppercase tracking-wider">Ajustes</span>
      </button>
    </nav>
  );
}
