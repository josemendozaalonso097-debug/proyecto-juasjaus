import { lazy, Suspense, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const TabEstadisticas = lazy(() => import('../components/admin/TabEstadisticas'));
const TabUsuarios = lazy(() => import('../components/admin/TabUsuarios'));
const TabAdeudos = lazy(() => import('../components/admin/TabAdeudos'));
const TabInventario = lazy(() => import('../components/admin/TabInventario'));
const TabNotificaciones = lazy(() => import('../components/admin/TabNotificaciones'));
const TabOxxo = lazy(() => import('../components/admin/TabOxxo'));
const TabVerificarCompras = lazy(() => import('../components/admin/TabVerificarCompras'));
const TabBandeja = lazy(() => import('../components/admin/TabBandeja'));
const TabInstitutionRequests = lazy(() => import('../components/admin/TabInstitutionRequests'));
const TabCustomization = lazy(() => import('../components/admin/TabCustomization'));

const TABS = [
  { id: 'bandeja',       label: 'Bandeja',          icon: 'inbox' },
  { id: 'planteles',     label: 'Altas de planteles', icon: 'domain_add' },
  { id: 'personalizacion', label: 'Personalización', icon: 'palette' },
  { id: 'stats',         label: 'Estadísticas',   icon: 'bar_chart' },
  { id: 'usuarios',      label: 'Usuarios',        icon: 'group' },
  { id: 'adeudos',       label: 'Adeudos',         icon: 'account_balance_wallet' },
  { id: 'inventario',    label: 'Inventario',      icon: 'inventory_2' },
  { id: 'notificaciones',label: 'Notificaciones',  icon: 'notifications' },
  { id: 'oxxo',         label: 'Escanear OXXO',    icon: 'barcode_reader' },
  { id: 'verificar',    label: 'Verificar compras', icon: 'verified' },
];

export default function Admin() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(() => new URLSearchParams(location.search).get('tab') === 'personalizacion' ? 'personalizacion' : 'stats');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user?.rol !== 'admin') navigate('/principal');
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="bg-gradient-to-r from-[#f20d0d] to-[#6e0404] px-6 py-4 flex items-center gap-4 shadow-lg">
        <button
          onClick={() => navigate('/principal')}
          className="p-2 bg-white/20 hover:bg-white/30 rounded-xl text-white transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-xl">arrow_back</span>
        </button>
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-white text-3xl">admin_panel_settings</span>
          <div>
            <h1 className="text-white font-black text-xl leading-tight">Panel de Administración</h1>
            <p className="text-white/70 text-xs">CBTis 258 — Sistema de Gestión</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3.5 text-sm font-bold transition-all border-b-2 cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-[#f20d0d] text-[#f20d0d]'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <span className="material-symbols-outlined text-base">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto">
        <Suspense fallback={<div role="status" className="flex justify-center py-16 text-sm font-bold text-slate-500">Cargando sección…</div>}>
          {activeTab === 'bandeja'        && <TabBandeja onNavigateVerification={() => setActiveTab('verificar')} />}
          {activeTab === 'planteles'      && <TabInstitutionRequests />}
          {activeTab === 'personalizacion' && <TabCustomization />}
          {activeTab === 'stats'          && <TabEstadisticas />}
          {activeTab === 'usuarios'       && <TabUsuarios />}
          {activeTab === 'adeudos'        && <TabAdeudos />}
          {activeTab === 'inventario'     && <TabInventario />}
          {activeTab === 'notificaciones' && <TabNotificaciones />}
          {activeTab === 'oxxo'          && <TabOxxo />}
          {activeTab === 'verificar'     && <TabVerificarCompras />}
        </Suspense>
      </div>
    </div>
  );
}
