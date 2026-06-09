import React from 'react';

export default function ConfirmacionModal({ isOpen, title, message, onAccept, onCancel }) {
  if (!isOpen) return null;

  return (
    <div id="modalConfirmacion" className="fixed inset-0 z-[10006] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-primary/10 flex flex-col">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
        
        {/* Header */}
        <header className="bg-gradient-to-r from-primary to-red-800 px-6 py-4 shrink-0 flex items-center gap-3">
          <span className="material-symbols-outlined text-white text-2xl">help_outline</span>
          <h2 className="text-white text-lg font-black leading-tight" id="confirm-title">{title}</h2>
        </header>

        {/* Content */}
        <div className="p-6 relative z-10 bg-white dark:bg-slate-900">
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed text-center mb-6" id="confirm-msg">
            {message}
          </p>

          {/* Actions */}
          <div className="flex gap-3">
            <button 
              onClick={onCancel}
              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-xl transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button 
              onClick={onAccept}
              className="flex-1 py-3 bg-primary hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all cursor-pointer"
              id="confirm-accept-btn"
            >
              Aceptar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
