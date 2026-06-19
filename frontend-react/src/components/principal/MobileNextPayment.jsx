import React from 'react';

export default function MobileNextPayment({ pendingCount, nextPaymentDateText, nextPaymentDateColor }) {
  return (
    <section className="mob-card bg-white dark:bg-[#1e2025] rounded-2xl p-5 mb-5 border border-slate-100 dark:border-[#3c1e1e]/20 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3">
        <div className="mob-action-icon w-10 h-10 rounded-xl bg-[#af101a]/5 dark:bg-[#af101a]/15 flex items-center justify-center text-[#af101a] dark:text-white shrink-0">
          <span className="material-symbols-outlined text-[20px]">calendar_month</span>
        </div>
        <div>
          <p className="mob-label text-[10px] font-bold text-[#8f6f6c] dark:text-[#9b7a78] uppercase tracking-wider mb-0.5">Próximo Vencimiento</p>
          <p className="font-bold text-[0.9rem]" style={{ color: nextPaymentDateColor }}>
            {pendingCount === 0 ? 'Sin deuda' : nextPaymentDateText}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="mob-label text-[10px] font-bold text-[#8f6f6c] dark:text-[#9b7a78] mb-0.5">Colegiatura</p>
        <p className="mob-value font-bold text-[0.9rem] text-[#1a1c1d] dark:text-[#f1f1f3]">$3,000 MXN</p>
      </div>
    </section>
  );
}
