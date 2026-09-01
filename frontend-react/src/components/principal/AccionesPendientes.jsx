import React from 'react';

export default function AccionesPendientes({
  pendingCount,
  eventos = [],
  onOpenInfo,
  onViewEvents,
  onNavigateTienda,
}) {
  const actions = [];

  if (pendingCount > 0) {
    actions.push({
      icon: 'priority_high',
      title: `Tienes ${pendingCount} pago${pendingCount === 1 ? '' : 's'} pendiente${pendingCount === 1 ? '' : 's'}`,
      description: 'Revisa tu estado de cuenta para conocer el siguiente paso.',
      button: 'Ver estado',
      onClick: onOpenInfo,
      tone: 'red',
    });
  }

  if (eventos.length > 0) {
    actions.push({
      icon: 'campaign',
      title: `Hay ${eventos.length} aviso${eventos.length === 1 ? '' : 's'} publicado${eventos.length === 1 ? '' : 's'}`,
      description: 'Consulta las novedades publicadas por el plantel.',
      button: 'Ver avisos',
      onClick: onViewEvents,
      tone: 'blue',
    });
  }

  return (
    <section
      id="acciones-pendientes"
      className="mb-8 rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:border-slate-700 dark:bg-slate-800 dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] sm:p-6"
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-primary">Tu siguiente paso</p>
          <h3 className="mt-1 text-xl font-black text-slate-800 dark:text-white">Acciones pendientes</h3>
        </div>
        <span className="material-symbols-outlined rounded-xl bg-primary/10 p-2 text-primary">task_alt</span>
      </div>

      {actions.length === 0 ? (
        <div className="flex flex-col gap-4 rounded-xl bg-green-50/70 p-4 dark:bg-emerald-950/20 sm:flex-row sm:items-center">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-300">
            <span className="material-symbols-outlined">check</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-bold text-slate-800 dark:text-white">No tienes acciones pendientes por ahora</p>
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-300">
              Tu cuenta está al corriente y no hay avisos nuevos que revisar.
            </p>
          </div>
          <button
            type="button"
            onClick={onNavigateTienda}
            className="shrink-0 rounded-xl border border-green-200 bg-white px-4 py-2.5 text-sm font-bold text-green-700 transition-colors hover:bg-green-50 dark:border-green-800 dark:bg-slate-800 dark:text-green-300 dark:hover:bg-green-950/30"
          >
            Explorar servicios
          </button>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {actions.map((action) => (
            <div
              key={action.title}
              className={`flex items-center gap-3 rounded-xl border p-4 ${
                action.tone === 'red'
                  ? 'border-red-100 bg-red-50/70 dark:border-red-900/40 dark:bg-red-950/20'
                  : 'border-blue-100 bg-blue-50/70 dark:border-blue-900/40 dark:bg-blue-950/20'
              }`}
            >
              <span
                className={`material-symbols-outlined rounded-xl p-2 ${
                  action.tone === 'red'
                    ? 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300'
                    : 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300'
                }`}
              >
                {action.icon}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-slate-800 dark:text-white">{action.title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-slate-500 dark:text-slate-300">
                  {action.description}
                </p>
              </div>
              <button
                type="button"
                onClick={action.onClick}
                className="shrink-0 text-xs font-black text-primary hover:underline"
              >
                {action.button}
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}