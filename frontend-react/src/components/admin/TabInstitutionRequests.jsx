import { useCallback, useEffect, useState } from 'react';
import { adminApi } from '../../api/admin';
import { showToast } from '../../utils/toast';

const FILTERS = ['Pendiente', 'En revisión', 'Aprobada', 'Rechazada', 'Todos'];

function dateLabel(value) {
  if (!value) return 'Fecha no disponible';
  return new Date(value).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' });
}

export default function TabInstitutionRequests() {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState('Pendiente');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  const load = useCallback(async () => {
    try {
      setRequests(await adminApi.getInstitutionRequests(filter));
    } catch (error) {
      showToast(error.message || 'No se pudieron cargar las solicitudes de planteles', 'error');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const review = async (item, status) => {
    setUpdating(item.id);
    try {
      await adminApi.reviewInstitutionRequest(item.id, { status });
      showToast(status === 'Aprobada' ? 'Solicitud aprobada. Recuerda dar de alta el entorno del plantel.' : 'Solicitud actualizada', 'success');
      await load();
    } catch (error) {
      showToast(error.message || 'No se pudo actualizar la solicitud', 'error');
    } finally {
      setUpdating(null);
    }
  };

  return (
    <section className="space-y-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-primary">Incorporación de escuelas</p>
          <h2 className="mt-1 text-2xl font-black text-slate-800 dark:text-white">Solicitudes de nuevos planteles</h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-slate-400">Revisa el plantel y su persona de contacto. Aprobar no crea todavía el servidor, la base de datos ni las credenciales; esos pasos se realizan manualmente después.</p>
        </div>
        <button type="button" onClick={load} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
          <span className="material-symbols-outlined text-[18px]">refresh</span>Actualizar
        </button>
      </header>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((value) => (
          <button key={value} type="button" onClick={() => { setLoading(true); setFilter(value); }} className={`rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${filter === value ? 'bg-primary text-white' : 'bg-white text-slate-500 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800'}`}>
            {value}
          </button>
        ))}
      </div>

      {loading ? (
        <div role="status" className="flex justify-center py-16"><span className="material-symbols-outlined animate-spin text-3xl text-primary">progress_activity</span></div>
      ) : requests.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-900">
          <span className="material-symbols-outlined text-5xl text-slate-200 dark:text-slate-700">domain_disabled</span>
          <p className="mt-3 font-bold text-slate-700 dark:text-white">No hay solicitudes en esta vista</p>
          <p className="mt-1 text-sm text-slate-500">Cuando un plantel envíe el formulario, aparecerá aquí.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((item) => (
            <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-col gap-5 xl:flex-row xl:items-start">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-red-50 text-primary dark:bg-red-950/40 dark:text-red-300"><span className="material-symbols-outlined">school</span></span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-black text-slate-800 dark:text-white">{item.school_name}</h3>
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${item.status === 'Pendiente' ? 'bg-amber-100 text-amber-800' : item.status === 'Aprobada' ? 'bg-emerald-100 text-emerald-800' : item.status === 'Rechazada' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>{item.status}</span>
                  </div>
                  <div className="mt-3 grid gap-x-6 gap-y-2 text-sm text-slate-600 dark:text-slate-300 sm:grid-cols-2">
                    <p><span className="font-bold">Contacto:</span> {item.contact_name} · {item.contact_role}</p>
                    <p><span className="font-bold">Correo:</span> <a className="text-primary underline" href={`mailto:${item.contact_email}`}>{item.contact_email}</a></p>
                    <p><span className="font-bold">Ubicación:</span> {[item.municipality, item.state, item.postal_code].filter(Boolean).join(', ')}</p>
                    <p><span className="font-bold">Recibida:</span> {dateLabel(item.created_at)}</p>
                  </div>
                  {item.requested_modules && <p className="mt-3 whitespace-pre-wrap rounded-xl bg-slate-50 p-3 text-sm leading-6 text-slate-600 dark:bg-slate-800 dark:text-slate-300"><span className="font-bold">Necesidades:</span> {item.requested_modules}</p>}
                  {item.review_note && <p className="mt-2 text-sm text-slate-500"><span className="font-bold">Nota:</span> {item.review_note}</p>}
                </div>
                {item.status === 'Pendiente' || item.status === 'En revisión' ? (
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <button type="button" disabled={updating === item.id} onClick={() => review(item, 'Aprobada')} className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50">
                      <span className="material-symbols-outlined text-lg">check_circle</span>Aprobar plantel
                    </button>
                    <button type="button" disabled={updating === item.id} onClick={() => review(item, 'Rechazada')} className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-bold text-red-700 hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950/30">
                      <span className="material-symbols-outlined text-lg">cancel</span>Rechazar
                    </button>
                  </div>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
