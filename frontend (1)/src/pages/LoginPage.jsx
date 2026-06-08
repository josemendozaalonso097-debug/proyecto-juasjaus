import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';
import {
  registerSendOTP,
  registerVerifyOTP,
  loginUser,
  loginWithGoogleToken,
  checkSessionToken,
  checkBackendHealth,
  sendForgotPasswordLink
} from '../api/auth.js';

const showToast = (message, type = 'info') => {
  if (window.showToast) {
    window.showToast(message, type);
  } else {
    console.log(`[Toast ${type}]: ${message}`);
  }
};

const GOOGLE_CLIENT_ID = '518151220144-9bvr54odrsmi1lccf27eok450e15tfor.apps.googleusercontent.com';

export default function LoginPage() {
  const navigate = useNavigate();

  // Active state for sliding animation (true = register, false = login)
  const [isActive, setIsActive] = useState(false);

  // Form states - Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Form states - Register
  const [registerNombre, setRegisterNombre] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerRol, setRegisterRol] = useState('');
  const [registerSemestre, setRegisterSemestre] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  // Modals state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [isSendingForgot, setIsSendingForgot] = useState(false);

  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [otpTimer, setOtpTimer] = useState(120);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isResendDisabled, setIsResendDisabled] = useState(true);

  // Temp register storage for OTP
  const [tempRegisterParams, setTempRegisterParams] = useState(null);

  const otpInputsRef = useRef([]);
  const otpIntervalRef = useRef(null);

  useEffect(() => {
    document.body.classList.add('login-body');

    // Initial checks
    checkSession();
    checkHealth();

    return () => {
      document.body.classList.remove('login-body');
      if (otpIntervalRef.current) clearInterval(otpIntervalRef.current);
    };
  }, []);

  // OTP Timer handler
  useEffect(() => {
    if (showOtpModal) {
      setOtpTimer(120);
      setIsResendDisabled(true);
      if (otpIntervalRef.current) clearInterval(otpIntervalRef.current);

      otpIntervalRef.current = setInterval(() => {
        setOtpTimer((prev) => {
          if (prev <= 1) {
            clearInterval(otpIntervalRef.current);
            setIsResendDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (otpIntervalRef.current) clearInterval(otpIntervalRef.current);
    };
  }, [showOtpModal]);

  const checkSession = async () => {
    if (localStorage.getItem('just_registered')) {
      localStorage.removeItem('just_registered');
      return;
    }

    const token = localStorage.getItem('access_token');
    if (token) {
      const userRaw = localStorage.getItem('user');
      if (userRaw) {
        try {
          const user = JSON.parse(userRaw);
          if (user && user.id) {
            const prefs = JSON.parse(localStorage.getItem(`prefs_${user.id}`)) || {};
            if (prefs.manualLogin) {
              console.log('🛑 Login Manual activo por preferencia del usuario. Deteniendo redirección.');
              return;
            }
          }
        } catch (e) {
          console.error('Error al procesar preferencias de login manual:', e);
        }
      }

      try {
        const response = await checkSessionToken(token);
        if (response.ok) {
          showToast('Sesión activa encontrada, redirigiendo...', 'success');
          setTimeout(() => {
            navigate('/principal?splash=1');
          }, 1000);
        } else {
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
        }
      } catch (error) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
      }
    }
  };

  const checkHealth = async () => {
    try {
      const response = await checkBackendHealth();
      if (response.ok) {
        const data = await response.json();
        console.log('Backend connected:', data);
      }
    } catch (e) {
      console.error('Backend not responding:', e);
    }
  };

  // Google OAuth Popup Flow
  const handleGoogleLogin = (e) => {
    e.preventDefault();
    const redirectUri = encodeURIComponent(window.location.origin + window.location.pathname);
    const scope = encodeURIComponent('openid email profile');
    const nonce = Math.random().toString(36).substring(2);

    const url = `https://accounts.google.com/o/oauth2/v2/auth` +
      `?client_id=${GOOGLE_CLIENT_ID}` +
      `&redirect_uri=${redirectUri}` +
      `&response_type=id_token` +
      `&scope=${scope}` +
      `&nonce=${nonce}` +
      `&prompt=select_account`;

    const width = 500, height = 600;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;
    const popup = window.open(url, 'google-login', `width=${width},height=${height},top=${top},left=${left}`);

    const interval = setInterval(() => {
      try {
        if (!popup || popup.closed) {
          clearInterval(interval);
          return;
        }
        const popupUrl = popup.location.href;
        if (popupUrl.includes('#')) {
          const hash = new URLSearchParams(popup.location.hash.substring(1));
          const id_token = hash.get('id_token');
          if (id_token) {
            popup.close();
            clearInterval(interval);
            sendGoogleToken(id_token);
          }
        }
      } catch (e) {
        // Cross-origin errors are expected until redirect happens
      }
    }, 200);
  };

  const sendGoogleToken = async (id_token) => {
    try {
      const res = await loginWithGoogleToken(id_token);
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        showToast(`¡Bienvenido ${data.user.nombre}! 🎉`, 'success');
        setTimeout(() => {
          navigate('/principal?splash=1');
        }, 1000);
      } else {
        showToast('Error con Google: ' + (data.detail || 'Intenta de nuevo'), 'error');
      }
    } catch (error) {
      showToast('Error de conexión con el servidor', 'error');
    }
  };

  // Login handler
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword.trim()) {
      showToast('Por favor llena todos los campos', 'warning');
      return;
    }

    setIsLoggingIn(true);
    try {
      const response = await loginUser(loginEmail.trim(), loginPassword.trim());
      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        if (data.user.id) {
          const perfilGuardado = localStorage.getItem(`perfil_${data.user.id}`);
          if (!perfilGuardado) {
            localStorage.setItem(`perfil_${data.user.id}`, JSON.stringify(data.user));
          }
        }
        showToast(`¡Bienvenid@ ${data.user.nombre}! 🎉`, 'success');
        setTimeout(() => {
          navigate('/principal?splash=1');
        }, 1000);
      } else {
        showToast(data.detail || 'Email o contraseña incorrectos', 'error');
      }
    } catch (error) {
      showToast('Error de conexión con el servidor', 'error');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Register send OTP handler
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    const nombre = registerNombre.trim();
    const email = registerEmail.trim();
    const password = registerPassword.trim();
    const rol = registerRol;

    if (!nombre || !email || !password || !rol) {
      showToast('Por favor llena todos los campos, incluyendo tu rol', 'warning');
      return;
    }

    let semestre = null;
    if (rol === 'estudiante') {
      if (!registerSemestre) {
        showToast('Por favor selecciona tu semestre', 'warning');
        return;
      }
      semestre = parseInt(registerSemestre);
    }

    if (password.length < 6) {
      showToast('La contraseña debe tener al menos 6 caracteres', 'warning');
      return;
    }

    setIsRegistering(true);
    try {
      const userData = { nombre, email, password, rol, semestre };
      const response = await registerSendOTP(userData);
      const data = await response.json();

      if (response.ok) {
        showToast('Código enviado a tu correo', 'success');
        setTempRegisterParams({ email, nombre, rol, semestre });
        setShowOtpModal(true);
      } else {
        showToast(data.detail || 'Error al iniciar registro', 'error');
      }
    } catch (e) {
      showToast('Error de conexión. Verifica que el backend esté corriendo', 'error');
    } finally {
      setIsRegistering(false);
    }
  };

  // OTP Verification
  const handleOtpInput = (e, index) => {
    let val = e.target.value.replace(/[^0-9]/g, '').slice(0, 1);
    const newOtp = [...otpCode];
    newOtp[index] = val;
    setOtpCode(newOtp);

    if (val !== '' && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace' && otpCode[index] === '' && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim().replace(/[^0-9]/g, '').slice(0, 6);
    if (pastedData) {
      const newOtp = [...otpCode];
      pastedData.split('').forEach((char, i) => {
        if (i < 6) newOtp[i] = char;
      });
      setOtpCode(newOtp);
      const nextFocus = Math.min(pastedData.length, 5);
      otpInputsRef.current[nextFocus]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const code = otpCode.join('');
    if (code.length !== 6 || !tempRegisterParams) return;

    setIsVerifyingOtp(true);
    try {
      const response = await registerVerifyOTP(tempRegisterParams.email, code);
      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('access_token', data.access_token);
        const userProfile = {
          id: data.user.id,
          email: data.user.email,
          nombre: tempRegisterParams.nombre,
          rol: tempRegisterParams.rol,
          semestre: tempRegisterParams.semestre
        };
        localStorage.setItem('user', JSON.stringify(userProfile));
        localStorage.setItem(`perfil_${data.user.id}`, JSON.stringify(userProfile));

        showToast('¡Cuenta creada exitosamente! 🎉', 'success');
        setShowOtpModal(false);
        localStorage.setItem('just_registered', 'true');

        setTimeout(() => {
          navigate('/principal');
        }, 1000);
      } else {
        showToast(data.detail || 'Código incorrecto o expirado', 'error');
      }
    } catch (e) {
      showToast('Error de conexión', 'error');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    if (isResendDisabled || !tempRegisterParams) return;
    setIsResendDisabled(true);

    try {
      const response = await registerSendOTP({
        nombre: tempRegisterParams.nombre,
        email: tempRegisterParams.email,
        password: registerPassword.trim(),
        rol: tempRegisterParams.rol,
        semestre: tempRegisterParams.semestre
      });
      if (response.ok) {
        showToast('Código reenviado', 'success');
        setOtpTimer(120);
      } else {
        const data = await response.json();
        showToast(data.detail || 'Error al reenviar código', 'error');
        setIsResendDisabled(false);
      }
    } catch (e) {
      showToast('Error al reenviar código', 'error');
      setIsResendDisabled(false);
    }
  };

  // Forgot Password Submit
  const handleForgotSubmit = async () => {
    if (!forgotEmail.trim()) {
      showToast('Por favor ingresa tu email', 'warning');
      return;
    }

    setIsSendingForgot(true);
    try {
      const response = await sendForgotPasswordLink(forgotEmail.trim());
      showToast('Si el correo existe, recibirás un email con instrucciones', 'success');
      setShowForgotModal(false);
      setForgotEmail('');
    } catch (error) {
      showToast('Error de conexión con el servidor', 'error');
    } finally {
      setIsSendingForgot(false);
    }
  };

  // Helper for dynamic input validation borders
  const getInputStyles = (val, type) => {
    if (val.length === 0) return {};
    let valid = false;
    if (type === 'email') {
      valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    } else if (type === 'password') {
      valid = val.length >= 6;
    }
    return {
      borderColor: valid ? '#22c55e' : '#ef4444',
      boxShadow: valid ? '0 0 0 3px rgba(34,197,94,0.15)' : '0 0 0 3px rgba(239,68,68,0.15)'
    };
  };

  const formatTimer = (secs) => {
    const minutes = Math.floor(secs / 60);
    const seconds = secs % 60;
    return `0${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className="min-h-screen md:flex md:items-center md:justify-center p-0 md:p-4 bg-background-light dark:bg-background-dark relative overflow-hidden">
      <div className="mesh-bg"></div>
      <div
        id="container"
        className={`container-box glass-card w-full md:max-w-[1200px] md:min-h-[700px] md:bg-white/70 md:dark:bg-slate-900/70 md:shadow-2xl mx-auto rounded-none md:rounded-xl overflow-hidden ${
          isActive ? 'active' : ''
        }`}
      >
      {/* SIGN UP SECTION */}
      <div className="form-container sign-up sign-up-container bg-background-light dark:bg-background-dark md:bg-white md:dark:bg-slate-900 px-0 py-0 md:px-16 md:py-8 flex flex-col justify-start md:justify-center">
        {/* Mobile Top Navigation Bar */}
        <header className="md:hidden flex items-center justify-between px-4 py-4 bg-background-light dark:bg-background-dark sticky top-0 z-50">
          <button
            aria-label="Volver"
            onClick={() => setIsActive(false)}
            className="text-primary mobile-trigger-login cursor-pointer"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></path>
            </svg>
          </button>
          <h1 className="text-xl font-extrabold tracking-tight text-[#0f172a] dark:text-white"></h1>
          <div className="w-6"></div>
        </header>

        {/* Mobile Hero Image Section */}
        <section className="md:hidden relative w-full h-64 overflow-hidden mb-8">
          <img
            alt="Edificio CBTis 258"
            className="w-full h-full object-cover brightness-75"
            src="/imgs/banner_mobile_new.jpg"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent"></div>
          <div className="absolute bottom-6 left-0 right-0 px-6">
            <h2 className="text-white text-3xl font-black uppercase tracking-wide leading-tight">
              UN MOTIVO DE ORGULLO
            </h2>
          </div>
        </section>

        {/* Mobile padding wrapper */}
        <div className="px-6 md:px-0 pb-10 md:pb-0">
          <div className="max-w-md mx-auto w-full">
            <div className="mb-4 text-center md:text-left">
              <h2 className="text-slate-900 dark:text-slate-100 text-3xl font-bold mb-2">Registro</h2>
              <p className="text-slate-500 dark:text-slate-400">Únete a nuestra comunidad educativa.</p>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 bg-white border border-slate-300 text-slate-700 font-medium py-3 px-4 rounded-lg hover:bg-slate-50 transition-colors mt-4 shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid" viewBox="0 0 256 262" className="w-5 h-5">
                <path
                  fill="#4285F4"
                  d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
                ></path>
                <path
                  fill="#34A853"
                  d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
                ></path>
                <path
                  fill="#FBBC05"
                  d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782"
                ></path>
                <path
                  fill="#EB4335"
                  d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
                ></path>
              </svg>
              Continuar con Google
            </button>

            <div className="relative flex py-4 items-center">
              <div className="flex-grow border-t border-slate-300 dark:border-slate-700"></div>
              <span className="flex-shrink-0 mx-4 text-slate-400 text-sm">O usa tu email</span>
              <div className="flex-grow border-t border-slate-300 dark:border-slate-700"></div>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nombre</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-slate-400 text-xl">person</span>
                  </div>
                  <input
                    type="text"
                    value={registerNombre}
                    onChange={(e) => setRegisterNombre(e.target.value)}
                    className="input block w-full pl-10 pr-3 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    placeholder="Nombre completo"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-slate-400 text-xl">mail</span>
                  </div>
                  <input
                    type="email"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    style={getInputStyles(registerEmail, 'email')}
                    className="input block w-full pl-10 pr-3 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    placeholder="example@cbtis258.edu.mx"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Contraseña</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-slate-400 text-xl">lock</span>
                  </div>
                  <input
                    type={showRegisterPassword ? 'text' : 'password'}
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    style={getInputStyles(registerPassword, 'password')}
                    className="input block w-full pl-10 pr-10 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    placeholder="••••••••"
                    required
                  />
                  <i
                    onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                    className={`fa-solid ${showRegisterPassword ? 'fa-eye-slash' : 'fa-eye'} toggle-password absolute right-4 top-[14px] text-slate-400 cursor-pointer hover:text-primary`}
                  ></i>
                </div>
              </div>

              {/* SELECT ROLES */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Rol</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-slate-400 text-xl">badge</span>
                  </div>
                  <select
                    value={registerRol}
                    onChange={(e) => {
                      setRegisterRol(e.target.value);
                      if (e.target.value !== 'estudiante') setRegisterSemestre('');
                    }}
                    className="block w-full pl-10 pr-10 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all appearance-none cursor-pointer"
                    required
                  >
                    <option disabled value="">
                      Selecciona tu rol
                    </option>
                    <option value="estudiante">Estudiante</option>
                    <option value="padre">Padre de familia</option>
                    <option value="profesor">Profesor</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <span className="material-symbols-outlined text-slate-400">expand_more</span>
                  </div>
                </div>
              </div>

              {/* SELECT SEMESTRE */}
              {registerRol === 'estudiante' && (
                <div className="transition-all duration-300">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Semestre</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="material-symbols-outlined text-slate-400 text-xl">school</span>
                    </div>
                    <select
                      value={registerSemestre}
                      onChange={(e) => setRegisterSemestre(e.target.value)}
                      className="block w-full pl-10 pr-10 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all appearance-none cursor-pointer"
                      required
                    >
                      <option disabled value="">
                        Selecciona tu semestre
                      </option>
                      <option value="1">1er Semestre</option>
                      <option value="2">2do Semestre</option>
                      <option value="3">3er Semestre</option>
                      <option value="4">4to Semestre</option>
                      <option value="5">5to Semestre</option>
                      <option value="6">6to Semestre</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <span className="material-symbols-outlined text-slate-400">expand_more</span>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isRegistering}
                className="w-full bg-primary text-white py-4 px-4 rounded-lg font-bold hover:bg-red-700 shadow-lg shadow-primary/20 transition-all mt-2 disabled:opacity-50"
              >
                {isRegistering ? 'Registrando...' : 'Crear cuenta'}
              </button>
            </form>

            {/* Mobile Switch to Login */}
            <div className="md:hidden flex justify-center mt-6 w-full">
              <p className="text-slate-600 dark:text-slate-400 text-sm font-normal">
                ¿Ya tienes una cuenta?
                <a
                  onClick={() => setIsActive(false)}
                  className="text-primary font-bold hover:underline ml-1 cursor-pointer"
                >
                  Inicia sesión
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SIGN IN SECTION */}
      <div className="form-container sign-in sign-in-container bg-background-light dark:bg-background-dark md:bg-white md:dark:bg-slate-900 px-0 py-0 md:px-16 md:py-8 flex flex-col justify-start md:justify-center">
        {/* Mobile Top Navigation Bar */}
        <header className="md:hidden flex items-center justify-between px-4 py-4 bg-background-light dark:bg-background-dark sticky top-0 z-50">
          <div className="w-6"></div>
          <h1 className="text-xl font-extrabold tracking-tight text-[#0f172a] dark:text-white uppercase">CBTis 258</h1>
          <div className="w-6"></div>
        </header>

        {/* Mobile Hero Image Section */}
        <section className="md:hidden relative w-full h-64 overflow-hidden mb-8">
          <img
            alt="Edificio CBTis 258"
            className="w-full h-full object-cover brightness-75"
            src="/imgs/mkc.jpg"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent"></div>
          <div className="absolute bottom-6 left-0 right-0 px-6">
            <h2 className="text-white text-3xl font-black uppercase tracking-wide leading-tight">
              UN MOTIVO DE ORGULLO
            </h2>
          </div>
        </section>

        {/* Mobile padding wrapper */}
        <div className="px-6 md:px-0 pb-10 md:pb-0">
          <div className="mb-8 hidden md:flex items-center gap-2">
            <img src="/imgs/yameharte.png" alt="logo" className="w-10 h-10 object-contain" />
            <span className="text-slate-900 dark:text-slate-100 font-bold text-xl tracking-tight"></span>
          </div>

          <div className="max-w-md w-full mx-auto">
            <h1 className="text-slate-900 dark:text-slate-100 text-4xl font-bold mb-2 text-center md:text-left">
              Iniciar sesión
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mb-8 text-center md:text-left">
              Accede a tu cuenta institucional
            </p>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 bg-white border border-slate-300 text-slate-700 font-medium py-3 px-4 rounded-lg hover:bg-slate-50 transition-colors mb-6 shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid" viewBox="0 0 256 262" className="w-5 h-5">
                <path
                  fill="#4285F4"
                  d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
                ></path>
                <path
                  fill="#34A853"
                  d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
                ></path>
                <path
                  fill="#FBBC05"
                  d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782"
                ></path>
                <path
                  fill="#EB4335"
                  d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
                ></path>
              </svg>
              Continuar con Google
            </button>

            <div className="relative flex py-4 items-center mb-6">
              <div className="flex-grow border-t border-slate-300 dark:border-slate-700"></div>
              <span className="flex-shrink-0 mx-4 text-slate-400 text-sm">O usa tu contraseña de Email</span>
              <div className="flex-grow border-t border-slate-300 dark:border-slate-700"></div>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-6">
              <div className="flex flex-col gap-2">
                <label className="text-slate-700 dark:text-slate-300 text-sm font-semibold">Email</label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-4 text-slate-400">mail</span>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    style={getInputStyles(loginEmail, 'email')}
                    className="input w-full pl-12 pr-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    placeholder="Email"
                    required
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <label className="text-slate-700 dark:text-slate-300 text-sm font-semibold">Contraseña</label>
                </div>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-4 text-slate-400">lock</span>
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    style={getInputStyles(loginPassword, 'password')}
                    className="input w-full pl-12 pr-12 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    placeholder="Contraseña"
                    required
                  />
                  <i
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className={`fa-solid ${showLoginPassword ? 'fa-eye-slash' : 'fa-eye'} toggle-password absolute right-4 text-slate-400 cursor-pointer hover:text-primary`}
                  ></i>
                </div>
                <div className="text-right mt-1">
                  <a
                    onClick={(e) => {
                      e.preventDefault();
                      setShowForgotModal(true);
                    }}
                    className="text-primary text-sm font-medium hover:underline cursor-pointer"
                  >
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full bg-primary hover:bg-red-700 text-white font-bold py-3 pt-4 pb-4 rounded-lg transition-colors shadow-lg shadow-primary/20 disabled:opacity-50"
              >
                {isLoggingIn ? 'Iniciando...' : 'Iniciar sesión'}
              </button>
            </form>

            {/* Mobile Switch to Register */}
            <div className="md:hidden flex justify-center mt-6 w-full">
              <p className="text-slate-600 dark:text-slate-400 text-sm font-normal">
                ¿No tienes una cuenta?
                <a
                  onClick={() => setIsActive(true)}
                  className="text-primary font-bold hover:underline ml-1 cursor-pointer"
                >
                  Regístrate
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* DESKTOP OVERLAY SLIDER */}
      <div className="overlay-container hidden md:block pointer-events-none">
        <div className="overlay bg-primary">
          {/* Decorative Pattern bg */}
          <div className="absolute inset-0 opacity-10">
            <svg height="100%" width="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid1" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"></path>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid1)"></rect>
            </svg>
          </div>

          {/* Overlay Left */}
          <div className="overlay-panel overlay-left pointer-events-auto">
            <img src="/imgs/yameharte.png" alt="logo" className="w-32 h-32 object-contain mb-8 z-10" />
            <h2 className="text-white text-5xl font-extrabold mb-4 tracking-tight">CBTis 258</h2>
            <p className="text-white/90 text-xl font-medium mb-12 tracking-widest uppercase">Un motivo de orgullo</p>
            <div className="w-full max-w-xs space-y-4">
              <p className="text-white/80 text-sm">¿Ya tienes una cuenta?</p>
              <button
                onClick={() => setIsActive(false)}
                className="w-full border-2 border-white text-white font-bold py-4 rounded-lg hover:bg-white hover:text-primary transition-all duration-300"
              >
                Iniciar sesión
              </button>
            </div>
          </div>

          {/* Overlay Right */}
          <div className="overlay-panel overlay-right pointer-events-auto">
            <img src="/imgs/yameharte.png" alt="logo" className="w-32 h-32 object-contain mb-8 z-10" />
            <h2 className="text-white text-5xl font-extrabold mb-4 tracking-tight">CBTis 258</h2>
            <p className="text-white/90 text-xl font-medium mb-12 tracking-widest uppercase">Un motivo de orgullo</p>
            <div className="w-full max-w-xs space-y-4">
              <p className="text-white/80 text-sm">¿No tienes una cuenta?</p>
              <button
                onClick={() => setIsActive(true)}
                className="w-full border-2 border-white text-white font-bold py-4 rounded-lg hover:bg-white hover:text-primary transition-all duration-300"
              >
                Crear cuenta
              </button>
            </div>
          </div>

          {/* Absolute positioned decorative blobs */}
          <div className="absolute bottom-10 left-10 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        </div>
      </div>

      {/* Modal Forgot Password */}
      {showForgotModal && (
        <div className="fixed inset-0 w-full h-full bg-black/50 z-[9999] flex justify-center items-center backdrop-blur-sm px-4">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
            <div className="bg-gradient-to-r from-primary to-orange-600 px-6 py-5 text-center">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>
                  password
                </span>
              </div>
              <h2 className="text-xl font-bold text-white">¿Olvidaste tu contraseña?</h2>
            </div>
            <div className="p-6">
              <p className="text-slate-600 dark:text-slate-400 text-center mb-6 text-sm">
                Ingresa tu correo y te enviaremos instrucciones para recuperarla.
              </p>
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full text-sm text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 py-3 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  placeholder="ejemplo@cbtis258.edu.mx"
                  required
                />
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={handleForgotSubmit}
                  disabled={isSendingForgot}
                  type="button"
                  className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-lg shadow-lg shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {isSendingForgot ? 'Enviando...' : 'Enviar Instrucciones'}
                </button>
                <p className="text-center text-sm mt-3 text-slate-600 dark:text-slate-400 block w-full">
                  ¿No tienes una cuenta?{' '}
                  <a
                    onClick={() => {
                      setShowForgotModal(false);
                      setIsActive(true);
                    }}
                    className="text-primary font-bold hover:underline cursor-pointer"
                  >
                    Regístrate ahora
                  </a>
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowForgotModal(false);
                  setForgotEmail('');
                }}
                className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/20 rounded-full p-1 transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal OTP Verification */}
      {showOtpModal && (
        <div className="fixed inset-0 w-full h-full bg-black/50 z-[9999] flex justify-center items-center backdrop-blur-sm px-4">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
            <div className="bg-gradient-to-r from-primary to-red-700 px-6 py-5 text-center">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>
                  lock_open
                </span>
              </div>
              <h2 className="text-xl font-bold text-white">Verificación de Cuenta</h2>
            </div>
            <div className="p-6">
              <p className="text-slate-600 dark:text-slate-400 text-center mb-6 text-sm">
                Hemos enviado un código de 6 dígitos a tu correo institucional. Por favor, ingrésalo a continuación para continuar.
              </p>
              <div className="flex justify-between items-center gap-1 md:gap-2 mb-6" onPaste={handleOtpPaste}>
                {otpCode.map((val, i) => (
                  <input
                    key={i}
                    ref={(el) => (otpInputsRef.current[i] = el)}
                    type="text"
                    maxLength="1"
                    value={val}
                    onChange={(e) => handleOtpInput(e, i)}
                    onKeyDown={(e) => handleOtpKeyDown(e, i)}
                    className="w-10 h-12 md:w-12 md:h-14 text-center text-xl font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  />
                ))}
              </div>

              <div className="flex flex-col gap-4">
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={isVerifyingOtp || otpCode.some((v) => v === '')}
                  className="w-full h-12 bg-primary text-white font-bold rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined">verified_user</span>
                  {isVerifyingOtp ? 'Verificando...' : 'Verificar Código'}
                </button>

                <div className="text-center">
                  <div className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                    El código expira en: <span className="font-bold text-primary">{formatTimer(otpTimer)}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isResendDisabled}
                    className="text-sm text-slate-400 hover:text-primary font-medium transition-colors disabled:opacity-50 disabled:cursor-default"
                  >
                    ¿No recibiste el código? Reenviar
                  </button>
                </div>

                <div className="text-center mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowOtpModal(false);
                      setOtpCode(['', '', '', '', '', '']);
                      setTempRegisterParams(null);
                    }}
                    className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                  >
                    Cancelar registro
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
