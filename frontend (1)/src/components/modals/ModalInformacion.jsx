import React from 'react';

export default function ModalInformacion({ isOpen, onClose, onSectionSelect }) {
  if (!isOpen) return null;

  return (
    <div className="modal-informacion fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm" id="modalInformacion">
      <div className="modal-informacion-content dark:bg-slate-900 dark:text-slate-100 relative w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col mx-4">
        <header className="bg-gradient-to-r from-primary to-red-800 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <img src="/imgs/yameharte.png" alt="CBTis 258" className="h-9 w-auto object-contain" />
            <div>
              <h2 className="text-white text-lg font-black leading-tight">CBTis 258</h2>
              <p className="text-white/80 text-[11px] font-semibold uppercase tracking-widest">Información General</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <span className="material-symbols-outlined text-white">close</span>
          </button>
        </header>

        <div className="info-grid p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="info-card-section cursor-pointer p-4 bg-slate-50 dark:bg-slate-800 dark:border-slate-700 border border-slate-200 rounded-xl hover:scale-[1.02] transition-transform flex flex-col gap-2" onClick={() => onSectionSelect('nuevoIngreso')}>
            <div className="info-icon text-3xl">🎓</div>
            <h3 className="font-bold text-slate-800 dark:text-white">Nuevo Ingreso</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Proceso de inscripción y requisitos</p>
          </div>

          <div className="info-card-section cursor-pointer p-4 bg-slate-50 dark:bg-slate-800 dark:border-slate-700 border border-slate-200 rounded-xl hover:scale-[1.02] transition-transform flex flex-col gap-2" onClick={() => onSectionSelect('becas')}>
            <div className="info-icon text-3xl">💰</div>
            <h3 className="font-bold text-slate-800 dark:text-white">Becas y Apoyos</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Información sobre becas disponibles</p>
          </div>

          <div className="info-card-section cursor-pointer p-4 bg-slate-50 dark:bg-slate-800 dark:border-slate-700 border border-slate-200 rounded-xl hover:scale-[1.02] transition-transform flex flex-col gap-2" onClick={() => onSectionSelect('contacto')}>
            <div className="info-icon text-3xl">📞</div>
            <h3 className="font-bold text-slate-800 dark:text-white">Contacto</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Teléfonos y correos importantes</p>
          </div>

          <div className="info-card-section cursor-pointer p-4 bg-slate-50 dark:bg-slate-800 dark:border-slate-700 border border-slate-200 rounded-xl hover:scale-[1.02] transition-transform flex flex-col gap-2" onClick={() => onSectionSelect('faq')}>
            <div className="info-icon text-3xl">❓</div>
            <h3 className="font-bold text-slate-800 dark:text-white">Preguntas Frecuentes</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Dudas comunes resueltas</p>
          </div>
        </div>
      </div>
    </div>
  );
}
