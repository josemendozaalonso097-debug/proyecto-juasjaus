import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { adminApi } from '../../api/admin';
import { showToast } from '../../utils/toast';

const FILTERS = ['Todos', 'Enviada', 'En revisión', 'Requiere corrección', 'Pendiente', 'Completado'];

const STATUS_STYLES = {
  Enviada: 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
  'En revisión': 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
  'Requiere corrección': 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300',
  Pendiente: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
  Completado: 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300',
};

function formatDate(value) {
  return value ? new Date(value).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' }) : '—';
}

export default function TabBandeja({ onNavigateVerification }) {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('Todos');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await adminApi.getInbox(filter));
    } catch (error) {
      showToast(error.message || 'No se pudo cargar la bandeja', 'error');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const counts = useMemo(() => items.reduce((result, item) => {
    result[item.estado] = (result[item.estado] || 0) + 1;
    return result;
  }, {}), [items]);

  const updateStatus = async (item, estado) => {
    if (item.source !== 'solicitud') return;
    setUpdatingId(item.id);
    try {
      await adminApi.updateSolicitud(item.source_id, { estado });
      showToast('Estado actualizado', 'success');
      await load();
    } catch (error) {
      showToast(error.message || 'No se pudo actualizar el estado', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#f20d0d]">Centro de trabajo</p>
          <h2 className="mt-1 text-2xl font-black text-slate-800 dark:text-white">Bandeja de pendientes</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Solicitudes y compras que requieren seguimiento administrativo.</p>
        </div>
        <button type="button" onClick={load} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800">
          <span className="material-symbols-outlined text-[18px]">refresh</span>
          Actualizar
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((value) => (
          <button key={value} type="button" onClick={() => setFilter(value)} className={`rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${filter === value ? 'bg-[#f20d0d] text-white' : 'bg-white text-slate-500 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800'}`}>
            {value}{value !== 'Todos' && counts[value] ? ` · ${counts[value]}` : ''}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><span className="material-symbols-outlined animate-spin text-3xl text-[#f20d0d]">progress_activity</span></div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-900">
          <span className="material-symbols-outlined text-5xl text-slate-200 dark:text-slate-700">inbox</span>
          <p className="mt-3 font-bold text-slate-700 dark:text-white">La bandeja está vacía</p>
          <p className="mt-1 text-sm text-slate-500">No hay elementos con este filtro.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                <span className={`material-symbols-outlined h-11 w-11 rounded-xl p-2.5 ${item.source === 'compra' ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300'}`}>
                  {item.source === 'compra' ? 'shopping_bag' : item.tipo === 'papeleria' ? 'description' : 'support_agent'}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-black text-slate-800 dark:text-white">{item.titulo}</h3>
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${STATUS_STYLES[item.estado] || 'bg-slate-100 text-slate-600'}`}>{item.estado}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{item.detalle || 'Sin detalles adicionales.'}</p>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-bold text-slate-400">
                    <span>{item.usuario?.nombre || 'Usuario no disponible'}</span>
                    <span>{item.usuario?.email || '—'}</span>
                    <span>{item.folio || 'Sin folio'}</span>
                    <span>{formatDate(item.created_at)}</span>
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  {item.source === 'solicitud' ? (
                    <select
                      value={item.estado}
                      disabled={updatingId === item.id}
                      onChange={(event) => updateStatus(item, event.target.value)}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    >
                      <option>Enviada</option>
                      <option>En revisión</option>
                      <option>Requiere corrección</option>
                      <option>Aprobada</option>
                      <option>Completada</option>
                    </select>
                  ) : (
                    <button type="button" onClick={onNavigateVerification} className="rounded-xl bg-[#f20d0d] px-3 py-2 text-xs font-bold text-white hover:bg-red-700">
                      Verificar compra
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}