import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkSessionToken } from '../api/auth';
import { showToast } from '../utils/toast';
import { obtenerHistorial } from '../utils/storage';

// Modals and components
import Sidebar from '../components/Sidebar';
import Chatbot from '../components/Chatbot';
import PerfilModal from '../components/PerfilModal';
import Pago from '../components/Pago';
import Papeleria from '../components/Papeleria';
import OrientacionModal from '../components/OrientacionModal';
import DeudaModal from '../components/DeudaModal';
import HistorialModal from '../components/HistorialModal';
import InformacionModal from '../components/InformacionModal';

export default function Principal() {
  const navigate = useNavigate();

  // Authentication & session state
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);

  // Modal display states
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [pagoOpen, setPagoOpen] = useState(false);
  const [papeleriaOpen, setPapeleriaOpen] = useState(false);
  const [orientacionOpen, setOrientacionOpen] = useState(false);
  const [deudaOpen, setDeudaOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);

  // Financial calculations state
  const [pendingCount, setPendingCount] = useState(0);
  const [nextPaymentDateText, setNextPaymentDateText] = useState('—');
  const [nextPaymentDateColor, setNextPaymentDateColor] = useState('');
  const [profileAvatar, setProfileAvatar] = useState("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2394272c'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E");

  // Splash logic
  const [showSplash, setShowSplash] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('splash') === '1';
  });

  // Calculate debt and next payment details
  const updateFinancialStatus = useCallback((profileData) => {
    if (!profileData) return;

    const hoy = new Date();
    const mesActual = hoy.getMonth(); // 0-11
    const anioActual = hoy.getFullYear();

    let mesVencimientoText = 'Enero';
    let anioVencimientoText = anioActual;

    // Window for January (Nov, Dec, Jan)
    if (mesActual === 10 || mesActual === 11 || mesActual === 0) {
      mesVencimientoText = 'Enero';
      anioVencimientoText = (mesActual === 0) ? anioActual : anioActual + 1;
    }
    // Window for July (May, Jun, Jul)
    else if (mesActual >= 4 && mesActual <= 6) {
      mesVencimientoText = 'Julio';
      anioVencimientoText = anioActual;
    } else {
      // Out of standard windows, show next upcoming standard vencimiento
      if (mesActual > 0 && mesActual < 4) {
        mesVencimientoText = 'Julio';
        anioVencimientoText = anioActual;
      } else {
        mesVencimientoText = 'Enero';
        anioVencimientoText = anioActual + 1;
      }
    }

    const textoFecha = `1 de ${mesVencimientoText} del ${anioVencimientoText}`;

    const rol = (profileData.rol || 'estudiante').toLowerCase();
    const semestreDelUsuario = parseInt(profileData.semestre || '1', 10);

    const historial = obtenerHistorial() || [];
    let pagosRealizados = 0;
    historial.forEach(compra => {
      if (compra.productos && compra.productos.some(p => p.nombre.toLowerCase().includes('colegiatura'))) {
        pagosRealizados++;
      }
    });

    let pagosPendientes = 0;
    if (rol === 'estudiante') {
      let pagosEsperados = semestreDelUsuario;
      pagosPendientes = Math.max(0, pagosEsperados - pagosRealizados);
    }

    setPendingCount(pagosPendientes);

    if (pagosPendientes === 0) {
      setNextPaymentDateText('No hay pagos pendientes');
      setNextPaymentDateColor('#27ae60'); // Green
    } else {
      setNextPaymentDateText(textoFecha);
      setNextPaymentDateColor('#e74c3c'); // Red
    }

    // Trigger DeudaModal automatically on mount/refresh if there is debt
    if (pagosPendientes > 0) {
      setDeudaOpen(true);
    }
  }, []);

  // Sync avatar and profile details from localStorage
  const loadProfileData = useCallback(() => {
    const token = localStorage.getItem('access_token');
    const userRaw = localStorage.getItem('user');
    if (!token || !userRaw) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      navigate('/login');
      return;
    }

    try {
      const u = JSON.parse(userRaw);
      const perfilKey = `perfil_${u.id}`;
      const perfilRaw = localStorage.getItem(perfilKey);
      const profile = perfilRaw ? JSON.parse(perfilRaw) : u;

      setUserProfile({
        ...u,
        nombre: profile.nombre || u.nombre || 'Usuario',
        rol: profile.rol || u.rol || 'estudiante',
        semestre: profile.semestre || u.semestre || '1',
      });

      const foto = localStorage.getItem(`foto_perfil_${u.id}`);
      if (foto) {
        setProfileAvatar(foto);
      }

      updateFinancialStatus(profile);
    } catch (e) {
      console.error('Error parseando datos de sesión:', e);
      navigate('/login');
    }
  }, [navigate, updateFinancialStatus]);

  // Authenticate user session
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      showToast('Debes iniciar sesión primero', 'warning');
      setTimeout(() => navigate('/login'), 1200);
      return;
    }

    checkSessionToken(token)
      .then(async (res) => {
        if (!res.ok) {
          showToast('Tu sesión ha expirado. Por favor inicia sesión nuevamente.', 'error');
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
          setTimeout(() => navigate('/login'), 1500);
          return;
        }

        const userData = await res.json();
        const userPrevRaw = localStorage.getItem('user');
        const userPrev = userPrevRaw ? JSON.parse(userPrevRaw) : {};
        const userActualizado = { ...userPrev, ...userData };
        localStorage.setItem('user', JSON.stringify(userActualizado));

        const perfilKey = `perfil_${userData.id}`;
        const perfilPrevRaw = localStorage.getItem(perfilKey);
        const perfilPrev = perfilPrevRaw ? JSON.parse(perfilPrevRaw) : {};
        const perfilActualizado = { ...perfilPrev, ...userData };
        localStorage.setItem(perfilKey, JSON.stringify(perfilActualizado));

        loadProfileData();
        setLoading(false);
      })
      .catch((err) => {
        console.error('Session verification error:', err);
        showToast('Error de conexión al verificar sesión', 'error');
        // fall back to offline verification
        loadProfileData();
        setLoading(false);
      });
  }, [navigate, loadProfileData]);

  // Handle splash timeout
  useEffect(() => {
    if (showSplash) {
      const url = new URL(window.location.href);
      url.searchParams.delete('splash');
      window.history.replaceState(null, '', url.pathname);

      const timer = setTimeout(() => {
        setShowSplash(false);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [showSplash]);

  const handleProfileUpdate = () => {
    loadProfileData();
  };

  const handlePaymentSuccess = () => {
    // Reload local financial stats
    loadProfileData();
    setPagoOpen(false);
  };

  const handleLogout = () => {
    if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      showToast('Sesión cerrada correctamente', 'success');
      setTimeout(() => {
        navigate('/login');
      }, 1000);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#f20d0d] flex items-center justify-center z-[99998]">
        <style>{`@keyframes ptSpin{to{transform:rotate(360deg)}}`}</style>
        <div className="text-center text-white">
          <div className="w-[66px] h-[66px] rounded-full border-[2.5px] border-white/30 border-top-color-white margin-[0_auto_12px] relative animate-[ptSpin_1s_linear_infinite] mx-auto mb-4">
            <div className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-[46px] h-[46px] rounded-full bg-white/15"></div>
          </div>
          <div className="text-lg font-bold">CBTis 258</div>
          <div className="text-[10px] opacity-65 tracking-[3px] uppercase mt-1">Cargando...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* CSS Splash animations injected */}
      <style>{`
        #_splash {
          position: fixed;
          inset: 0;
          z-index: 999999;
          background: #94272C;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          transition: opacity .5s ease;
          pointer-events: none;
        }
        #_splash-inner {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 18px;
          position: relative;
          z-index: 2;
          animation: _sPopIn .65s cubic-bezier(.34,1.56,.64,1) forwards;
        }
        #_splash-ring {
          position: relative;
          width: 120px;
          height: 120px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        #_splash-ring-border {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 2.5px solid rgba(255,255,255,.35);
          border-top-color: white;
          animation: _sSpin 1.4s linear infinite;
        }
        #_splash-logo-bg {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background: rgba(255,255,255,.15);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        #_splash-logo-bg img {
          width: 64px;
          height: 64px;
          object-fit: contain;
        }
        #_splash-title {
          color: white;
          font-size: 1.9rem;
          font-weight: 900;
          letter-spacing: -.5px;
          font-family: Lexend, Montserrat, sans-serif;
          margin: 0;
          animation: _sFadeUp .5s ease .35s both;
        }
        #_splash-sub {
          color: rgba(255,255,255,.65);
          font-size: .72rem;
          font-weight: 600;
          letter-spacing: 3.5px;
          text-transform: uppercase;
          font-family: Lexend, Montserrat, sans-serif;
          margin: -10px 0 0;
          animation: _sFadeUp .5s ease .55s both;
        }
        #_splash-dots {
          display: flex;
          gap: 8px;
          margin-top: 6px;
          animation: _sFadeUp .5s ease .7s both;
        }
        .splash-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: rgba(255,255,255,.4);
        }
        .splash-dot:nth-child(1) { animation: _sBounce 1.1s ease infinite 0s; }
        .splash-dot:nth-child(2) { animation: _sBounce 1.1s ease infinite .18s; }
        .splash-dot:nth-child(3) { animation: _sBounce 1.1s ease infinite .36s; }
        ._sc { position: absolute; border-radius: 50%; background: rgba(255,100,100,.18); }
        ._sc-tr { width: 360px; height: 360px; top: -130px; right: -130px; }
        ._sc-bl { width: 300px; height: 300px; bottom: -110px; left: -110px; }

        @keyframes _sPopIn { from{opacity:0;transform:scale(0.7)} to{opacity:1;transform:scale(1)} }
        @keyframes _sFadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes _sSpin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes _sBounce { 0%,80%,100%{transform:translateY(0);opacity:.4} 40%{transform:translateY(-8px);opacity:1;background:white} }
      `}</style>

      {/* SPLASH SCREEN */}
      {showSplash && (
        <div id="_splash">
          <div className="_sc _sc-tr"></div>
          <div className="_sc _sc-bl"></div>
          <div id="_splash-inner">
            <div id="_splash-ring">
              <div id="_splash-ring-border"></div>
              <div id="_splash-logo-bg">
                <img src="/imgs/yameharte.png" alt="CBTis 258" />
              </div>
            </div>
            <p id="_splash-title">CBTis 258</p>
            <p id="_splash-sub">Un motivo de orgullo</p>
            <div id="_splash-dots">
              <div className="splash-dot"></div>
              <div className="splash-dot"></div>
              <div className="splash-dot"></div>
            </div>
          </div>
        </div>
      )}

      {/* DESKTOP LAYOUT */}
      <div className="hidden lg:flex flex-col min-h-screen bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 relative">
        <div className="mesh-bg" aria-hidden="true"></div>

        {/* HEADER */}
        <header className="bg-gradient-to-r from-primary to-red-800/90 backdrop-blur-md bg-opacity-90 text-white flex items-center justify-between whitespace-nowrap px-10 py-5 shadow-lg sticky top-0 z-50 border-b border-white/10">
          <div 
            onClick={() => setSidebarOpen(true)}
            className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <img src="/imgs/yameharte.png" alt="Logo" className="h-8 w-auto object-contain" />
            </div>
            <div>
              <h1 className="text-2xl font-black leading-tight tracking-[-0.015em] text-white">CBTis 258</h1>
              <p className="text-xs font-semibold text-white/90 uppercase tracking-widest">Un motivo de orgullo</p>
            </div>
          </div>
          <div className="flex flex-1 justify-end gap-8 items-center">
            <div 
              onClick={() => setProfileOpen(true)}
              className="flex items-center gap-4 bg-black/10 py-2 px-4 rounded-full border border-white/20 shadow-sm cursor-pointer hover:bg-black/20 transition-colors"
            >
              <span className="text-sm font-bold text-white">
                {userProfile ? userProfile.nombre : '—'}
              </span>
              <div 
                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border-2 border-white/50 bg-slate-300"
                style={{ backgroundImage: `url("${profileAvatar}")` }}
              />
            </div>
          </div>
        </header>

        {/* MAIN BODY */}
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-[1280px]">
          <div className="mb-12">
            <h2 className="text-5xl font-black leading-tight tracking-[-0.033em] mb-3 bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent inline-block transform transition-transform hover:scale-[1.02] cursor-default">
              Bienvenid@, <span>{userProfile ? userProfile.nombre : '—'}</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-lg font-medium leading-normal ml-1">
              Revisa tu estado de cuenta y realiza pagos escolares.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 flex flex-col gap-8">
              <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-slate-100 dark:border-slate-700 p-8 flex flex-col h-full relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
                <h3 className="text-2xl font-bold leading-tight tracking-[-0.015em] mb-8 flex items-center gap-3 relative z-10 text-slate-800 dark:text-white">
                  <div className="p-2 bg-primary/10 rounded-xl">
                    <span className="material-symbols-outlined text-primary text-2xl">account_balance_wallet</span>
                  </div>
                  Estados de pago
                </h3>

                <div className="flex-grow flex flex-col items-center justify-center p-10 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 relative overflow-hidden glass-card z-10 mb-8" id="estado-container-global">
                  {pendingCount > 0 ? (
                    <>
                      <div className="relative inline-flex items-center justify-center w-36 h-36 rounded-full mb-6">
                        <svg className="w-full h-full text-red-200 dark:text-red-900/40" viewBox="0 0 36 36">
                          <path className="stroke-current" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeLinecap="round" strokeWidth="2.5"></path>
                        </svg>
                        <svg className="w-full h-full text-red-500 absolute top-0 left-0" viewBox="0 0 36 36">
                          <path className="stroke-current" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeDasharray="100, 100" strokeLinecap="round" strokeWidth="2.5"></path>
                        </svg>
                        <div className="absolute bg-red-500/10 w-24 h-24 rounded-full flex items-center justify-center">
                          <span className="material-symbols-outlined text-5xl text-red-500">close</span>
                        </div>
                      </div>
                      <h4 className="text-2xl font-bold leading-tight tracking-[-0.015em] mb-3 text-slate-800 dark:text-slate-100">
                        Tienes <strong className="text-red-500">{pendingCount}</strong> pago(s) pendiente(s)
                      </h4>
                      <p className="text-slate-500 dark:text-slate-400 text-base max-w-md text-center">
                        Hemos detectado un atraso en tu cuenta. Por favor regulariza tu situación.
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="relative inline-flex items-center justify-center w-36 h-36 rounded-full mb-6">
                        <svg className="w-full h-full text-slate-200 dark:text-slate-700" viewBox="0 0 36 36">
                          <path className="stroke-current" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeLinecap="round" strokeWidth="2.5"></path>
                        </svg>
                        <svg className="w-full h-full text-green-500 absolute top-0 left-0" viewBox="0 0 36 36">
                          <path className="stroke-current" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeDasharray="100, 100" strokeLinecap="round" strokeWidth="2.5"></path>
                        </svg>
                        <div className="absolute bg-green-500/10 w-24 h-24 rounded-full flex items-center justify-center">
                          <span className="material-symbols-outlined text-5xl text-green-500">check</span>
                        </div>
                      </div>
                      <h4 className="text-2xl font-bold leading-tight tracking-[-0.015em] mb-3 text-slate-800 dark:text-slate-100">
                        Tienes <strong className="text-primary">0</strong> pagos pendientes
                      </h4>
                      <p className="text-slate-500 dark:text-slate-400 text-base max-w-md text-center">
                        Tu cuenta está al corriente. ¡Gracias por tu puntualidad y compromiso con tu educación!
                      </p>
                    </>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-5 mt-auto relative z-10">
                  <button 
                    onClick={() => setInfoOpen(true)}
                    className="flex-1 flex cursor-pointer items-center justify-center rounded-xl h-14 px-8 bg-gradient-to-r from-primary to-red-600 text-white text-base font-bold shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5 transition-all focus:ring-4 focus:ring-primary/20"
                  >
                    <span className="material-symbols-outlined mr-3 text-[22px]">info</span>
                    Información
                  </button>
                  <button 
                    onClick={() => setHistoryOpen(true)}
                    className="flex-1 flex cursor-pointer items-center justify-center rounded-xl h-14 px-8 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-base font-bold shadow-sm border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 hover:-translate-y-0.5 transition-all"
                  >
                    <span className="material-symbols-outlined mr-3 text-[22px]">history</span>
                    Historial de Pagos
                  </button>
                </div>
              </section>
            </div>

            <div className="flex flex-col gap-8">
              <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-slate-100 dark:border-slate-700 p-8">
                <h3 className="text-xl font-bold leading-tight tracking-[-0.015em] mb-6 flex items-center gap-3 text-slate-800 dark:text-white">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                    <span className="material-symbols-outlined text-blue-500 text-xl">credit_card</span>
                  </div>
                  Cuenta Activa
                </h3>
                <div className="space-y-5">
                  <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-700/50">
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Semestre Actual</span>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      {userProfile ? `${userProfile.semestre}° Semestre` : '—'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-700/50">
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Colegiatura Mes</span>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200">$3,000.00 MXN</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-primary/5 rounded-xl border border-primary/10">
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Próximo Vencimiento</span>
                    <span 
                      className="text-sm font-black" 
                      style={{ color: nextPaymentDateColor }}
                    >
                      {nextPaymentDateText}
                    </span>
                  </div>
                </div>
              </section>

              <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-slate-100 dark:border-slate-700 p-8">
                <h3 className="text-xl font-bold leading-tight tracking-[-0.015em] mb-4 flex items-center gap-3 text-slate-800 dark:text-white">
                  <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                    <span className="material-symbols-outlined text-purple-500 text-xl">storefront</span>
                  </div>
                  Financieros
                </h3>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-6">Adquiere productos escolares o realiza tus trámites.</p>
                <ul className="space-y-4 mb-6">
                  <li>
                    <a 
                      onClick={() => setPapeleriaOpen(true)}
                      className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700 border border-slate-100 dark:border-slate-700 hover:border-orange-200 dark:hover:border-orange-500/30 hover:shadow-md transition-all group cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform">
                          <span className="material-symbols-outlined text-xl">draw</span>
                        </div>
                        <span className="text-base font-bold text-slate-700 dark:text-slate-200">Subir Papelería</span>
                      </div>
                      <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 group-hover:text-orange-500 transition-colors">arrow_forward</span>
                    </a>
                  </li>
                  <li>
                    <a 
                      onClick={() => setOrientacionOpen(true)}
                      className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700 border border-slate-100 dark:border-slate-700 hover:border-teal-200 dark:hover:border-teal-500/30 hover:shadow-md transition-all group cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-teal-100 dark:bg-teal-900/30 rounded-lg text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform">
                          <span className="material-symbols-outlined text-xl">psychology</span>
                        </div>
                        <span className="text-base font-bold text-slate-700 dark:text-slate-200">Orientación</span>
                      </div>
                      <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 group-hover:text-teal-500 transition-colors">arrow_forward</span>
                    </a>
                  </li>
                </ul>
                <button 
                  onClick={() => navigate('/tienda')}
                  className="w-full flex cursor-pointer items-center justify-center h-12 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-sm"
                >
                  Ingresar a Tienda
                </button>
              </section>
            </div>
          </div>
        </main>

        {/* FOOTER */}
        <footer className="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 mt-auto py-10 z-10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1280px] flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 md:gap-10 text-sm font-medium text-slate-500 dark:text-slate-400">
              <a className="hover:text-primary transition-colors" href="#">Ayuda</a>
              <a className="hover:text-primary transition-colors" href="#">Términos y condiciones</a>
              <a className="hover:text-primary transition-colors" href="#">Política de privacidad</a>
            </div>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-primary/5 border border-transparent hover:border-primary/10 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
              Cerrar sesión
            </button>
          </div>
        </footer>
      </div>

      {/* MOBILE LAYOUT */}
      <div className="mobile-only block lg:hidden min-h-screen bg-[#f9f9fb] dark:bg-[#121316] pb-[88px] relative text-slate-900 dark:text-slate-100 font-display">
        {/* Mobile Header */}
        <header className="mob-header fixed top-0 left-0 right-0 z-50 bg-white/92 dark:bg-[#1a1c20]/92 backdrop-blur-md border-b border-slate-100 dark:border-[#3c1e1e]/30 h-[64px] flex items-center justify-between px-5">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(true)}
              style={{ background: 'transparent' }} 
              className="w-10 h-10 rounded-full border-none cursor-pointer flex items-center justify-center text-[#1a1c1d] dark:text-[#f1f1f3]"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div className="flex items-center gap-2">
              <img src="/imgs/yameharte.png" alt="Logo" className="w-[28px] h-[28px] object-contain" />
              <span className="mob-title font-bold text-[1.1rem] text-[#af101a] dark:text-white">CBTis 258</span>
            </div>
          </div>
          <button 
            onClick={() => setProfileOpen(true)}
            style={{ background: 'transparent' }} 
            className="border-none cursor-pointer p-0"
          >
            <div 
              className="w-9 h-9 rounded-full bg-center bg-no-repeat bg-cover border-2 border-primary/20 bg-slate-300"
              style={{ backgroundImage: `url("${profileAvatar}")` }}
            />
          </button>
        </header>

        {/* Mobile Main Content */}
        <div className="mobile-main-content px-5 pt-[80px]">
          {/* Greeting */}
          <section className="mb-8 mt-4">
            <p className="mob-sub text-xs font-semibold text-slate-500 dark:text-[#9b7a78] uppercase tracking-wider mb-1">Bienvenid@</p>
            <h2 className="mob-title text-[1.75rem] font-extrabold tracking-tight text-[#1a1c1d] dark:text-[#f1f1f3]">
              {userProfile ? userProfile.nombre : '—'}
            </h2>
            <div className="mob-badge inline-flex items-center gap-2 bg-white dark:bg-slate-850 rounded-full px-[14px] py-1 border border-slate-200 dark:border-[#3c1e1e]/40 shadow-sm mt-2">
              <span 
                className="w-[7px] h-[7px] rounded-full inline-block"
                style={{ backgroundColor: pendingCount === 0 ? '#27ae60' : '#e74c3c' }}
              />
              <span className="mob-value text-[11px] font-bold text-slate-800 dark:text-[#f1f1f3]">
                {userProfile ? `${userProfile.semestre}° Semestre` : '—'}
              </span>
            </div>
          </section>

          {/* Payment Status Card */}
          <section className="mb-5" id="estado-container-global-mobile">
            <div className="mob-card bg-white dark:bg-[#1e2025] rounded-2xl p-5 border border-slate-100 dark:border-[#3c1e1e]/20 shadow-sm">
              <div className="flex justify-between items-start mb-[14px]">
                <div>
                  <h3 className="mob-title font-bold text-base text-[#1a1c1d] dark:text-[#f1f1f3] mb-1.5">Estados de pago</h3>
                  {pendingCount > 0 ? (
                    <div className="inline-flex items-center gap-1.5 bg-[#ffdad6] dark:bg-red-950/40 rounded-full px-2.5 py-1 text-[11px] font-bold text-[#93000a] dark:text-red-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a] inline-block"></span>
                      {pendingCount} pago(s) pendiente(s)
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 bg-[#e8f5e9] dark:bg-green-950/40 rounded-full px-2.5 py-1 text-[11px] font-bold text-[#1b5e20] dark:text-green-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#27ae60] inline-block"></span>
                      Al corriente
                    </div>
                  )}
                </div>
                {pendingCount > 0 ? (
                  <div className="w-[52px] h-[52px] rounded-full bg-[#ffdad6] dark:bg-red-950/40 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[#ba1a1a] dark:text-red-400 text-[22px]">warning</span>
                  </div>
                ) : (
                  <div className="w-[52px] h-[52px] rounded-full bg-[#e8f5e9] dark:bg-green-950/40 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[#27ae60] dark:text-green-400 text-[22px]">check_circle</span>
                  </div>
                )}
              </div>
              <p className="mob-sub text-xs text-[#5b403d] dark:text-[#9b7a78] leading-relaxed mb-4">
                {pendingCount > 0 
                  ? 'Tienes pagos atrasados. Regulariza tu situación a tiempo.'
                  : 'Tu cuenta está al corriente. ¡Gracias por tu puntualidad!'}
              </p>
              <button 
                onClick={() => setInfoOpen(true)}
                className="w-full bg-[#af101a] text-white py-3 rounded-xl font-bold text-sm border-none cursor-pointer"
              >
                Ver detalles
              </button>
            </div>
          </section>

          {/* Next Payment Date Card */}
          <section className="mob-card bg-white dark:bg-[#1e2025] rounded-2xl p-5 mb-5 border border-slate-100 dark:border-[#3c1e1e]/20 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="mob-action-icon w-10 h-10 rounded-xl bg-[#af101a]/5 dark:bg-[#af101a]/15 flex items-center justify-center text-[#af101a] dark:text-white shrink-0">
                <span className="material-symbols-outlined text-[20px]">calendar_month</span>
              </div>
              <div>
                <p className="mob-label text-[10px] font-bold text-[#8f6f6c] dark:text-[#9b7a78] uppercase tracking-wider mb-0.5">Próximo Vencimiento</p>
                <p className="font-bold text-[0.9rem]" style={{ color: nextPaymentDateColor }}>
                  {pendingCount === 0 ? 'Sin deuda' : nextPaymentDateText}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="mob-label text-[10px] font-bold text-[#8f6f6c] dark:text-[#9b7a78] mb-0.5">Colegiatura</p>
              <p className="mob-value font-bold text-[0.9rem] text-[#1a1c1d] dark:text-[#f1f1f3]">$3,000 MXN</p>
            </div>
          </section>

          {/* Account Info Card */}
          <section className="mob-card bg-white dark:bg-[#1e2025] rounded-2xl p-5 mb-5 border border-slate-100 dark:border-[#3c1e1e]/20 shadow-sm">
            <h3 className="mob-title font-bold text-base text-[#1a1c1d] dark:text-[#f1f1f3] mb-4">Cuenta Activa</h3>
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-[#3c1e1e]/20">
                <span className="mob-label text-sm text-[#5b403d] dark:text-[#9b7a78]">Semestre Actual</span>
                <span className="mob-value font-bold text-sm text-[#1a1c1d] dark:text-[#f1f1f3]">
                  {userProfile ? `${userProfile.semestre}° Semestre` : '—'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="mob-label text-sm text-[#5b403d] dark:text-[#9b7a78]">Correo</span>
                <span className="mob-value font-bold text-sm text-[#1a1c1d] dark:text-[#f1f1f3] max-w-[180px] overflow-hidden text-ellipsis whitespace-nowrap">
                  {userProfile ? userProfile.email : '—'}
                </span>
              </div>
            </div>
          </section>

          {/* Quick Actions */}
          <section className="mb-5">
            <h3 className="mob-title font-bold text-base text-[#1a1c1d] dark:text-[#f1f1f3] mb-3.5">Acciones rápidas</h3>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setInfoOpen(true)}
                className="mob-card bg-white dark:bg-[#1e2025] border border-slate-100 dark:border-[#3c1e1e]/20 rounded-2xl p-5 text-left cursor-pointer transition-transform"
              >
                <div className="mob-action-icon w-10 h-10 rounded-xl bg-[#af101a]/5 dark:bg-[#af101a]/15 flex items-center justify-center mb-2.5">
                  <span className="material-symbols-outlined text-[#af101a] dark:text-white text-[20px]">info</span>
                </div>
                <p className="mob-title font-bold text-sm text-[#1a1c1d] dark:text-[#f1f1f3] m-0">Información</p>
                <p className="mob-sub text-[10px] text-[#8f6f6c] dark:text-[#9b7a78] mt-0.5">Ver estado de cuenta</p>
              </button>

              <button 
                onClick={() => setHistoryOpen(true)}
                className="mob-card bg-white dark:bg-[#1e2025] border border-slate-100 dark:border-[#3c1e1e]/20 rounded-2xl p-5 text-left cursor-pointer transition-transform"
              >
                <div className="w-10 h-10 rounded-xl bg-[#005faf]/5 dark:bg-[#005faf]/15 flex items-center justify-center mb-2.5">
                  <span className="material-symbols-outlined text-[#005faf] dark:text-blue-400 text-[20px]">history</span>
                </div>
                <p className="mob-title font-bold text-sm text-[#1a1c1d] dark:text-[#f1f1f3] m-0">Historial</p>
                <p className="mob-sub text-[10px] text-[#8f6f6c] dark:text-[#9b7a78] mt-0.5">Pagos realizados</p>
              </button>

              <button 
                onClick={() => navigate('/tienda')}
                className="mob-card bg-white dark:bg-[#1e2025] border border-slate-100 dark:border-[#3c1e1e]/20 rounded-2xl p-5 text-left cursor-pointer transition-transform"
              >
                <div className="w-10 h-10 rounded-xl bg-[#715300]/5 dark:bg-[#715300]/15 flex items-center justify-center mb-2.5">
                  <span className="material-symbols-outlined text-[#715300] dark:text-amber-400 text-[20px]">storefront</span>
                </div>
                <p className="mob-title font-bold text-sm text-[#1a1c1d] dark:text-[#f1f1f3] m-0">Tienda</p>
                <p className="mob-sub text-[10px] text-[#8f6f6c] dark:text-[#9b7a78] mt-0.5">Productos y trámites</p>
              </button>

              <button 
                onClick={() => setPapeleriaOpen(true)}
                className="mob-card bg-white dark:bg-[#1e2025] border border-slate-100 dark:border-[#3c1e1e]/20 rounded-2xl p-5 text-left cursor-pointer transition-transform"
              >
                <div className="mob-action-icon w-10 h-10 rounded-xl bg-[#af101a]/5 dark:bg-[#af101a]/15 flex items-center justify-center mb-2.5">
                  <span className="material-symbols-outlined text-[#af101a] dark:text-white text-[20px]">edit_note</span>
                </div>
                <p className="mob-title font-bold text-sm text-[#1a1c1d] dark:text-[#f1f1f3] m-0">Papelería</p>
                <p className="mob-sub text-[10px] text-[#8f6f6c] dark:text-[#9b7a78] mt-0.5">Subir documentos</p>
              </button>
            </div>
          </section>
        </div>

        {/* Bottom Nav Bar (Mobile) */}
        <nav className="mob-nav fixed bottom-0 left-0 right-0 z-45 flex justify-around items-center px-4 h-20 bg-white/92 dark:bg-[#1a1c20]/92 backdrop-blur-md border-t border-slate-100 dark:border-[#3c1e1e]/20 shadow-lg rounded-t-3xl">
          <a href="#" className="flex flex-col items-center justify-center w-full h-full text-[#af101a] relative">
            <span className="absolute w-16 h-10 bg-[#af101a]/8 rounded-full z-[-1]"></span>
            <span className="material-symbols-outlined mb-1 text-[FILL] font-variation-settings-['FILL'_1]">dashboard</span>
            <span className="text-[10px] font-bold uppercase tracking-wider">Panel</span>
          </a>
          <a 
            onClick={() => navigate('/tienda?splash=1')}
            className="flex flex-col items-center justify-center w-full h-full text-slate-500 dark:text-[#9b7a78] cursor-pointer"
          >
            <span className="material-symbols-outlined mb-1">shopping_bag</span>
            <span className="text-[10px] font-bold uppercase tracking-wider">Tienda</span>
          </a>
          <a 
            onClick={() => setSidebarOpen(true)}
            className="flex flex-col items-center justify-center w-full h-full text-slate-500 dark:text-[#9b7a78] cursor-pointer"
          >
            <span className="material-symbols-outlined mb-1">settings</span>
            <span className="text-[10px] font-bold uppercase tracking-wider">Ajustes</span>
          </a>
        </nav>
      </div>

      {/* ALL MODALS RENDERED HERE */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        onOpenChatbot={() => setChatbotOpen(true)} 
      />
      
      <Chatbot 
        isOpen={chatbotOpen} 
        onClose={() => setChatbotOpen(false)} 
      />

      <PerfilModal 
        isOpen={profileOpen} 
        onClose={() => setProfileOpen(false)} 
        onProfileUpdate={handleProfileUpdate} 
      />

      <Pago 
        isOpen={pagoOpen} 
        onClose={() => setPagoOpen(false)} 
        cart={[]} 
        clearCart={() => {}} 
        mode="principal" 
        onPaymentSuccess={handlePaymentSuccess} 
      />

      <Papeleria 
        isOpen={papeleriaOpen} 
        onClose={() => setPapeleriaOpen(false)} 
      />

      <OrientacionModal 
        isOpen={orientacionOpen} 
        onClose={() => setOrientacionOpen(false)} 
      />

      <DeudaModal 
        isOpen={deudaOpen} 
        onClose={() => setDeudaOpen(false)} 
        pendingCount={pendingCount} 
      />

      <HistorialModal 
        isOpen={historyOpen} 
        onClose={() => setHistoryOpen(false)} 
      />

      <InformacionModal 
        isOpen={infoOpen} 
        onClose={() => setInfoOpen(false)} 
      />
    </>
  );
}
