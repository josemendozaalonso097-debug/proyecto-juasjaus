import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './PrincipalPage.css';

// Components
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import Sidebar from '../components/Sidebar.jsx';

// Modals
import ModalHistorial from '../components/modals/ModalHistorial.jsx';
import ModalInformacion from '../components/modals/ModalInformacion.jsx';
import ModalDetalle from '../components/modals/ModalDetalle.jsx';
import ModalPago from '../components/modals/ModalPago.jsx';
import ModalPapeleria from '../components/modals/ModalPapeleria.jsx';
import ModalPerfil from '../components/modals/ModalPerfil.jsx';
import ModalOrientacion from '../components/modals/ModalOrientacion.jsx';
import ModalDeuda from '../components/modals/ModalDeuda.jsx';
import ModalConfirmacion from '../components/modals/ModalConfirmacion.jsx';

// Utilities
import { checkSessionToken } from '../api/auth.js';
import { obtenerHistorial } from '../utils/storage.js';

const LIMIT_ROL = 3;
const LIMIT_SEMESTRE = 10;

const showToast = (message, type = 'info') => {
  if (window.showToast) {
    window.showToast(message, type);
  } else {
    console.log(`[Toast ${type}]: ${message}`);
  }
};

export default function PrincipalPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // User details state
  const [user, setUser] = useState(null);
  
  // Modals visibility states
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showHistorial, setShowHistorial] = useState(false);
  const [showInformacion, setShowInformacion] = useState(false);
  const [showDetalle, setShowDetalle] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);
  const [showPago, setShowPago] = useState(false);
  const [showPapeleria, setShowPapeleria] = useState(false);
  const [showPerfil, setShowPerfil] = useState(false);
  const [showOrientacion, setShowOrientacion] = useState(false);
  const [showDeuda, setShowDeuda] = useState(false);
  
  // Generic confirmation modal state
  const [showConfirmacion, setShowConfirmacion] = useState(false);
  const [confirmData, setConfirmData] = useState({ title: '', message: '', onConfirm: null });

  // Splash and page load states
  const [showSplash, setShowSplash] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Payments / Debt calculation states
  const [pagosPendientes, setPagosPendientes] = useState(0);
  const [textoFechaVencimiento, setTextoFechaVencimiento] = useState('—');
  const [nextDateColor, setNextDateColor] = useState('text-slate-800');

  // Verify auth session on mount
  useEffect(() => {
    // 1. Splash Screen Check
    const needsSplash = searchParams.get('splash') === '1';
    if (needsSplash) {
      setShowSplash(true);
      // Clean query parameter from URL
      window.history.replaceState(null, '', window.location.pathname);
      
      const splashTimeout = setTimeout(() => {
        const fadeEl = document.getElementById('_splash');
        if (fadeEl) {
          fadeEl.style.opacity = '0';
          setTimeout(() => setShowSplash(false), 500);
        } else {
          setShowSplash(false);
        }
      }, 2500);
      return () => clearTimeout(splashTimeout);
    }
  }, [searchParams]);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      showToast('Debes iniciar sesión primero', 'warning');
      setTimeout(() => navigate('/login'), 1200);
      return;
    }

    const verifySession = async () => {
      try {
        const response = await checkSessionToken(token);
        if (!response.ok) {
          showToast('Tu sesión ha expirado. Por favor inicia sesión nuevamente.', 'error');
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
          setTimeout(() => navigate('/login'), 1500);
          return;
        }

        const userData = await response.json();
        console.log('✅ Usuario autenticado:', userData.nombre);

        // Merge and save user details in localStorage
        const userPrevRaw = localStorage.getItem('user');
        const userPrev = userPrevRaw ? JSON.parse(userPrevRaw) : {};
        const userActualizado = { ...userPrev, ...userData };
        localStorage.setItem('user', JSON.stringify(userActualizado));

        const perfilKey = `perfil_${userData.id}`;
        const perfilPrevRaw = localStorage.getItem(perfilKey);
        const perfilPrev = perfilPrevRaw ? JSON.parse(perfilPrevRaw) : {};
        const perfilActualizado = { ...perfilPrev, ...userData };
        localStorage.setItem(perfilKey, JSON.stringify(perfilActualizado));

        setUser(perfilActualizado);

        // Apply dark mode if enabled in user preferences
        const storedPrefs = localStorage.getItem(`prefs_${userData.id}`);
        if (storedPrefs) {
          const parsedPrefs = JSON.parse(storedPrefs);
          if (parsedPrefs.darkMode) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
          if (parsedPrefs.largeText) {
            document.documentElement.classList.add('large-text');
          } else {
            document.documentElement.classList.remove('large-text');
          }
        }

        // Run automatic semester increment checks
        verificarCambioAutomatico(perfilActualizado);
        
        // Calculate due payments / dates
        actualizarProximoVencimiento(perfilActualizado);
        
        setIsLoading(false);

      } catch (error) {
        console.error('Error:', error);
        showToast('Error al verificar la sesión', 'error');
        setTimeout(() => navigate('/login'), 1200);
      }
    };

    verifySession();
  }, [navigate]);

  // Bridges the React state triggers with external or chatbot requests via window.
  useEffect(() => {
    window.abrirModalOrientacion = () => setShowOrientacion(true);
    window.cerrarModalOrientacion = () => setShowOrientacion(false);
    window.abrirModalPapeleria = () => setShowPapeleria(true);
    window.cerrarModalPapeleria = () => setShowPapeleria(false);
    window.abrirHistorial = () => setShowHistorial(true);
    window.cerrarHistorial = () => setShowHistorial(false);
    
    window.mostrarModalDeuda = (cantidad) => {
      setPagosPendientes(cantidad);
      setShowDeuda(true);
    };

    window.mostrarModalConfirmacion = (titulo, mensaje, onConfirm) => {
      setConfirmData({ title: titulo, message: mensaje, onConfirm });
      setShowConfirmacion(true);
    };

    window.actualizarProximoVencimiento = () => {
      const uRaw = localStorage.getItem('user');
      if (uRaw) {
        const uObj = JSON.parse(uRaw);
        const pKey = `perfil_${uObj.id}`;
        const pRaw = localStorage.getItem(pKey);
        const pObj = pRaw ? JSON.parse(pRaw) : uObj;
        actualizarProximoVencimiento(pObj);
      }
    };

    return () => {
      delete window.abrirModalOrientacion;
      delete window.cerrarModalOrientacion;
      delete window.abrirModalPapeleria;
      delete window.cerrarModalPapeleria;
      delete window.abrirHistorial;
      delete window.cerrarHistorial;
      delete window.mostrarModalDeuda;
      delete window.mostrarModalConfirmacion;
      delete window.actualizarProximoVencimiento;
    };
  }, []);

  const verificarCambioAutomatico = (perfil) => {
    if (!perfil || !perfil.id || perfil.rol !== 'estudiante') return;

    const hoy = new Date();
    const mes = hoy.getMonth(); // 0-11 (Jan=0, Jul=6)
    const anio = hoy.getFullYear();
    
    // Periodos: "Enero" (mes 0) y "Julio" (mes 6)
    if (mes !== 0 && mes !== 6) return;

    const periodKey = `${anio}-${mes}`;
    const ultimoUpdate = localStorage.getItem(`ultimo_auto_update_${perfil.id}`);

    if (ultimoUpdate === periodKey) return; // Already checked for this period

    let semestreActual = parseInt(perfil.semestre || '1', 10);
    if (semestreActual < 6) {
      semestreActual++;
      
      const perfilKey = `perfil_${perfil.id}`;
      const updatedPerfil = { ...perfil, semestre: semestreActual.toString() };
      
      localStorage.setItem(perfilKey, JSON.stringify(updatedPerfil));
      localStorage.setItem('user', JSON.stringify(updatedPerfil));
      localStorage.setItem(`ultimo_auto_update_${perfil.id}`, periodKey);

      console.log(`🚀 Semestre actualizado automáticamente a ${semestreActual}°`);
      setUser(updatedPerfil);
      
      showToast(`¡Felicidades! Has pasado al ${semestreActual}° semestre.`, 'success');
    }
  };

  const actualizarProximoVencimiento = (perfil) => {
    if (!perfil) return;

    const hoy = new Date();
    const mesActual = hoy.getMonth();
    const anioActual = hoy.getFullYear();
    
    let mesVencimientoText = 'Enero';
    let anioVencimientoText = anioActual;
    
    if (mesActual === 10 || mesActual === 11 || mesActual === 0) {
      mesVencimientoText = 'Enero';
      anioVencimientoText = (mesActual === 0) ? anioActual : anioActual + 1;
    } else if (mesActual >= 4 && mesActual <= 6) {
      mesVencimientoText = 'Julio';
      anioVencimientoText = anioActual;
    }

    const textoFecha = `1 de ${mesVencimientoText} del ${anioVencimientoText}`;

    const rol = (perfil.rol || 'estudiante').toLowerCase();
    const semestreDelUsuario = parseInt(perfil.semestre || '1', 10);

    const historial = obtenerHistorial() || [];
    let pagosRealizados = 0;
    historial.forEach(compra => {
      if (compra.productos && compra.productos.some(p => p.nombre.toLowerCase().includes('colegiatura'))) {
        pagosRealizados++;
      }
    });

    let pendientes = 0;
    if (rol === 'estudiante') {
      // expected total colegiaturas paid = N (current semester)
      const pagosEsperados = semestreDelUsuario;
      pendientes = Math.max(0, pagosEsperados - pagosRealizados);
    }

    setPagosPendientes(pendientes);

    if (pendientes === 0) {
      setTextoFechaVencimiento('No hay pagos pendientes');
      setNextDateColor('text-green-600 dark:text-green-400 font-extrabold');
    } else {
      setTextoFechaVencimiento(textoFecha);
      setNextDateColor('text-red-500 font-extrabold');

      // Trigger debt alert modal on load
      setTimeout(() => setShowDeuda(true), 1000);
    }
  };

  const handleLogout = () => {
    if (window.confirm('¿Estás seguro que deseas cerrar sesión?')) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      showToast('Sesión cerrada correctamente', 'success');
      setTimeout(() => navigate('/login'), 1000);
    }
  };

  const handleOpenChatbot = () => {
    if (window.abrirChatbot) {
      window.abrirChatbot();
    } else {
      showToast('El asistente CobraBot no está cargado.', 'warning');
    }
  };

  const handlePay = () => {
    // Check semester limit before opening pay page
    const rol = (user?.rol || 'estudiante').toLowerCase();
    const semestreStr = user?.semestre || '1';

    if (rol === 'estudiante') {
      const semestreDelUsuario = parseInt(semestreStr, 10) || 1;
      const maxPagosPermitidos = Math.max(0, (6 - semestreDelUsuario) + 1);
      
      const historial = obtenerHistorial() || [];
      let count = 0;
      historial.forEach(compra => {
        if (compra.productos && compra.productos.some(p => p.nombre.toLowerCase().includes('colegiatura'))) {
          count++;
        }
      });

      if (count >= maxPagosPermitidos) {
        setConfirmData({
          title: 'Límite de colegiaturas alcanzado',
          message: `De acuerdo a tu grado actual, has alcanzado tu límite de ${maxPagosPermitidos} pagos de colegiatura correspondientes a lo que restaba de tu plan de estudios. ¿Deseas realizar otro pago adicional?`,
          onConfirm: () => setShowPago(true)
        });
        setShowConfirmacion(true);
        return;
      }
    }

    setShowPago(true);
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[99998] bg-[#f20d0d] flex items-center justify-center text-white">
        <div className="text-center">
          <div className="w-16 h-16 border-[2.5px] border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-lg font-bold">CBTis 258</h2>
          <p className="text-xs opacity-70 uppercase tracking-widest mt-1">Cargando tablero...</p>
        </div>
      </div>
    );
  }

  const userNombre = user?.nombre || 'Usuario';
  const userRol = user?.rol || 'Estudiante';
  const userSemestreText = userRol === 'estudiante' ? (user?.semestre ? `${user.semestre}° Semestre` : 'Sin semestre') : 'No aplica';

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen flex flex-col relative">
      <div className="mesh-bg" aria-hidden="true"></div>

      {/* SPLASH OVERLAY */}
      {showSplash && (
        <div id="_splash" className="transition-opacity duration-500">
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

      {/* HEADER */}
      <Header 
        userName={user?.nombre || 'Invitado'} 
        onMenuClick={() => setSidebarOpen(true)} 
        onProfileClick={() => setShowPerfil(true)} 
        userPhoto={user?.fotoUrl || (user?.id ? localStorage.getItem('foto_perfil_' + user.id) : null)}
      />

      {/* SIDEBAR */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        onOpenChatbot={handleOpenChatbot} 
      />

      {/* MAIN LAYOUT (DESKTOP) */}
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-[1280px]">
        
        {/* Welcome Section */}
        <div className="mb-12">
          <h2 className="text-5xl font-black leading-tight tracking-[-0.033em] mb-3 bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent inline-block transform transition-transform hover:scale-[1.02] cursor-default">
            Bienvenid@, <span id="user-name">{userNombre}</span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-lg font-medium leading-normal ml-1">
            Revisa tu estado de cuenta y realiza pagos escolares.
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Main Panel Content (2 Columns wide) */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-slate-100 dark:border-slate-700 p-8 flex flex-col h-full relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
              
              <h3 className="text-2xl font-bold leading-tight tracking-[-0.015em] mb-8 flex items-center gap-3 relative z-10">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <span className="material-symbols-outlined text-primary text-2xl">account_balance_wallet</span>
                </div>
                Estados de pago
              </h3>
              
              <div className="flex-grow flex flex-col items-center justify-center p-10 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 relative overflow-hidden glass-card z-10" id="estado-container-global">
                {pagosPendientes > 0 ? (
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
                      Tienes <strong className="text-red-500">{pagosPendientes}</strong> pago(s) pendiente(s)
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
              
              <div className="flex flex-col sm:flex-row gap-5 mt-8 relative z-10">
                <button 
                  onClick={() => setShowInformacion(true)} 
                  className="flex-1 flex cursor-pointer items-center justify-center rounded-xl h-14 px-8 bg-gradient-to-r from-primary to-red-600 text-white text-base font-bold shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5 transition-all focus:ring-4 focus:ring-primary/20"
                >
                  <span className="material-symbols-outlined mr-3 text-[22px]">info</span>
                  Información
                </button>
                
                <button 
                  onClick={() => setShowHistorial(true)} 
                  className="flex-1 flex cursor-pointer items-center justify-center rounded-xl h-14 px-8 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-base font-bold shadow-sm border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 hover:-translate-y-0.5 transition-all"
                >
                  <span className="material-symbols-outlined mr-3 text-[22px]">history</span>
                  Historial de Pagos
                </button>
              </div>
            </section>
          </div>

          {/* Sidebar Area (1 Column wide) */}
          <div className="flex flex-col gap-8">
            
            {/* Active Account Info Card */}
            <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-slate-100 dark:border-slate-700 p-8">
              <h3 className="text-xl font-bold leading-tight tracking-[-0.015em] mb-6 flex items-center gap-3">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <span className="material-symbols-outlined text-blue-500 text-xl">credit_card</span>
                </div>
                Cuenta Activa
              </h3>
              
              <div className="space-y-5">
                <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-700/50">
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Semestre Actual</span>
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200" id="status-badge">
                    {userSemestreText}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-700/50">
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Colegiatura Mes</span>
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200">$3,000.00 MXN</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-primary/5 rounded-xl border border-primary/10">
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Próximo Vencimiento</span>
                  <span className={`text-sm ${nextDateColor}`} id="next-date">
                    {textoFechaVencimiento}
                  </span>
                </div>
              </div>
            </section>

            {/* Quick Financial Shortcuts */}
            <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-slate-100 dark:border-slate-700 p-8">
              <h3 className="text-xl font-bold leading-tight tracking-[-0.015em] mb-4 flex items-center gap-3">
                <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                  <span className="material-symbols-outlined text-purple-500 text-xl">storefront</span>
                </div>
                Financieros
              </h3>
              
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-6">
                Adquiere productos escolares o realiza tus trámites.
              </p>
              
              <ul className="space-y-4 mb-6">
                <li>
                  <a 
                    onClick={() => setShowPapeleria(true)}
                    className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700 hover:border-orange-200 dark:hover:border-orange-500/30 hover:shadow-md transition-all group cursor-pointer"
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
                    onClick={() => setShowOrientacion(true)}
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
                className="w-full flex items-center justify-center h-12 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-sm cursor-pointer"
              >
                Ingresar a Tienda
              </button>
            </section>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <Footer onLogout={handleLogout} />

      {/* ======================== MOBILE STITCH LAYOUT ======================== */}
      <div className="mobile-only lg:hidden" style={{ minHeight: '100dvh', background: '#f9f9fb', paddingBottom: '88px' }}>
        
        {/* Mobile Header */}
        <header className="mob-header" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, background: 'rgba(249,249,251,0.92)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(228,190,186,0.15)', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button 
              onClick={() => setSidebarOpen(true)}
              style={{ width: '40px', height: '40px', borderRadius: '50%', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1a1c1d' }}
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <img src="/imgs/yameharte.png" alt="Logo" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
              <span className="mob-title" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: '1.1rem', color: '#af101a' }}>CBTis 258</span>
            </div>
          </div>
          <button onClick={() => setShowPerfil(true)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}>
            <div 
              style={{ 
                width: '36px', 
                height: '36px', 
                borderRadius: '50%', 
                backgroundColor: '#e4beba',
                backgroundImage: `url('${localStorage.getItem(`foto_perfil_${user?.id}`) || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2394272c'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E"}')`,
                backgroundPosition: 'center',
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
                border: '2px solid rgba(175,16,26,0.2)' 
              }} 
            />
          </button>
        </header>

        {/* Mobile content container */}
        <div className="mobile-main-content" style={{ padding: '80px 20px 0' }}>
          {/* Hero Greeting */}
          <section style={{ marginBottom: '32px', marginTop: '16px' }}>
            <p className="mob-sub" style={{ fontFamily: "'Manrope',sans-serif", fontSize: '0.875rem', color: '#8f6f6c', fontWeight: 500, marginBottom: '4px' }}>Bienvenid@</p>
            <h2 id="user-name-mobile" className="mob-title" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#1a1c1d', marginBottom: '8px' }}>
              {userNombre}
            </h2>
            <div className="mob-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'white', borderRadius: '999px', padding: '4px 14px', border: '1px solid rgba(228,190,186,0.3)', boxShadow: '0 2px 8px rgba(175,16,26,0.06)' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: pagosPendientes === 0 ? '#27ae60' : '#eb4444', display: 'inline-block' }}></span>
              <span id="status-badge-mobile" className="mob-value" style={{ fontFamily: "'Manrope',sans-serif", fontSize: '12px', fontWeight: 700, color: '#1a1c1d' }}>
                {userSemestreText}
              </span>
            </div>
          </section>

          {/* Payment Status Card (Mobile) */}
          <section style={{ marginBottom: '20px' }}>
            {pagosPendientes > 0 ? (
              <div className="mob-card" style={{ backgroundColor: 'white', borderRadius: '16px', padding: '20px', border: '1px solid rgba(228,190,186,0.15)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                  <div>
                    <h3 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '1rem', fontWeight: 700, color: '#1a1c1d', marginBottom: '6px' }}>Estados de pago</h3>
                    <div style={{ display: 'inline-flex', alignItems: 'center', backgroundColor: '#ffdad6', borderRadius: '999px', padding: '3px 10px', fontSize: '11px', fontWeight: 700, color: '#93000a' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ba1a1a', display: 'inline-block', marginRight: '6px' }}></span>
                      {pagosPendientes} pago(s) pendiente(s)
                    </div>
                  </div>
                  <div style={{ width: '52px', height: '52px', borderRadius: '50%', backgroundColor: '#ffdad6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span className="material-symbols-outlined" style={{ color: '#ba1a1a', fontSize: '22px' }}>warning</span>
                  </div>
                </div>
                <p style={{ fontFamily: "'Manrope',sans-serif", fontSize: '0.8rem', color: '#5b403d', marginBottom: '14px' }}>Tienes pagos atrasados. Regulariza tu situación a tiempo.</p>
                <button onClick={() => setShowInformacion(true)} style={{ width: '100%', backgroundColor: '#af101a', color: 'white', padding: '12px', borderRadius: '10px', fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: "'Manrope',sans-serif", fontSize: '0.875rem' }}>
                  Ver detalles
                </button>
              </div>
            ) : (
              <div className="mob-card" style={{ backgroundColor: 'white', borderRadius: '16px', padding: '20px', border: '1px solid rgba(228,190,186,0.15)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                  <div>
                    <h3 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '1rem', fontWeight: 700, color: '#1a1c1d', marginBottom: '6px' }}>Estados de pago</h3>
                    <div style={{ display: 'inline-flex', alignItems: 'center', backgroundColor: '#e8f5e9', borderRadius: '999px', padding: '3px 10px', fontSize: '11px', fontWeight: 700, color: '#1b5e20' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#27ae60', display: 'inline-block', marginRight: '6px' }}></span>
                      Al corriente
                    </div>
                  </div>
                  <div style={{ width: '52px', height: '52px', borderRadius: '50%', backgroundColor: '#e8f5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span className="material-symbols-outlined" style={{ color: '#27ae60', fontSize: '22px' }}>check_circle</span>
                  </div>
                </div>
                <p style={{ fontFamily: "'Manrope',sans-serif", fontSize: '0.8rem', color: '#5b403d', marginBottom: '14px' }}>Tu cuenta está al corriente. ¡Gracias por tu puntualidad!</p>
                <button disabled style={{ width: '100%', backgroundColor: '#e2e2e4', color: '#5b403d', padding: '12px', borderRadius: '10px', fontWeight: 700, border: 'none', cursor: 'not-allowed', fontFamily: "'Manrope',sans-serif", fontSize: '0.875rem', opacity: 0.7 }}>
                  Sin deuda
                </button>
              </div>
            )}
          </section>

          {/* Next Payment Date (Mobile) */}
          <section className="mob-card" style={{ backgroundColor: 'white', borderRadius: '16px', padding: '18px 20px', marginBottom: '20px', border: '1px solid rgba(228,190,186,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="mob-action-icon" style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: 'rgba(175,16,26,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#af101a', flexShrink: 0 }}>
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>calendar_month</span>
              </div>
              <div>
                <p className="mob-label" style={{ fontFamily: "'Manrope',sans-serif", fontSize: '11px', color: '#8f6f6c', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>Próximo Vencimiento</p>
                <p style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '0.9rem', fontWeight: 700, color: pagosPendientes === 0 ? '#27ae60' : '#af101a' }}>
                  {textoFechaVencimiento === 'No hay pagos pendientes' ? 'Sin deuda' : textoFechaVencimiento}
                </p>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p className="mob-label" style={{ fontFamily: "'Manrope',sans-serif", fontSize: '11px', color: '#8f6f6c', marginBottom: '2px' }}>Colegiatura</p>
              <p className="mob-value" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '0.9rem', fontWeight: 700, color: '#1a1c1d' }}>$3,000 MXN</p>
            </div>
          </section>

          {/* Account Info Card (Mobile) */}
          <section className="mob-card" style={{ backgroundColor: 'white', borderRadius: '16px', padding: '18px 20px', marginBottom: '20px', border: '1px solid rgba(228,190,186,0.15)' }}>
            <h3 className="mob-title" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '1rem', fontWeight: 700, color: '#1a1c1d', marginBottom: '16px' }}>Cuenta Activa</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid rgba(228,190,186,0.2)' }}>
                <span className="mob-label" style={{ fontFamily: "'Manrope',sans-serif", fontSize: '0.875rem', color: '#5b403d' }}>Semestre Actual</span>
                <span className="mob-value" style={{ fontFamily: "'Manrope',sans-serif", fontSize: '0.875rem', fontWeight: 700, color: '#1a1c1d' }}>
                  {userSemestreText}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="mob-label" style={{ fontFamily: "'Manrope',sans-serif", fontSize: '0.875rem', color: '#5b403d' }}>Correo</span>
                <span className="mob-value" style={{ fontFamily: "'Manrope',sans-serif", fontSize: '0.875rem', fontWeight: 700, color: '#1a1c1d', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.email || '—'}
                </span>
              </div>
            </div>
          </section>

          {/* Quick Actions (Mobile) */}
          <section style={{ marginBottom: '20px' }}>
            <h3 className="mob-title" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '1rem', fontWeight: 700, color: '#1a1c1d', marginBottom: '14px' }}>Acciones rápidas</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button onClick={() => setShowInformacion(true)} className="mob-card cursor-pointer text-left" style={{ background: 'white', border: '1px solid rgba(228,190,186,0.2)', borderRadius: '16px', padding: '20px 16px' }}>
                <div className="mob-action-icon" style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: 'rgba(175,16,26,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
                  <span className="material-symbols-outlined" style={{ color: '#af101a', fontSize: '20px' }}>info</span>
                </div>
                <p className="mob-title" style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 700, fontSize: '0.875rem', color: '#1a1c1d', margin: 0 }}>Información</p>
                <p className="mob-sub" style={{ fontFamily: "'Manrope',sans-serif", fontSize: '11px', color: '#8f6f6c', marginTop: '2px' }}>Ver estado de cuenta</p>
              </button>
              
              <button onClick={() => setShowHistorial(true)} className="mob-card cursor-pointer text-left" style={{ background: 'white', border: '1px solid rgba(228,190,186,0.2)', borderRadius: '16px', padding: '20px 16px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: 'rgba(0,95,175,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
                  <span className="material-symbols-outlined" style={{ color: '#005faf', fontSize: '20px' }}>history</span>
                </div>
                <p className="mob-title" style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 700, fontSize: '0.875rem', color: '#1a1c1d', margin: 0 }}>Historial</p>
                <p className="mob-sub" style={{ fontFamily: "'Manrope',sans-serif", fontSize: '11px', color: '#8f6f6c', marginTop: '2px' }}>Pagos realizados</p>
              </button>
              
              <button onClick={() => navigate('/tienda')} className="mob-card cursor-pointer text-left" style={{ background: 'white', border: '1px solid rgba(228,190,186,0.2)', borderRadius: '16px', padding: '20px 16px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: 'rgba(113,83,0,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
                  <span className="material-symbols-outlined" style={{ color: '#715300', fontSize: '20px' }}>storefront</span>
                </div>
                <p className="mob-title" style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 700, fontSize: '0.875rem', color: '#1a1c1d', margin: 0 }}>Tienda</p>
                <p className="mob-sub" style={{ fontFamily: "'Manrope',sans-serif", fontSize: '11px', color: '#8f6f6c', marginTop: '2px' }}>Productos y trámites</p>
              </button>
              
              <button onClick={() => setShowPapeleria(true)} className="mob-card cursor-pointer text-left" style={{ background: 'white', border: '1px solid rgba(228,190,186,0.2)', borderRadius: '16px', padding: '20px 16px' }}>
                <div className="mob-action-icon" style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: 'rgba(175,16,26,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
                  <span className="material-symbols-outlined" style={{ color: '#af101a', fontSize: '20px' }}>edit_note</span>
                </div>
                <p className="mob-title" style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 700, fontSize: '0.875rem', color: '#1a1c1d', margin: 0 }}>Papelería</p>
                <p className="mob-sub" style={{ fontFamily: "'Manrope',sans-serif", fontSize: '11px', color: '#8f6f6c', marginTop: '2px' }}>Subir documentos</p>
              </button>
            </div>
          </section>
        </div>

        {/* Bottom Navigation (Mobile) */}
        <nav className="mob-nav" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 45, display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '0 16px', height: '80px', background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(16px)', borderTop: '1px solid rgba(228,190,186,0.15)', boxShadow: '0 -8px 24px -4px rgba(175,16,26,0.08)', borderRadius: '24px 24px 0 0' }}>
          <a href="#" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', color: '#af101a', textDecoration: 'none', position: 'relative' }}>
            <span style={{ position: 'absolute', width: '64px', height: '40px', background: 'rgba(175,16,26,0.08)', borderRadius: '999px', zIndex: -1 }}></span>
            <span className="material-symbols-outlined" style={{ marginBottom: '4px', fontVariationSettings: "'FILL' 1" }}>dashboard</span>
            <span style={{ fontFamily: "'Manrope',sans-serif", fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Panel</span>
          </a>
          <a onClick={() => navigate('/tienda')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', color: '#64748b', textDecoration: 'none', cursor: 'pointer' }}>
            <span className="material-symbols-outlined" style={{ marginBottom: '4px' }}>shopping_bag</span>
            <span style={{ fontFamily: "'Manrope',sans-serif", fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tienda</span>
          </a>
          <a onClick={() => setSidebarOpen(true)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', color: '#64748b', textDecoration: 'none', cursor: 'pointer' }}>
            <span className="material-symbols-outlined" style={{ marginBottom: '4px' }}>settings</span>
            <span style={{ fontFamily: "'Manrope',sans-serif", fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ajustes</span>
          </a>
        </nav>
      </div>

      {/* RENDER MODALS */}
      <ModalHistorial 
        isOpen={showHistorial} 
        onClose={() => setShowHistorial(false)} 
        style={{ zIndex: 10000 }}
      />

      <ModalInformacion 
        isOpen={showInformacion} 
        onClose={() => setShowInformacion(false)} 
        onSectionSelect={(section) => {
          setSelectedSection(section);
          setShowInformacion(false);
          setShowDetalle(true);
        }}
        style={{ zIndex: 10000 }}
      />

      <ModalDetalle 
        isOpen={showDetalle} 
        onClose={() => {
          setShowDetalle(false);
          setShowInformacion(true);
        }} 
        section={selectedSection}
      />

      <ModalPago 
        isOpen={showPago} 
        onClose={() => setShowPago(false)} 
        total={3000}
        onPaymentSuccess={() => {
          // Re-calculate dates/debt
          const uRaw = localStorage.getItem('user');
          if (uRaw) {
            const uObj = JSON.parse(uRaw);
            const pKey = `perfil_${uObj.id}`;
            const pRaw = localStorage.getItem(pKey);
            const pObj = pRaw ? JSON.parse(pRaw) : uObj;
            actualizarProximoVencimiento(pObj);
          }
        }}
      />

      <ModalPapeleria 
        isOpen={showPapeleria} 
        onClose={() => setShowPapeleria(false)} 
        user={user}
      />

      <ModalPerfil 
        isOpen={showPerfil} 
        onClose={() => setShowPerfil(false)} 
        user={user}
        onProfileUpdate={(updatedUser) => {
          setUser(updatedUser);
          actualizarProximoVencimiento(updatedUser);
        }}
        onRequestConfirm={(titulo, mensaje, onConfirm) => {
          setConfirmData({ title: titulo, message: mensaje, onConfirm });
          setShowConfirmacion(true);
        }}
      />

      <ModalOrientacion 
        isOpen={showOrientacion} 
        onClose={() => setShowOrientacion(false)} 
      />

      <ModalDeuda 
        isOpen={showDeuda} 
        onClose={() => setShowDeuda(false)} 
        cantidad={pagosPendientes}
        onPayClick={handlePay}
      />

      <ModalConfirmacion 
        isOpen={showConfirmacion} 
        onClose={() => setShowConfirmacion(false)} 
        title={confirmData.title}
        message={confirmData.message}
        onConfirm={confirmData.onConfirm}
      />
    </div>
  );
}
