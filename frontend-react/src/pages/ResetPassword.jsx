import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { showToast } from '../utils/toast';
import { API_URL } from '../api/auth';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'success'|'error', text: '' }

  useEffect(() => {
    if (!token) {
      setMessage({
        type: 'error',
        text: 'Token inválido o no proporcionado'
      });
      showToast('Token inválido o no proporcionado', 'error');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      showToast('No se puede restablecer sin un token válido', 'error');
      return;
    }

    if (password.length < 6) {
      setMessage({ type: 'error', text: 'La contraseña debe tener al menos 6 caracteres' });
      showToast('La contraseña debe tener al menos 6 caracteres', 'error');
      return;
    }

    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Las contraseñas no coinciden' });
      showToast('Las contraseñas no coinciden', 'error');
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch(`${API_URL}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password })
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: '✅ Contraseña actualizada exitosamente. Redirigiendo...' });
        showToast('Contraseña restablecida con éxito', 'success');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setMessage({ type: 'error', text: data.message || 'Error al restablecer la contraseña' });
        showToast(data.message || 'Error al restablecer la contraseña', 'error');
        setSubmitting(false);
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      setMessage({ type: 'error', text: 'Error de conexión con el servidor' });
      showToast('Error de conexión con el servidor', 'error');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-r from-[#e2e2e2] to-[#c9d6ff] p-5 font-display">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-10 border border-slate-100 dark:border-slate-800">
        
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <img 
            src="/imgs/dgeti_red-removebg-preview.png" 
            alt="CBTis 258" 
            className="w-20 h-auto object-contain mb-4" 
            onError={(e) => { e.target.src = '/imgs/yameharte.png'; }}
          />
          <h1 className="text-2xl font-black text-slate-850 dark:text-white leading-tight">
            Restablecer Contraseña
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
            Ingresa tu nueva contraseña
          </p>
        </div>

        {/* Message alert box */}
        {message && (
          <div 
            className={`p-4 rounded-xl text-sm font-semibold mb-6 border ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-400 dark:border-green-900/50' 
                : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/50'
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="password-reset" className="text-xs font-bold text-slate-650 dark:text-slate-350 uppercase tracking-wider">
              Nueva Contraseña
            </label>
            <input 
              type="password" 
              id="password-reset" 
              placeholder="Mínimo 6 caracteres" 
              required
              disabled={!token || submitting}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-4 py-3 text-sm focus:ring-2 focus:ring-primary/40 outline-none transition-all disabled:opacity-50"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="confirm-password-reset" className="text-xs font-bold text-slate-650 dark:text-slate-350 uppercase tracking-wider">
              Confirmar Contraseña
            </label>
            <input 
              type="password" 
              id="confirm-password-reset" 
              placeholder="Repite la contraseña" 
              required
              disabled={!token || submitting}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-4 py-3 text-sm focus:ring-2 focus:ring-primary/40 outline-none transition-all disabled:opacity-50"
            />
          </div>

          <button 
            type="submit" 
            disabled={!token || submitting}
            className="w-full py-3.5 bg-gradient-to-r from-primary to-red-700 text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 cursor-pointer text-sm"
          >
            {submitting ? 'Procesando...' : 'Restablecer Contraseña'}
          </button>
        </form>

        <div className="text-center mt-6">
          <a 
            onClick={() => navigate('/login')}
            className="text-primary hover:text-red-700 transition-colors font-bold text-sm cursor-pointer hover:underline"
          >
            ← Volver al inicio de sesión
          </a>
        </div>

      </div>
    </div>
  );
}
