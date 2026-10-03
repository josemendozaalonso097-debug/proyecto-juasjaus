import { useEffect, useState } from 'react';

export default function NetworkStatus() {
  const [offline, setOffline] = useState(() => !navigator.onLine);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    const handleOffline = () => {
      setRetrying(false);
      setOffline(true);
    };
    const handleOnline = () => {
      setOffline(false);
      setRetrying(false);
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  useEffect(() => {
    if (!retrying) return undefined;
    const timer = window.setTimeout(() => {
      setRetrying(false);
      setOffline(!navigator.onLine);
    }, 800);
    return () => window.clearTimeout(timer);
  }, [retrying]);

  if (!offline) return null;

  return (
    <div className="fixed inset-0 z-[110000] flex items-center justify-center bg-slate-950/80 px-5 py-10 backdrop-blur-sm">
      <section role="alertdialog" aria-modal="true" aria-labelledby="offline-title" className="w-full max-w-lg rounded-3xl border border-white/10 bg-white p-8 text-center shadow-2xl dark:bg-slate-900">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300">
          <span className="material-symbols-outlined text-4xl">wifi_off</span>
        </div>
        <p className="mt-5 text-xs font-black uppercase tracking-[0.18em] text-amber-600 dark:text-amber-300">Sin conexión</p>
        <h1 id="offline-title" className="mt-2 text-2xl font-black text-slate-800 dark:text-white">No hay internet</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          La conexión se interrumpió. Revisa tu red; el portal se reanudará automáticamente cuando vuelva internet.
        </p>
        <button
          type="button"
          data-testid="button-retry-connection"
          onClick={() => setRetrying(true)}
          disabled={retrying}
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-black text-white transition-colors hover:bg-red-700 disabled:cursor-wait disabled:opacity-70"
        >
          <span className={`material-symbols-outlined text-lg ${retrying ? 'animate-spin' : ''}`}>{retrying ? 'progress_activity' : 'refresh'}</span>
          {retrying ? 'Comprobando conexión…' : 'Reintentar conexión'}
        </button>
      </section>
    </div>
  );
}