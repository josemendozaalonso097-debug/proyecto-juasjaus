import React, { useState, useEffect, useCallback } from 'react';
import { adminApi } from '../../api/admin';
import { showToast } from '../../utils/toast';
import AdminLoader from './AdminLoader';

const estadoColor = (e) => {
  if (e === 'Pendiente') return 'bg-orange-50 text-orange-600 dark:bg-orange-900/20';
  if (e === 'Pagada') return 'bg-green-50 text-green-600 dark:bg-green-900/20';
  return 'bg-slate-100 text-slate-500 dark:bg-slate-800';
};

export default function TabAdeudos() {
  const [deudas, setDeudas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ user_id: '', concepto: '', monto: '', fecha_vencimiento: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [d, u] = await Promise.all([adminApi.getDeudas(filtroEstado), adminApi.getUsuarios()]);
      setDeudas(d);
      setUsuarios(u);
    } catch {
      showToast('Error al cargar adeudos', 'error');
    } finally {
      setLoading(false);
    }
  }, [filtroEstado]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await adminApi.createDeuda({
        user_id: parseInt(form.user_id),
        concepto: form.concepto,
        monto: parseFloat(form.monto),
        fecha_vencimiento: form.fecha_vencimiento || null,
      });
      showToast('Adeudo registrado', 'success');
      setShowForm(false);
      setForm({ user_id: '', concepto: '', monto: '', fecha_vencimiento: '' });
      load();
    } catch (e) {
      showToast(e.message, 'error');
    }
  };

  const handleEstado = async (id, estado) => {
    try {
      await adminApi.updateDeuda(id, { estado });
      showToast(`Marcado como ${estado}`, 'success');
      load();
    } catch (e) {
      showToast(e.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este adeudo?')) return;
    try {
      await adminApi.deleteDeuda(id);
      showToast('Adeudo eliminado', 'success');
      load();
    } catch (e) {
      showToast(e.message, 'error');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-2">
          {['', 'Pendiente', 'Pagada', 'Cancelada'].map(e => (
            <button
              key={e}
              onClick={() => setFiltroEstado(e)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer border transition-colors ${filtroEstado === e ? 'bg-[#f20d0d] text-white border-[#f20d0d]' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-[#f20d0d]'}`}
            >
              {e || 'Todos'}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#f20d0d] text-white rounded-xl font-bold text-sm cursor-pointer hover:bg-red-700 transition-colors"
        >
          <span className="material-symbols-outlined text-base">add</span>
          Nuevo adeudo
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
          <h3 className="font-bold dark:text-white mb-4">Registrar nuevo adeudo</h3>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Alumno *</label>
              <select
                required
                value={form.user_id}
                onChange={e => setForm(f => ({ ...f, user_id: e.target.value }))}
                className="w-full border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-sm bg-white dark:bg-slate-800 dark:text-white"
              >
                <option value="">Seleccionar alumno...</option>
                {usuarios.filter(u => u.rol === 'alumno').map(u => (
                  <option key={u.id} value={u.id}>{u.nombre} — {u.email}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Concepto *</label>
              <input
                required type="text"
                placeholder="Ej: Colegiatura Enero"
                value={form.concepto}
                onChange={e => setForm(f => ({ ...f, concepto: e.target.value }))}
                className="w-full border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-sm bg-white dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Monto (MXN) *</label>
              <input
                required type="number" min="1" step="0.01" placeholder="0.00"
                value={form.monto}
                onChange={e => setForm(f => ({ ...f, monto: e.target.value }))}
                className="w-full border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-sm bg-white dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Fecha límite</label>
              <input
                type="date"
                value={form.fecha_vencimiento}
                onChange={e => setForm(f => ({ ...f, fecha_vencimiento: e.target.value }))}
                className="w-full border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-sm bg-white dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div className="md:col-span-2 flex gap-3 justify-end">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-xl text-sm text-slate-600 dark:text-slate-400 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
                Cancelar
              </button>
              <button type="submit" className="px-4 py-2 bg-[#f20d0d] text-white rounded-xl text-sm font-bold cursor-pointer hover:bg-red-700">
                Guardar adeudo
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? <AdminLoader /> : (
        <div className="space-y-3">
          {deudas.length === 0 && (
            <div className="text-center py-16 text-slate-400">
              <span className="material-symbols-outlined text-4xl block mb-2">account_balance_wallet</span>
              <p className="text-sm">No hay adeudos registrados</p>
            </div>
          )}
          {deudas.map(d => (
            <div key={d.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 flex items-center gap-4 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-orange-500 text-lg">receipt_long</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold dark:text-white text-sm truncate">{d.concepto}</p>
                <p className="text-xs text-slate-500">{d.user_nombre} · {d.user_email}</p>
                {d.fecha_vencimiento && (
                  <p className="text-xs text-slate-400 mt-0.5">Vence: {new Date(d.fecha_vencimiento).toLocaleDateString('es-MX')}</p>
                )}
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-black text-lg dark:text-white">${Number(d.monto).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${estadoColor(d.estado)}`}>{d.estado}</span>
              </div>
              <div className="flex flex-col gap-1 flex-shrink-0">
                {d.estado === 'Pendiente' && (
                  <button onClick={() => handleEstado(d.id, 'Pagada')} className="p-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 cursor-pointer" title="Marcar pagada">
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                  </button>
                )}
                {d.estado === 'Pendiente' && (
                  <button onClick={() => handleEstado(d.id, 'Cancelada')} className="p-1.5 bg-slate-100 text-slate-500 rounded-lg hover:bg-slate-200 cursor-pointer" title="Cancelar">
                    <span className="material-symbols-outlined text-sm">cancel</span>
                  </button>
                )}
                <button onClick={() => handleDelete(d.id)} className="p-1.5 bg-red-50 text-[#f20d0d] rounded-lg hover:bg-red-100 cursor-pointer" title="Eliminar">
                  <span className="material-symbols-outlined text-sm">delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
