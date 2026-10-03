import { Link, useLocation } from 'react-router-dom';

export default function NotFound() {
  const location = useLocation();

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-10 dark:bg-slate-950">
      <section className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/5 text-primary dark:bg-primary/10">
          <span className="material-symbols-outlined text-4xl">search_off</span>
        </div>
        <p className="mt-5 text-xs font-black uppercase tracking-[0.18em] text-primary">Error 404</p>
        <h1 className="mt-2 text-2xl font-black text-slate-800 dark:text-white">No encontramos esta página</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          El enlace puede estar equivocado o la página ya no existe.
        </p>
        <p className="mt-3 break-all rounded-lg bg-slate-50 px-3 py-2 font-mono text-xs text-slate-400 dark:bg-slate-800" data-testid="text-not-found-path">
          {location.pathname}
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            to="/"
            data-testid="link-home-from-404"
            className="rounded-xl bg-primary px-5 py-3 text-sm font-black text-white transition-colors hover:bg-red-700"
          >
            Volver al inicio
          </Link>
          <button
            type="button"
            data-testid="button-back-from-404"
            onClick={() => window.history.length > 1 ? window.history.back() : window.location.assign('/')}
            className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-black text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Página anterior
          </button>
        </div>
      </section>
    </main>
  );
}