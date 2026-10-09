import { lazy, Suspense, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkSessionToken } from '../api/auth';
import { showToast } from '../utils/toast';
import { useAuth } from '../hooks/useAuth';
import { useEventos } from '../hooks/useEventos';
import { useFinancial } from '../hooks/useFinancial';
import { useCustomization } from '../hooks/useCustomization';

import AppHeader from '../components/AppHeader';

import SplashScreen from '../components/principal/SplashScreen';
import { DesktopWelcomeBanner, MobileWelcomeBanner } from '../components/principal/WelcomeBanner';
import EstadoPago from '../components/principal/EstadoPago';
import FinancierosPanel from '../components/principal/FinancierosPanel';
import EventosList from '../components/principal/EventosList';
import CalendarioEventos from '../components/principal/CalendarioEventos';
import MobileCarousel from '../components/principal/MobileCarousel';
import MobileNextPayment from '../components/principal/MobileNextPayment';
import MobileQuickActions from '../components/principal/MobileQuickActions';
import MobileBottomNav from '../components/principal/MobileBottomNav';
import CuentaActivaCarousel from '../components/principal/CuentaActivaCarousel';
import GuidedTour from '../components/principal/GuidedTour';

const Sidebar = lazy(() => import('../components/Sidebar'));
const Chatbot = lazy(() => import('../components/Chatbot'));
const PerfilModal = lazy(() => import('../components/PerfilModal'));
const Pago = lazy(() => import('../components/Pago'));
const Papeleria = lazy(() => import('../components/Papeleria'));
const OrientacionModal = lazy(() => import('../components/OrientacionModal'));
const DeudaModal = lazy(() => import('../components/DeudaModal'));
const HistorialModal = lazy(() => import('../components/HistorialModal'));
const InformacionModal = lazy(() => import('../components/InformacionModal'));
const SeguimientoModal = lazy(() => import('../components/SeguimientoModal'));
const EventoModal = lazy(() => import('../components/principal/EventoModal'));

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
  const { getCustomization } = useCustomization();
  const cbtisTheme = getCustomization('cbtis');
  const financeTheme = getCustomization('finanzas');
  const visibleSections = cbtisTheme.sections || [];
  const financeSections = financeTheme.sections || [];
  const hasFinancialServices = ['tramites', 'seguimiento', 'orientacion', 'tienda'].some((section) => visibleSections.includes(section)) && financeSections.length > 0;

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
  const [seguimientoOpen, setSeguimientoOpen] = useState(false);

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

  const scrollToSection = useCallback((id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

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
  }, [navigate, updateFinancialStatus, setDeudaOpen]);

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
      <GuidedTour userId={userProfile?.id} />

      {/* ── DESKTOP LAYOUT ── */}
      <div className="hidden lg:flex flex-col min-h-screen bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 relative" style={{ backgroundColor: cbtisTheme.backgroundColor }}>
        <div className="mesh-bg" aria-hidden="true" />

        <AppHeader
          userProfile={userProfile}
          profileAvatar={profileAvatar}
          onOpenMenu={() => setSidebarOpen(true)}
          onOpenProfile={() => setProfileOpen(true)}
          theme={cbtisTheme}
        />

        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-[1280px]">
          {isAdmin && <div className="mb-5 flex justify-end"><button type="button" onClick={() => navigate('/admin?tab=personalizacion')} className="inline-flex items-center gap-2 rounded-xl border border-primary/20 bg-white px-4 py-2.5 text-sm font-bold text-primary shadow-sm transition hover:bg-primary/5 dark:bg-slate-900"><span className="material-symbols-outlined text-lg">palette</span>Personalizar portal</button></div>}
          <DesktopWelcomeBanner
            userProfile={userProfile}
            profileAvatar={profileAvatar}
            pendingCount={pendingCount}
            greeting={greeting}
            formattedDate={formattedDate}
            theme={cbtisTheme}
          />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 flex flex-col gap-8">
              {visibleSections.includes('pagos') && <EstadoPago
                pendingCount={pendingCount}
                userId={userProfile?.id}
                onOpenInfo={() => setInfoOpen(true)}
                onOpenHistory={() => setHistoryOpen(true)}
              />}
            </div>
            <div className="flex flex-col gap-8">
              {visibleSections.includes('pagos') && <CuentaActivaCarousel
                userProfile={userProfile}
                nextPaymentDateText={nextPaymentDateText}
                nextPaymentDateColor={nextPaymentDateColor}
                pendingCount={pendingCount}
                eventos={eventoHandlers.eventos}
                onOpenInfo={() => setInfoOpen(true)}
                onViewEvents={() => scrollToSection('eventos-avisos')}
                variant="desktop"
              />}
              {hasFinancialServices && <FinancierosPanel
                onOpenPapeleria={() => setPapeleriaOpen(true)}
                onOpenOrientacion={() => setOrientacionOpen(true)}
                onOpenSeguimiento={() => setSeguimientoOpen(true)}
                onNavigateTienda={() => navigate('/tienda')}
                userId={userProfile?.id}
                theme={financeTheme}
              />}
              {visibleSections.includes('eventos') && <EventosList
                eventos={eventoHandlers.eventos}
                userId={userProfile?.id}
                isAdmin={isAdmin}
                onCreate={eventoHandlers.openCreateEvento}
                onEdit={eventoHandlers.openEditEvento}
                onDelete={eventoHandlers.handleDeleteEvento}
              />}
              {visibleSections.includes('eventos') && <CalendarioEventos
                eventos={eventoHandlers.eventos}
                isAdmin={isAdmin}
                onCreate={eventoHandlers.openCreateEvento}
                onEdit={eventoHandlers.openEditEvento}
                onDelete={eventoHandlers.handleDeleteEvento}
              />}
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
      <div className="mobile-only block lg:hidden min-h-screen bg-[#f9f9fb] dark:bg-[#121316] pb-[88px] relative text-slate-900 dark:text-slate-100 font-display" style={{ backgroundColor: cbtisTheme.backgroundColor }}>
        <AppHeader
          userProfile={userProfile}
          profileAvatar={profileAvatar}
          onOpenMenu={() => setSidebarOpen(true)}
          onOpenProfile={() => setProfileOpen(true)}
          theme={cbtisTheme}
        />

        <div className="mobile-main-content px-5 pt-[80px]">
          {isAdmin && <button type="button" onClick={() => navigate('/admin?tab=personalizacion')} className="mb-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-primary/20 bg-white px-4 py-3 text-sm font-bold text-primary shadow-sm dark:bg-slate-900"><span className="material-symbols-outlined text-lg">palette</span>Personalizar portal</button>}
          <MobileWelcomeBanner
            userProfile={userProfile}
            profileAvatar={profileAvatar}
            pendingCount={pendingCount}
            greeting={greeting}
            formattedDate={formattedDate}
            theme={cbtisTheme}
          />
          {visibleSections.includes('eventos') && <MobileCarousel
            pendingCount={pendingCount}
            eventos={eventoHandlers.eventos}
            isAdmin={isAdmin}
            onOpenInfo={() => setInfoOpen(true)}
            onCreate={eventoHandlers.openCreateEvento}
            onEdit={eventoHandlers.openEditEvento}
            onDelete={eventoHandlers.handleDeleteEvento}
          />}
          {visibleSections.includes('pagos') && <MobileNextPayment
            pendingCount={pendingCount}
            nextPaymentDateText={nextPaymentDateText}
            nextPaymentDateColor={nextPaymentDateColor}
            userId={userProfile?.id}
          />}
          {visibleSections.includes('pagos') && <CuentaActivaCarousel
            userProfile={userProfile}
            nextPaymentDateText={nextPaymentDateText}
            nextPaymentDateColor={nextPaymentDateColor}
            pendingCount={pendingCount}
            eventos={eventoHandlers.eventos}
            onOpenInfo={() => setInfoOpen(true)}
            onViewEvents={() => scrollToSection('eventos-avisos')}
            variant="mobile"
          />}
          {hasFinancialServices && <MobileQuickActions
            onOpenInfo={() => setInfoOpen(true)}
            onOpenHistory={() => setHistoryOpen(true)}
            onOpenOrientacion={() => setOrientacionOpen(true)}
            onOpenPapeleria={() => setPapeleriaOpen(true)}
            onOpenSeguimiento={() => setSeguimientoOpen(true)}
            userId={userProfile?.id}
            sections={financeSections}
          />}
        </div>

        <MobileBottomNav
          onOpenSidebar={() => setSidebarOpen(true)}
          onNavigateTienda={() => navigate('/tienda?splash=1')}
          showStore={hasFinancialServices && visibleSections.includes('tienda') && financeSections.includes('tienda')}
        />
      </div>

      {/* ── MODALS ── */}
      <Suspense fallback={null}>
        {sidebarOpen && <Sidebar isOpen onClose={() => setSidebarOpen(false)} onOpenChatbot={() => setChatbotOpen(true)} />}
        {chatbotOpen && <Chatbot isOpen onClose={() => setChatbotOpen(false)} />}
        {profileOpen && <PerfilModal isOpen onClose={() => setProfileOpen(false)} onProfileUpdate={loadProfileData} />}
        {pagoOpen && <Pago isOpen onClose={() => setPagoOpen(false)} cart={[]} clearCart={() => {}} mode="principal" onPaymentSuccess={() => { loadProfileData(); setPagoOpen(false); }} />}
        {papeleriaOpen && <Papeleria isOpen onClose={() => setPapeleriaOpen(false)} />}
        {orientacionOpen && <OrientacionModal isOpen onClose={() => setOrientacionOpen(false)} />}
        {deudaOpen && <DeudaModal isOpen onClose={() => setDeudaOpen(false)} pendingCount={pendingCount} />}
        {historyOpen && <HistorialModal isOpen onClose={() => setHistoryOpen(false)} />}
        {seguimientoOpen && <SeguimientoModal isOpen onClose={() => setSeguimientoOpen(false)} />}
        {infoOpen && <InformacionModal isOpen onClose={() => setInfoOpen(false)} />}
        {eventoHandlers.eventoModal && <EventoModal {...eventoHandlers} />}
      </Suspense>
    </>
  );
}
