import React, { useCallback, useEffect, useMemo, useState } from 'react';
import TooltipBubble from './TooltipBubble';
import { getUserPreferences, setTooltipEnabled } from '../../utils/preferences';

const TOUR_STEPS = [
  {
    id: 'welcome',
    target: 'welcome',
    title: 'Tu inicio en CBTis 258',
    description: 'Aquí encontrarás tu saludo, perfil y el resumen más importante de tu cuenta.',
    image: '/CobraIcon/CobraBienvenida.png',
  },
  {
    id: 'account',
    target: 'account',
    title: 'Cuenta activa',
    description: 'Consulta tu semestre, correo y próximo vencimiento. Si aparece una acción nueva, esta sección alternará automáticamente para mostrártela.',
    image: '/CobraIcon/CobraApoyo.png',
  },
  {
    id: 'payments',
    target: 'payments',
    title: 'Estados de pago',
    description: 'Revisa si estás al corriente, cuántos pagos tienes pendientes y abre los detalles cuando necesites consultarlos.',
    image: '/CobraIcon/CobraDinero.png',
  },
  {
    id: 'services',
    target: 'services',
    title: 'Servicios escolares',
    description: 'Desde aquí puedes acceder a papelería, orientación y la tienda institucional.',
    image: '/CobraIcon/CobraPape.png',
  },
  {
    id: 'events',
    target: 'events',
    title: 'Eventos y avisos',
    description: 'Las novedades del plantel y el calendario aparecen en esta sección para que puedas consultarlas cuando lo necesites.',
    image: '/CobraIcon/CobraOrienta.png',
  },
];

function findVisibleTarget(targetName) {
  const candidates = Array.from(document.querySelectorAll(`[data-tour="${targetName}"]`));
  return candidates.find((element) => {
    const rect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);
    return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
  }) || null;
}

