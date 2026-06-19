import React from 'react';

export default function FinancierosPanel({ onOpenPapeleria, onOpenOrientacion, onNavigateTienda }) {
  return (
    <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-slate-100 dark:border-slate-700 p-8">
      <h3 className="text-xl font-bold leading-tight tracking-[-0.015em] mb-4 flex items-center gap-3 text-slate-800 dark:text-white">
        <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
          <span className="material-symbols-outlined text-purple-500 text-xl">storefront</span>
        </div>
        Financieros
      </h3>
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-6">Adquiere productos escolares o realiza tus trámites.</p>
      <ul className="space-y-4 mb-6">
        <li>
          <button
            onClick={onOpenPapeleria}
            className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700 border border-slate-100 dark:border-slate-700 hover:border-orange-200 dark:hover:border-orange-500/30 hover:shadow-md transition-all group cursor-pointer text-left"
          >
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-xl">draw</span>
              </div>
              <span className="text-base font-bold text-slate-700 dark:text-slate-200">Subir Papelería</span>
            </div>
            <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 group-hover:text-orange-500 transition-colors">arrow_forward</span>
          </button>
        </li>
        <li>
          <button
            onClick={onOpenOrientacion}
            className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700 border border-slate-100 dark:border-slate-700 hover:border-teal-200 dark:hover:border-teal-500/30 hover:shadow-md transition-all group cursor-pointer text-left"
          >
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-teal-100 dark:bg-teal-900/30 rounded-lg text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-xl">psychology</span>
              </div>
              <span className="text-base font-bold text-slate-700 dark:text-slate-200">Orientación</span>
            </div>
            <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 group-hover:text-teal-500 transition-colors">arrow_forward</span>
          </button>
        </li>
      </ul>
      <button
        onClick={onNavigateTienda}
        className="w-full flex cursor-pointer items-center justify-center h-12 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-sm"
      >
        Ingresar a Tienda
      </button>
    </section>
  );
}
