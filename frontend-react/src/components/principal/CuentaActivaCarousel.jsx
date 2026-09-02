import React, { useEffect, useMemo, useState } from 'react';
import TooltipBubble from './TooltipBubble';

function getActions({ pendingCount, eventos, onOpenInfo, onViewEvents }) {
  const actions = [];
  if (pendingCount > 0) {
    actions.push({
      id: 'payment',
      icon: 'priority_high',
      title: `${pendingCount} pago${pendingCount === 1 ? '' : 's'} pendiente${pendingCount === 1 ? '' : 's'}`,
      description: 'Revisa tu estado de cuenta para conocer el siguiente paso.',
      button: 'Ver estado',
      onClick: onOpenInfo,
      tone: 'red',
    });
  }
  if (eventos.length > 0) {
    actions.push({
      id: 'event',
      icon: 'campaign',
      title: `${eventos.length} aviso${eventos.length === 1 ? '' : 's'} publicado${eventos.length === 1 ? '' : 's'}`,
      description: 'Consulta las novedades del plantel.',
      button: 'Ver avisos',
      onClick: onViewEvents,
      tone: 'blue',
    });
  }
  return actions;
}

export default function CuentaActivaCarousel({
  userProfile,
  nextPaymentDateText,
  nextPaymentDateColor,
  pendingCount,
  eventos = [],
  onOpenInfo,
  onViewEvents,
  onTooltip,
  variant = 'desktop',
}) {
  const [slide, setSlide] = useState(0);
  const actions = useMemo(
    () => getActions({ pendingCount, eventos, onOpenInfo, onViewEvents }),
    [pendingCount, eventos, onOpenInfo, onViewEvents],
  );
  const isMobile = variant === 'mobile';

  useEffect(() => {
    setSlide(0);
  }, [actions.length]);

  useEffect(() => {
    if (!actions.length) return undefined;
    const timer = window.setInterval(() => {
      setSlide((current) => (current + 1) % (actions.length + 1));
    }, 5500);
    return () => window.clearInterval(timer);
  }, [actions.length]);

  const sectionClass = isMobile
    ? 'mob-card mb-5 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:border-[#3c1e1e]/20 dark:bg-[#1e2025]'
    : 'rounded-2xl border border-slate-100 bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:border-slate-700 dark:bg-slate-800 dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)]';
  const titleClass = isMobile
    ? 'mob-title text-base font-bold text-[#1a1c1d] dark:text-[#f1f1f3]'
    : 'text-xl font-bold text-slate-800 dark:text-white';

  return (
    <section data-tour="account" className={sectionClass}>
      <div className="mb-5 flex items-center gap-3">
        <div className={`rounded-xl ${isMobile ? 'bg-blue-50 p-2 dark:bg-blue-900/20' : 'bg-blue-50 p-2 dark:bg-blue-900/20'}`}>
          <span className="material-symbols-outlined text-xl text-blue-500">credit_card</span>
        </div>
        <h3 className={titleClass}>Cuenta Activa</h3>
        <TooltipBubble userId={userProfile?.id} stepId="account" />
      </div>

      <div className="overflow-hidden" aria-live="polite">
        <div
          className="flex items-start transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${slide * 100}%)` }}
        >
          <div className={`min-w-full ${isMobile ? 'flex flex-col gap-3' : 'space-y-5'}`}>
            <div className={`flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-700/50`}>
              <span className={isMobile ? 'mob-label text-sm text-[#5b403d] dark:text-[#9b7a78]' : 'text-sm font-medium text-slate-500 dark:text-slate-400'}>Semestre Actual</span>
              <span className={isMobile ? 'mob-value text-sm font-bold text-[#1a1c1d] dark:text-[#f1f1f3]' : 'text-sm font-bold text-slate-800 dark:text-slate-200'}>
                {userProfile ? `${userProfile.semestre}° Semestre` : '—'}
              </span>
            </div>
            <div className={`flex items-center justify-between ${isMobile ? '' : 'border-b border-slate-100 pb-4 dark:border-slate-700/50'}`}>
              <span className={isMobile ? 'mob-label text-sm text-[#5b403d] dark:text-[#9b7a78]' : 'text-sm font-medium text-slate-500 dark:text-slate-400'}>{isMobile ? 'Correo' : 'Colegiatura Mes'}</span>
              <span className={isMobile ? 'mob-value max-w-[180px] overflow-hidden text-ellipsis whitespace-nowrap text-sm font-bold text-[#1a1c1d] dark:text-[#f1f1f3]' : 'text-sm font-bold text-slate-800 dark:text-slate-200'}>
                {isMobile ? (userProfile?.email || '—') : '$3,000.00 MXN'}
              </span>
            </div>
            {!isMobile && (
              <div className="flex items-center justify-between rounded-xl border border-primary/10 bg-primary/5 p-4">
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Próximo Vencimiento</span>
                <span className="text-sm font-black" style={{ color: nextPaymentDateColor }}>{nextPaymentDateText}</span>
              </div>
            )}
          </div>

          {actions.map((action) => (
            <div key={action.id} className="min-w-full">
              <div className={`flex min-h-[126px] flex-col justify-between rounded-xl border p-4 ${
                action.tone === 'red'
                  ? 'border-red-100 bg-red-50/70 dark:border-red-900/40 dark:bg-red-950/20'
                  : 'border-blue-100 bg-blue-50/70 dark:border-blue-900/40 dark:bg-blue-950/20'
              }`}>
                <div className="flex items-start gap-3">
                  <span className={`material-symbols-outlined rounded-xl p-2 ${
                    action.tone === 'red'
                      ? 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300'
                      : 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300'
                  }`}>{action.icon}</span>
                  <div className="min-w-0">
                    <p className="font-black text-slate-800 dark:text-white">{action.title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-300">{action.description}</p>
                  </div>
                </div>
                <button type="button" onClick={action.onClick} className="self-end text-xs font-black text-primary hover:underline">
                  {action.button}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {actions.length > 0 && (
        <div className="mt-4 flex items-center justify-center gap-1.5" aria-label="Acciones de cuenta">
          {[0, ...actions].map((action, index) => (
            <button
              key={action === 0 ? 'account' : action.id}
              type="button"
              aria-label={index === 0 ? 'Ver cuenta activa' : `Ver ${action.title}`}
              onClick={() => setSlide(index)}
              className={`h-1.5 rounded-full transition-all ${slide === index ? 'w-6 bg-primary' : 'w-1.5 bg-slate-200 dark:bg-slate-600'}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}