export default function GuidedTour({ userId }) {
  const [tourOpen, setTourOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState(null);
  const [showPreferencePrompt, setShowPreferencePrompt] = useState(false);
  const [openedFromTooltip, setOpenedFromTooltip] = useState(false);

  const storageKey = useMemo(
    () => (userId ? `tour_inicio_completado_${userId}` : null),
    [userId],
  );

  const closeTour = useCallback((showPrompt = false) => {
    setTourOpen(false);
    setTargetRect(null);
    if (showPrompt && userId && !getUserPreferences(userId).tooltips) {
      setShowPreferencePrompt(true);
    }
  }, [userId]);

  const startTour = useCallback((index = 0, fromTooltip = false) => {
    setOpenedFromTooltip(fromTooltip);
    setStepIndex(Math.max(0, Math.min(index, TOUR_STEPS.length - 1)));
    setTourOpen(true);
    setShowPreferencePrompt(false);
  }, []);

  useEffect(() => {
    if (!storageKey) return undefined;
    const promptDismissed = localStorage.getItem(`${storageKey}_prompt`);
    if (!localStorage.getItem(storageKey) && !promptDismissed) {
      const timer = window.setTimeout(() => startTour(), 650);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [storageKey, startTour]);

  useEffect(() => {
    const openFromTooltip = (event) => {
      const stepId = event.detail?.stepId;
      const index = TOUR_STEPS.findIndex((step) => step.id === stepId);
      if (index >= 0) startTour(index, true);
    };
    window.addEventListener('cbtis-open-tour', openFromTooltip);
    return () => window.removeEventListener('cbtis-open-tour', openFromTooltip);
  }, [startTour]);

  useEffect(() => {
    if (!tourOpen) return undefined;

    let frameId;
    const updateTarget = () => {
      const element = findVisibleTarget(TOUR_STEPS[stepIndex].target);
      if (!element) {
        setTargetRect(null);
        return;
      }
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      frameId = window.requestAnimationFrame(() => {
        const rect = element.getBoundingClientRect();
        setTargetRect({
          top: Math.max(8, rect.top - 8),
          left: Math.max(8, rect.left - 8),
          width: Math.min(window.innerWidth - 16, rect.width + 16),
          height: Math.min(window.innerHeight - 16, rect.height + 16),
          bottom: rect.bottom,
        });
      });
    };

    const timer = window.setTimeout(updateTarget, 80);
    window.addEventListener('resize', updateTarget);
    window.addEventListener('scroll', updateTarget, { passive: true });
    return () => {
      window.clearTimeout(timer);
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('resize', updateTarget);
      window.removeEventListener('scroll', updateTarget);
    };
  }, [tourOpen, stepIndex]);

  if (!tourOpen && !showPreferencePrompt) return null;

  const step = TOUR_STEPS[stepIndex];
  const isLast = stepIndex === TOUR_STEPS.length - 1;
  const tooltipBelow = !targetRect || targetRect.bottom + 250 < window.innerHeight;
  const tooltipStyle = targetRect ? {
    left: Math.min(Math.max(16, targetRect.left), Math.max(16, window.innerWidth - 376)),
    ...(tooltipBelow
      ? { top: Math.min(window.innerHeight - 250, targetRect.top + targetRect.height + 18) }
      : { top: Math.max(16, targetRect.top - 242) }),
  } : {};

  const finishTour = (showPrompt = true) => {
    if (storageKey) localStorage.setItem(storageKey, 'true');
    closeTour(showPrompt && !openedFromTooltip);
  };

  const enableTooltips = () => {
    setTooltipEnabled(userId, true);
    setShowPreferencePrompt(false);
  };

  const dismissPrompt = () => {
    if (storageKey) localStorage.setItem(`${storageKey}_prompt`, 'true');
    setShowPreferencePrompt(false);
  };

  return (
    <>
      {tourOpen && (
        <>
          {!targetRect && <div className="fixed inset-0 z-[100000] bg-slate-950/70 backdrop-blur-[2px]" />}
          {targetRect && (
            <div
              aria-hidden="true"
              className="pointer-events-none fixed z-[100001] rounded-2xl border-2 border-white/90 transition-all duration-300"
              style={{
                top: targetRect.top,
                left: targetRect.left,
                width: targetRect.width,
                height: targetRect.height,
                boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.70), 0 0 28px rgba(255,255,255,0.30)',
              }}
            />
          )}
          <aside
            role="dialog"
            aria-label={`Tour guiado, paso ${stepIndex + 1} de ${TOUR_STEPS.length}`}
            className="fixed z-[100002] w-[calc(100vw-32px)] max-w-[360px] rounded-2xl border border-white/20 bg-white p-4 text-slate-900 shadow-2xl dark:bg-slate-900 dark:text-white"
            style={tooltipStyle}
          >
            <div className="flex gap-3">
              <img src={step.image} alt="" className="h-16 w-14 shrink-0 object-contain" />
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-primary">
                  Tour guiado · {stepIndex + 1}/{TOUR_STEPS.length}
                </p>
                <h2 className="mt-1 text-base font-black">{step.title}</h2>
                <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-300">{step.description}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => finishTour(true)}
                className="text-xs font-bold text-slate-400 hover:text-primary"
              >
                Omitir tour
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={stepIndex === 0}
                  onClick={() => setStepIndex((current) => current - 1)}
                  className="rounded-lg px-2.5 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 disabled:opacity-30 dark:hover:bg-slate-800"
                >
                  Atrás
                </button>
                <button
                  type="button"
                  onClick={() => (isLast ? finishTour(true) : setStepIndex((current) => current + 1))}
                  className="rounded-lg bg-primary px-3 py-2 text-xs font-bold text-white shadow-sm hover:bg-red-700"
                >
                  {isLast ? 'Terminar' : 'Siguiente'}
                </button>
              </div>
            </div>
          </aside>
        </>
      )}

      {showPreferencePrompt && (
        <aside
          role="dialog"
          aria-label="Preferencia de tooltips"
          className="fixed bottom-4 left-4 z-[100003] flex w-[calc(100vw-32px)] max-w-[390px] items-center gap-3 rounded-2xl border border-primary/15 bg-white p-4 shadow-2xl dark:bg-slate-900"
        >
          <img src="/CobraIcon/CobraDuda.png" alt="" className="h-14 w-12 shrink-0 object-contain" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-black text-slate-800 dark:text-white">¿Quieres activar los tooltips?</p>
            <p className="mt-0.5 text-xs leading-relaxed text-slate-500 dark:text-slate-300">
              Verás una burbuja de ayuda en las secciones principales.
            </p>
            <div className="mt-2 flex gap-2">
              <button type="button" onClick={enableTooltips} className="rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-white">
                Activar
              </button>
              <button type="button" onClick={dismissPrompt} className="rounded-lg px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
                No por ahora
              </button>
            </div>
          </div>
        </aside>
      )}
    </>
  );
}