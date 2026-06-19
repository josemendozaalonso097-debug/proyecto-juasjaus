import React, { useState, useRef } from 'react';

export default function MobileCarousel({ pendingCount, eventos, isAdmin, onOpenInfo, onCreate, onEdit, onDelete }) {
  const [slide, setSlide] = useState(0);
  const touchStartX = useRef(null);

  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) setSlide(diff > 0 ? 1 : 0);
    touchStartX.current = null;
  };

  return (
    <section className="mb-5" id="estado-container-global-mobile">
      <div className="flex justify-center gap-1.5 mb-2">
        <button onClick={() => setSlide(0)} className={`w-2 h-2 rounded-full transition-all border-none cursor-pointer ${slide === 0 ? 'bg-[#af101a] w-5' : 'bg-slate-300 dark:bg-slate-600'}`} />
        <button onClick={() => setSlide(1)} className={`w-2 h-2 rounded-full transition-all border-none cursor-pointer ${slide === 1 ? 'bg-[#af101a] w-5' : 'bg-slate-300 dark:bg-slate-600'}`} />
      </div>

      <div className="overflow-hidden rounded-2xl" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        <div className="flex transition-transform duration-300 ease-in-out" style={{ transform: `translateX(-${slide * 100}%)` }}>

          {/* Slide 1: Estado de pago */}
          <div className="min-w-full">
            <div className="mob-card bg-white dark:bg-[#1e2025] rounded-2xl p-5 border border-slate-100 dark:border-[#3c1e1e]/20 shadow-sm">
              <div className="flex justify-between items-start mb-[14px]">
                <div>
                  <h3 className="mob-title font-bold text-base text-[#1a1c1d] dark:text-[#f1f1f3] mb-1.5">Estados de pago</h3>
                  {pendingCount > 0 ? (
                    <div className="inline-flex items-center gap-1.5 bg-[#ffdad6] dark:bg-red-950/40 rounded-full px-2.5 py-1 text-[11px] font-bold text-[#93000a] dark:text-red-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a] inline-block" />
                      {pendingCount} pago(s) pendiente(s)
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 bg-[#e8f5e9] dark:bg-green-950/40 rounded-full px-2.5 py-1 text-[11px] font-bold text-[#1b5e20] dark:text-green-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#27ae60] inline-block" />
                      Al corriente
                    </div>
                  )}
                </div>
                {pendingCount > 0 ? (
                  <div className="w-[52px] h-[52px] rounded-full bg-[#ffdad6] dark:bg-red-950/40 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[#ba1a1a] dark:text-red-400 text-[22px]">warning</span>
                  </div>
                ) : (
                  <div className="w-[52px] h-[52px] rounded-full bg-[#e8f5e9] dark:bg-green-950/40 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[#27ae60] dark:text-green-400 text-[22px]">check_circle</span>
                  </div>
                )}
              </div>
              <p className="mob-sub text-xs text-[#5b403d] dark:text-[#9b7a78] leading-relaxed mb-4">
                {pendingCount > 0 ? 'Tienes pagos atrasados. Regulariza tu situación a tiempo.' : 'Tu cuenta está al corriente. ¡Gracias por tu puntualidad!'}
              </p>
              <button onClick={onOpenInfo} className="w-full bg-[#af101a] text-white py-3 rounded-xl font-bold text-sm border-none cursor-pointer">
                Ver detalles
              </button>
            </div>
          </div>

          {/* Slide 2: Eventos */}
          <div className="min-w-full">
            <div className="mob-card bg-white dark:bg-[#1e2025] rounded-2xl p-5 border border-slate-100 dark:border-[#3c1e1e]/20 shadow-sm min-h-[190px]">
              <div className="flex justify-between items-center mb-3">
                <h3 className="mob-title font-bold text-base text-[#1a1c1d] dark:text-[#f1f1f3]">Eventos y Avisos</h3>
                {isAdmin && (
                  <button onClick={onCreate} className="w-8 h-8 rounded-full bg-[#af101a] text-white flex items-center justify-center border-none cursor-pointer shrink-0">
                    <span className="material-symbols-outlined text-[18px]">add</span>
                  </button>
                )}
              </div>
              {eventos.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 gap-2 text-center">
                  <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 text-[40px]">event_note</span>
                  <p className="text-xs text-[#8f6f6c] dark:text-[#9b7a78]">Sin eventos por ahora</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3 max-h-[280px] overflow-y-auto pr-1">
                  {eventos.map(ev => (
                    <div key={ev.id} className="flex flex-col gap-0.5 pb-2.5 border-b border-slate-100 dark:border-[#3c1e1e]/20 last:border-0 last:pb-0">
                      <div className="flex justify-between items-start gap-2">
                        <p className="font-bold text-sm text-[#1a1c1d] dark:text-[#f1f1f3] leading-snug">{ev.titulo}</p>
                        {isAdmin && (
                          <div className="flex gap-1 shrink-0">
                            <button onClick={() => onEdit(ev)} className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center border-none cursor-pointer">
                              <span className="material-symbols-outlined text-[14px] text-slate-600 dark:text-slate-300">edit</span>
                            </button>
                            <button onClick={() => onDelete(ev.id)} className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-950/30 flex items-center justify-center border-none cursor-pointer">
                              <span className="material-symbols-outlined text-[14px] text-[#ba1a1a] dark:text-red-400">delete</span>
                            </button>
                          </div>
                        )}
                      </div>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#af101a] dark:text-red-400">
                        <span className="material-symbols-outlined text-[12px]">calendar_month</span>
                        {ev.fecha}
                      </span>
                      {ev.descripcion && (
                        <p className="text-xs text-[#5b403d] dark:text-[#9b7a78] leading-relaxed mt-0.5">{ev.descripcion}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
