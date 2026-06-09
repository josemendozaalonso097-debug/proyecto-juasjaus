import React, { useState, useEffect } from 'react';
import { showToast } from '../utils/toast';
import ConfirmacionModal from './ConfirmacionModal';

const LIMIT_ROL = 3;
const LIMIT_SEMESTRE = 10;
const DEFAULT_PHOTO = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2394272c'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E";

export default function PerfilModal({ isOpen, onClose, onProfileUpdate }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({
    nombre: '',
    email: '',
    rol: 'estudiante',
    semestre: ''
  });

  const [inputName, setInputName] = useState('');
  const [inputRol, setInputRol] = useState('estudiante');
  const [inputSemestre, setInputSemestre] = useState('');
  const [avatar, setAvatar] = useState(DEFAULT_PHOTO);

  const [cambiosRol, setCambiosRol] = useState(0);
  const [cambiosSemestre, setCambiosSemestre] = useState(0);

  // Confirmation modal state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState('');
  const [confirmMsg, setConfirmMsg] = useState('');
  const [confirmCallback, setConfirmCallback] = useState(null);

  const [showSavedMsg, setShowSavedMsg] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadProfileData();
    }
  }, [isOpen]);

  const loadProfileData = () => {
    const userRaw = localStorage.getItem('user');
    if (!userRaw) return;
    try {
      const u = JSON.parse(userRaw);
      setUser(u);
      
      const perfilKey = `perfil_${u.id}`;
      const perfilRaw = localStorage.getItem(perfilKey);
      const p = perfilRaw ? JSON.parse(perfilRaw) : u;
      
      setProfile({
        nombre: p.nombre || u.nombre || 'Usuario',
        email: p.email || u.email || '—',
        rol: p.rol || u.rol || 'estudiante',
        semestre: p.semestre || u.semestre || ''
      });

      setInputName(p.nombre || u.nombre || '');
      setInputRol(p.rol || u.rol || 'estudiante');
      setInputSemestre(p.semestre || u.semestre || '');

      const foto = localStorage.getItem(`foto_perfil_${u.id}`);
      setAvatar(foto || DEFAULT_PHOTO);

      const cRol = parseInt(localStorage.getItem(`cambios_rol_${u.id}`) || '0', 10);
      const cSem = parseInt(localStorage.getItem(`cambios_semestre_${u.id}`) || '0', 10);
      setCambiosRol(cRol);
      setCambiosSemestre(cSem);

    } catch (e) {
      console.error('Error loading profile in modal:', e);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      showToast('La imagen es demasiado grande. Máximo 3MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = function(evt) {
      const base64 = evt.target.result;
      setAvatar(base64);
      if (user) {
        localStorage.setItem(`foto_perfil_${user.id}`, base64);
        showToast('Foto de perfil actualizada.', 'success');
        if (onProfileUpdate) onProfileUpdate();
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!inputName.trim()) {
      showToast('El nombre no puede estar vacío.', 'warning');
      return;
    }

    const rolCambiado = inputRol !== profile.rol;
    const semestreCambiado = inputSemestre !== profile.semestre;

    if (rolCambiado && cambiosRol >= LIMIT_ROL) {
      showToast('Has alcanzado el límite de cambios de rol.', 'error');
      return;
    }
    if (semestreCambiado && cambiosSemestre >= LIMIT_SEMESTRE) {
      showToast('Has alcanzado el límite de cambios de semestre.', 'error');
      return;
    }

    // Ask confirmation if it's the first time changing role or semester
    if ((rolCambiado && cambiosRol === 0) || (semestreCambiado && cambiosSemestre === 0)) {
      const tipo = rolCambiado ? 'Rol' : 'Semestre';
      const limite = rolCambiado ? LIMIT_ROL : LIMIT_SEMESTRE;
      
      setConfirmTitle('¡Atención!');
      setConfirmMsg(`Si cambias tu ${tipo}, solo tendrás ${limite} probabilidades de cambiarlo. ¿Deseas continuar?`);
      setConfirmCallback(() => () => ejecutarGuardado(rolCambiado, semestreCambiado));
      setConfirmOpen(true);
      return;
    }

    ejecutarGuardado(rolCambiado, semestreCambiado);
  };

  const ejecutarGuardado = (rolCambiado, semestreCambiado) => {
    setConfirmOpen(false);

    const perfilKey = `perfil_${user.id}`;
    const updatedPerfil = {
      ...profile,
      nombre: inputName,
      rol: inputRol,
      semestre: inputRol === 'estudiante' ? inputSemestre : ''
    };

    let newCambiosRol = cambiosRol;
    let newCambiosSemestre = cambiosSemestre;

    if (rolCambiado) {
      newCambiosRol = cambiosRol + 1;
      localStorage.setItem(`cambios_rol_${user.id}`, String(newCambiosRol));
      setCambiosRol(newCambiosRol);
    }
    if (semestreCambiado) {
      newCambiosSemestre = cambiosSemestre + 1;
      localStorage.setItem(`cambios_semestre_${user.id}`, String(newCambiosSemestre));
      setCambiosSemestre(newCambiosSemestre);
    }

    localStorage.setItem(perfilKey, JSON.stringify(updatedPerfil));

    // Update global user session representation
    const updatedUser = {
      ...user,
      nombre: inputName,
      rol: inputRol,
      semestre: inputRol === 'estudiante' ? inputSemestre : ''
    };
    localStorage.setItem('user', JSON.stringify(updatedUser));

    setProfile(updatedPerfil);
    showToast('Perfil actualizado correctamente.', 'success');
    setShowSavedMsg(true);
    setTimeout(() => setShowSavedMsg(false), 3000);

    if (onProfileUpdate) {
      onProfileUpdate();
    }
  };

  if (!isOpen) return null;

  const restRol = Math.max(0, LIMIT_ROL - cambiosRol);
  const restSem = Math.max(0, LIMIT_SEMESTRE - cambiosSemestre);

  return (
    <>
      <div 
        id="modalPerfil" 
        className="fixed inset-0 z-[1001] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
        onClick={(e) => { if (e.target.id === 'modalPerfil') onClose(); }}
      >
        <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-primary/10 max-h-[90vh] flex flex-col">
          {/* Header */}
          <header className="bg-gradient-to-r from-primary to-red-800 px-6 py-4 flex items-center justify-between shrink-0 text-white">
            <div className="flex items-center gap-3">
              <img src="/imgs/yameharte.png" alt="CBTis 258" className="h-9 w-auto object-contain" />
              <div>
                <h2 className="text-white text-lg font-black leading-tight">CBTis 258</h2>
                <p className="text-white/80 text-[11px] font-semibold uppercase tracking-widest">Mi Perfil</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-white">close</span>
            </button>
          </header>

          {/* Body */}
          <div className="overflow-y-auto flex-1">
            {/* Photo Section */}
            <div className="p-8 pb-4 flex flex-col items-center">
              <div className="relative">
                <div 
                  className="size-32 rounded-full border-4 border-primary/20 p-1 bg-white dark:bg-slate-800 shadow-xl overflow-hidden cursor-pointer"
                  onClick={() => document.getElementById('profilePhotoInputReact').click()}
                  title="Cambiar foto"
                >
                  <div 
                    id="profilePhotoPreview" 
                    className="w-full h-full rounded-full bg-center bg-no-repeat bg-cover bg-slate-200" 
                    style={{ backgroundImage: `url("${avatar}")` }}
                  />
                </div>
                <input 
                  type="file" 
                  id="profilePhotoInputReact" 
                  accept="image/*" 
                  style={{ display: 'none' }}
                  onChange={handleAvatarChange}
                />
                <button 
                  onClick={() => document.getElementById('profilePhotoInputReact').click()}
                  className="absolute bottom-1 right-1 bg-primary text-white size-9 rounded-full shadow-lg hover:scale-110 transition-transform flex items-center justify-center border-3 border-white dark:border-slate-900 cursor-pointer"
                  title="Cambiar foto"
                >
                  <span className="material-symbols-outlined text-lg text-white">photo_camera</span>
                </button>
              </div>
              <div className="mt-4 text-center">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">{profile.nombre}</h1>
                <p className="text-primary font-semibold text-sm mt-0.5 capitalize">{profile.rol}</p>
              </div>
            </div>

            {/* Read-Only Details */}
            <div className="px-6 pb-2 space-y-2">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1 pb-1">Información de la Cuenta</h3>
              
              <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-xl border border-transparent">
                <div className="size-9 rounded-lg bg-primary text-white flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[18px] text-white">person</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Nombre</span>
                  <span className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{profile.nombre}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-xl border border-transparent">
                <div className="size-9 rounded-lg bg-primary text-white flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[18px] text-white">mail</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Correo</span>
                  <span className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{profile.email}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-xl border border-transparent">
                <div className="size-9 rounded-lg bg-primary text-white flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[18px] text-white">badge</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Rol</span>
                  <span className="text-sm font-medium capitalize text-slate-900 dark:text-slate-100">{profile.rol}</span>
                </div>
              </div>

              {profile.rol === 'estudiante' && (
                <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-xl border border-transparent">
                  <div className="size-9 rounded-lg bg-primary text-white flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[18px] text-white">calendar_today</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Semestre</span>
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {profile.semestre ? `${profile.semestre}° Semestre` : '—'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Editable Fields */}
            <div className="px-6 pb-6 pt-3 space-y-3">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1 pb-1">Actualizar Datos</h3>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Nombre completo</label>
                <input 
                  value={inputName} 
                  onChange={(e) => setInputName(e.target.value)}
                  type="text" 
                  placeholder="Tu nombre completo" 
                  className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Rol</label>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${restRol === 0 ? 'bg-red-100 text-red-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                    {restRol} cambios restantes
                  </span>
                </div>
                <select 
                  value={inputRol}
                  onChange={(e) => setInputRol(e.target.value)}
                  disabled={restRol === 0}
                  className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all cursor-pointer disabled:opacity-50"
                >
                  <option value="estudiante">Estudiante</option>
                  <option value="padre">Padre de familia</option>
                  <option value="profesor">Profesor</option>
                </select>
              </div>

              {inputRol === 'estudiante' && (
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Semestre</label>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${restSem === 0 ? 'bg-red-100 text-red-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                      {restSem} cambios restantes
                    </span>
                  </div>
                  <select 
                    value={inputSemestre}
                    onChange={(e) => setInputSemestre(e.target.value)}
                    disabled={restSem === 0}
                    className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all cursor-pointer disabled:opacity-50"
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

              {showSavedMsg && (
                <p id="perfil-guardado-msg" className="text-green-600 text-xs font-semibold text-center">✅ Perfil actualizado correctamente.</p>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="bg-slate-50 dark:bg-slate-850 px-6 py-4 flex flex-col gap-2 shrink-0 border-t border-slate-100 dark:border-slate-800">
            <button 
              onClick={handleSave} 
              className="w-full py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-red-700 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg text-white">save</span>
              Actualizar Información
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation inner modal */}
      <ConfirmacionModal 
        isOpen={confirmOpen}
        title={confirmTitle}
        message={confirmMsg}
        onAccept={confirmCallback}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
