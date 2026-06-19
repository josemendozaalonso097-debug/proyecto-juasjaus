import React, { useState } from 'react';
import { adminApi } from '../../api/admin';
import { showToast } from '../../utils/toast';

export default function TabNotificaciones() {
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

  const destinatarioOpts = [
    { value: 'todos', label: 'Todos' },
    { value: 'alumnos', label: 'Solo Alumnos' },
    { value: 'admin', label: 'Solo Admins' },
  ];

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
              {destinatarioOpts.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, destinatarios: opt.value }))}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer border transition-colors ${form.destinatarios === opt.value ? 'bg-[#f20d0d] text-white border-[#f20d0d]' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5">Título *</label>
            <input
              required
              type="text"
              placeholder="Título del aviso"
              value={form.titulo}
              onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))}
              className="w-full border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-sm bg-white dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#f20d0d]/30"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5">Mensaje *</label>
            <textarea
              required
              rows={4}
              placeholder="Escribe el mensaje del aviso..."
              value={form.mensaje}
              onChange={e => setForm(f => ({ ...f, mensaje: e.target.value }))}
              className="w-full border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-sm bg-white dark:bg-slate-800 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-[#f20d0d]/30"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#f20d0d] text-white rounded-xl font-bold text-sm cursor-pointer hover:bg-red-700 transition-colors disabled:opacity-60"
          >
            {loading ? 'Enviando...' : 'Enviar Notificación'}
          </button>
        </form>
      </div>
    </div>
  );
}
