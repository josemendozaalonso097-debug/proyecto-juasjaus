import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './TiendaPage.css';

// Components
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import Sidebar from '../components/Sidebar.jsx';

// Modals
import ModalPago from '../components/modals/ModalPago.jsx';
import ModalPapeleria from '../components/modals/ModalPapeleria.jsx';
import ModalPerfil from '../components/modals/ModalPerfil.jsx';

// Data & Utils
import { productosData } from '../api/tienda.js';
import { checkSessionToken } from '../api/auth.js';
import { obtenerHistorial } from '../utils/storage.js';

const showToast = (message, type = 'info') => {
  if (window.showToast) {
    window.showToast(message, type);
  } else {
    console.log(`[Toast ${type}]: ${message}`);
  }
};

// ----- Libros por Semestre Mapping -----
const librosPorSemestre = {
  1: [6, 7, 8, 9, 10, 11, 13],
  2: [6, 7, 8, 9, 10, 11, 12],
  3: [6, 7, 8, 9, 10, 11, 14],
  4: [6, 7, 8, 9, 10, 11, 15, 17],
  5: [6, 7, 8, 9, 10, 11, 15, 16, 17, 18],
  6: [6, 7, 8, 9, 10, 11, 19]
};
const semestresLabels = ['1er', '2do', '3er', '4to', '5to', '6to'];

