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

export default function PrincipalPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState(null);
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
  const [showConfirmacion, setShowConfirmacion] = useState(false);
  const [confirmData, setConfirmData] = useState({ title: '', message: '', onConfirm: null });
  const [showSplash, setShowSplash] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [pagosPendientes, setPagosPendientes] = useState(0);
  const [textoFechaVencimiento, setTextoFechaVencimiento] = useState('—');

  useEffect(() => {
    const needsSplash = searchParams.get('splash') === '1';
    if (needsSplash) {
      setShowSplash(true);
      window.history.replaceState(null, '', window.location.pathname);
      const timeout = setTimeout(() => setShowSplash(false), 3000);
      return () => clearTimeout(timeout);
    }
  }, [searchParams]);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) { navigate('/login'); return; }
    const verify = async () => {
      try {
        const res = await checkSessionToken(token);
        if (!res.ok) { navigate('/login'); return; }
        const data = await res.json();
        setUser(data);
        setIsLoading(false);
        // Debt check
        const hist = obtenerHistorial() || [];
        const count = hist.filter(c => c.productos?.some(p => p.nombre.toLowerCase().includes('colegiatura'))).length;
        const sem = parseInt(data.semestre || '1', 10);
        const pend = Math.max(0, sem - count);
        setPagosPendientes(pend);
        if (pend > 0) setTextoFechaVencimiento('1 de Julio del 2026');
        else setTextoFechaVencimiento('Sin adeudos');
      } catch (e) { navigate('/login'); }
    };
    verify();
  }, [navigate]);

  if (isLoading) return <div className="loading-screen">Cargando...</div>;

  return (
    <div className="principal-wrapper">
      <div className="mesh-bg" aria-hidden="true"></div>

      {showSplash && (
        <div id="_splash">
          <div id="_splash-inner">
            <div id="_splash-ring"><div id="_splash-ring-border"></div></div>
            <p id="_splash-title">CBTis 258</p>
          </div>
        </div>
      )}

      <Header userName={user?.nombre} onMenuClick={() => setSidebarOpen(true)} onProfileClick={() => setShowPerfil(true)} />

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="main-content">
        <div className="bienvenida">
          <h2 className="titulodeBienvenida">Bienvenid@, <span>{user?.nombre}</span></h2>
          <p className="user-info">Revisa tu estado de cuenta y realiza pagos escolares.</p>
        </div>

        <div className="dashboard">
          <div className="card-main">
            <h3 className="card-title">Estados de pago</h3>
            {pagosPendientes > 0 ? (
              <div className="alert-box">
                <p className="alert-text">Tienes {pagosPendientes} pago(s) pendiente(s)</p>
              </div>
            ) : (
              <div className="alert-box" style={{ background: 'green' }}>
                <p className="alert-text">Al corriente</p>
              </div>
            )}
            <div className="botones">
              <button className="btn btn-primary" onClick={() => setShowInformacion(true)}>Información</button>
              <button className="btn btn-secondary" onClick={() => setShowHistorial(true)}>Historial</button>
            </div>
          </div>

          <aside className="columna-derecha">
            <div className="info-card">
              <div className="status">{user?.semestre || '1'}° Semestre</div>
              <h3 className="info-title">Cuenta Activa</h3>
              <p className="info-text">Colegiatura: <strong>$3,000.00 MXN</strong></p>
              <p className="info-text">Vencimiento: <strong>{textoFechaVencimiento}</strong></p>
              <button className="btn btn-store" onClick={() => navigate('/tienda')}>Ir a Tienda</button>
            </div>

            <div className="info-card" style={{ marginTop: '20px' }}>
               <h3 className="info-title">Trámites</h3>
               <button className="btn btn-secondary" style={{ width:'100%' }} onClick={() => setShowPapeleria(true)}>Papelería</button>
            </div>
          </aside>
        </div>
      </main>

      {/* ======================== MOBILE STITCH LAYOUT ======================== */}
      <div className="mobile-only" style={{ minHeight: '100dvh', background: '#f9f9fb', paddingBottom: '88px' }}>
        <header className="mob-header" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, background: 'rgba(249,249,251,0.92)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(228,190,186,0.15)', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={() => setSidebarOpen(true)} style={{ width: '40px', height: '40px', borderRadius: '50%', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1a1c1d' }}>
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <img src="/imgs/yameharte.png" alt="Logo" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
              <span className="mob-title" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: '1.1rem', color: '#af101a' }}>CBTis 258</span>
            </div>
          </div>
          <button onClick={() => setShowPerfil(true)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#e4beba center/cover no-repeat', border: '2px solid rgba(175,16,26,0.2)' }} />
          </button>
        </header>

        <div className="mobile-main-content" style={{ padding: '80px 20px 0' }}>
          <section style={{ marginBottom: '32px', marginTop: '16px' }}>
            <p className="mob-sub" style={{ fontFamily: "'Manrope', sans-serif", fontSize: '0.875rem', color: '#8f6f6c', fontWeight: 500, marginBottom: '4px' }}>Bienvenid@</p>
            <h2 className="mob-title" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#1a1c1d', marginBottom: '8px' }}>{user?.nombre}</h2>
            <div className="mob-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'white', borderRadius: '999px', padding: '4px 14px', border: '1px solid rgba(228,190,186,0.3)', boxShadow: '0 2px 8px rgba(175,16,26,0.06)' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#27ae60', display: 'inline-block' }}></span>
              <span className="mob-value" style={{ fontFamily: "'Manrope', sans-serif", fontSize: '12px', fontWeight: 700, color: '#1a1c1d' }}>{user?.semestre}° Semestre</span>
            </div>
          </section>

          <section style={{ marginBottom: '20px' }}>
            <div className="mob-card" style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid rgba(228,190,186,0.15)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p className="mob-label" style={{ fontFamily: "'Manrope', sans-serif", fontSize: '11px', color: '#8f6f6c', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Estado de Cuenta</p>
                  <p className="mob-title" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#af101a' }}>{pagosPendientes > 0 ? `${pagosPendientes} Pendientes` : 'Al Corriente'}</p>
                </div>
                <div className="mob-action-icon" style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(175,16,26,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#af101a' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>account_balance_wallet</span>
                </div>
              </div>
            </div>
          </section>

          <section className="mob-card" style={{ background: 'white', borderRadius: '16px', padding: '18px 20px', marginBottom: '20px', border: '1px solid rgba(228,190,186,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="mob-action-icon" style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(175,16,26,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#af101a', flexShrink: 0 }}>
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>calendar_month</span>
              </div>
              <div>
                <p className="mob-label" style={{ fontFamily: "'Manrope', sans-serif", fontSize: '11px', color: '#8f6f6c', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>Próximo Vencimiento</p>
                <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.9rem', fontWeight: 700, color: '#af101a' }}>{textoFechaVencimiento}</p>
              </div>
            </div>
          </section>

          <section style={{ marginBottom: '20px' }}>
            <h3 className="mob-title" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1rem', fontWeight: 700, color: '#1a1c1d', marginBottom: '14px' }}>Acciones rápidas</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button onClick={() => setShowInformacion(true)} className="mob-card" style={{ background: 'white', border: '1px solid rgba(228,190,186,0.2)', borderRadius: '16px', padding: '20px 16px', textAlign: 'left' }}>
                <div className="mob-action-icon" style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(175,16,26,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
                  <span className="material-symbols-outlined" style={{ color: '#af101a', fontSize: '20px' }}>info</span>
                </div>
                <p className="mob-title" style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: '0.875rem', color: '#1a1c1d', margin: 0 }}>Información</p>
              </button>
              <button onClick={() => setShowHistorial(true)} className="mob-card" style={{ background: 'white', border: '1px solid rgba(228,190,186,0.2)', borderRadius: '16px', padding: '20px 16px', textAlign: 'left' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(0,95,175,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
                  <span className="material-symbols-outlined" style={{ color: '#005faf', fontSize: '20px' }}>history</span>
                </div>
                <p className="mob-title" style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: '0.875rem', color: '#1a1c1d', margin: 0 }}>Historial</p>
              </button>
              <button onClick={() => navigate('/tienda')} className="mob-card" style={{ background: 'white', border: '1px solid rgba(228,190,186,0.2)', borderRadius: '16px', padding: '20px 16px', textAlign: 'left' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(113,83,0,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
                  <span className="material-symbols-outlined" style={{ color: '#715300', fontSize: '20px' }}>storefront</span>
                </div>
                <p className="mob-title" style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: '0.875rem', color: '#1a1c1d', margin: 0 }}>Tienda</p>
              </button>
              <button onClick={() => setShowPapeleria(true)} className="mob-card" style={{ background: 'white', border: '1px solid rgba(228,190,186,0.2)', borderRadius: '16px', padding: '20px 16px', textAlign: 'left' }}>
                <div className="mob-action-icon" style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(175,16,26,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
                  <span className="material-symbols-outlined" style={{ color: '#af101a', fontSize: '20px' }}>edit_note</span>
                </div>
                <p className="mob-title" style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: '0.875rem', color: '#1a1c1d', margin: 0 }}>Papelería</p>
              </button>
            </div>
          </section>
        </div>

        <nav className="mob-nav" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 45, display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '0 16px', height: '80px', background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(16px)', borderTop: '1px solid rgba(228,190,186,0.15)', boxShadow: '0 -8px 24px -4px rgba(175,16,26,0.08)', borderRadius: '24px 24px 0 0' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', color: '#af101a', position: 'relative' }}>
            <span style={{ position: 'absolute', width: '64px', height: '40px', background: 'rgba(175,16,26,0.08)', borderRadius: '999px', zIndex: -1 }}></span>
            <span className="material-symbols-outlined" style={{ marginBottom: '4px' }}>dashboard</span>
            <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Panel</span>
          </div>
          <div onClick={() => navigate('/tienda')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', color: '#64748b', cursor: 'pointer' }}>
            <span className="material-symbols-outlined" style={{ marginBottom: '4px' }}>shopping_bag</span>
            <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tienda</span>
          </div>
          <div onClick={() => setSidebarOpen(true)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', color: '#64748b', cursor: 'pointer' }}>
            <span className="material-symbols-outlined" style={{ marginBottom: '4px' }}>settings</span>
            <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ajustes</span>
          </div>
        </nav>
      </div>

      <Footer onLogout={() => navigate('/login')} />
      
      {/* Modals remain same as before for functionality */}
      <ModalHistorial isOpen={showHistorial} onClose={() => setShowHistorial(false)} />
      <ModalInformacion isOpen={showInformacion} onClose={() => setShowInformacion(false)} onSectionSelect={() => {}} />
      <ModalPago isOpen={showPago} onClose={() => setShowPago(false)} total={3000} items={[]} onPaymentSuccess={() => {}} />
      <ModalPapeleria isOpen={showPapeleria} onClose={() => setShowPapeleria(false)} user={user} />
      <ModalPerfil isOpen={showPerfil} onClose={() => setShowPerfil(false)} user={user} />
    </div>
  );
}
