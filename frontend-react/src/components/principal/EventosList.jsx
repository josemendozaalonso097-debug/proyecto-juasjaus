import React from 'react';

export default function EventosList({ eventos, isAdmin, onCreate, onEdit, onDelete }) {
  return (
    <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-slate-100 dark:border-slate-700 p-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold leading-tight tracking-[-0.015em] flex items-center gap-3 text-slate-800 dark:text-white">
          <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-xl">
            <span className="material-symbols-outlined text-primary text-xl">event_note</span>
          </div>
          Eventos y Avisos
        </h3>
        {isAdmin && (
          <button
            onClick={onCreate}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-xl text-xs font-bold border-none cursor-pointer hover:bg-red-700 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            Nuevo
          </button>
        )}
      </div>

      {eventos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 gap-3 text-center">
          <span className="material-symbols-outlined text-slate-200 dark:text-slate-700 text-5xl">event_busy</span>
          <p className="text-sm text-slate-400 dark:text-slate-500">No hay eventos publicados</p>
          {isAdmin && (
            <button onClick={onCreate} className="mt-1 text-xs font-bold text-primary hover:underline cursor-pointer border-none bg-transparent">
              Publicar el primero
            </button>
          )}
        </div>
      ) : (
        <ul className="flex flex-col divide-y divide-slate-100 dark:divide-slate-700/50 max-h-72 overflow-y-auto">
          {eventos.map(ev => (
            <li key={ev.id} className="py-4 first:pt-0 last:pb-0">
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-slate-800 dark:text-slate-200 leading-snug truncate">{ev.titulo}</p>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary mt-0.5">
                    <span className="material-symbols-outlined text-[13px]">calendar_month</span>
                    {ev.fecha}
                  </span>
                  {ev.descripcion && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-1 line-clamp-2">{ev.descripcion}</p>
                  )}
                </div>
                {isAdmin && (
                  <div className="flex gap-1 shrink-0 mt-0.5">
                    <button
                      onClick={() => onEdit(ev)}
                      className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 flex items-center justify-center border-none cursor-pointer transition-colors"
                    >
                      <span className="material-symbols-outlined text-[14px] text-slate-600 dark:text-slate-300">edit</span>
                    </button>
                    <button
                      onClick={() => onDelete(ev.id)}
                      className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-950/50 flex items-center justify-center border-none cursor-pointer transition-colors"
                    >
                      <span className="material-symbols-outlined text-[14px] text-primary dark:text-red-400">delete</span>
                    </button>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
