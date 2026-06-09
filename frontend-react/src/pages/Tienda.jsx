import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkSessionToken } from '../api/auth';
import { showToast } from '../utils/toast';
import { useCarrito } from '../components/Carrito';

// Modals and components
import Sidebar from '../components/Sidebar';
import Chatbot from '../components/Chatbot';
import PerfilModal from '../components/PerfilModal';
import Pago from '../components/Pago';
import Papeleria from '../components/Papeleria';
import Productos from '../components/Productos';

export default function Tienda() {
  const navigate = useNavigate();

  // Authentication & session state
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [profileAvatar, setProfileAvatar] = useState("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2394272c'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E");

  // Modal display states
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [pagoOpen, setPagoOpen] = useState(false);
  const [papeleriaOpen, setPapeleriaOpen] = useState(false);

  // Products modal state
  const [productosOpen, setProductosOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('uniformes');

  // Cart logic hook
  const { carrito, agregarAlCarrito, eliminarDelCarrito, vaciarCarrito, calcularTotal } = useCarrito();

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
    } catch (e) {
      console.error('Error parseando datos de sesión en tienda:', e);
      navigate('/login');
    }
  }, [navigate]);

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
        console.error('Session verification error in shop:', err);
        showToast('Error de conexión al verificar sesión', 'error');
        // fall back to offline verification
        loadProfileData();
        setLoading(false);
      });
  }, [navigate, loadProfileData]);

  const handleProfileUpdate = () => {
    loadProfileData();
  };

  const handlePaymentSuccess = () => {
    vaciarCarrito();
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

  const handleOpenCategory = (cat) => {
    setActiveCategory(cat);
    setProductosOpen(true);
  };

  const handlePay = () => {
    if (carrito.length === 0) {
      showToast('Tu carrito está vacío. Agrega productos antes de pagar.', 'warning');
      return;
    }
    setPagoOpen(true);
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

  const total = calcularTotal();

  return (
    <>
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
        <main className="flex-grow flex items-center py-12">
          <div className="max-w-[1200px] mx-auto w-full px-4 md:px-6">
            <div className="flex flex-col lg:flex-row items-start justify-center gap-8">
              
              {/* Products Area */}
              <div className="flex-1 w-full max-w-3xl">
                <div className="mb-10">
                  <h2 className="text-5xl font-black leading-tight tracking-[-0.033em] mb-3 bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent inline-block transform transition-transform hover:scale-[1.02] cursor-default">
                    Productos y Servicios
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 text-lg font-medium leading-normal ml-1">
                    Selecciona los artículos que necesites para tu trámite o estudio institucional.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Category: Papelería */}
                  <div 
                    onClick={() => setPapeleriaOpen(true)} 
                    className="cursor-pointer group bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-slate-100 dark:border-slate-800 flex h-44"
                  >
                    <div className="w-1/3 bg-[#FDF2E9] dark:bg-slate-800 flex items-center justify-center p-4">
                      <img 
                        className="w-full h-auto object-contain transition-transform group-hover:scale-110" 
                        alt="Papelería" 
                        src="https://api.iconify.design/fluent-emoji:pencil.svg?color=%23f20d0d" 
                      />
                    </div>
                    <div className="p-6 flex flex-col justify-between flex-1">
                      <div>
                        <h3 className="font-bold text-xl leading-tight group-hover:text-primary transition-colors text-slate-850 dark:text-white">Subir Papelería</h3>
                        <p className="text-sm text-slate-500 mt-2">Sube la papelería necesaria para tus trámites.</p>
                      </div>
                    </div>
                  </div>

                  {/* Category: Uniformes */}
                  <div 
                    onClick={() => handleOpenCategory('uniformes')} 
                    className="cursor-pointer group bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-slate-100 dark:border-slate-800 flex h-44"
                  >
                    <div className="w-1/3 bg-[#FFF9DB] dark:bg-slate-800 flex items-center justify-center p-4">
                      <img 
                        className="w-full h-auto object-contain transition-transform group-hover:scale-110" 
                        alt="Uniformes" 
                        src="https://api.iconify.design/fluent-emoji:t-shirt.svg" 
                      />
                    </div>
                    <div className="p-6 flex flex-col justify-between flex-1">
                      <div>
                        <h3 className="font-bold text-xl leading-tight group-hover:text-primary transition-colors text-slate-850 dark:text-white">Uniformes</h3>
                        <p className="text-sm text-slate-500 mt-2">Uniformes y credenciales oficiales.</p>
                      </div>
                    </div>
                  </div>

                  {/* Category: Libros */}
                  <div 
                    onClick={() => handleOpenCategory('Libros')} 
                    className="cursor-pointer group bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-slate-100 dark:border-slate-800 flex h-44"
                  >
                    <div className="w-1/3 bg-[#E3FAFC] dark:bg-slate-800 flex items-center justify-center p-4">
                      <img 
                        className="w-full h-auto object-contain transition-transform group-hover:scale-110" 
                        alt="Libros" 
                        src="https://api.iconify.design/fluent-emoji:books.svg?color=%23f20d0d" 
                      />
                    </div>
                    <div className="p-6 flex flex-col justify-between flex-1">
                      <div>
                        <h3 className="font-bold text-xl leading-tight group-hover:text-primary transition-colors text-slate-850 dark:text-white">Libros</h3>
                        <p className="text-sm text-slate-500 mt-2">Libros de texto y manuales de materias.</p>
                      </div>
                    </div>
                  </div>

                  {/* Category: Trámites */}
                  <div 
                    onClick={() => handleOpenCategory('tramites')} 
                    className="cursor-pointer group bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-slate-100 dark:border-slate-800 flex h-44"
                  >
                    <div className="w-1/3 bg-[#EBFBEE] dark:bg-slate-800 flex items-center justify-center p-4">
                      <img 
                        className="w-full h-auto object-contain transition-transform group-hover:scale-110" 
                        alt="Trámites" 
                        src="https://api.iconify.design/fluent-emoji:page-facing-up.svg?color=%23f20d0d" 
                      />
                    </div>
                    <div className="p-6 flex flex-col justify-between flex-1">
                      <div>
                        <h3 className="font-bold text-xl leading-tight group-hover:text-primary transition-colors text-slate-850 dark:text-white">Trámites</h3>
                        <p className="text-sm text-slate-500 mt-2">Certificados, constancias y trámites oficiales.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar: Carrito */}
              <aside className="w-full lg:w-80 space-y-6 flex-shrink-0 sidebar-derecha">
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xl border border-primary/10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12"></div>
                  <div className="flex items-center gap-3 mb-6 relative z-10">
                    <div className="bg-primary/10 text-primary p-2 rounded-lg">
                      <span className="material-symbols-outlined text-primary">shopping_basket</span>
                    </div>
                    <h3 className="font-bold text-lg text-slate-850 dark:text-white">Productos Seleccionados</h3>
                  </div>

                  <div className="space-y-4 mb-4">
                    {carrito.length === 0 ? (
                      <p className="text-center text-slate-400 py-6">
                        No hay productos seleccionados
                      </p>
                    ) : (
                      <>
                        <div className="max-h-[350px] overflow-y-auto space-y-3 pr-1">
                          {carrito.map((item, index) => (
                            <div 
                              key={`${item.id}-${item.tallaSeleccionada || ''}-${index}`}
                              className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-850"
                            >
                              <div className="min-w-0 flex-1 pr-2">
                                <h4 className="text-sm font-bold text-slate-850 dark:text-slate-100 truncate">
                                  {item.nombre}
                                </h4>
                                <p className="text-xs text-slate-500 mt-0.5">
                                  ${item.precio} x {item.cantidad}
                                  {item.tallaSeleccionada ? ` (Talla: ${item.tallaSeleccionada})` : ''}
                                </p>
                              </div>
                              <button 
                                type="button"
                                onClick={() => eliminarDelCarrito(index)}
                                className="bg-red-500 hover:bg-red-650 text-white border-none size-7 rounded-lg flex items-center justify-center cursor-pointer shrink-0"
                              >
                                <span className="material-symbols-outlined text-xs text-white">close</span>
                              </button>
                            </div>
                          ))}
                        </div>
                        <div className="border-t-2 border-primary/25 pt-4 mt-4">
                          <div className="flex justify-between items-center text-slate-850 dark:text-white">
                            <span className="font-bold">Total:</span>
                            <span className="text-xl font-black text-primary">${total.toFixed(2)} MXN</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <button 
                    onClick={handlePay}
                    className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 shadow-lg shadow-primary/20 transition-all active:scale-[0.98] mt-6 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-white">credit_card</span> 
                    PAGAR AHORA
                  </button>
                </div>

                <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
                  <div className="flex gap-3">
                    <span className="material-symbols-outlined text-primary">info</span>
                    <p className="text-xs text-primary font-medium leading-relaxed">
                      Los comprobantes de pago digitales deben presentarse en ventanilla para la entrega de materiales físicos.
                    </p>
                  </div>
                </div>
              </aside>

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
            <a 
              onClick={() => navigate('/principal')}
              className="flex items-center gap-2 text-decoration-none cursor-pointer"
            >
              <img src="/imgs/yameharte.png" alt="Logo" className="w-[28px] h-[28px] object-contain" />
              <span className="mob-title font-bold text-[1.1rem] text-[#af101a] dark:text-white">CBTis 258</span>
            </a>
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
          <section className="mb-6 mt-4">
            <h2 className="mob-title text-[1.75rem] font-extrabold tracking-tight text-[#1a1c1d] dark:text-[#f1f1f3]">Tienda Escolar</h2>
            <p className="mob-sub text-xs text-slate-500 dark:text-[#9b7a78]">Selecciona lo que necesites para tus trámites.</p>
          </section>

          {/* Category List */}
          <div className="flex flex-col gap-3.5 mb-6">
            {/* Uniformes */}
            <div 
              onClick={() => handleOpenCategory('uniformes')} 
              className="mob-card bg-white dark:bg-[#1e2025] rounded-2xl p-5 border border-slate-100 dark:border-[#3c1e1e]/20 cursor-pointer shadow-sm flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-[48px] h-[48px] rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                  <span className="material-symbols-outlined text-[24px]">checkroom</span>
                </div>
                <div>
                  <h3 className="mob-title font-bold text-sm text-[#1a1c1d] dark:text-[#f1f1f3] m-0">Uniformes</h3>
                  <p className="mob-sub text-[11px] text-[#5b403d] dark:text-[#9b7a78] mt-0.5">Tallas oficiales disponibles</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-slate-400">chevron_right</span>
            </div>

            {/* Libros */}
            <div 
              onClick={() => handleOpenCategory('Libros')} 
              className="mob-card bg-white dark:bg-[#1e2025] rounded-2xl p-5 border border-slate-100 dark:border-[#3c1e1e]/20 cursor-pointer shadow-sm flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-[48px] h-[48px] rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                  <span className="material-symbols-outlined text-[24px]">menu_book</span>
                </div>
                <div>
                  <h3 className="mob-title font-bold text-sm text-[#1a1c1d] dark:text-[#f1f1f3] m-0">Libros</h3>
                  <p className="mob-sub text-[11px] text-[#5b403d] dark:text-[#9b7a78] mt-0.5">Guías de estudio oficiales</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-slate-400">chevron_right</span>
            </div>

            {/* Trámites */}
            <div 
              onClick={() => handleOpenCategory('tramites')} 
              className="mob-card bg-white dark:bg-[#1e2025] rounded-2xl p-5 border border-slate-100 dark:border-[#3c1e1e]/20 cursor-pointer shadow-sm flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="mob-action-icon w-[48px] h-[48px] rounded-full bg-[#af101a]/5 dark:bg-[#af101a]/15 flex items-center justify-center text-[#af101a] dark:text-white shrink-0">
                  <span className="material-symbols-outlined text-[24px]">receipt_long</span>
                </div>
                <div>
                  <h3 className="mob-title font-bold text-sm text-[#1a1c1d] dark:text-[#f1f1f3] m-0">Trámites</h3>
                  <p className="mob-sub text-[11px] text-[#5b403d] dark:text-[#9b7a78] mt-0.5">Constancias y certificados</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-slate-400">chevron_right</span>
            </div>

            {/* Papelería */}
            <div 
              onClick={() => setPapeleriaOpen(true)} 
              className="mob-card bg-white dark:bg-[#1e2025] rounded-2xl p-5 border border-slate-100 dark:border-[#3c1e1e]/20 cursor-pointer shadow-sm flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="mob-action-icon w-[48px] h-[48px] rounded-full bg-[#af101a]/5 dark:bg-[#af101a]/15 flex items-center justify-center text-[#af101a] dark:text-white shrink-0">
                  <span className="material-symbols-outlined text-[24px]">edit_note</span>
                </div>
                <div>
                  <h3 className="mob-title font-bold text-sm text-[#1a1c1d] dark:text-[#f1f1f3] m-0">Papelería</h3>
                  <p className="mob-sub text-[11px] text-[#5b403d] dark:text-[#9b7a78] mt-0.5">Sube tu documentación</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-slate-400">chevron_right</span>
            </div>
          </div>

          {/* Floating Cart (Mobile) */}
          {carrito.length > 0 && (
            <div style={{ position: 'fixed', bottom: '96px', left: '16px', right: '16px', zIndex: 44 }}>
              <div className="mob-card bg-white/95 dark:bg-[#1e2025]/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-primary/20">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-base">shopping_bag</span>
                    <span className="mob-title font-bold text-xs text-[#1a1c1d] dark:text-white">Productos seleccionados</span>
                  </div>
                  <span className="text-primary font-black text-sm">${total.toFixed(2)}</span>
                </div>
                
                <button 
                  onClick={handlePay}
                  className="w-full bg-gradient-to-r from-[#af101a] to-[#d32f2f] text-white py-3 rounded-xl font-bold border-none cursor-pointer flex items-center justify-center gap-2 text-sm"
                >
                  <span className="material-symbols-outlined text-white text-sm">credit_card</span>
                  Pagar Ahora
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Nav Bar (Mobile) */}
        <nav className="mob-nav fixed bottom-0 left-0 right-0 z-45 flex justify-around items-center px-4 h-20 bg-white/92 dark:bg-[#1a1c20]/92 backdrop-blur-md border-t border-slate-100 dark:border-[#3c1e1e]/20 shadow-lg rounded-t-3xl">
          <a 
            onClick={() => navigate('/principal')}
            className="flex flex-col items-center justify-center w-full h-full text-slate-500 dark:text-[#9b7a78] cursor-pointer"
          >
            <span className="material-symbols-outlined mb-1">dashboard</span>
            <span className="text-[10px] font-bold uppercase tracking-wider">Panel</span>
          </a>
          <a href="#" className="flex flex-col items-center justify-center w-full h-full text-[#af101a] relative">
            <span className="absolute w-16 h-10 bg-[#af101a]/8 rounded-full z-[-1]"></span>
            <span className="material-symbols-outlined mb-1 text-[FILL] font-variation-settings-['FILL'_1]">shopping_bag</span>
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
        cart={carrito} 
        clearCart={vaciarCarrito} 
        mode="tienda" 
        onPaymentSuccess={handlePaymentSuccess} 
      />

      <Papeleria 
        isOpen={papeleriaOpen} 
        onClose={() => setPapeleriaOpen(false)} 
      />

      <Productos 
        isOpen={productosOpen} 
        onClose={() => setProductosOpen(false)} 
        categoria={activeCategory} 
        onAgregarAlCarrito={agregarAlCarrito} 
      />
    </>
  );
}
