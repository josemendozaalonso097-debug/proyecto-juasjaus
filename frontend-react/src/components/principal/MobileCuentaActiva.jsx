import React from 'react';

export default function MobileCuentaActiva({ userProfile }) {
  return (
    <section className="mob-card bg-white dark:bg-[#1e2025] rounded-2xl p-5 mb-5 border border-slate-100 dark:border-[#3c1e1e]/20 shadow-sm">
      <h3 className="mob-title font-bold text-base text-[#1a1c1d] dark:text-[#f1f1f3] mb-4">Cuenta Activa</h3>
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-[#3c1e1e]/20">
          <span className="mob-label text-sm text-[#5b403d] dark:text-[#9b7a78]">Semestre Actual</span>
          <span className="mob-value font-bold text-sm text-[#1a1c1d] dark:text-[#f1f1f3]">
            {userProfile ? `${userProfile.semestre}° Semestre` : '—'}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="mob-label text-sm text-[#5b403d] dark:text-[#9b7a78]">Correo</span>
          <span className="mob-value font-bold text-sm text-[#1a1c1d] dark:text-[#f1f1f3] max-w-[180px] overflow-hidden text-ellipsis whitespace-nowrap">
            {userProfile ? userProfile.email : '—'}
          </span>
        </div>
      </div>
    </section>
  );
}
