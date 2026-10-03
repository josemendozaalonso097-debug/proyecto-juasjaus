import React from 'react';

export default class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error inesperado en el portal:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-10 dark:bg-slate-950">
          <section className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-primary dark:bg-red-950/30">
              <span className="material-symbols-outlined text-4xl">error</span>
            </div>
            <p className="mt-5 text-xs font-black uppercase tracking-[0.18em] text-primary">Error inesperado</p>
            <h1 className="mt-2 text-2xl font-black text-slate-800 dark:text-white">No pudimos mostrar esta página</h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              Ocurrió un problema al cargar el portal. Puedes volver a intentarlo o regresar al inicio de sesión.
            </p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <button
                type="button"
                data-testid="button-reload-after-error"
                onClick={() => window.location.reload()}
                className="rounded-xl bg-primary px-5 py-3 text-sm font-black text-white transition-colors hover:bg-red-700"
              >
                Intentar de nuevo
              </button>
              <a
                data-testid="link-login-after-error"
                href="/login"
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-black text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Ir a iniciar sesión
              </a>
            </div>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}