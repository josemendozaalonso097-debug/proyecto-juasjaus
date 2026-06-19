import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/admin';
import { showToast } from '../../utils/toast';
import AdminLoader from './AdminLoader';

const stockColor = (s) => {
  if (s === 0) return 'text-[#f20d0d] font-bold';
  if (s <= 5) return 'text-orange-500 font-bold';
  return 'text-green-600 dark:text-green-400 font-bold';
};

export default function TabInventario() {
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

  if (loading) return <AdminLoader />;

  const categorias = [...new Set(productos.map(p => p.categoria))];

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
                        type="number" min="0"
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
