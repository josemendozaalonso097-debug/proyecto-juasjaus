import React, { useEffect, useMemo, useState } from 'react';

const STEPS = [
  {
    icon: 'account_balance_wallet',
    title: 'Revisa tu estado',
    description: 'Consulta tus pagos y conoce rápidamente si tu cuenta está al corriente.',
    actionLabel: 'Ver estado de cuenta',
    image: '/CobraIcon/CobraDinero.png',
  },
  {
    icon: 'task_alt',
    title: 'Consulta tus pendientes',
    description: 'Aquí encontrarás avisos o acciones que requieren tu atención.',
    actionLabel: 'Ver mis pendientes',
    image: '/CobraIcon/CobraApoyo.png',
  },
  {
    icon: 'explore',
    title: 'Explora tus servicios',
    description: 'Encuentra papelería, orientación, tienda y otros servicios del plantel.',
    actionLabel: 'Explorar servicios',
    image: '/CobraIcon/CobraBienvenida.png',
  },
];

export default function OnboardingGuide({
  userId,
  onOpenInfo,
  onScrollToPending,
  onNavigateTienda,
}) {
  const [visible, setVisible] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const storageKey = useMemo(
    () => (userId ? `inicio_guia_vista_${userId}` : null),
    [userId],
  );

  useEffect(() => {
    setVisible(Boolean(storageKey && !localStorage.getItem(storageKey)));
  }, [storageKey]);

  if (!visible) return null;

  const step = STEPS[stepIndex];
  const isLastStep = stepIndex === STEPS.length - 1;

  const dismiss = () => {
    if (storageKey) localStorage.setItem(storageKey, 'true');
    setVisible(false);
  };

  const handleAction = () => {
    if (stepIndex === 0) onOpenInfo?.();
    if (stepIndex === 1) onScrollToPending?.();
    if (stepIndex === 2) onNavigateTienda?.();
    dismiss();
  };

  return (
    <section
      aria-label="Guía de inicio"
      className="relative mb-8 overflow-hidden rounded-3xl border border-primary/10 bg-white shadow-[0_10px_35px_rgb(148,39,44,0.10)] dark:border-red-900/30 dark:bg-slate-800"
    >
      <div className="absolute -right-12 -top-16 h-44 w-44 rounded-full bg-primary/5 blur-2xl dark:bg-primary/10" />
      <div className="relative flex flex-col gap-5 p-5 sm:p-6 md:flex-row md:items-center md:gap-7">
        <div className="flex shrink-0 items-center justify-center md:w-28">
          <img
            src={step.image}
            alt="Cobra guía de CBTis 258"
            className="h-28 w-24 object-contain drop-shadow-md sm:h-32 sm:w-28"
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-primary">
              Guía rápida
            </p>
            <button
              type="button"
              onClick={dismiss}
              className="rounded-lg px-2 py-1 text-xs font-bold text-slate-400 transition-colors hover:bg-slate-100 hover:text-primary dark:hover:bg-slate-700"
            >
              Omitir
            </button>
          </div>
          <h3 className="text-xl font-black text-slate-800 dark:text-white sm:text-2xl">
            {step.title}
          </h3>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-500 dark:text-slate-300">
            {step.description}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleAction}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-red-700 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              {step.actionLabel}
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
            <div className="flex items-center gap-1.5" aria-label={`Paso ${stepIndex + 1} de ${STEPS.length}`}>
              {STEPS.map((item, index) => (
                <button
                  key={item.title}
                  type="button"
                  aria-label={`Ir al paso ${index + 1}: ${item.title}`}
                  onClick={() => setStepIndex(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === stepIndex ? 'w-7 bg-primary' : 'w-2 bg-slate-200 dark:bg-slate-600'
                  }`}
                />
              ))}
            </div>
            {!isLastStep && (
              <button
                type="button"
                onClick={() => setStepIndex((current) => current + 1)}
                className="text-sm font-bold text-slate-500 transition-colors hover:text-primary dark:text-slate-300"
              >
                Siguiente
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}