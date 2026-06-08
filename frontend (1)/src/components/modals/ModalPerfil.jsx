import React, { useState, useEffect } from 'react';

const LIMIT_ROL = 3;
const LIMIT_SEMESTRE = 10;
const DEFAULT_PHOTO = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2394272c'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E";

const showToast = (message, type = 'info') => {
  if (window.showToast) {
    window.showToast(message, type);
  } else {
    console.log(`[Toast ${type}]: ${message}`);
  }
};

export default function ModalPerfil({ isOpen, onClose, user, onProfileUpdate, onRequestConfirm }) {
  const [profilePhoto, setProfilePhoto] = useState(DEFAULT_PHOTO);
  
  // Fields states
  const [nombre, setNombre] = useState('');
  const [rol, setRol] = useState('estudiante');
  const [semestre, setSemestre] = useState('');

  // Changes counts
  const [cambiosRolRestantes, setCambiosRolRestantes] = useState(LIMIT_ROL);
  const [cambiosSemestreRestantes, setCambiosSemestreRestantes] = useState(LIMIT_SEMESTRE);

  useEffect(() => {
    if (user && user.id) {
      // 1. Photo
      const storedPhoto = localStorage.getItem(`foto_perfil_${user.id}`);
      if (storedPhoto) {
        setProfilePhoto(storedPhoto);
      } else {
        setProfilePhoto(DEFAULT_PHOTO);
      }

      // 2. Load extended profile data
      const perfilKey = `perfil_${user.id}`;
      const perfilRaw = localStorage.getItem(perfilKey);
      const perfil = perfilRaw ? JSON.parse(perfilRaw) : user;

      setNombre(perfil.nombre || user.nombre || '');
      setRol(perfil.rol || user.rol || 'estudiante');
      setSemestre(perfil.semestre || user.semestre || '');

      // 3. Changes statistics
      const cRol = parseInt(localStorage.getItem(`cambios_rol_${user.id}`) || '0', 10);
      const cSem = parseInt(localStorage.getItem(`cambios_semestre_${user.id}`) || '0', 10);

      setCambiosRolRestantes(Math.max(0, LIMIT_ROL - cRol));
      setCambiosSemestreRestantes(Math.max(0, LIMIT_SEMESTRE - cSem));
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      showToast('La imagen es demasiado grande. Máximo 3MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = function(evt) {
      const base64 = evt.target.result;
      setProfilePhoto(base64);
      localStorage.setItem(`foto_perfil_${user.id}`, base64);
      
      // Update globally and call update parent
      if (onProfileUpdate) {
        onProfileUpdate({ ...user, fotoUrl: base64 });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    const nuevoNombre = nombre.trim();
    if (!nuevoNombre) {
      showToast('El nombre no puede estar vacío.', 'warning');
      return;
    }

    const perfilKey = `perfil_${user.id}`;
    const perfilRaw = localStorage.getItem(perfilKey);
    const perfil = perfilRaw ? JSON.parse(perfilRaw) : { ...user };

    const rolCambiado = rol !== (perfil.rol || user.rol);
    const semestreCambiado = semestre !== (perfil.semestre || user.semestre);

    const cRol = parseInt(localStorage.getItem(`cambios_rol_${user.id}`) || '0', 10);
    const cSem = parseInt(localStorage.getItem(`cambios_semestre_${user.id}`) || '0', 10);

    if (rolCambiado && cRol >= LIMIT_ROL) {
      showToast('Has alcanzado el límite de cambios de rol.', 'error');
      return;
    }
    if (semestreCambiado && cSem >= LIMIT_SEMESTRE) {
      showToast('Has alcanzado el límite de cambios de semestre.', 'error');
      return;
    }

    const performUpdate = () => {
      const updatedPerfil = {
        ...perfil,
        nombre: nuevoNombre,
        rol,
        semestre: rol === 'estudiante' ? semestre : ''
      };

      if (rolCambiado) {
        localStorage.setItem(`cambios_rol_${user.id}`, String(cRol + 1));
        setCambiosRolRestantes(Math.max(0, LIMIT_ROL - (cRol + 1)));
      }
      if (semestreCambiado) {
        localStorage.setItem(`cambios_semestre_${user.id}`, String(cSem + 1));
        setCambiosSemestreRestantes(Math.max(0, LIMIT_SEMESTRE - (cSem + 1)));
      }

      localStorage.setItem(perfilKey, JSON.stringify(updatedPerfil));

      const updatedUser = {
        ...user,
        nombre: nuevoNombre,
        rol,
        semestre: rol === 'estudiante' ? semestre : ''
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      if (onProfileUpdate) {
        onProfileUpdate(updatedUser);
      }

      showToast('✅ Perfil actualizado correctamente.', 'success');
      onClose();
    };

    // Confirm if first time changing Rol or Semestre
    if ((rolCambiado && cRol === 0) || (semestreCambiado && cSem === 0)) {
      const tipo = rolCambiado ? 'Rol' : 'Semestre';
      const limite = rolCambiado ? LIMIT_ROL : LIMIT_SEMESTRE;
      
      if (onRequestConfirm) {
        onRequestConfirm(
          '¡Atención!',
          `Si cambias tu ${tipo}, solo tendrás ${limite} oportunidades de cambiarlo. ¿Deseas continuar?`,
          performUpdate
        );
      } else if (window.confirm(`Si cambias tu ${tipo}, solo tendrás ${limite} oportunidades de cambiarlo. ¿Deseas continuar?`)) {
        performUpdate();
      }
      return;
    }

    performUpdate();
  };

  const esEstudiante = rol === 'estudiante';

  return (
    <div id="modalPerfil" className="fixed inset-0 z-[1001] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-primary/10 mx-4 max-h-[90vh] flex flex-col">

        {/* Header */}
        <header className="bg-gradient-to-r from-primary to-red-800 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <img src="/imgs/yameharte.png" alt="CBTis 258" className="h-9 w-auto object-contain" />
            <div>
              <h2 className="text-white text-lg font-black leading-tight">CBTis 258</h2>
              <p className="text-white/80 text-[11px] font-semibold uppercase tracking-widest">Mi Perfil</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <span className="material-symbols-outlined text-white">close</span>
          </button>
        </header>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1">
          {/* Profile Photo Section */}
          <div className="p-8 pb-4 flex flex-col items-center">
            <div className="relative">
              <label 
                htmlFor="profilePhotoInput"
                className="size-32 rounded-full border-4 border-primary/20 p-1 bg-white dark:bg-slate-800 shadow-xl overflow-hidden cursor-pointer block" 
                title="Cambiar foto"
              >
                <div 
                  id="profilePhotoPreview" 
                  className="w-full h-full rounded-full bg-center bg-no-repeat bg-cover bg-slate-200" 
                  style={{ backgroundImage: `url("${profilePhoto}")` }}
                ></div>
              </label>
              <input 
                type="file" 
                id="profilePhotoInput" 
                accept="image/*" 
                className="hidden"
                onChange={handlePhotoChange}
              />
              <button 
                onClick={() => document.getElementById('profilePhotoInput')?.click()}
                className="absolute bottom-1 right-1 bg-primary text-white size-9 rounded-full shadow-lg hover:scale-110 transition-transform flex items-center justify-center border-3 border-white dark:border-slate-900" 
                title="Cambiar foto"
              >
                <span className="material-symbols-outlined text-lg">photo_camera</span>
              </button>
            </div>
            <div className="mt-4 text-center">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white" id="modal-perfil-nombre">{nombre || 'Usuario'}</h1>
              <p className="text-primary font-semibold text-sm mt-0.5" id="modal-perfil-rol">
                {rol.charAt(0).toUpperCase() + rol.slice(1)}
              </p>
            </div>
          </div>

          {/* Details Section */}
          <div className="px-6 pb-2 space-y-2">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1 pb-1">Información de la Cuenta</h3>
            
            {/* Nombre */}
            <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-xl border border-transparent">
              <div className="size-9 rounded-lg bg-primary text-white flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[18px]">person</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Nombre</span>
                <span className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate" id="modal-perfil-nombre-completo">{nombre}</span>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-xl border border-transparent">
              <div className="size-9 rounded-lg bg-primary text-white flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[18px]">mail</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Correo</span>
                <span className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate" id="modal-perfil-email">{user.email || '—'}</span>
              </div>
            </div>

            {/* Rol */}
            <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-xl border border-transparent">
              <div className="size-9 rounded-lg bg-primary text-white flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[18px]">badge</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Rol</span>
                <span className="text-sm font-medium capitalize text-slate-900 dark:text-slate-100" id="modal-perfil-rol-detalle">
                  {rol.charAt(0).toUpperCase() + rol.slice(1)}
                </span>
              </div>
            </div>

            {/* Semestre (solo si es estudiante) */}
            {esEstudiante && (
              <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-xl border border-transparent" id="fila-semestre">
                <div className="size-9 rounded-lg bg-primary text-white flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Semestre</span>
                  <span className="text-sm font-medium text-slate-900 dark:text-slate-100" id="modal-perfil-semestre">
                    {semestre ? `${semestre}° Semestre` : '—'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Edit Section */}
          <div className="px-6 pb-6 pt-3 space-y-3">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1 pb-1">Actualizar Datos</h3>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Nombre completo</label>
              <input 
                id="input-perfil-nombre" 
                type="text" 
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Tu nombre completo" 
                className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all"
              />
            </div>
            
            <div className="flex flex-col gap-1.5" id="editar-rol-container">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Rol</label>
                <span id="badge-cambios-rol" className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${cambiosRolRestantes === 0 ? 'bg-red-100 text-red-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                  {cambiosRolRestantes} cambios restantes
                </span>
              </div>
              <select 
                id="input-perfil-rol" 
                value={rol}
                onChange={(e) => {
                  setRol(e.target.value);
                  if (e.target.value !== 'estudiante') setSemestre('');
                }}
                disabled={cambiosRolRestantes === 0}
                className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all"
              >
                <option value="estudiante">Estudiante</option>
                <option value="padre">Padre de familia</option>
                <option value="profesor">Profesor</option>
              </select>
            </div>

            {esEstudiante && (
              <div className="flex flex-col gap-1.5" id="editar-semestre-container">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Semestre</label>
                  <span id="badge-cambios-semestre" className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${cambiosSemestreRestantes === 0 ? 'bg-red-100 text-red-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                    {cambiosSemestreRestantes} cambios restantes
                  </span>
                </div>
                <select 
                  id="input-perfil-semestre" 
                  value={semestre}
                  onChange={(e) => setSemestre(e.target.value)}
                  disabled={cambiosSemestreRestantes === 0}
                  className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all"
                >
                  <option value="">Seleccionar...</option>
                  <option value="1">1er Semestre</option>
                  <option value="2">2do Semestre</option>
                  <option value="3">3er Semestre</option>
                  <option value="4">4to Semestre</option>
                  <option value="5">5to Semestre</option>
                  <option value="6">6to Semestre</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 flex flex-col gap-2 shrink-0 border-t border-slate-100 dark:border-slate-800">
          <button 
            onClick={handleSave} 
            className="w-full py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-red-700 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">save</span>
            Actualizar Información
          </button>
        </div>

      </div>
    </div>
  );
}
