import React, { useEffect, useMemo, useState } from 'react';
import { obtenerMisCompras } from '../api/compras';
import { obtenerMisSolicitudes } from '../api/solicitudes';

const STATUS_STYLES = {
  Completado: 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300',
  Aprobada: 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300',
  Enviada: 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
  Pendiente: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
  'En revisión': 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
  'Requiere corrección': 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300',
};

function formatDate(value) {
  if (!value) return 'Fecha no disponible';
  return new Date(value).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function SeguimientoModal({ isOpen, onClose }) {
  const [solicitudes, setSolicitudes] = useState([]);
  const [compras, setCompras] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    setLoading(true);
    setError('');
    Promise.all([obtenerMisSolicitudes(), obtenerMisCompras()])
      .then(([requestData, purchaseData]) => {
        if (!active) return;
        setSolicitudes(requestData);
        setCompras(purchaseData);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message || 'No se pudo cargar el seguimiento.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [isOpen]);

  const items = useMemo(() => [
    ...solicitudes.map((item) => ({
      id: `solicitud-${item.id}`,
      icon: item.tipo === 'papeleria' ? 'description' : item.tipo === 'cita' ? 'event' : 'support_agent',
      title: item.titulo || 'Solicitud',
      type: item.tipo,
      reference: item.folio,
      status: item.estado,
      date: item.created_at,
      detail: item.nota_admin || 'Tu solicitud fue recibida y está en seguimiento.',
    })),
    ...compras.map((item) => ({
      id: `compra-${item.id}`,
      icon: 'shopping_bag',
      title: item.productos?.map((product) => `${product.nombre} ×${product.cantidad}`).join(', ') || 'Compra institucional',
      type: 'compra',
      reference: item.verification_id ? `ID ${item.verification_id}` : 'Compra',
      status: item.estado,
      date: item.created_at,
      detail: `Método de pago: ${item.metodo_pago || 'No especificado'}`,
    })),
  ].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0)), [solicitudes, compras]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10020] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" onClick={(event) => event.target === event.currentTarget && onClose()}>
      <section role="dialog" aria-modal="true" aria-label="Seguimiento de solicitudes y compras" className="flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-primary/10 bg-white shadow-2xl dark:bg-slate-900">
        <header className="flex items-center justify-between bg-gradient-to-r from-primary to-red-800 px-6 py-5 text-white">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined rounded-xl bg-white/15 p-2">route</span>
            <div>
              <h2 className="text-lg font-black">Seguimiento</h2>
              <p className="text-xs font-semibold text-white/75">Solicitudes y compras</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-xl p-2 text-white transition-colors hover:bg-white/15">
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          {loading && <div className="flex justify-center py-12"><span className="material-symbols-outlined animate-spin text-3xl text-primary">progress_activity</span></div>}
          {!loading && error && <p className="rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700 dark:bg-red-950/30 dark:text-red-300">{error}</p>}
          {!loading && !error && items.length === 0 && (
            <div className="flex flex-col items-center py-12 text-center">
              <span className="material-symbols-outlined text-5xl text-slate-200 dark:text-slate-700">route</span>
              <h3 className="mt-3 font-black text-slate-700 dark:text-white">Aún no tienes movimientos</h3>
              <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">Cuando envíes una solicitud o realices una compra, aquí podrás consultar su estado.</p>
            </div>
          )}
          {!loading && !error && items.length > 0 && (
            <div className="space-y-3">
              {items.map((item) => (
                <article key={item.id} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/50">
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined rounded-xl bg-white p-2 text-primary shadow-sm dark:bg-slate-700">{item.icon}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <h3 className="font-bold text-slate-800 dark:text-white">{item.title}</h3>
                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${STATUS_STYLES[item.status] || 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>{item.status}</span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{item.detail}</p>
                      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-bold text-slate-400">
                        <span>{item.reference}</span>
                        <span>{formatDate(item.date)}</span>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}