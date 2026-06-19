import React from 'react';

export default function EstadoPago({ pendingCount, onOpenInfo, onOpenHistory }) {
  return (
    <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-slate-100 dark:border-slate-700 p-8 flex flex-col h-full relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20" />
      <h3 className="text-2xl font-bold leading-tight tracking-[-0.015em] mb-8 flex items-center gap-3 relative z-10 text-slate-800 dark:text-white">
        <div className="p-2 bg-primary/10 rounded-xl">
          <span className="material-symbols-outlined text-primary text-2xl">account_balance_wallet</span>
        </div>
        Estados de pago
      </h3>

      <div className="flex-grow flex flex-col items-center justify-center p-10 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 relative overflow-hidden glass-card z-10 mb-8">
        {pendingCount > 0 ? (
          <>
            <div className="relative inline-flex items-center justify-center w-36 h-36 rounded-full mb-6">
              <svg className="w-full h-full text-red-200 dark:text-red-900/40" viewBox="0 0 36 36">
                <path className="stroke-current" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeLinecap="round" strokeWidth="2.5" />
              </svg>
              <svg className="w-full h-full text-red-500 absolute top-0 left-0" viewBox="0 0 36 36">
                <path className="stroke-current" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeDasharray="100, 100" strokeLinecap="round" strokeWidth="2.5" />
              </svg>
              <div className="absolute bg-red-500/10 w-24 h-24 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-5xl text-red-500">close</span>
              </div>
            </div>
            <h4 className="text-2xl font-bold leading-tight tracking-[-0.015em] mb-3 text-slate-800 dark:text-slate-100">
              Tienes <strong className="text-red-500">{pendingCount}</strong> pago(s) pendiente(s)
            </h4>
            <p className="text-slate-500 dark:text-slate-400 text-base max-w-md text-center">
              Hemos detectado un atraso en tu cuenta. Por favor regulariza tu situación.
            </p>
          </>
        ) : (
          <>
            <div className="relative inline-flex items-center justify-center w-36 h-36 rounded-full mb-6">
              <svg className="w-full h-full text-slate-200 dark:text-slate-700" viewBox="0 0 36 36">
                <path className="stroke-current" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeLinecap="round" strokeWidth="2.5" />
              </svg>
              <svg className="w-full h-full text-green-500 absolute top-0 left-0" viewBox="0 0 36 36">
                <path className="stroke-current" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeDasharray="100, 100" strokeLinecap="round" strokeWidth="2.5" />
              </svg>
              <div className="absolute bg-green-500/10 w-24 h-24 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-5xl text-green-500">check</span>
              </div>
            </div>
            <h4 className="text-2xl font-bold leading-tight tracking-[-0.015em] mb-3 text-slate-800 dark:text-slate-100">
              Tienes <strong className="text-primary">0</strong> pagos pendientes
            </h4>
            <p className="text-slate-500 dark:text-slate-400 text-base max-w-md text-center">
              Tu cuenta está al corriente. ¡Gracias por tu puntualidad y compromiso con tu educación!
            </p>
          </>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-5 mt-auto relative z-10">
        <button
          onClick={onOpenInfo}
          className="flex-1 flex cursor-pointer items-center justify-center rounded-xl h-14 px-8 bg-gradient-to-r from-primary to-red-600 text-white text-base font-bold shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5 transition-all focus:ring-4 focus:ring-primary/20"
        >
          <span className="material-symbols-outlined mr-3 text-[22px]">info</span>
          Información
        </button>
        <button
          onClick={onOpenHistory}
          className="flex-1 flex cursor-pointer items-center justify-center rounded-xl h-14 px-8 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-base font-bold shadow-sm border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 hover:-translate-y-0.5 transition-all"
        >
          <span className="material-symbols-outlined mr-3 text-[22px]">history</span>
          Historial de Pagos
        </button>
      </div>
    </section>
  );
}
