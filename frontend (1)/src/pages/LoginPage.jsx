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

  // Form states - Register
  const [registerNombre, setRegisterNombre] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerRol, setRegisterRol] = useState('');
  const [registerSemestre, setRegisterSemestre] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

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
    checkSession();
    checkHealth();
    
    // Load Google script
    const script = document.createElement('script');
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    return () => {
      document.body.classList.remove('login-body');
      if (otpIntervalRef.current) clearInterval(otpIntervalRef.current);
    };
  }, []);

  const checkSession = async () => {
    const token = localStorage.getItem('access_token');
    if (token) {
      const response = await checkSessionToken(token);
      if (response.ok) navigate('/principal');
      else {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
      }
    }
  };

  const checkHealth = async () => {
    try { await checkBackendHealth(); } catch (e) { console.error('Backend unreachable'); }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    try {
      const data = await loginUser(loginEmail, loginPassword);
      if (data.access_token) {
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        showToast('¡Bienvenido!', 'success');
        navigate('/principal');
      } else {
        showToast(data.detail || 'Credenciales inválidas', 'error');
      }
    } catch (err) {
      showToast('Error en el servidor', 'error');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!registerRol) { showToast('Selecciona un rol', 'warning'); return; }
    if (registerRol === 'alumno' && !registerSemestre) { showToast('Selecciona semestre', 'warning'); return; }

    setIsRegistering(true);
    try {
      const res = await registerSendOTP(registerEmail);
      if (res.ok) {
        setTempRegisterParams({ nombre: registerNombre, email: registerEmail, password: registerPassword, rol: registerRol, semestre: registerSemestre });
        setShowOtpModal(true);
      } else {
        const data = await res.json();
        showToast(data.detail || 'Error al enviar OTP', 'error');
      }
    } catch (err) {
      showToast('Error de conexión', 'error');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleOtpVerify = async (e) => {
    e.preventDefault();
    const code = otpCode.join('');
    if (code.length < 6) return;
    setIsVerifyingOtp(true);
    try {
      const res = await registerVerifyOTP(tempRegisterParams.nombre, tempRegisterParams.email, tempRegisterParams.password, tempRegisterParams.rol, tempRegisterParams.semestre, code);
      if (res.ok) {
        showToast('Cuenta creada con éxito', 'success');
        setShowOtpModal(false);
        setIsActive(false); // Move to login
      } else {
        const data = await res.json();
        showToast(data.detail || 'OTP incorrecto', 'error');
      }
    } catch (err) {
      showToast('Error de verificación', 'error');
    } finally {
      setIsVerifyingOtp(true);
    }
  };

  const handleGoogleLogin = () => {
    if (!window.google) {
      showToast('Cargando Google...', 'info');
      return;
    }
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: async (response) => {
        try {
          const res = await loginWithGoogleToken(response.credential);
          if (res.ok) {
            const data = await res.json();
            localStorage.setItem('access_token', data.access_token);
            localStorage.setItem('user', JSON.stringify(data.user));
            navigate('/principal');
          } else {
            showToast('Falla en login con Google', 'error');
          }
        } catch (e) { showToast('Error con Google', 'error'); }
      }
    });
    window.google.accounts.id.prompt();
  };

  return (
    <div className={`container ${isActive ? 'active' : ''}`} id="container">
      {/* SIGN UP */}
      <div className="form-container sign-up">
        {/* Mobile Top Navigation Bar */}
        <header className="md:hidden flex items-center justify-between px-4 py-4 bg-background-light dark:bg-background-dark sticky top-0 z-50">
          <button onClick={() => setIsActive(false)} className="text-primary cursor-pointer border-none bg-transparent">
            <span className="material-symbols-outlined" style={{ fontSize: '24px', fontWeight: 'bold' }}>arrow_back</span>
          </button>
          <h1 className="text-xl font-extrabold tracking-tight text-[#0f172a] dark:text-white"></h1>
          <div className="w-6"></div>
        </header>

        {/* Mobile Hero Image Section */}
        <section className="md:hidden relative w-full h-64 overflow-hidden mb-8">
          <img alt="Edificio CBTis 258" className="w-full h-full object-cover brightness-75" src="/imgs/banner_mobile_new.jpg"/>
          <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent"></div>
          <div className="absolute bottom-6 left-0 right-0 px-6">
            <h2 className="text-white text-3xl font-black uppercase tracking-wide leading-tight">
              UN MOTIVO DE ORGULLO
            </h2>
          </div>
        </section>

        <form onSubmit={handleRegisterSubmit}>
          <h1>Crear Cuenta</h1>
          <div className="social-icons">
            <button type="button" className="icon" onClick={handleGoogleLogin}><i className="fa-brands fa-google"></i></button>
          </div>
          <span>Usa tu correo institucional</span>
          <input type="text" placeholder="Nombre completo" value={registerNombre} onChange={e => setRegisterNombre(e.target.value)} required />
          <input type="email" placeholder="Correo institucional" value={registerEmail} onChange={e => setRegisterEmail(e.target.value)} required />
          <input type="password" placeholder="Contraseña" value={registerPassword} onChange={e => setRegisterPassword(e.target.value)} required />
          
          <div className="select-row" style={{ display:'flex', gap:'10px', width:'100%', margin:'8px 0' }}>
            <select value={registerRol} onChange={e => setRegisterRol(e.target.value)} required style={{ flex:1, padding:'10px', borderRadius:'8px', border:'none', background:'#eee' }}>
              <option value="">Rol</option>
              <option value="alumno">Alumno</option>
              <option value="docente">Docente</option>
              <option value="admin">Administrativo</option>
            </select>
            {registerRol === 'alumno' && (
              <select value={registerSemestre} onChange={e => setRegisterSemestre(e.target.value)} required style={{ flex:1, padding:'10px', borderRadius:'8px', border:'none', background:'#eee' }}>
                <option value="">Semestre</option>
                {[1,2,3,4,5,6].map(s => <option key={s} value={s}>{s}°</option>)}
              </select>
            )}
          </div>
          
          <button type="submit" disabled={isRegistering}>{isRegistering ? 'Procesando...' : 'Registrarse'}</button>
          
          {/* Mobile Switch to Login */}
          <div className="md:hidden flex justify-center mt-6 w-full">
            <p className="text-slate-600 dark:text-slate-400 text-sm font-normal">
              ¿Ya tienes una cuenta? 
              <a className="text-primary font-bold hover:underline ml-1 cursor-pointer" onClick={() => setIsActive(false)}>Inicia sesión</a>
            </p>
          </div>
        </form>
      </div>

      {/* SIGN IN */}
      <div className="form-container sign-in">
        {/* Mobile Top Navigation Bar */}
        <header className="md:hidden flex items-center justify-between px-4 py-4 bg-background-light dark:bg-background-dark sticky top-0 z-50">
          <div className="w-6"></div>
          <h1 className="text-xl font-extrabold tracking-tight text-[#0f172a] dark:text-white uppercase">CBTis 258</h1>
          <div className="w-6"></div>
        </header>

        {/* Mobile Hero Image Section */}
        <section className="md:hidden relative w-full h-64 overflow-hidden mb-8">
          <img alt="Edificio CBTis 258" className="w-full h-full object-cover brightness-75" src="/imgs/mkc.jpg"/>
          <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent"></div>
          <div className="absolute bottom-6 left-0 right-0 px-6">
            <h2 className="text-white text-3xl font-black uppercase tracking-wide leading-tight">
              UN MOTIVO DE ORGULLO
            </h2>
          </div>
        </section>

        <form onSubmit={handleLoginSubmit}>
          <h1>Iniciar Sesión</h1>
          <div className="social-icons">
            <button type="button" className="icon" onClick={handleGoogleLogin}><i className="fa-brands fa-google"></i></button>
          </div>
          <span>Usa tu cuenta institucional</span>
          <input type="email" placeholder="Correo" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required />
          <input type="password" placeholder="Contraseña" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required />
          <a href="#" onClick={(e) => { e.preventDefault(); setShowForgotModal(true); }}>¿Olvidaste tu contraseña?</a>
          <button type="submit" disabled={isLoggingIn}>{isLoggingIn ? 'Entrando...' : 'Ingresar'}</button>

          {/* Mobile Switch to Register */}
          <div className="md:hidden flex justify-center mt-6 w-full">
            <p className="text-slate-600 dark:text-slate-400 text-sm font-normal">
              ¿No tienes una cuenta? 
              <a className="text-primary font-bold hover:underline ml-1 cursor-pointer" onClick={() => setIsActive(true)}>Regístrate</a>
            </p>
          </div>
        </form>
      </div>

      {/* TOGGLE */}
      <div className="toggle-container">
        <div className="toggle">
          <div className="toggle-panel toggle-left">
            <h1>¡Bienvenido de nuevo!</h1>
            <p>Introduce tus datos personales para utilizar todas las funciones del sitio</p>
            <button className="hidden" id="login" onClick={() => setIsActive(false)}>Iniciar Sesión</button>
          </div>
          <div className="toggle-panel toggle-right">
            <h1>¡Hola, Amigo!</h1>
            <p>Regístrate con tus datos personales para utilizar todas las funciones del sitio</p>
            <button className="hidden" id="register" onClick={() => setIsActive(true)}>Registrarse</button>
          </div>
        </div>
      </div>

      {/* MOBILE SWITCHER (Hides on desktop) */}
      <div className="mobile-switcher" style={{ display:'none' }}>
         {/* Original mobile structure would go here if needed, but the legacy login was responsive via container classes */}
      </div>

      {/* MODALS (OTP / Forgot) */}
      {showOtpModal && (
        <div className="otp-modal-overlay">
           <div className="otp-modal">
             <h2>Verificación OTP</h2>
             <p>Enviamos un código a {tempRegisterParams?.email}</p>
             <form onSubmit={handleOtpVerify}>
                <div className="otp-inputs">
                  {otpCode.map((digit, i) => (
                    <input key={i} type="text" maxLength="1" value={digit} onChange={(e) => {
                      const newVal = e.target.value;
                      setOtpCode(prev => {
                        const updated = [...prev];
                        updated[i] = newVal;
                        return updated;
                      });
                      if (newVal && i < 5) otpInputsRef.current[i+1]?.focus();
                    }} ref={el => otpInputsRef.current[i] = el} />
                  ))}
                </div>
                <button type="submit">Verificar</button>
             </form>
             <button className="close-btn" onClick={() => setShowOtpModal(false)}>Cerrar</button>
           </div>
        </div>
      )}
    </div>
  );
}
