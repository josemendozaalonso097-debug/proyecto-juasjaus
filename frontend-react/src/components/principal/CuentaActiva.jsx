import React from 'react';

export default function CuentaActiva({ userProfile, nextPaymentDateText, nextPaymentDateColor }) {
  return (
    <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-slate-100 dark:border-slate-700 p-8">
      <h3 className="text-xl font-bold leading-tight tracking-[-0.015em] mb-6 flex items-center gap-3 text-slate-800 dark:text-white">
        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
          <span className="material-symbols-outlined text-blue-500 text-xl">credit_card</span>
        </div>
        Cuenta Activa
      </h3>
      <div className="space-y-5">
        <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-700/50">
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Semestre Actual</span>
          <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
            {userProfile ? `${userProfile.semestre}° Semestre` : '—'}
          </span>
        </div>
        <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-700/50">
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Colegiatura Mes</span>
          <span className="text-sm font-bold text-slate-800 dark:text-slate-200">$3,000.00 MXN</span>
        </div>
        <div className="flex justify-between items-center p-4 bg-primary/5 rounded-xl border border-primary/10">
          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Próximo Vencimiento</span>
          <span className="text-sm font-black" style={{ color: nextPaymentDateColor }}>
            {nextPaymentDateText}
          </span>
        </div>
      </div>
    </section>
  );
}
