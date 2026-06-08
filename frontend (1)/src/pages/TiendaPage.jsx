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
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showPago, setShowPago] = useState(false);
  const [showPapeleria, setShowPapeleria] = useState(false);
  const [showPerfil, setShowPerfil] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalIcon, setModalIcon] = useState('shopping_bag');
  const [modalProducts, setModalProducts] = useState([]);
  const [currentCategory, setCurrentCategory] = useState('');
  const [activeLibroTab, setActiveLibroTab] = useState(1);
  const [isLibrosCategory, setIsLibrosCategory] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState({});
  const [carrito, setCarrito] = useState([]);

  useEffect(() => {
    const carritoGuardado = localStorage.getItem('carrito');
    if (carritoGuardado) {
      try { setCarrito(JSON.parse(carritoGuardado)); } catch (e) { setCarrito([]); }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('carrito', JSON.stringify(carrito));
  }, [carrito]);

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
          localStorage.removeItem('access_token');
          navigate('/login');
          return;
        }
        const userData = await response.json();
        setUser(userData);
        setIsLoading(false);
      } catch (error) { navigate('/login'); }
    };
    verifySession();
  }, [navigate]);

  const calcularTotal = () => carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);

  const eliminarDelCarrito = (index) => {
    setCarrito(prev => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });
  };

  const vaciarCarrito = () => setCarrito([]);

  const titulos = { uniformes: 'Uniformes y Credenciales', Libros: 'Libros', tramites: 'Trámites y Documentos' };
  const iconos = { uniformes: 'apparel', Libros: 'menu_book', tramites: 'description' };

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
    setSelectedSizes({});
    setShowProductModal(true);
  };

  const cerrarModal = () => setShowProductModal(false);

  const cambiarTabLibros = (sem) => {
    setActiveLibroTab(sem);
    const productos = productosData['Libros'] || [];
    const ids = librosPorSemestre[sem] || [];
    setModalProducts(productos.filter(p => ids.includes(p.id)));
  };

  const handleSizeSelect = (productId, size) => {
    setSelectedSizes(prev => ({ ...prev, [productId]: size }));
  };

  const agregarAlCarrito = (producto) => {
    const prodCopy = { ...producto };
    if (prodCopy.tallas || prodCopy.semestre) {
      prodCopy.tallaSeleccionada = selectedSizes[prodCopy.id] || (prodCopy.tallas ? 'S' : 'II');
    }
    setCarrito(prev => {
      const existente = prev.find(item => item.id === prodCopy.id && (!item.tallaSeleccionada || item.tallaSeleccionada === prodCopy.tallaSeleccionada));
      if (existente) {
        return prev.map(item => item.id === existente.id && item.tallaSeleccionada === existente.tallaSeleccionada ? { ...item, cantidad: item.cantidad + 1 } : item);
      } else {
        return [...prev, { ...prodCopy, cantidad: 1 }];
      }
    });
    showToast(`${prodCopy.nombre} agregado`, 'success');
  };

  const handlePay = () => {
    if (carrito.length === 0) return;
    setShowPago(true);
  };

  if (isLoading) return <div className="loading-screen">Cargando tienda...</div>;

  return (
    <div className="tienda-wrapper">
      <div className="mesh-bg" aria-hidden="true"></div>
      
      <Header userName={user?.nombre} onMenuClick={() => setSidebarOpen(true)} onProfileClick={() => setShowPerfil(true)} />

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* DESKTOP LAYOUT (1:1 index.html / tienda.html) */}
      <main className="main-content">
        <div className="bienvenida">
          <h2 className="titulodeBienvenida">Tienda Escolar</h2>
          <p className="user-info">Selecciona los artículos que necesites.</p>
        </div>

        <div className="tienda-layout">
          <div className="productos-container">
            <h3 className="section-title">Categorías</h3>
            <div className="productos-grid">
              {/* Papelería Card */}
              <div className="card" onClick={() => setShowPapeleria(true)}>
                <div className="card2">
                  <div className="iconito">📄</div>
                  <h3>Subir Papelería</h3>
                  <p>Sube la papelería para tus trámites</p>
                </div>
              </div>
              {/* Uniformes Card */}
              <div className="card" onClick={() => abrirModal('uniformes')}>
                <div className="card2">
                  <div className="iconito">👕</div>
                  <h3>Uniformes</h3>
                  <p>Oficiales</p>
                </div>
              </div>
              {/* Libros Card */}
              <div className="card" onClick={() => abrirModal('Libros')}>
                <div className="card2">
                  <div className="iconito">📚</div>
                  <h3>Libros</h3>
                  <p>Guías de estudio</p>
                </div>
              </div>
              {/* Trámites Card */}
              <div className="card" onClick={() => abrirModal('tramites')}>
                <div className="card2">
                  <div className="iconito">📝</div>
                  <h3>Trámites</h3>
                  <p>Certificados</p>
                </div>
              </div>
            </div>
          </div>

          <aside className="sidebar-derecha">
            <div className="info-card">
              <h3 className="info-title">Tu Carrito</h3>
              <div className="carrito-list">
                {carrito.length === 0 ? (
                  <p className="empty-msg">Vacío</p>
                ) : (
                  carrito.map((item, i) => (
                    <div key={i} className="carrito-item">
                      <span>{item.nombre} x{item.cantidad}</span>
                      <button onClick={() => eliminarDelCarrito(i)}>✕</button>
                    </div>
                  ))
                )}
              </div>
              <div className="total-box">
                <strong>Total: ${calcularTotal().toFixed(2)}</strong>
              </div>
              <button className="pay-button" onClick={handlePay} disabled={carrito.length === 0} style={{ width: '100%', marginTop: '15px' }}>
                PAGAR
              </button>
            </div>
          </aside>
        </div>
      </main>

      <Footer onLogout={() => navigate('/login')} />

      {/* ======================== MOBILE STITCH TIENDA ======================== */}
      <div className="tienda-mobile-only" style={{ minHeight: '100dvh', background: '#f9f9fb', paddingBottom: '88px' }}>
        <header className="mob-header" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, background: 'rgba(249,249,251,0.92)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(228,190,186,0.15)', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px' }}>
          <div onClick={() => navigate('/principal')} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <img src="/imgs/yameharte.png" alt="Logo" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
            <span className="mob-title" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: '1.1rem', color: '#af101a' }}>CBTis 258</span>
          </div>
          <button onClick={() => setShowPerfil(true)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#e4beba center/cover no-repeat', border: '2px solid rgba(175,16,26,0.2)' }}></div>
          </button>
        </header>

        <div className="mobile-main-content" style={{ padding: '80px 20px 0' }}>
          <section style={{ marginBottom: '24px', marginTop: '16px' }}>
            <h2 className="mob-title" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#1a1c1d', marginBottom: '6px' }}>Tienda Escolar</h2>
            <p className="mob-sub" style={{ fontFamily: "'Manrope', sans-serif", fontSize: '0.875rem', color: '#5b403d' }}>Selecciona lo que necesites.</p>
          </section>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
            {/* Papelería */}
            <div onClick={() => setShowPapeleria(true)} className="mob-card" style={{ position: 'relative', overflow: 'hidden', background: 'white', borderRadius: '14px', padding: '20px', border: '1px solid rgba(228,190,186,0.15)', cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div className="mob-action-icon" style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(175,16,26,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#af101a' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>edit_note</span>
                  </div>
                  <div>
                    <h3 className="mob-title" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1rem', fontWeight: 700, color: '#1a1c1d', margin: '0 0 2px' }}>Papelería</h3>
                    <p className="mob-sub" style={{ fontFamily: "'Manrope', sans-serif", fontSize: '12px', color: '#5b403d', margin: 0 }}>Sube tu documentación</p>
                  </div>
                </div>
                <span className="material-symbols-outlined" style={{ color: '#8f6f6c' }}>chevron_right</span>
              </div>
            </div>
            {/* Uniformes */}
            <div onClick={() => abrirModal('uniformes')} className="mob-card" style={{ position: 'relative', overflow: 'hidden', background: 'white', borderRadius: '14px', padding: '20px', border: '1px solid rgba(228,190,186,0.15)', cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(0,95,175,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#005faf' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>checkroom</span>
                  </div>
                  <div>
                    <h3 className="mob-title" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1rem', fontWeight: 700, color: '#1a1c1d', margin: '0 0 2px' }}>Uniformes</h3>
                    <p className="mob-sub" style={{ fontFamily: "'Manrope', sans-serif", fontSize: '12px', color: '#5b403d', margin: 0 }}>Tallas S, M, L disponibles</p>
                  </div>
                </div>
                <span className="material-symbols-outlined" style={{ color: '#8f6f6c' }}>chevron_right</span>
              </div>
            </div>
            {/* Libros */}
            <div onClick={() => abrirModal('Libros')} className="mob-card" style={{ position: 'relative', overflow: 'hidden', background: 'white', borderRadius: '14px', padding: '20px', border: '1px solid rgba(228,190,186,0.15)', cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(113,83,0,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#715300' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>menu_book</span>
                  </div>
                  <div>
                    <h3 className="mob-title" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1rem', fontWeight: 700, color: '#1a1c1d', margin: '0 0 2px' }}>Libros</h3>
                    <p className="mob-sub" style={{ fontFamily: "'Manrope', sans-serif", fontSize: '12px', color: '#5b403d', margin: 0 }}>Guías de estudio oficiales</p>
                  </div>
                </div>
                <span className="material-symbols-outlined" style={{ color: '#8f6f6c' }}>chevron_right</span>
              </div>
            </div>
            {/* Trámites */}
            <div onClick={() => abrirModal('tramites')} className="mob-card" style={{ position: 'relative', overflow: 'hidden', background: 'white', borderRadius: '14px', padding: '20px', border: '1px solid rgba(228,190,186,0.15)', cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div className="mob-action-icon" style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(175,16,26,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#af101a' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>receipt_long</span>
                  </div>
                  <div>
                    <h3 className="mob-title" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1rem', fontWeight: 700, color: '#1a1c1d', margin: '0 0 2px' }}>Trámites</h3>
                    <p className="mob-sub" style={{ fontFamily: "'Manrope', sans-serif", fontSize: '12px', color: '#5b403d', margin: 0 }}>Constancias y certificados</p>
                  </div>
                </div>
                <span className="material-symbols-outlined" style={{ color: '#8f6f6c' }}>chevron_right</span>
              </div>
            </div>
          </div>

          {carrito.length > 0 && (
            <div id="carrito-mobile-widget" style={{ position: 'fixed', bottom: '96px', left: '16px', right: '16px', zIndex: 44 }}>
              <div className="mob-card" style={{ background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(16px)', borderRadius: '16px', padding: '16px 20px', boxShadow: '0 8px 32px -8px rgba(175,16,26,0.2)', border: '1px solid rgba(228,190,186,0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className="material-symbols-outlined" style={{ color: '#af101a', fontSize: '20px' }}>shopping_bag</span>
                    <span className="mob-title" style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, color: '#1a1c1d', fontSize: '0.875rem' }}>{carrito.length} Prods. (${calcularTotal().toFixed(2)})</span>
                  </div>
                </div>
                <button onClick={handlePay} className="pay-button" style={{ width: '100%', background: 'linear-gradient(135deg,#af101a,#d32f2f)', color: 'white', borderRadius: '12px', padding: '14px', fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: "'Manrope', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.9rem' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>credit_card</span>
                  Pagar Ahora
                </button>
              </div>
            </div>
          )}
        </div>

        <nav className="mob-nav" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 45, display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '0 16px', height: '80px', background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(16px)', borderTop: '1px solid rgba(228,190,186,0.15)', boxShadow: '0 -8px 24px -4px rgba(175,16,26,0.08)', borderRadius: '24px 24px 0 0' }}>
          <div onClick={() => navigate('/principal')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', color: '#64748b', cursor: 'pointer', textDecoration: 'none' }}>
            <span className="material-symbols-outlined" style={{ marginBottom: '4px' }}>dashboard</span>
            <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Panel</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', color: '#af101a', position: 'relative' }}>
            <span style={{ position: 'absolute', width: '64px', height: '40px', background: 'rgba(175,16,26,0.08)', borderRadius: '999px', zIndex: -1 }}></span>
            <span className="material-symbols-outlined" style={{ marginBottom: '4px', fontVariationSettings: "'FILL' 1" }}>shopping_bag</span>
            <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tienda</span>
          </div>
          <div onClick={() => setSidebarOpen(true)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', color: '#64748b', cursor: 'pointer' }}>
            <span className="material-symbols-outlined" style={{ marginBottom: '4px' }}>settings</span>
            <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ajustes</span>
          </div>
        </nav>
      </div>

      {/* MODALS */}
      {showProductModal && (
        <div className="modal" style={{ display: 'block' }}>
          <div className="modal-content">
            <span className="close-modal" onClick={cerrarModal}>&times;</span>
            <h2 className="modal-title">{modalTitle}</h2>
            <div className="productos-modal-grid">
               {modalProducts.map(p => (
                 <div key={p.id} className="product-card">
                    <div className="product-image-container">
                       <div className="price-badge">${p.precio}</div>
                       <span>🎁</span>
                    </div>
                    <div className="product-info">
                       <h3>{p.nombre}</h3>
                       <button className="btn-add-cart" onClick={() => agregarAlCarrito(p)}>Agregar</button>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        </div>
      )}

      <ModalPago isOpen={showPago} onClose={() => setShowPago(false)} total={calcularTotal()} items={carrito} onPaymentSuccess={() => { vaciarCarrito(); setShowPago(false); }} />
      <ModalPapeleria isOpen={showPapeleria} onClose={() => setShowPapeleria(false)} user={user} />
      <ModalPerfil isOpen={showPerfil} onClose={() => setShowPerfil(false)} user={user} />
    </div>
  );
}
