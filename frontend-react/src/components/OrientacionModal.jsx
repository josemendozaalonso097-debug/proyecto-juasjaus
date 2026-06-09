import React, { useState, useEffect } from 'react';
import { showToast } from '../utils/toast';

export default function OrientacionModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('reporte');

  // Input states
  const [reportText, setReportText] = useState('');
  
  const [complaintType, setComplaintType] = useState('');
  const [complaintText, setComplaintText] = useState('');
  
  const [appointmentReason, setAppointmentReason] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('Turno Matutino (7:00 AM - 1:00 PM)');
  
  const [suggestionText, setSuggestionText] = useState('');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) handleClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (type) => {
    let successMessage = "";

    if (type === 'reporte') {
      if (!reportText.trim()) { showToast("Por favor describe el incidente.", 'warning'); return; }
      successMessage = "🚨 Reporte enviado con éxito. Orientación revisará el caso a la brevedad.";
    } else if (type === 'queja') {
      if (!complaintType) { showToast("Por favor selecciona un tipo de queja.", 'warning'); return; }
      successMessage = `📢 Tu queja sobre "${complaintType}" ha sido recibida. Le daremos seguimiento inmediato.`;
    } else if (type === 'cita') {
      if (!appointmentReason.trim()) { showToast("Por favor escribe el motivo de la cita.", 'warning'); return; }
      successMessage = `📅 Solicitud de cita enviada (${appointmentTime}). El psicólogo se pondrá en contacto contigo pronto.`;
    } else if (type === 'buzon') {
      if (!suggestionText.trim()) { showToast("Por favor escribe tu sugerencia.", 'warning'); return; }
      successMessage = "📥 ¡Gracias por tu sugerencia! Tu opinión nos ayuda a mejorar el plantel.";
    }

    if (successMessage) {
      showToast(successMessage, 'success');
      handleClose();
    }
  };

  const handleClose = () => {
    setReportText('');
    setComplaintType('');
    setComplaintText('');
    setAppointmentReason('');
    setAppointmentTime('Turno Matutino (7:00 AM - 1:00 PM)');
    setSuggestionText('');
    onClose();
  };

  return (
    <div id="modalOrientacion" className="fixed inset-0 z-[1001] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-primary/10 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <header className="bg-gradient-to-r from-teal-600 to-teal-800 px-6 py-4 flex items-center justify-between shrink-0 text-white font-display">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <span className="material-symbols-outlined text-white block">psychology</span>
            </div>
            <div>
              <h2 className="text-white text-lg font-black leading-tight">Orientación Educativa</h2>
              <p className="text-white/80 text-[11px] font-semibold uppercase tracking-widest">Apoyo Estudiantil</p>
            </div>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-white/20 rounded-full transition-colors cursor-pointer text-white">
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>

        {/* Tabs Navigation */}
        <nav className="flex border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 shrink-0">
          {[
            { key: 'reporte', label: 'Reportes' },
            { key: 'queja', label: 'Quejas' },
            { key: 'cita', label: 'Citas' },
            { key: 'buzon', label: 'Buzón' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-3 text-sm font-bold border-b-2 transition-all hover:bg-teal-50 dark:hover:bg-teal-900/20 cursor-pointer ${activeTab === tab.key ? 'border-teal-600 text-teal-600' : 'border-transparent text-slate-500'}`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Body sections */}
        <div className="overflow-y-auto flex-1 p-6">
          
          {/* SECCIÓN: REPORTE */}
          {activeTab === 'reporte' && (
            <div id="seccion-reporte" className="seccion-orientacion space-y-4">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Enviar un Reporte de Incidente</h3>
              <div className="space-y-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Descripción del incidente</label>
                  <textarea 
                    value={reportText}
                    onChange={(e) => setReportText(e.target.value)}
                    rows="4" 
                    placeholder="Describe lo ocurrido detalladamente..." 
                    className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500/40 outline-none transition-all"
                  />
                </div>
                <button 
                  onClick={() => handleSubmit('reporte')} 
                  className="w-full py-3 bg-teal-600 text-white font-bold rounded-xl shadow-lg hover:bg-teal-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-lg text-white">send</span>
                  Enviar Reporte
                </button>
              </div>
            </div>
          )}

          {/* SECCIÓN: QUEJA */}
          {activeTab === 'queja' && (
            <div id="seccion-queja" className="seccion-orientacion space-y-4">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Presentar una Queja</h3>
              <div className="space-y-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Tipo de queja</label>
                  <select 
                    value={complaintType}
                    onChange={(e) => setComplaintType(e.target.value)}
                    className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500/40 outline-none transition-all cursor-pointer"
                  >
                    <option value="">Selecciona una opción...</option>
                    <option value="Acoso escolar (Bullying)">Acoso escolar (Bullying)</option>
                    <option value="Mal trato de trabajador">Mal trato de trabajador</option>
                    <option value="Instalaciones en mal estado">Instalaciones en mal estado</option>
                    <option value="Inconformidad académica">Inconformidad académica</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Detalles adicionales</label>
                  <textarea 
                    value={complaintText}
                    onChange={(e) => setComplaintText(e.target.value)}
                    rows="3" 
                    placeholder="Proporciona más detalles..." 
                    className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500/40 outline-none transition-all"
                  />
                </div>
                <button 
                  onClick={() => handleSubmit('queja')} 
                  className="w-full py-3 bg-teal-600 text-white font-bold rounded-xl shadow-lg hover:bg-teal-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-lg text-white">flag</span>
                  Enviar Queja
                </button>
              </div>
            </div>
          )}

          {/* SECCIÓN: CITA */}
          {activeTab === 'cita' && (
            <div id="seccion-cita" className="seccion-orientacion space-y-4">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Solicitar Cita con Psicólogo</h3>
              <div className="space-y-3">
                <p className="text-xs text-slate-500 leading-relaxed italic border-l-4 border-teal-500 pl-3">Tu información será tratada con absoluta confidencialidad.</p>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Motivo de la cita</label>
                  <input 
                    type="text" 
                    value={appointmentReason}
                    onChange={(e) => setAppointmentReason(e.target.value)}
                    placeholder="Ej: Apoyo emocional, problemas académicos..." 
                    className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500/40 outline-none transition-all"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Horario preferido</label>
                  <select 
                    value={appointmentTime}
                    onChange={(e) => setAppointmentTime(e.target.value)}
                    className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500/40 outline-none transition-all cursor-pointer"
                  >
                    <option value="Turno Matutino (7:00 AM - 1:00 PM)">Turno Matutino (7:00 AM - 1:00 PM)</option>
                    <option value="Turno Vespertino (1:00 PM - 7:00 PM)">Turno Vespertino (1:00 PM - 7:00 PM)</option>
                  </select>
                </div>
                <button 
                  onClick={() => handleSubmit('cita')} 
                  className="w-full py-3 bg-teal-600 text-white font-bold rounded-xl shadow-lg hover:bg-teal-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-lg text-white">event</span>
                  Solicitar Cita
                </button>
              </div>
            </div>
          )}

          {/* SECCIÓN: BUZÓN */}
          {activeTab === 'buzon' && (
            <div id="seccion-buzon" className="seccion-orientacion space-y-4">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Buzón de Sugerencias</h3>
              <div className="space-y-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">¿Tienes alguna sugerencia para mejorar el plantel?</label>
                  <textarea 
                    value={suggestionText}
                    onChange={(e) => setSuggestionText(e.target.value)}
                    rows="4" 
                    placeholder="Tus comentarios son muy valiosos para nosotros..." 
                    className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500/40 outline-none transition-all"
                  />
                </div>
                <button 
                  onClick={() => handleSubmit('buzon')} 
                  className="w-full py-3 bg-teal-600 text-white font-bold rounded-xl shadow-lg hover:bg-teal-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-lg text-white">mail</span>
                  Enviar al Buzón
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
