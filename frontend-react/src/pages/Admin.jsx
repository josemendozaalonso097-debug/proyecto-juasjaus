import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../api/admin';
import { showToast } from '../utils/toast';

const TABS = [
  { id: 'stats', label: 'Estadísticas', icon: 'bar_chart' },
  { id: 'usuarios', label: 'Usuarios', icon: 'group' },
  { id: 'adeudos', label: 'Adeudos', icon: 'account_balance_wallet' },
  { id: 'inventario', label: 'Inventario', icon: 'inventory_2' },
  { id: 'notificaciones', label: 'Notificaciones', icon: 'notifications' },
];

export default function Admin() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('stats');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user?.rol !== 'admin') {
      navigate('/principal');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#f20d0d] to-[#6e0404] px-6 py-4 flex items-center gap-4 shadow-lg">
        <button
          onClick={() => navigate('/principal')}
          className="p-2 bg-white/20 hover:bg-white/30 rounded-xl text-white transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-xl">arrow_back</span>
        </button>
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-white text-3xl">admin_panel_settings</span>
          <div>
            <h1 className="text-white font-black text-xl leading-tight">Panel de Administración</h1>
            <p className="text-white/70 text-xs">CBTis 258 — Sistema de Gestión</p>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3.5 text-sm font-bold transition-all border-b-2 cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-[#f20d0d] text-[#f20d0d]'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <span className="material-symbols-outlined text-base">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 max-w-7xl mx-auto">
        {activeTab === 'stats' && <TabEstadisticas />}
        {activeTab === 'usuarios' && <TabUsuarios />}
        {activeTab === 'adeudos' && <TabAdeudos />}
        {activeTab === 'inventario' && <TabInventario />}
        {activeTab === 'notificaciones' && <TabNotificaciones />}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// TAB: ESTADÍSTICAS
// ──────────────────────────────────────────────────────────────────────────────
function TabEstadisticas() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getStats()
      .then(setStats)
      .catch(() => showToast('Error al cargar estadísticas', 'error'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;
  if (!stats) return null;

  const cards = [
    { label: 'Total usuarios', value: stats.total_usuarios, icon: 'group', color: 'blue' },
    { label: 'Usuarios activos', value: stats.usuarios_activos, icon: 'person_check', color: 'green' },
    { label: 'Productos activos', value: stats.total_productos, icon: 'storefront', color: 'purple' },
    { label: 'Adeudos pendientes', value: stats.deudas_pendientes, icon: 'warning', color: 'red' },
    { label: 'Monto por cobrar', value: `$${stats.monto_deudas_pendientes.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, icon: 'payments', color: 'orange' },
  ];

  const colorMap = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600',
    red: 'bg-red-50 dark:bg-red-900/20 text-[#f20d0d]',
    orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600',
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {cards.map(c => (
          <div key={c.label} className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-800">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${colorMap[c.color]}`}>
              <span className="material-symbols-outlined text-xl">{c.icon}</span>
            </div>
            <p className="text-2xl font-black dark:text-white">{c.value}</p>
            <p className="text-xs text-slate-500 mt-1">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChartCard title="Usuarios por Semestre" data={stats.usuarios_por_semestre} keyX="semestre" keyY="count" color="#f20d0d" />
        <ChartCard title="Usuarios por Rol" data={stats.usuarios_por_rol} keyX="rol" keyY="count" color="#6e0404" />
        <ChartCard title="Productos por Categoría" data={stats.productos_por_categoria} keyX="categoria" keyY="count" color="#3b82f6" />
      </div>
    </div>
  );
}

function ChartCard({ title, data, keyX, keyY, color }) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data.map(d => d[keyY]), 1);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-800">
      <h3 className="font-bold text-slate-700 dark:text-white mb-4">{title}</h3>
      <div className="space-y-3">
        {data.map(item => (
          <div key={item[keyX]} className="flex items-center gap-3">
            <span className="text-xs text-slate-500 w-20 truncate font-medium capitalize">{item[keyX]}</span>
            <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="h-2 rounded-full transition-all"
                style={{ width: `${(item[keyY] / max) * 100}%`, background: color }}
              />
            </div>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 w-6 text-right">{item[keyY]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// TAB: USUARIOS
// ──────────────────────────────────────────────────────────────────────────────
function TabUsuarios() {
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

      {loading ? <Loader /> : (
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

// ──────────────────────────────────────────────────────────────────────────────
// TAB: ADEUDOS
// ──────────────────────────────────────────────────────────────────────────────
function TabAdeudos() {
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

  const estadoColor = (e) => {
    if (e === 'Pendiente') return 'bg-orange-50 text-orange-600 dark:bg-orange-900/20';
    if (e === 'Pagada') return 'bg-green-50 text-green-600 dark:bg-green-900/20';
    return 'bg-slate-100 text-slate-500 dark:bg-slate-800';
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
                required
                type="text"
                placeholder="Ej: Colegiatura Enero, Libro de Matemáticas..."
                value={form.concepto}
                onChange={e => setForm(f => ({ ...f, concepto: e.target.value }))}
                className="w-full border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-sm bg-white dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Monto (MXN) *</label>
              <input
                required
                type="number"
                min="1"
                step="0.01"
                placeholder="0.00"
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

      {loading ? <Loader /> : (
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

// ──────────────────────────────────────────────────────────────────────────────
// TAB: INVENTARIO
// ──────────────────────────────────────────────────────────────────────────────
function TabInventario() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [newStock, setNewStock] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getInventario();
      setProductos(data);
    } catch {
      showToast('Error al cargar inventario', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (id) => {
    const val = parseInt(newStock);
    if (isNaN(val) || val < 0) { showToast('Stock debe ser un número >= 0', 'warning'); return; }
    try {
      await adminApi.updateStock(id, val);
      showToast('Stock actualizado', 'success');
      setEditingId(null);
      load();
    } catch (e) {
      showToast(e.message, 'error');
    }
  };

  const stockColor = (s) => {
    if (s === 0) return 'text-[#f20d0d] font-bold';
    if (s <= 5) return 'text-orange-500 font-bold';
    return 'text-green-600 dark:text-green-400 font-bold';
  };

  const categorias = [...new Set(productos.map(p => p.categoria))];

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      {categorias.map(cat => (
        <div key={cat} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
            <h3 className="font-black text-slate-700 dark:text-white capitalize text-sm">{cat}</h3>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {productos.filter(p => p.categoria === cat).map(p => (
              <div key={p.id} className="flex items-center gap-4 px-5 py-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium dark:text-white text-sm truncate">{p.nombre}</p>
                  <p className="text-xs text-slate-400">${p.precio.toFixed(2)} MXN</p>
                </div>
                <div className="flex items-center gap-3">
                  {editingId === p.id ? (
                    <>
                      <input
                        type="number"
                        min="0"
                        value={newStock}
                        onChange={e => setNewStock(e.target.value)}
                        className="w-20 border border-slate-300 dark:border-slate-600 rounded-lg px-2 py-1 text-sm text-center bg-white dark:bg-slate-800 dark:text-white"
                        autoFocus
                      />
                      <button onClick={() => handleSave(p.id)} className="p-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 cursor-pointer">
                        <span className="material-symbols-outlined text-sm">check</span>
                      </button>
                      <button onClick={() => setEditingId(null)} className="p-1.5 bg-slate-100 text-slate-500 rounded-lg hover:bg-slate-200 cursor-pointer">
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <span className={`text-sm ${stockColor(p.stock)}`}>{p.stock} uds.</span>
                      <button onClick={() => { setEditingId(p.id); setNewStock(String(p.stock)); }} className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 cursor-pointer">
                        <span className="material-symbols-outlined text-sm">edit</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// TAB: NOTIFICACIONES
// ──────────────────────────────────────────────────────────────────────────────
function TabNotificaciones() {
  const [form, setForm] = useState({ titulo: '', mensaje: '', destinatarios: 'todos' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.titulo.trim() || !form.mensaje.trim()) {
      showToast('Completa todos los campos', 'warning');
      return;
    }
    setLoading(true);
    try {
      const res = await adminApi.sendNotificacion(form);
      showToast(res.mensaje, 'success');
      setForm({ titulo: '', mensaje: '', destinatarios: 'todos' });
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-[#f20d0d]/10 rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined text-[#f20d0d]">campaign</span>
          </div>
          <div>
            <h3 className="font-black dark:text-white">Enviar Notificación</h3>
            <p className="text-xs text-slate-500">Comunica avisos a los alumnos</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5">Destinatarios</label>
            <div className="flex gap-2">
              {[
                { value: 'todos', label: 'Todos' },
                { value: 'alumnos', label: 'Solo Alumnos' },
                { value: 'admin', label: 'Solo Admins' },
              ].map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, destinatarios: opt.value }))}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer border transition-colors ${form.destinatarios === opt.value ? 'bg-[#f20d0d] text-white border-[#f20d0d]' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:border-[#f20d0d]'}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5">Título *</label>
            <input
              type="text"
              required
              placeholder="Título de la notificación"
              value={form.titulo}
              onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))}
              className="w-full border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#f20d0d]/30"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5">Mensaje *</label>
            <textarea
              required
              rows={5}
              placeholder="Escribe aquí el mensaje completo..."
              value={form.mensaje}
              onChange={e => setForm(f => ({ ...f, mensaje: e.target.value }))}
              className="w-full border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-2.5 text-sm resize-none bg-white dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#f20d0d]/30"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-[#f20d0d] to-[#af101a] text-white font-bold rounded-xl cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Enviando...' : '📣 Enviar Notificación'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// UTILITY
// ──────────────────────────────────────────────────────────────────────────────
function Loader() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="w-8 h-8 border-4 border-[#f20d0d]/20 border-t-[#f20d0d] rounded-full animate-spin" />
    </div>
  );
}
