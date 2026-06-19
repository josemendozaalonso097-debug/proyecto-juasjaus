import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkSessionToken } from '../api/auth';
import { showToast } from '../utils/toast';
import { useAuth } from '../hooks/useAuth';
import { useEventos } from '../hooks/useEventos';
import { useFinancial } from '../hooks/useFinancial';

import Sidebar from '../components/Sidebar';
import Chatbot from '../components/Chatbot';
import PerfilModal from '../components/PerfilModal';
import Pago from '../components/Pago';
import Papeleria from '../components/Papeleria';
import OrientacionModal from '../components/OrientacionModal';
import DeudaModal from '../components/DeudaModal';
import HistorialModal from '../components/HistorialModal';
import InformacionModal from '../components/InformacionModal';

import SplashScreen from '../components/principal/SplashScreen';
import { DesktopWelcomeBanner, MobileWelcomeBanner } from '../components/principal/WelcomeBanner';
import EstadoPago from '../components/principal/EstadoPago';
import CuentaActiva from '../components/principal/CuentaActiva';
import FinancierosPanel from '../components/principal/FinancierosPanel';
import EventosList from '../components/principal/EventosList';
import EventoModal from '../components/principal/EventoModal';
import MobileCarousel from '../components/principal/MobileCarousel';
import MobileNextPayment from '../components/principal/MobileNextPayment';
import MobileCuentaActiva from '../components/principal/MobileCuentaActiva';
import MobileQuickActions from '../components/principal/MobileQuickActions';
import MobileBottomNav from '../components/principal/MobileBottomNav';

const DEFAULT_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2394272c'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E";

const getGreeting = () => {
  const h = new Date().getHours();
  if (h >= 6 && h < 12) return { text: 'Buenos días', emoji: '🌅' };
  if (h >= 12 && h < 19) return { text: 'Buenas tardes', emoji: '☀️' };
  return { text: 'Buenas noches', emoji: '🌙' };
};

const getFormattedDate = () => new Date().toLocaleDateString('es-MX', {
  weekday: 'long', day: 'numeric', month: 'long',
});

