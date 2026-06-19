import React from 'react';

export default function MobileQuickActions({ onOpenInfo, onOpenHistory, onOpenOrientacion, onOpenPapeleria }) {
  return (
    <section className="mb-5">
      <h3 className="mob-title font-bold text-base text-[#1a1c1d] dark:text-[#f1f1f3] mb-3.5">Acciones rápidas</h3>
      <div className="grid grid-cols-2 gap-3">

        <button onClick={onOpenInfo} className="mob-card bg-white dark:bg-[#1e2025] border border-slate-100 dark:border-[#3c1e1e]/20 rounded-2xl p-5 text-left cursor-pointer transition-transform">
          <div className="w-10 h-10 rounded-xl bg-[#af101a]/5 dark:bg-[#af101a]/15 flex items-center justify-center mb-2.5">
            <span className="material-symbols-outlined text-[#af101a] dark:text-white text-[20px]">info</span>
          </div>
          <p className="mob-title font-bold text-sm text-[#1a1c1d] dark:text-[#f1f1f3] m-0">Información</p>
          <p className="mob-sub text-[10px] text-[#8f6f6c] dark:text-[#9b7a78] mt-0.5">Ver estado de cuenta</p>
        </button>

        <button onClick={onOpenHistory} className="mob-card bg-white dark:bg-[#1e2025] border border-slate-100 dark:border-[#3c1e1e]/20 rounded-2xl p-5 text-left cursor-pointer transition-transform">
          <div className="w-10 h-10 rounded-xl bg-[#005faf]/5 dark:bg-[#005faf]/15 flex items-center justify-center mb-2.5">
            <span className="material-symbols-outlined text-[#005faf] dark:text-blue-400 text-[20px]">history</span>
          </div>
          <p className="mob-title font-bold text-sm text-[#1a1c1d] dark:text-[#f1f1f3] m-0">Historial</p>
          <p className="mob-sub text-[10px] text-[#8f6f6c] dark:text-[#9b7a78] mt-0.5">Pagos realizados</p>
        </button>

        <button onClick={onOpenOrientacion} className="mob-card bg-white dark:bg-[#1e2025] border border-slate-100 dark:border-[#3c1e1e]/20 rounded-2xl p-5 text-left cursor-pointer transition-transform">
          <div className="w-10 h-10 rounded-xl bg-[#005f3a]/5 dark:bg-[#005f3a]/15 flex items-center justify-center mb-2.5">
            <span className="material-symbols-outlined text-[#005f3a] dark:text-emerald-400 text-[20px]">school</span>
          </div>
          <p className="mob-title font-bold text-sm text-[#1a1c1d] dark:text-[#f1f1f3] m-0">Orientación</p>
          <p className="mob-sub text-[10px] text-[#8f6f6c] dark:text-[#9b7a78] mt-0.5">Reportes y citas</p>
        </button>

        <button onClick={onOpenPapeleria} className="mob-card bg-white dark:bg-[#1e2025] border border-slate-100 dark:border-[#3c1e1e]/20 rounded-2xl p-5 text-left cursor-pointer transition-transform">
          <div className="mob-action-icon w-10 h-10 rounded-xl bg-[#af101a]/5 dark:bg-[#af101a]/15 flex items-center justify-center mb-2.5">
            <span className="material-symbols-outlined text-[#af101a] dark:text-white text-[20px]">edit_note</span>
          </div>
          <p className="mob-title font-bold text-sm text-[#1a1c1d] dark:text-[#f1f1f3] m-0">Papelería</p>
          <p className="mob-sub text-[10px] text-[#8f6f6c] dark:text-[#9b7a78] mt-0.5">Subir documentos</p>
        </button>

      </div>
    </section>
  );
}
