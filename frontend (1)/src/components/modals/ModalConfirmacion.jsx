import React from 'react';

export default function ModalConfirmacion({ isOpen, onClose, title, message, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div id="modalConfirmacion" className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/70 backdrop-blur-md">
      <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 mx-4 animate-in fade-in zoom-in duration-300">
        
        {/* Icono y Título */}
        <div className="p-8 pb-4 flex flex-col items-center text-center">
          <div className="size-20 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center mb-6 shadow-inner rotate-3">
            <span className="material-symbols-outlined text-4xl">warning_amber</span>
          </div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white leading-tight mb-3" id="confirm-title">{title || '¡Atención!'}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed px-4" id="confirm-msg">
            {message}
          </p>
        </div>

        {/* Botones de Acción */}
        <div className="p-6 pt-2 flex flex-col gap-3">
          <button 
            id="confirm-accept-btn" 
            onClick={() => {
              if (onConfirm) onConfirm();
              onClose();
            }}
            className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">check_circle</span>
            Sí, continuar
          </button>
          <button 
            onClick={onClose} 
            className="w-full py-4 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold rounded-2xl border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">cancel</span>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
