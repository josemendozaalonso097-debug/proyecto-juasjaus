import React, { useState, useEffect } from 'react';
import { enviarPapeleria } from '../api/papeleria';
import { showToast } from '../utils/toast';

export default function Papeleria({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    nombreAlumno: '',
    matriculaAlumno: '',
    gradoGrupo: '',
    telefonoAlumno: '',
    nombrePadre: '',
    parentesco: '',
    telefonoPadre: '',
    emailPadre: '',
    tipoDocumento: '',
    otroDocumento: '',
    observaciones: ''
  });

  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [sentStats, setSentStats] = useState({ tipo: '', count: 0 });

  useEffect(() => {
    if (isOpen) {
      // Pre-fill student info if logged in
      const userRaw = localStorage.getItem('user');
      if (userRaw) {
        try {
          const user = JSON.parse(userRaw);
          // Prefer profile data if available
          const perfilRaw = localStorage.getItem(`perfil_${user.id}`);
          const perfil = perfilRaw ? JSON.parse(perfilRaw) : user;
          
          setFormData(prev => ({
            ...prev,
            nombreAlumno: perfil.nombre || '',
            matriculaAlumno: perfil.matricula || perfil.id || ''
          }));
        } catch (e) {
          console.error('Error pre-filling student info in Papeleria:', e);
        }
      }
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) handleClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const addFiles = (filesList) => {
    if (uploadedFiles.length >= 10) {
      showToast('Ya has alcanzado el máximo de 10 archivos.', 'warning');
      return;
    }

    const newFiles = [...uploadedFiles];
    const allowedTypes = [
      'image/png', 'image/jpeg', 'image/jpg', 'application/pdf',
      'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    Array.from(filesList).forEach(file => {
      if (newFiles.length >= 10) return;
      if (file.size > 5 * 1024 * 1024) {
        showToast(`El archivo "${file.name}" es demasiado grande. Máximo 5MB.`, 'error');
        return;
      }
      
      const fileExt = file.name.split('.').pop().toLowerCase();
      const isWord = fileExt === 'doc' || fileExt === 'docx';
      const isAllowed = allowedTypes.includes(file.type) || isWord;

      if (!isAllowed) {
        showToast(`El archivo "${file.name}" no tiene un formato permitido.`, 'error');
        return;
      }
      newFiles.push(file);
    });

    setUploadedFiles(newFiles);
  };

  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files) {
      addFiles(e.dataTransfer.files);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (uploadedFiles.length === 0) {
      showToast('Debes subir al menos un archivo.', 'warning');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      alumno: {
        nombre: formData.nombreAlumno,
        matricula: formData.matriculaAlumno,
        gradoGrupo: formData.gradoGrupo,
        telefono: formData.telefonoAlumno
      },
      padre: {
        nombre: formData.nombrePadre,
        telefono: formData.telefonoPadre,
        email: formData.emailPadre,
        parentesco: formData.parentesco
      },
      tipoDocumento: formData.tipoDocumento,
      otroDocumento: formData.otroDocumento,
      observaciones: formData.observaciones,
      archivos: uploadedFiles.map(f => f.name),
      fecha: new Date().toLocaleString()
    };

    try {
      await enviarPapeleria(payload);
      setSentStats({
        tipo: formData.tipoDocumento === 'Otro' ? formData.otroDocumento : formData.tipoDocumento,
        count: uploadedFiles.length
      });
      setShowConfirmation(true);
    } catch (err) {
      console.error(err);
      showToast('Error al enviar documentos.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      nombreAlumno: '',
      matriculaAlumno: '',
      gradoGrupo: '',
      telefonoAlumno: '',
      nombrePadre: '',
      parentesco: '',
      telefonoPadre: '',
      emailPadre: '',
      tipoDocumento: '',
      otroDocumento: '',
      observaciones: ''
    });
    setUploadedFiles([]);
    onClose();
  };

  const formatSize = (bytes) => {
    if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    if (bytes >= 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return bytes + ' B';
  };

  const getFileIcon = (type, name) => {
    if (type.includes('image')) return '🖼️';
    if (type.includes('pdf')) return '📄';
    const ext = name.split('.').pop().toLowerCase();
    if (ext === 'doc' || ext === 'docx') return '📝';
    return '📎';
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4" 
        onClick={(e) => { if (e.target.id === 'modalPapeleria') handleClose(); }}
        id="modalPapeleria"
      >
        {/* Modal Container */}
        <div className="bg-background-light dark:bg-[#121316] w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
          {/* Header */}
          <header className="bg-gradient-to-r from-primary to-red-700 px-6 py-4 flex items-center justify-between shadow-md shrink-0">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-white text-2xl">upload_file</span>
              <h2 className="text-white text-xl font-bold tracking-tight">Subir Papelería</h2>
            </div>
            <button className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg cursor-pointer" onClick={handleClose}>
              <span class="material-symbols-outlined">close</span>
            </button>
          </header>
          
          {/* Modal Body */}
          <div className="overflow-y-auto p-6">
            <form id="formPapeleria" onSubmit={handleSubmit} className="space-y-8">
              {/* Section: Datos del Alumno */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 border-b border-primary/10 pb-2">
                  <span className="material-symbols-outlined text-primary">person</span>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Datos del Alumno</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Nombre Completo *</label>
                    <input 
                      id="nombreAlumno" 
                      required 
                      value={formData.nombreAlumno}
                      onChange={handleInputChange}
                      className="rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-primary focus:border-primary px-3 py-2" 
                      placeholder="Ej. Juan Pérez García" 
                      type="text"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Matrícula *</label>
                    <input 
                      id="matriculaAlumno" 
                      required 
                      value={formData.matriculaAlumno}
                      onChange={handleInputChange}
                      className="rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-primary focus:border-primary px-3 py-2" 
                      placeholder="Número de control" 
                      type="text"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Grado y Grupo *</label>
                    <input 
                      id="gradoGrupo" 
                      required 
                      value={formData.gradoGrupo}
                      onChange={handleInputChange}
                      className="rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-primary focus:border-primary px-3 py-2" 
                      placeholder="Ej. 4to A - Programación" 
                      type="text"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Teléfono</label>
                    <input 
                      id="telefonoAlumno" 
                      value={formData.telefonoAlumno}
                      onChange={handleInputChange}
                      className="rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-primary focus:border-primary px-3 py-2" 
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
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Datos del Tutor</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1 md:col-span-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Nombre del Tutor *</label>
                    <input 
                      id="nombrePadre" 
                      required 
                      value={formData.nombrePadre}
                      onChange={handleInputChange}
                      className="rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-primary focus:border-primary px-3 py-2" 
                      placeholder="Nombre completo del responsable" 
                      type="text"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Parentesco *</label>
                    <select 
                      id="parentesco" 
                      required 
                      value={formData.parentesco}
                      onChange={handleInputChange}
                      className="rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-primary focus:border-primary px-3 py-2"
                    >
                      <option value="">Seleccionar...</option>
                      <option value="Padre">Padre</option>
                      <option value="Madre">Madre</option>
                      <option value="Tutor">Tutor Legal</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Teléfono Tutor *</label>
                    <input 
                      id="telefonoPadre" 
                      required 
                      value={formData.telefonoPadre}
                      onChange={handleInputChange}
                      className="rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-primary focus:border-primary px-3 py-2" 
                      type="tel" 
                      placeholder="10 dígitos"
                    />
                  </div>
                  <div className="flex flex-col gap-1 md:col-span-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Correo Electrónico</label>
                    <input 
                      id="emailPadre" 
                      value={formData.emailPadre}
                      onChange={handleInputChange}
                      className="rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-primary focus:border-primary px-3 py-2" 
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
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Carga de Documentos</h3>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Tipo de Documento *</label>
                  <select 
                    id="tipoDocumento" 
                    required 
                    value={formData.tipoDocumento}
                    onChange={handleInputChange}
                    className="rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-primary focus:border-primary px-3 py-2"
                  >
                    <option value="">Seleccione el tipo de trámite</option>
                    <option value="Inscripción">Inscripción</option>
                    <option value="Reinscripción">Reinscripción</option>
                    <option value="Beca">Solicitud de Beca</option>
                    <option value="Constancia">Constancia de Estudios</option>
                    <option value="Otro">Otro Documento</option>
                  </select>
                </div>
                
                {formData.tipoDocumento === 'Otro' && (
                  <div className="flex flex-col gap-1 mt-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Especificar Documento *</label>
                    <input 
                      id="otroDocumento" 
                      required
                      value={formData.otroDocumento}
                      onChange={handleInputChange}
                      className="rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-primary focus:border-primary px-3 py-2" 
                      placeholder="Ej. Constancia de buena conducta" 
                      type="text"
                    />
                  </div>
                )}

                {/* Drag & Drop Zone */}
                <div 
                  id="uploadZone" 
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('archivosInput').click()}
                  className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors group mt-4 ${isDragOver ? 'border-primary bg-primary/10' : 'border-primary/30 bg-primary/5 hover:bg-primary/10'}`}
                >
                  <input 
                    type="file" 
                    id="archivosInput" 
                    multiple 
                    accept="image/*,.pdf,.doc,.docx" 
                    style={{ display: 'none' }}
                    onChange={(e) => addFiles(e.target.files)}
                  />
                  <span className="material-symbols-outlined text-5xl text-primary/60 group-hover:scale-110 transition-transform mb-3">file_upload</span>
                  <p className="text-slate-900 dark:text-slate-100 font-medium font-display">Arrastra tus archivos aquí o haz clic para buscar</p>
                  <p className="text-xs text-slate-500 mt-2">Formatos: PDF, JPG, PNG, DOCX (Máx. 5MB c/u)</p>
                  
                  <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400">
                    <span className="material-symbols-outlined text-sm">attachment</span>
                    <span id="contadorArchivos">{uploadedFiles.length} / 10 archivos seleccionados</span>
                  </div>
                </div>
                
                {/* Archivos Lista Container */}
                <div id="archivosLista" className="mt-4 space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="archivo-item" style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px',
                      background: 'rgba(0,0,0,0.02)',
                      border: '1px solid rgba(0,0,0,0.05)',
                      borderRadius: '8px'
                    }}>
                      <div className="archivo-info" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="archivo-icon text-xl">{getFileIcon(file.type, file.name)}</div>
                        <div className="archivo-detalles" style={{ display: 'flex', flexDirection: 'column' }}>
                          <div className="archivo-nombre text-sm font-semibold truncate max-w-[250px]">{file.name}</div>
                          <div className="archivo-tamano text-xs text-slate-400">{formatSize(file.size)}</div>
                        </div>
                      </div>
                      <button 
                        type="button" 
                        className="btn-eliminar-archivo" 
                        onClick={() => removeFile(index)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#e74c3c',
                          fontWeight: '600',
                          fontSize: '0.85rem',
                          cursor: 'pointer'
                        }}
                      >
                        ✕ Eliminar
                      </button>
                    </div>
                  ))}
                </div>
              </section>
              
              {/* Section: Observaciones */}
              <section className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Observaciones adicionales</label>
                <textarea 
                  id="observaciones" 
                  value={formData.observaciones}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-primary focus:border-primary px-3 py-2" 
                  placeholder="Escribe aquí cualquier aclaración sobre los documentos..." 
                  rows="3"
                />
              </section>

              {/* Sticky Footer */}
              <div className="border-t border-slate-200 dark:border-slate-850 pt-6 flex flex-col sm:flex-row justify-end gap-3 pb-2 shrink-0">
                <button 
                  type="button" 
                  className="px-6 py-2.5 rounded-lg font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer" 
                  onClick={handleClose}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-8 py-2.5 rounded-lg font-semibold bg-primary text-white hover:bg-red-700 shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-lg">send</span>
                  {isSubmitting ? 'Enviando...' : 'Enviar Documentos'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Confirmation Overlay Modal */}
      {showConfirmation && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100000,
          display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
          <div style={{
            background: 'white', padding: '40px', borderRadius: '20px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)', textAlign: 'center',
            maxWidth: '450px', border: '3px solid #27ae60'
          }}>
            <div style={{ fontSize: '4em', marginBottom: '20px' }}>✅</div>
            <h2 style={{ color: '#27ae60', marginBottom: '15px', fontSize: '1.5em', fontWeight: 'bold' }}>¡Documentos enviados!</h2>
            <p style={{ color: '#666', marginBottom: '20px', lineHeight: '1.6' }}>
              Tu papelería ha sido recibida exitosamente.<br/>
              <strong>Tipo:</strong> {sentStats.tipo}<br/>
              <strong>Archivos:</strong> {sentStats.count}<br/><br/>
              <strong>Estado: Pendiente de revisión</strong>
            </p>
            <button 
              onClick={() => {
                setShowConfirmation(false);
                handleClose();
              }}
              style={{
                background: '#27ae60', color: 'white', border: 'none',
                padding: '12px 30px', borderRadius: '10px', fontWeight: '600', cursor: 'pointer'
              }}
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
}