export default function TiendaPage() {
  const navigate = useNavigate();

  // User / Auth
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // UI states
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showPago, setShowPago] = useState(false);
  const [showPapeleria, setShowPapeleria] = useState(false);
  const [showPerfil, setShowPerfil] = useState(false);

  // Product Modal
  const [showProductModal, setShowProductModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalIcon, setModalIcon] = useState('shopping_bag');
  const [modalProducts, setModalProducts] = useState([]);
  const [currentCategory, setCurrentCategory] = useState('');
  const [activeLibroTab, setActiveLibroTab] = useState(1);
  const [isLibrosCategory, setIsLibrosCategory] = useState(false);

  // Size selections per product (keyed by product id)
  const [selectedSizes, setSelectedSizes] = useState({});

  // Cart
  const [carrito, setCarrito] = useState([]);

  // Initialize cart from localStorage on mount
  useEffect(() => {
    const carritoGuardado = localStorage.getItem('carrito');
    if (carritoGuardado) {
      try {
        setCarrito(JSON.parse(carritoGuardado));
      } catch (e) {
        setCarrito([]);
      }
    }
  }, []);

  // Persist cart on changes
  useEffect(() => {
    localStorage.setItem('carrito', JSON.stringify(carrito));
  }, [carrito]);

  // Auth check
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
        console.log('✅ Usuario autenticado en la tienda:', userData.nombre);

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

        // Apply dark mode
        const storedPrefs = localStorage.getItem(`prefs_${userData.id}`);
        if (storedPrefs) {
          const parsedPrefs = JSON.parse(storedPrefs);
          if (parsedPrefs.darkMode) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error:', error);
        showToast('Error al verificar la sesión', 'error');
        setTimeout(() => navigate('/login'), 1200);
      }
    };

    verifySession();
  }, [navigate]);

  // Expose window functions for chatbot integration
  useEffect(() => {
    window.abrirModalPapeleria = () => setShowPapeleria(true);
    window.cerrarModalPapeleria = () => setShowPapeleria(false);

    return () => {
      delete window.abrirModalPapeleria;
      delete window.cerrarModalPapeleria;
    };
  }, []);

  // ========== CART FUNCTIONS ==========
  const calcularTotal = () => carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);

  const eliminarDelCarrito = (index) => {
    setCarrito(prev => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });
    showToast('Producto eliminado del carrito', 'info');
  };

  const vaciarCarrito = () => {
    setCarrito([]);
    localStorage.removeItem('carrito');
  };

  // ========== PRODUCT MODAL ==========
  const titulos = {
    uniformes: 'Uniformes y Credenciales',
    Libros: 'Libros',
    libros: 'Libros',
    tramites: 'Trámites y Documentos',
  };

  const iconos = {
    uniformes: 'apparel',
    Libros: 'menu_book',
    libros: 'menu_book',
    tramites: 'description',
  };

  const abrirModal = (categoria) => {
    setModalTitle(titulos[categoria] || 'Productos');
    setModalIcon(iconos[categoria] || 'shopping_bag');
    setCurrentCategory(categoria);

    const productos = productosData[categoria] || [];

    if (categoria === 'Libros') {
      setIsLibrosCategory(true);
      setActiveLibroTab(1);
      const ids = librosPorSemestre[1] || [];
      setModalProducts(productos.filter(p => ids.includes(p.id)));
    } else {
      setIsLibrosCategory(false);
      setModalProducts(productos);
    }

    // Reset size selections
    setSelectedSizes({});
    setShowProductModal(true);
  };

  const cerrarModal = () => {
    setShowProductModal(false);
  };

  const cambiarTabLibros = (sem) => {
    setActiveLibroTab(sem);
    const productos = productosData['Libros'] || [];
    const ids = librosPorSemestre[sem] || [];
    setModalProducts(productos.filter(p => ids.includes(p.id)));
  };

  const handleSizeSelect = (productId, size) => {
    setSelectedSizes(prev => ({ ...prev, [productId]: size }));
  };

  const verificarLimiteColegiatura = (callback) => {
    const rol = (user?.rol || 'estudiante').toLowerCase();
    if (rol !== 'estudiante') {
      callback();
      return;
    }

    const semestreDelUsuario = parseInt(user?.semestre || '1', 10) || 1;
    const maxPagosPermitidos = Math.max(0, (6 - semestreDelUsuario) + 1);

    const historial = obtenerHistorial() || [];
    let count = 0;
    historial.forEach(compra => {
      if (compra.productos && compra.productos.some(p => p.nombre.toLowerCase().includes('colegiatura'))) {
        count++;
      }
    });

    if (count >= maxPagosPermitidos) {
      if (window.confirm(`Has alcanzado tu límite de ${maxPagosPermitidos} pagos de colegiatura. ¿Deseas realizar otro pago adicional?`)) {
        callback();
      }
    } else {
      callback();
    }
  };

  const agregarAlCarrito = (producto) => {
    const addToCart = () => {
      const prodCopy = { ...producto };

      if (prodCopy.tallas || prodCopy.semestre) {
        prodCopy.tallaSeleccionada = selectedSizes[prodCopy.id] || (prodCopy.tallas ? 'S' : 'II');
      }

      setCarrito(prev => {
        const existente = prev.find(item =>
          item.id === prodCopy.id &&
          (!item.tallaSeleccionada || item.tallaSeleccionada === prodCopy.tallaSeleccionada)
        );

        if (existente) {
          return prev.map(item =>
            item.id === existente.id && item.tallaSeleccionada === existente.tallaSeleccionada
              ? { ...item, cantidad: item.cantidad + 1 }
              : item
          );
        } else {
          return [...prev, { ...prodCopy, cantidad: 1 }];
        }
      });

      showToast(`${prodCopy.nombre} agregado al carrito`, 'success');
      cerrarModal();
    };

    if (producto.nombre && producto.nombre.toLowerCase().includes('colegiatura')) {
      verificarLimiteColegiatura(addToCart);
    } else {
      addToCart();
    }
  };

  // ========== PAY HANDLER ==========
  const handlePay = () => {
    if (carrito.length === 0) {
      showToast('No hay productos en el carrito', 'warning');
      return;
    }
    setShowPago(true);
  };

  const handleLogout = () => {
    if (window.confirm('¿Estás seguro que deseas cerrar sesión?')) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      showToast('Sesión cerrada correctamente', 'success');
      setTimeout(() => navigate('/login'), 1000);
    }
  };

  // ========== LOADING ==========
  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[99998] bg-[#f20d0d] flex items-center justify-center text-white">
        <div className="text-center">
          <div className="w-16 h-16 border-[2.5px] border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-lg font-bold">CBTis 258</h2>
          <p className="text-xs opacity-70 uppercase tracking-widest mt-1">Cargando tienda...</p>
        </div>
      </div>
    );
  }

  const userNombre = user?.nombre || 'Usuario';
  const total = calcularTotal();

  // ========== RENDER ==========
  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen flex flex-col relative">
      <div className="mesh-bg" aria-hidden="true"></div>

      {/* HEADER */}
      <Header
        userName={userNombre}
        onMenuClick={() => setSidebarOpen(true)}
        onProfileClick={() => setShowPerfil(true)}
      />

      {/* SIDEBAR */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpenChatbot={() => {
          if (window.abrirChatbot) window.abrirChatbot();
          else showToast('El asistente CobraBot no está cargado.', 'warning');
        }}
      />

      {/* ======================== DESKTOP LAYOUT ======================== */}
      <main className="flex-grow flex items-center py-12">
        <div className="max-w-[1200px] mx-auto w-full px-4 md:px-6">
          <div className="flex flex-col lg:flex-row items-start justify-center gap-8">
            {/* Main Content Area */}
            <div className="flex-1 w-full max-w-3xl">
              <div className="mb-10">
                <h2 className="text-5xl font-black leading-tight tracking-[-0.033em] mb-3 bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent inline-block transform transition-transform hover:scale-[1.02] cursor-default">Productos y Servicios</h2>
                <p className="text-slate-500 dark:text-slate-400 text-lg font-medium leading-normal ml-1">Selecciona los artículos que necesites para tu trámite o estudio institucional.</p>
              </div>

              {/* Grid of Products */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Papelería */}
                <div
                  onClick={() => setShowPapeleria(true)}
                  className="cursor-pointer group bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-slate-100 dark:border-slate-800 flex h-44"
                >
                  <div className="w-1/3 bg-[#FDF2E9] dark:bg-slate-800 flex items-center justify-center p-4">
                    <span className="material-symbols-outlined text-5xl text-primary/60 group-hover:scale-110 transition-transform">edit_note</span>
                  </div>
                  <div className="p-6 flex flex-col justify-between flex-1">
                    <div>
                      <h3 className="font-bold text-xl leading-tight group-hover:text-primary transition-colors">Subir Papelería</h3>
                      <p className="text-sm text-slate-500 mt-2">Sube la papelería necesaria para tus trámites.</p>
                    </div>
                  </div>
                </div>

                {/* Uniformes */}
                <div
                  onClick={() => abrirModal('uniformes')}
                  className="cursor-pointer group bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-slate-100 dark:border-slate-800 flex h-44"
                >
                  <div className="w-1/3 bg-[#FFF9DB] dark:bg-slate-800 flex items-center justify-center p-4">
                    <img className="w-full h-auto object-contain transition-transform group-hover:scale-110" alt="Uniformes" src="https://api.iconify.design/fluent-emoji:t-shirt.svg" />
                  </div>
                  <div className="p-6 flex flex-col justify-between flex-1">
                    <div>
                      <h3 className="font-bold text-xl leading-tight group-hover:text-primary transition-colors">Uniformes</h3>
                      <p className="text-sm text-slate-500 mt-2">Uniformes y credenciales oficiales.</p>
                    </div>
                  </div>
                </div>

                {/* Libros */}
                <div
                  onClick={() => abrirModal('Libros')}
                  className="cursor-pointer group bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-slate-100 dark:border-slate-800 flex h-44"
                >
                  <div className="w-1/3 bg-[#E3FAFC] dark:bg-slate-800 flex items-center justify-center p-4">
                    <span className="material-symbols-outlined text-5xl text-cyan-600/60 group-hover:scale-110 transition-transform">menu_book</span>
                  </div>
                  <div className="p-6 flex flex-col justify-between flex-1">
                    <div>
                      <h3 className="font-bold text-xl leading-tight group-hover:text-primary transition-colors">Libros</h3>
                      <p className="text-sm text-slate-500 mt-2">Libros de texto y manuales.</p>
                    </div>
                  </div>
                </div>

                {/* Trámites */}
                <div
                  onClick={() => abrirModal('tramites')}
                  className="cursor-pointer group bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-slate-100 dark:border-slate-800 flex h-44"
                >
                  <div className="w-1/3 bg-[#EBFBEE] dark:bg-slate-800 flex items-center justify-center p-4">
                    <span className="material-symbols-outlined text-5xl text-green-600/60 group-hover:scale-110 transition-transform">receipt_long</span>
                  </div>
                  <div className="p-6 flex flex-col justify-between flex-1">
                    <div>
                      <h3 className="font-bold text-xl leading-tight group-hover:text-primary transition-colors">Trámites</h3>
                      <p className="text-sm text-slate-500 mt-2">Certificados y constancias oficiales.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sidebar (Cart) */}
            <aside className="w-full lg:w-80 space-y-6 flex-shrink-0 sidebar-derecha">
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xl border border-primary/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12"></div>
                <div className="flex items-center gap-3 mb-6 relative z-10">
                  <div className="bg-primary/10 text-primary p-2 rounded-lg">
                    <span className="material-symbols-outlined">shopping_basket</span>
                  </div>
                  <h3 className="font-bold text-lg">Productos Seleccionados</h3>
                </div>

                <div className="space-y-4 mb-4">
                  {carrito.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#999', padding: '20px' }}>No hay productos seleccionados</p>
                  ) : (
                    <>
                      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {carrito.map((item, index) => (
                          <div key={index} className="carrito-item-wrap" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderBottom: '1px solid #eee', marginBottom: '8px' }}>
                            <div>
                              <h4 style={{ fontSize: '0.95em', color: '#94272C', marginBottom: '4px', fontWeight: 700 }}>{item.nombre}</h4>
                              <p style={{ fontSize: '0.85em', color: '#666' }}>
                                ${item.precio} x {item.cantidad}
                                {item.tallaSeleccionada ? ` - Talla: ${item.tallaSeleccionada}` : ''}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => eliminarDelCarrito(index)}
                              style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85em' }}
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                      <div style={{ borderTop: '2px solid #94272C', paddingTop: '15px', marginTop: '15px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.3em', fontWeight: 700, color: '#94272C' }}>
                          <span>Total:</span>
                          <span>${total.toFixed(2)}</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <button
                  onClick={handlePay}
                  className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 shadow-lg shadow-primary/20 transition-all active:scale-[0.98] mt-6"
                >
                  <span className="material-symbols-outlined">credit_card</span> PAGAR AHORA
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
      <Footer onLogout={handleLogout} />

      {/* ======================== MOBILE LAYOUT ======================== */}
      <div className="tienda-mobile-only lg:hidden" style={{ minHeight: '100dvh', background: '#f9f9fb', paddingBottom: '88px' }}>
        {/* Mobile Header */}
        <header className="mob-header" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, background: 'rgba(249,249,251,0.92)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(228,190,186,0.15)', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px' }}>
          <a onClick={() => navigate('/principal?splash=1')} style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', cursor: 'pointer' }}>
            <img src="/imgs/yameharte.png" alt="Logo" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
            <span className="mob-title" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: '1.1rem', color: '#af101a' }}>CBTis 258</span>
          </a>
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

        <div className="mobile-main-content" style={{ padding: '80px 20px 0' }}>
          {/* Hero */}
          <section style={{ marginBottom: '24px', marginTop: '16px' }}>
            <h2 className="mob-title" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#1a1c1d', marginBottom: '6px' }}>
              Tienda Escolar
            </h2>
            <p className="mob-sub" style={{ fontFamily: "'Manrope',sans-serif", fontSize: '0.875rem', color: '#5b403d' }}>Selecciona lo que necesites.</p>
          </section>

          {/* Categories */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
            {/* Papelería */}
            <div onClick={() => setShowPapeleria(true)} className="mob-card" style={{ position: 'relative', overflow: 'hidden', background: 'white', borderRadius: '14px', padding: '20px', border: '1px solid rgba(228,190,186,0.15)', cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div className="mob-action-icon" style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(175,16,26,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#af101a', flexShrink: 0 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>edit_note</span>
                  </div>
                  <div>
                    <h3 className="mob-title" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '1rem', fontWeight: 700, color: '#1a1c1d', margin: '0 0 2px' }}>Papelería</h3>
                    <p className="mob-sub" style={{ fontFamily: "'Manrope',sans-serif", fontSize: '12px', color: '#5b403d', margin: 0 }}>Sube tu documentación</p>
                  </div>
                </div>
                <span className="material-symbols-outlined mob-sub" style={{ color: '#8f6f6c' }}>chevron_right</span>
              </div>
            </div>

            {/* Uniformes */}
            <div onClick={() => abrirModal('uniformes')} className="mob-card" style={{ position: 'relative', overflow: 'hidden', background: 'white', borderRadius: '14px', padding: '20px', border: '1px solid rgba(228,190,186,0.15)', cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(0,95,175,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#005faf', flexShrink: 0 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>checkroom</span>
                  </div>
                  <div>
                    <h3 className="mob-title" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '1rem', fontWeight: 700, color: '#1a1c1d', margin: '0 0 2px' }}>Uniformes</h3>
                    <p className="mob-sub" style={{ fontFamily: "'Manrope',sans-serif", fontSize: '12px', color: '#5b403d', margin: 0 }}>Tallas S, M, L disponibles</p>
                  </div>
                </div>
                <span className="material-symbols-outlined mob-sub" style={{ color: '#8f6f6c' }}>chevron_right</span>
              </div>
            </div>

            {/* Libros */}
            <div onClick={() => abrirModal('Libros')} className="mob-card" style={{ position: 'relative', overflow: 'hidden', background: 'white', borderRadius: '14px', padding: '20px', border: '1px solid rgba(228,190,186,0.15)', cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(113,83,0,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#715300', flexShrink: 0 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>menu_book</span>
                  </div>
                  <div>
                    <h3 className="mob-title" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '1rem', fontWeight: 700, color: '#1a1c1d', margin: '0 0 2px' }}>Libros</h3>
                    <p className="mob-sub" style={{ fontFamily: "'Manrope',sans-serif", fontSize: '12px', color: '#5b403d', margin: 0 }}>Guías de estudio oficiales</p>
                  </div>
                </div>
                <span className="material-symbols-outlined mob-sub" style={{ color: '#8f6f6c' }}>chevron_right</span>
              </div>
            </div>

            {/* Trámites */}
            <div onClick={() => abrirModal('tramites')} className="mob-card" style={{ position: 'relative', overflow: 'hidden', background: 'white', borderRadius: '14px', padding: '20px', border: '1px solid rgba(228,190,186,0.15)', cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div className="mob-action-icon" style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(175,16,26,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#af101a', flexShrink: 0 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>receipt_long</span>
                  </div>
                  <div>
                    <h3 className="mob-title" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '1rem', fontWeight: 700, color: '#1a1c1d', margin: '0 0 2px' }}>Trámites</h3>
                    <p className="mob-sub" style={{ fontFamily: "'Manrope',sans-serif", fontSize: '12px', color: '#5b403d', margin: 0 }}>Constancias y certificados</p>
                  </div>
                </div>
                <span className="material-symbols-outlined mob-sub" style={{ color: '#8f6f6c' }}>chevron_right</span>
              </div>
            </div>
          </div>

          {/* Floating Cart (mobile) */}
          {carrito.length > 0 && (
            <div style={{ position: 'fixed', bottom: '96px', left: '16px', right: '16px', zIndex: 44 }}>
              <div className="mob-card" style={{ background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(16px)', borderRadius: '16px', padding: '16px 20px', boxShadow: '0 8px 32px -8px rgba(175,16,26,0.2)', border: '1px solid rgba(228,190,186,0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className="material-symbols-outlined" style={{ color: '#af101a', fontSize: '20px' }}>shopping_bag</span>
                    <span className="mob-title" style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 700, color: '#1a1c1d', fontSize: '0.875rem' }}>
                      {carrito.length} producto(s) — ${total.toFixed(2)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handlePay}
                  style={{ width: '100%', background: 'linear-gradient(135deg,#af101a,#d32f2f)', color: 'white', borderRadius: '12px', padding: '14px', fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: "'Manrope',sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.9rem' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>credit_card</span>
                  Pagar Ahora
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Nav */}
        <nav className="mob-nav" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 45, display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '0 16px', height: '80px', background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(16px)', borderTop: '1px solid rgba(228,190,186,0.15)', boxShadow: '0 -8px 24px -4px rgba(175,16,26,0.08)', borderRadius: '24px 24px 0 0' }}>
          <a onClick={() => navigate('/principal?splash=1')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', color: '#64748b', textDecoration: 'none', cursor: 'pointer' }}>
            <span className="material-symbols-outlined" style={{ marginBottom: '4px' }}>dashboard</span>
            <span style={{ fontFamily: "'Manrope',sans-serif", fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Panel</span>
          </a>
          <a href="#" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', color: '#af101a', textDecoration: 'none', position: 'relative' }}>
            <span style={{ position: 'absolute', width: '64px', height: '40px', background: 'rgba(175,16,26,0.08)', borderRadius: '999px', zIndex: -1 }}></span>
            <span className="material-symbols-outlined" style={{ marginBottom: '4px', fontVariationSettings: "'FILL' 1" }}>shopping_bag</span>
            <span style={{ fontFamily: "'Manrope',sans-serif", fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tienda</span>
          </a>
          <a onClick={() => setSidebarOpen(true)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', color: '#64748b', textDecoration: 'none', cursor: 'pointer' }}>
            <span className="material-symbols-outlined" style={{ marginBottom: '4px' }}>settings</span>
            <span style={{ fontFamily: "'Manrope',sans-serif", fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ajustes</span>
          </a>
        </nav>
      </div>

      {/* ======================== PRODUCT MODAL ======================== */}
      {showProductModal && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget) cerrarModal(); }}
        >
          <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-200 dark:border-slate-800">
            {/* Modal Header */}
            <header className="bg-gradient-to-r from-primary to-red-700 px-6 py-4 flex items-center justify-between shadow-md shrink-0">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-white text-2xl">{modalIcon}</span>
                <h2 className="text-white text-xl font-bold tracking-tight">{modalTitle}</h2>
              </div>
              <button className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg" onClick={cerrarModal}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </header>

            {/* Libros Tabs */}
            {isLibrosCategory && (
              <div className="dark:bg-slate-900" style={{ display: 'flex', borderBottom: '2px solid #e2e8f0', padding: '0 20px', overflowX: 'auto' }}>
                {semestresLabels.map((label, i) => {
                  const sem = i + 1;
                  const isActive = activeLibroTab === sem;
                  return (
                    <button
                      key={sem}
                      onClick={() => cambiarTabLibros(sem)}
                      style={{
                        flex: 1,
                        padding: '13px 6px',
                        border: 'none',
                        borderBottom: isActive ? '3px solid #f20d0d' : '3px solid transparent',
                        background: 'transparent',
                        color: isActive ? '#f20d0d' : '#64748b',
                        fontWeight: isActive ? 700 : 500,
                        fontSize: '0.88em',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        fontFamily: 'inherit',
                        whiteSpace: 'nowrap',
                        marginBottom: '-2px',
                        textAlign: 'center'
                      }}
                    >
                      {label} Sem
                    </button>
                  );
                })}
              </div>
            )}

            {/* Products Grid */}
            <div className="overflow-y-auto p-6" style={{ maxHeight: '60vh' }}>
              {modalProducts.length === 0 ? (
                <p style={{ textAlign: 'center', padding: '40px', color: '#999' }}>No hay productos disponibles</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {modalProducts.map(producto => (
                    <div key={producto.id} className="product-card producto-card dark:bg-slate-800 dark:border-slate-700">
                      <div className="product-image-container">
                        <div className="product-image-placeholder">
                          {producto.imagen ? (
                            <img src={producto.imagen} alt={producto.nombre} onError={(e) => { e.target.style.display = 'none'; }} />
                          ) : '👕'}
                        </div>
                        <div className="price-badge">${producto.precio}</div>
                      </div>
                      <div className="product-info">
                        <p className="product-brand">{producto.marca}</p>
                        <h2 className="product-title">{producto.nombre}</h2>

                        {producto.tallas && (
                          <div className="size-selector">
                            <p className="size-label">TALLA</p>
                            <div className="size-options">
                              {['XS', 'S', 'M', 'L', 'XL'].map(s => (
                                <button
                                  key={s}
                                  type="button"
                                  className={`size-btn ${(selectedSizes[producto.id] || 'S') === s ? 'active' : ''}`}
                                  onClick={() => handleSizeSelect(producto.id, s)}
                                >
                                  {s}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {producto.semestre && (
                          <div className="size-selector">
                            <p className="size-label">SEMESTRE</p>
                            <div className="size-options">
                              {['I', 'II', 'III', 'IV', 'V', 'VI'].map(s => (
                                <button
                                  key={s}
                                  type="button"
                                  className={`size-btn ${(selectedSizes[producto.id] || 'II') === s ? 'active' : ''}`}
                                  onClick={() => handleSizeSelect(producto.id, s)}
                                >
                                  {s}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="product-actions">
                          <button
                            type="button"
                            className="btn-add-cart"
                            onClick={() => agregarAlCarrito(producto)}
                          >
                            Agregar al carrito
                          </button>
                          <button className="btn-icon">🛒</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================== MODALS ======================== */}
      <ModalPago
        isOpen={showPago}
        onClose={() => setShowPago(false)}
        total={total}
        items={carrito}
        onPaymentSuccess={() => {
          vaciarCarrito();
          showToast('¡Pago realizado exitosamente!', 'success');
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
      />
    </div>
  );
}
