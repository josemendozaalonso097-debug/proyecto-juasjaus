import { useState, useEffect, useCallback } from 'react';
import { getEventos, createEvento, updateEvento, deleteEvento } from '../api/eventos';
import { showToast } from '../utils/toast';
import { eventDateKey } from '../utils/eventos';

export function useEventos() {
  const [eventos, setEventos] = useState([]);
  const [eventoModal, setEventoModal] = useState(false);
  const [editingEvento, setEditingEvento] = useState(null);
  const [eventoForm, setEventoForm] = useState({ titulo: '', fecha: '', hora: '', descripcion: '' });
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

  const openCreateEvento = useCallback((fecha = '') => {
    setEditingEvento(null);
    setEventoForm({ titulo: '', fecha, hora: '', descripcion: '' });
    setEventoModal(true);
  }, []);

  const openEditEvento = useCallback((ev) => {
    setEditingEvento(ev);
    setEventoForm({
      titulo: ev.titulo,
      fecha: eventDateKey(ev.fecha) || '',
      hora: ev.hora || '',
      descripcion: ev.descripcion || '',
    });
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
      const res = await deleteEvento(id);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        showToast(body.detail || 'No se pudo eliminar el evento', 'error');
        return;
      }
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
