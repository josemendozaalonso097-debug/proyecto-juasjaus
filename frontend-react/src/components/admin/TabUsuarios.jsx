import React, { useState, useEffect, useCallback } from 'react';
import { adminApi } from '../../api/admin';
import { showToast } from '../../utils/toast';
import AdminLoader from './AdminLoader';

export default function TabUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.getUsuarios(search);
      setUsuarios(data);
    } catch {
      showToast('Error al cargar usuarios', 'error');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (id) => {
    try {
      await adminApi.updateUsuario(id, editData);
      showToast('Usuario actualizado', 'success');
      setEditingId(null);
      load();
    } catch (e) {
      showToast(e.message, 'error');
    }
  };

  const handleDelete = async (id, nombre) => {
    if (!confirm(`¿Eliminar al usuario "${nombre}"? Esta acción no se puede deshacer.`)) return;
    try {
      await adminApi.deleteUsuario(id);
      showToast('Usuario eliminado', 'success');
      load();
    } catch (e) {
      showToast(e.message, 'error');
    }
  };

  const handleToggleActivo = async (u) => {
    try {
      await adminApi.updateUsuario(u.id, { activo: !u.activo });
      showToast(u.activo ? 'Usuario desactivado' : 'Usuario activado', 'success');
      load();
    } catch (e) {
      showToast(e.message, 'error');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3 items-center">
        <div className="relative flex-1 max-w-sm">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-base">search</span>
          <input
            type="text"
            placeholder="Buscar por nombre o correo..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm w-full focus:outline-none focus:ring-2 focus:ring-[#f20d0d]/30 dark:text-white"
          />
        </div>
        <button onClick={load} className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 cursor-pointer">
          <span className="material-symbols-outlined text-slate-500 text-base">refresh</span>
        </button>
      </div>

      {loading ? <AdminLoader /> : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  {['#', 'Nombre', 'Correo', 'Rol', 'Semestre', 'Estado', 'Acciones'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-black uppercase tracking-wider text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {usuarios.map(u => (
                  <tr key={u.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3 text-slate-400 font-mono text-xs">{u.id}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#f20d0d]/10 flex items-center justify-center text-xs font-bold text-[#f20d0d]">
                          {u.nombre.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium dark:text-white truncate max-w-[140px]">{u.nombre}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-xs">{u.email}</td>
                    <td className="px-4 py-3">
                      {editingId === u.id ? (
                        <select
                          value={editData.rol ?? u.rol}
                          onChange={e => setEditData(d => ({ ...d, rol: e.target.value }))}
                          className="text-xs border border-slate-300 dark:border-slate-600 rounded-lg px-2 py-1 bg-white dark:bg-slate-800 dark:text-white"
                        >
                          <option value="alumno">Alumno</option>
                          <option value="admin">Admin</option>
                        </select>
                      ) : (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${u.rol === 'admin' ? 'bg-[#f20d0d]/10 text-[#f20d0d]' : 'bg-blue-50 text-blue-600 dark:bg-blue-900/20'}`}>
                          {u.rol}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editingId === u.id ? (
                        <input
                          type="text"
                          value={editData.semestre ?? u.semestre ?? ''}
                          onChange={e => setEditData(d => ({ ...d, semestre: e.target.value }))}
                          className="text-xs border border-slate-300 dark:border-slate-600 rounded-lg px-2 py-1 w-16 bg-white dark:bg-slate-800 dark:text-white"
                          placeholder="1-6"
                        />
                      ) : (
                        <span className="text-slate-600 dark:text-slate-400">{u.semestre || '—'}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleActivo(u)}
                        className={`px-2 py-0.5 rounded-full text-xs font-bold cursor-pointer border-none ${u.activo ? 'bg-green-50 text-green-600 dark:bg-green-900/20' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}`}
                      >
                        {u.activo ? '● Activo' : '○ Inactivo'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {editingId === u.id ? (
                          <>
                            <button onClick={() => handleSave(u.id)} className="p-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 cursor-pointer">
                              <span className="material-symbols-outlined text-sm">check</span>
                            </button>
                            <button onClick={() => { setEditingId(null); setEditData({}); }} className="p-1.5 bg-slate-100 text-slate-500 rounded-lg hover:bg-slate-200 cursor-pointer">
                              <span className="material-symbols-outlined text-sm">close</span>
                            </button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => { setEditingId(u.id); setEditData({}); }} className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 cursor-pointer">
                              <span className="material-symbols-outlined text-sm">edit</span>
                            </button>
                            {u.rol !== 'admin' && (
                              <button onClick={() => handleDelete(u.id, u.nombre)} className="p-1.5 bg-red-50 text-[#f20d0d] rounded-lg hover:bg-red-100 cursor-pointer">
                                <span className="material-symbols-outlined text-sm">delete</span>
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {usuarios.length === 0 && (
              <p className="text-center text-slate-400 py-10 text-sm">No se encontraron usuarios</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
