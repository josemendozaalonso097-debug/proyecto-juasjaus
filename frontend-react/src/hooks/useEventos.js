import { useState, useEffect, useCallback } from 'react';
import { getEventos, createEvento, updateEvento, deleteEvento } from '../api/eventos';
import { showToast } from '../utils/toast';

export function useEventos() {
  const [eventos, setEventos] = useState([]);
  const [eventoModal, setEventoModal] = useState(false);
  const [editingEvento, setEditingEvento] = useState(null);
  const [eventoForm, setEventoForm] = useState({ titulo: '', fecha: '', descripcion: '' });
  const [savingEvento, setSavingEvento] = useState(false);

  const fetchEventos = useCallback(() => {
    getEventos()
      .then(r => r.json())
      .then(data => setEventos(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchEventos();
    const interval = setInterval(fetchEventos, 30000);
    return () => clearInterval(interval);
  }, [fetchEventos]);

  const openCreateEvento = useCallback(() => {
    setEditingEvento(null);
    setEventoForm({ titulo: '', fecha: '', descripcion: '' });
    setEventoModal(true);
  }, []);

  const openEditEvento = useCallback((ev) => {
    setEditingEvento(ev);
    setEventoForm({ titulo: ev.titulo, fecha: ev.fecha, descripcion: ev.descripcion || '' });
    setEventoModal(true);
  }, []);

  const handleSaveEvento = useCallback(async () => {
    if (!eventoForm.titulo.trim() || !eventoForm.fecha.trim()) {
      showToast('El título y la fecha son obligatorios', 'error');
      return;
    }
    setSavingEvento(true);
    try {
      const fn = editingEvento
        ? updateEvento(editingEvento.id, eventoForm)
        : createEvento(eventoForm);
      const res = await fn;
      if (!res.ok) throw new Error();
      fetchEventos();
      setEventoModal(false);
      showToast(editingEvento ? 'Evento actualizado' : 'Evento creado', 'success');
    } catch {
      showToast('Error al guardar el evento', 'error');
    } finally {
      setSavingEvento(false);
    }
  }, [editingEvento, eventoForm, fetchEventos]);

  const handleDeleteEvento = useCallback(async (id) => {
    if (!window.confirm('¿Eliminar este evento?')) return;
    try {
      await deleteEvento(id);
      setEventos(prev => prev.filter(e => e.id !== id));
      showToast('Evento eliminado', 'success');
    } catch {
      showToast('Error al eliminar', 'error');
    }
  }, []);

  return {
    eventos,
    eventoModal,
    setEventoModal,
    editingEvento,
    eventoForm,
    setEventoForm,
    savingEvento,
    openCreateEvento,
    openEditEvento,
    handleSaveEvento,
    handleDeleteEvento,
  };
}
