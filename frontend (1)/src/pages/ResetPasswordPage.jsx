import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import './ResetPasswordPage.css';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    document.body.classList.add('reset-body');
    if (!token) {
      setMessage('Token inválido o no proporcionado');
      setMessageType('error');
    }
    return () => {
      document.body.classList.remove('reset-body');
    };
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      setMessage('Token inválido o no proporcionado');
      setMessageType('error');
      return;
    }

    if (password.length < 6) {
      setMessage('La contraseña debe tener al menos 6 caracteres');
      setMessageType('error');
      return;
    }

    if (password !== confirmPassword) {
      setMessage('Las contraseñas no coinciden');
      setMessageType('error');
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage('✅ Contraseña actualizada exitosamente. Redirigiendo...');
        setMessageType('success');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setMessage(data.message || 'Error al restablecer la contraseña');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error de conexión con el servidor');
      setMessageType('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="reset-container">
      <div className="reset-header">
        <img src="/imgs/dgeti_red-removebg-preview.png" alt="CBTis 258" />
        <h1>Restablecer Contraseña</h1>
        <p>Ingresa tu nueva contraseña</p>
      </div>

      {message && (
        <div className={`reset-alert reset-alert-${messageType}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="reset-form-group">
          <label htmlFor="password">Nueva Contraseña</label>
          <input
            type="password"
            id="password"
            placeholder="Mínimo 6 caracteres"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={!token || isSubmitting}
          />
        </div>

        <div className="reset-form-group">
          <label htmlFor="confirm-password">Confirmar Contraseña</label>
          <input
            type="password"
            id="confirm-password"
            placeholder="Repite la contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={!token || isSubmitting}
          />
        </div>

        <button
          type="submit"
          className="reset-btn"
          disabled={!token || isSubmitting}
        >
          {isSubmitting ? 'Procesando...' : 'Restablecer Contraseña'}
        </button>
      </form>

      <div className="reset-back-link">
        <Link to="/login">← Volver al inicio de sesión</Link>
      </div>
    </div>
  );
}
