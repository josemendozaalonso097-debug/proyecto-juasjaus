import React, { useState, useEffect } from 'react';
import { enviarPapeleria } from '../../api/papeleria.js';

const showToast = (message, type = 'info') => {
  if (window.showToast) {
    window.showToast(message, type);
  } else {
    console.log(`[Toast ${type}]: ${message}`);
  }
};

export default function ModalPapeleria({ isOpen, onClose, user }) {
  const [dragover, setDragover] = useState(false);
  const [archivosSubidos, setArchivosSubidos] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [nombreAlumno, setNombreAlumno] = useState('');
  const [matriculaAlumno, setMatriculaAlumno] = useState('');
  const [gradoGrupo, setGradoGrupo] = useState('');
  const [telefonoAlumno, setTelefonoAlumno] = useState('');

  const [nombreTutor, setNombreTutor] = useState('');
  const [parentesco, setParentesco] = useState('');
  const [telefonoTutor, setTelefonoTutor] = useState('');
  const [emailTutor, setEmailTutor] = useState('');

  const [tipoDocumento, setTipoDocumento] = useState('');
  const [otroDocumento, setOtroDocumento] = useState('');
  const [observaciones, setObservaciones] = useState('');

  const [showSuccess, setShowSuccess] = useState(false);
  const [successData, setSuccessData] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setShowSuccess(false);
      setSuccessData(null);
      setArchivosSubidos([]);
      setNombreAlumno(user?.nombre || '');
      setMatriculaAlumno('');
      setGradoGrupo('');
      setTelefonoAlumno('');
      setNombreTutor('');
      setParentesco('');
      setTelefonoTutor('');
      setEmailTutor('');
      setTipoDocumento('');
      setOtroDocumento('');
      setObservaciones('');
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleAddFiles = (files) => {
    if (archivosSubidos.length >= 10) {
      showToast('Ya has alcanzado el máximo de 10 archivos.', 'warning');
      return;
    }

    const newFiles = [];
    Array.from(files).forEach(file => {
      if (archivosSubidos.length + newFiles.length >= 10) return;
      
      if (file.size > 5 * 1024 * 1024) {
        showToast(`El archivo "${file.name}" es demasiado grande. Máximo 5MB.`, 'error');
        return;
      }

      const tiposPermitidos = [
        'image/png', 'image/jpeg', 'image/jpg', 'application/pdf',
        'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      if (!tiposPermitidos.includes(file.type)) {
        showToast(`El archivo "${file.name}" no tiene un formato permitido.`, 'error');
        return;
      }
      newFiles.push(file);
    });

    setArchivosSubidos((prev) => [...prev, ...newFiles]);
  };

  const handleRemoveFile = (index) => {
    setArchivosSubidos((prev) => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (type) => {
    if (type.includes('image')) return '🖼️';
    if (type.includes('pdf')) return '📄';
    if (type.includes('word') || type.includes('document')) return '📝';
    return '📎';
  };

  const getFriendlySize = (bytes) => {
    if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    if (bytes >= 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return bytes + ' B';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (archivosSubidos.length === 0) {
      showToast('Debes subir al menos un archivo.', 'warning');
      return;
    }

    const datos = {
      alumno: {
        nombre: nombreAlumno,
        matricula: matriculaAlumno,
        gradoGrupo,
        telefono: telefonoAlumno
      },
      padre: {
        nombre: nombreTutor,
        telefono: telefonoTutor,
        email: emailTutor,
        parentesco
      },
      tipoDocumento,
      otroDocumento: tipoDocumento === 'Otro' ? otroDocumento : '',
      observaciones,
      archivos: archivosSubidos.map(f => f.name),
      fecha: new Date().toLocaleString()
    };

    setSubmitting(true);
    try {
      await enviarPapeleria(datos);
      setSuccessData(datos);
      setShowSuccess(true);
    } catch (err) {
      showToast('Error al enviar los documentos.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto" id="modalPapeleria">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-200 dark:border-slate-800">
        
        {/* Header */}
        <header className="bg-gradient-to-r from-primary to-red-700 px-6 py-4 flex items-center justify-between shadow-md shrink-0">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-white text-2xl">upload_file</span>
            <h2 className="text-white text-xl font-bold tracking-tight">Subir Papelería</h2>
          </div>
          <button className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>

        {showSuccess ? (
          <div className="p-10 flex flex-col items-center text-center text-slate-800 dark:text-slate-100 overflow-y-auto">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-black text-[#27ae60] mb-3">¡Documentos enviados!</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-4 max-w-md">
              Tu papelería ha sido recibida exitosamente.<br/>
              <strong>Tipo:</strong> {successData.tipoDocumento === 'Otro' ? successData.otroDocumento : successData.tipoDocumento}<br/>
              <strong>Archivos:</strong> {successData.archivos.length}<br/><br/>
              <strong>Estado: Pendiente de revisión</strong>
            </p>
            <button 
              onClick={onClose} 
              className="px-8 py-3 bg-[#27ae60] text-white font-bold rounded-xl hover:bg-green-700 transition-colors"
            >
              Entendido
            </button>
          </div>
        ) : (
          /* Modal Body (Scrollable Form) */
          <div className="overflow-y-auto p-6 text-slate-800 dark:text-slate-100">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Section: Datos del Alumno */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 border-b border-primary/10 pb-2">
                  <span className="material-symbols-outlined text-primary">person</span>
                  <h3 className="text-lg font-semibold">Datos del Alumno</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1 text-sm">
                    <label className="font-semibold text-slate-600 dark:text-slate-400">Nombre Completo *</label>
                    <input 
                      required 
                      value={nombreAlumno}
                      onChange={(e) => setNombreAlumno(e.target.value)}
                      className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 focus:ring-primary focus:border-primary outline-none" 
                      placeholder="Ej. Juan Pérez García" 
                      type="text"
                    />
                  </div>
                  <div className="flex flex-col gap-1 text-sm">
                    <label className="font-semibold text-slate-600 dark:text-slate-400">Matrícula *</label>
                    <input 
                      required 
                      value={matriculaAlumno}
                      onChange={(e) => setMatriculaAlumno(e.target.value)}
                      className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 focus:ring-primary focus:border-primary outline-none" 
                      placeholder="Número de control" 
                      type="text"
                    />
                  </div>
                  <div className="flex flex-col gap-1 text-sm">
                    <label className="font-semibold text-slate-600 dark:text-slate-400">Grado y Grupo *</label>
                    <input 
                      required 
                      value={gradoGrupo}
                      onChange={(e) => setGradoGrupo(e.target.value)}
                      className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 focus:ring-primary focus:border-primary outline-none" 
                      placeholder="Ej. 4to A - Programación" 
                      type="text"
                    />
                  </div>
                  <div className="flex flex-col gap-1 text-sm">
                    <label className="font-semibold text-slate-600 dark:text-slate-400">Teléfono</label>
                    <input 
                      value={telefonoAlumno}
                      onChange={(e) => setTelefonoAlumno(e.target.value)}
                      className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 focus:ring-primary focus:border-primary outline-none" 
                      placeholder="10 dígitos" 
                      type="tel"
                    />
                  </div>
                </div>
              </section>
              
              {/* Section: Datos del Tutor */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 border-b border-primary/10 pb-2">
                  <span className="material-symbols-outlined text-primary">family_restroom</span>
                  <h3 className="text-lg font-semibold">Datos del Tutor</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1 text-sm md:col-span-2">
                    <label className="font-semibold text-slate-600 dark:text-slate-400">Nombre del Tutor *</label>
                    <input 
                      required 
                      value={nombreTutor}
                      onChange={(e) => setNombreTutor(e.target.value)}
                      className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 focus:ring-primary focus:border-primary outline-none" 
                      placeholder="Nombre completo del responsable" 
                      type="text"
                    />
                  </div>
                  <div className="flex flex-col gap-1 text-sm">
                    <label className="font-semibold text-slate-600 dark:text-slate-400">Parentesco *</label>
                    <select 
                      required 
                      value={parentesco}
                      onChange={(e) => setParentesco(e.target.value)}
                      className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 focus:ring-primary focus:border-primary outline-none"
                    >
                      <option value="">Seleccionar...</option>
                      <option value="Padre">Padre</option>
                      <option value="Madre">Madre</option>
                      <option value="Tutor">Tutor Legal</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1 text-sm">
                    <label className="font-semibold text-slate-600 dark:text-slate-400">Teléfono Tutor *</label>
                    <input 
                      required 
                      value={telefonoTutor}
                      onChange={(e) => setTelefonoTutor(e.target.value)}
                      className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 focus:ring-primary focus:border-primary outline-none" 
                      type="tel" 
                      placeholder="10 dígitos"
                    />
                  </div>
                  <div className="flex flex-col gap-1 text-sm md:col-span-2">
                    <label className="font-semibold text-slate-600 dark:text-slate-400">Correo Electrónico</label>
                    <input 
                      value={emailTutor}
                      onChange={(e) => setEmailTutor(e.target.value)}
                      className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 focus:ring-primary focus:border-primary outline-none" 
                      placeholder="ejemplo@correo.com" 
                      type="email"
                    />
                  </div>
                </div>
              </section>
              
              {/* Section: Documentos */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 border-b border-primary/10 pb-2">
                  <span className="material-symbols-outlined text-primary">cloud_upload</span>
                  <h3 className="text-lg font-semibold">Carga de Documentos</h3>
                </div>
                <div className="flex flex-col gap-1 text-sm">
                  <label className="font-semibold text-slate-600 dark:text-slate-400">Tipo de Documento *</label>
                  <select 
                    required 
                    value={tipoDocumento}
                    onChange={(e) => setTipoDocumento(e.target.value)}
                    className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 focus:ring-primary focus:border-primary outline-none"
                  >
                    <option value="">Seleccione el tipo de trámite</option>
                    <option value="Inscripción">Inscripción</option>
                    <option value="Reinscripción">Reinscripción</option>
                    <option value="Beca">Solicitud de Beca</option>
                    <option value="Constancia">Constancia de Estudios</option>
                    <option value="Otro">Otro Documento</option>
                  </select>
                </div>
                
                {tipoDocumento === 'Otro' && (
                  <div className="flex flex-col gap-1 mt-2 text-sm">
                    <label className="font-semibold text-slate-600 dark:text-slate-400">Especificar Documento *</label>
                    <input 
                      id="otroDocumento" 
                      required
                      value={otroDocumento}
                      onChange={(e) => setOtroDocumento(e.target.value)}
                      className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 focus:ring-primary focus:border-primary outline-none" 
                      placeholder="Ej. Constancia de buena conducta" 
                      type="text"
                    />
                  </div>
                )}

                {/* Drag & Drop Zone */}
                <div 
                  onDragOver={(e) => { e.preventDefault(); setDragover(true); }}
                  onDragLeave={() => setDragover(false)}
                  onDrop={(e) => { e.preventDefault(); setDragover(false); handleAddFiles(e.dataTransfer.files); }}
                  onClick={() => document.getElementById('archivosInput')?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors group mt-4 ${
                    dragover ? 'border-primary bg-primary/10' : 'border-primary/30 bg-primary/5 hover:bg-primary/10'
                  }`}
                >
                  <input 
                    type="file" 
                    id="archivosInput" 
                    multiple 
                    className="hidden" 
                    accept="image/*,.pdf,.doc,.docx"
                    onChange={(e) => handleAddFiles(e.target.files)}
                  />
                  <span className="material-symbols-outlined text-5xl text-primary/60 group-hover:scale-110 transition-transform mb-3">file_upload</span>
                  <p className="font-medium font-display">Arrastra tus archivos aquí o haz clic para buscar</p>
                  <p className="text-xs text-slate-500 mt-2">Formatos: PDF, JPG, PNG, DOCX (Máx. 5MB c/u)</p>
                  
                  <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400">
                    <span className="material-symbols-outlined text-sm">attachment</span>
                    <span id="contadorArchivos">{archivosSubidos.length} / 10 archivos seleccionados</span>
                  </div>
                </div>
                
                {/* Archivos Lista Container */}
                {archivosSubidos.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {archivosSubidos.map((file, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <span className="text-lg">{getFileIcon(file.type)}</span>
                          <div className="truncate">
                            <div className="font-bold text-slate-800 dark:text-white truncate">{file.name}</div>
                            <div className="text-[10px] text-slate-400">{getFriendlySize(file.size)}</div>
                          </div>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => handleRemoveFile(index)}
                          className="px-2 py-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded font-semibold transition-colors"
                        >
                          ✕ Eliminar
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>
              
              {/* Section: Observaciones */}
              <section className="space-y-2 text-sm">
                <label className="font-semibold text-slate-600 dark:text-slate-400">Observaciones adicionales</label>
                <textarea 
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 focus:ring-primary focus:border-primary outline-none" 
                  placeholder="Escribe aquí cualquier aclaración sobre los documentos..." 
                  rows="3"
                />
              </section>

              {/* Footer Actions */}
              <div className="border-t border-slate-200 dark:border-slate-800 pt-6 flex flex-col sm:flex-row justify-end gap-3 pb-2">
                <button 
                  type="button" 
                  className="px-6 py-2.5 rounded-lg font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" 
                  onClick={onClose}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="px-8 py-2.5 rounded-lg font-semibold bg-primary text-white hover:bg-red-700 shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-lg">send</span>
                  {submitting ? 'Enviando...' : 'Enviar Documentos'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