export default function Principal() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [profileAvatar, setProfileAvatar] = useState(DEFAULT_AVATAR);

  const [sidebarOpen,     setSidebarOpen]     = useState(false);
  const [chatbotOpen,     setChatbotOpen]     = useState(false);
  const [profileOpen,     setProfileOpen]     = useState(false);
  const [pagoOpen,        setPagoOpen]        = useState(false);
  const [papeleriaOpen,   setPapeleriaOpen]   = useState(false);
  const [orientacionOpen, setOrientacionOpen] = useState(false);
  const [deudaOpen,       setDeudaOpen]       = useState(false);
  const [historyOpen,     setHistoryOpen]     = useState(false);
  const [infoOpen,        setInfoOpen]        = useState(false);

  const [showSplash] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('splash') === '1') {
      const url = new URL(window.location.href);
      url.searchParams.delete('splash');
      window.history.replaceState(null, '', url.pathname);
      return true;
    }
    return false;
  });

  const { pendingCount, nextPaymentDateText, nextPaymentDateColor, updateFinancialStatus } = useFinancial();
  const eventoHandlers = useEventos();

  const greeting = getGreeting();
  const formattedDate = getFormattedDate();

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
        nombre:   profile.nombre   || u.nombre   || 'Usuario',
        rol:      profile.rol      || u.rol       || 'estudiante',
        semestre: profile.semestre || u.semestre  || '1',
      });

      const foto = localStorage.getItem(`foto_perfil_${u.id}`);
      if (foto) setProfileAvatar(foto);

      const count = updateFinancialStatus(profile);
      if (count > 0) setDeudaOpen(true);
    } catch (e) {
      console.error('Error parseando datos de sesión:', e);
      navigate('/login');
    }
  }, [navigate, updateFinancialStatus]);

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
        const userPrev = JSON.parse(localStorage.getItem('user') || '{}');
        const merged = { ...userPrev, ...userData };
        localStorage.setItem('user', JSON.stringify(merged));

        const perfilKey = `perfil_${userData.id}`;
        const perfilPrev = JSON.parse(localStorage.getItem(perfilKey) || '{}');
        localStorage.setItem(perfilKey, JSON.stringify({ ...perfilPrev, ...userData }));

        loadProfileData();
        setLoading(false);
      })
      .catch(() => {
        showToast('Error de conexión al verificar sesión', 'error');
        loadProfileData();
        setLoading(false);
      });
  }, [navigate, loadProfileData]);

  const handleLogout = () => {
    if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      showToast('Sesión cerrada correctamente', 'success');
      setTimeout(() => navigate('/login'), 1000);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#f20d0d] flex items-center justify-center z-[99998]">
        <div className="text-center text-white">
          <div className="w-16 h-16 rounded-full border-2 border-white/30 border-t-white animate-spin mx-auto mb-4" />
          <div className="text-lg font-bold">CBTis 258</div>
          <div className="text-[10px] opacity-65 tracking-[3px] uppercase mt-1">Cargando...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <SplashScreen show={showSplash} />

      {/* ── DESKTOP LAYOUT ── */}
      <div className="hidden lg:flex flex-col min-h-screen bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 relative">
        <div className="mesh-bg" aria-hidden="true" />

        <header className="bg-gradient-to-r from-primary to-red-800/90 backdrop-blur-md bg-opacity-90 text-white flex items-center justify-between whitespace-nowrap px-10 py-5 shadow-lg sticky top-0 z-50 border-b border-white/10">
          <div onClick={() => setSidebarOpen(true)} className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity">
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
              <span className="text-sm font-bold text-white">{userProfile?.nombre ?? '—'}</span>
              <div
                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border-2 border-white/50 bg-slate-300"
                style={{ backgroundImage: `url("${profileAvatar}")` }}
              />
            </div>
          </div>
        </header>

        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-[1280px]">
          <DesktopWelcomeBanner
            userProfile={userProfile}
            profileAvatar={profileAvatar}
            pendingCount={pendingCount}
            greeting={greeting}
            formattedDate={formattedDate}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 flex flex-col gap-8">
              <EstadoPago
                pendingCount={pendingCount}
                onOpenInfo={() => setInfoOpen(true)}
                onOpenHistory={() => setHistoryOpen(true)}
              />
            </div>
            <div className="flex flex-col gap-8">
              <CuentaActiva
                userProfile={userProfile}
                nextPaymentDateText={nextPaymentDateText}
                nextPaymentDateColor={nextPaymentDateColor}
              />
              <FinancierosPanel
                onOpenPapeleria={() => setPapeleriaOpen(true)}
                onOpenOrientacion={() => setOrientacionOpen(true)}
                onNavigateTienda={() => navigate('/tienda')}
              />
              <EventosList
                eventos={eventoHandlers.eventos}
                isAdmin={isAdmin}
                onCreate={eventoHandlers.openCreateEvento}
                onEdit={eventoHandlers.openEditEvento}
                onDelete={eventoHandlers.handleDeleteEvento}
              />
            </div>
          </div>
        </main>

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

      {/* ── MOBILE LAYOUT ── */}
      <div className="mobile-only block lg:hidden min-h-screen bg-[#f9f9fb] dark:bg-[#121316] pb-[88px] relative text-slate-900 dark:text-slate-100 font-display">
        <header className="mob-header fixed top-0 left-0 right-0 z-50 bg-white/92 dark:bg-[#1a1c20]/92 backdrop-blur-md border-b border-slate-100 dark:border-[#3c1e1e]/30 h-[64px] flex items-center justify-between px-5">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} style={{ background: 'transparent' }} className="w-10 h-10 rounded-full border-none cursor-pointer flex items-center justify-center text-[#1a1c1d] dark:text-[#f1f1f3]">
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div className="flex items-center gap-2">
              <img src="/imgs/yameharte.png" alt="Logo" className="w-[28px] h-[28px] object-contain" />
              <span className="mob-title font-bold text-[1.1rem] text-[#af101a] dark:text-white">CBTis 258</span>
            </div>
          </div>
          <button onClick={() => setProfileOpen(true)} style={{ background: 'transparent' }} className="border-none cursor-pointer p-0">
            <div className="w-9 h-9 rounded-full bg-center bg-no-repeat bg-cover border-2 border-primary/20 bg-slate-300" style={{ backgroundImage: `url("${profileAvatar}")` }} />
          </button>
        </header>

        <div className="mobile-main-content px-5 pt-[80px]">
          <MobileWelcomeBanner
            userProfile={userProfile}
            profileAvatar={profileAvatar}
            pendingCount={pendingCount}
            greeting={greeting}
            formattedDate={formattedDate}
          />
          <MobileCarousel
            pendingCount={pendingCount}
            eventos={eventoHandlers.eventos}
            isAdmin={isAdmin}
            onOpenInfo={() => setInfoOpen(true)}
            onCreate={eventoHandlers.openCreateEvento}
            onEdit={eventoHandlers.openEditEvento}
            onDelete={eventoHandlers.handleDeleteEvento}
          />
          <MobileNextPayment
            pendingCount={pendingCount}
            nextPaymentDateText={nextPaymentDateText}
            nextPaymentDateColor={nextPaymentDateColor}
          />
          <MobileCuentaActiva userProfile={userProfile} />
          <MobileQuickActions
            onOpenInfo={() => setInfoOpen(true)}
            onOpenHistory={() => setHistoryOpen(true)}
            onOpenOrientacion={() => setOrientacionOpen(true)}
            onOpenPapeleria={() => setPapeleriaOpen(true)}
          />
        </div>

        <MobileBottomNav
          onOpenSidebar={() => setSidebarOpen(true)}
          onNavigateTienda={() => navigate('/tienda?splash=1')}
        />
      </div>

      {/* ── MODALS ── */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onOpenChatbot={() => setChatbotOpen(true)} />
      <Chatbot isOpen={chatbotOpen} onClose={() => setChatbotOpen(false)} />
      <PerfilModal isOpen={profileOpen} onClose={() => setProfileOpen(false)} onProfileUpdate={loadProfileData} />
      <Pago isOpen={pagoOpen} onClose={() => setPagoOpen(false)} cart={[]} clearCart={() => {}} mode="principal" onPaymentSuccess={() => { loadProfileData(); setPagoOpen(false); }} />
      <Papeleria isOpen={papeleriaOpen} onClose={() => setPapeleriaOpen(false)} />
      <OrientacionModal isOpen={orientacionOpen} onClose={() => setOrientacionOpen(false)} />
      <DeudaModal isOpen={deudaOpen} onClose={() => setDeudaOpen(false)} pendingCount={pendingCount} />
      <HistorialModal isOpen={historyOpen} onClose={() => setHistoryOpen(false)} />
      <InformacionModal isOpen={infoOpen} onClose={() => setInfoOpen(false)} />
      <EventoModal {...eventoHandlers} />
    </>
  );
}
