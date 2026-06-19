import React from 'react';

export default function EventoModal({
  eventoModal,
  setEventoModal,
  editingEvento,
  eventoForm,
  setEventoForm,
  savingEvento,
  handleSaveEvento,
}) {
  if (!eventoModal) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm"
      onClick={() => setEventoModal(false)}
    >
      <div
        className="bg-white dark:bg-[#1e2025] rounded-t-3xl w-full max-w-lg p-6 pb-10 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-5">
          <h2 className="font-bold text-lg text-[#1a1c1d] dark:text-[#f1f1f3]">
            {editingEvento ? 'Editar Evento' : 'Nuevo Evento'}
          </h2>
          <button
            onClick={() => setEventoModal(false)}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center border-none cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px] text-slate-600 dark:text-slate-300">close</span>
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-[#5b403d] dark:text-[#9b7a78] mb-1.5 uppercase tracking-wide">Título *</label>
            <input
              type="text"
              placeholder="Ej. Junta de padres de familia"
              value={eventoForm.titulo}
              onChange={e => setEventoForm(f => ({ ...f, titulo: e.target.value }))}
              className="w-full bg-slate-50 dark:bg-[#2a2d35] border border-slate-200 dark:border-[#3c1e1e]/30 rounded-xl px-4 py-3 text-sm text-[#1a1c1d] dark:text-[#f1f1f3] outline-none focus:border-[#af101a]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#5b403d] dark:text-[#9b7a78] mb-1.5 uppercase tracking-wide">Fecha *</label>
            <input
              type="text"
              placeholder="Ej. 15 de junio de 2026"
              value={eventoForm.fecha}
              onChange={e => setEventoForm(f => ({ ...f, fecha: e.target.value }))}
              className="w-full bg-slate-50 dark:bg-[#2a2d35] border border-slate-200 dark:border-[#3c1e1e]/30 rounded-xl px-4 py-3 text-sm text-[#1a1c1d] dark:text-[#f1f1f3] outline-none focus:border-[#af101a]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#5b403d] dark:text-[#9b7a78] mb-1.5 uppercase tracking-wide">Descripción</label>
            <textarea
              rows={3}
              placeholder="Detalles adicionales del evento..."
              value={eventoForm.descripcion}
              onChange={e => setEventoForm(f => ({ ...f, descripcion: e.target.value }))}
              className="w-full bg-slate-50 dark:bg-[#2a2d35] border border-slate-200 dark:border-[#3c1e1e]/30 rounded-xl px-4 py-3 text-sm text-[#1a1c1d] dark:text-[#f1f1f3] outline-none focus:border-[#af101a] resize-none"
            />
          </div>
          <button
            onClick={handleSaveEvento}
            disabled={savingEvento}
            className="w-full bg-[#af101a] text-white py-3.5 rounded-xl font-bold text-sm border-none cursor-pointer disabled:opacity-60 mt-1"
          >
            {savingEvento ? 'Guardando...' : (editingEvento ? 'Guardar cambios' : 'Crear evento')}
          </button>
        </div>
      </div>
    </div>
  );
}
