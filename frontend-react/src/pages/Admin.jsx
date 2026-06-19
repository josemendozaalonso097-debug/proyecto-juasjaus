import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import TabEstadisticas from '../components/admin/TabEstadisticas';
import TabUsuarios from '../components/admin/TabUsuarios';
import TabAdeudos from '../components/admin/TabAdeudos';
import TabInventario from '../components/admin/TabInventario';
import TabNotificaciones from '../components/admin/TabNotificaciones';

const TABS = [
  { id: 'stats',         label: 'Estadísticas',   icon: 'bar_chart' },
  { id: 'usuarios',      label: 'Usuarios',        icon: 'group' },
  { id: 'adeudos',       label: 'Adeudos',         icon: 'account_balance_wallet' },
  { id: 'inventario',    label: 'Inventario',      icon: 'inventory_2' },
  { id: 'notificaciones',label: 'Notificaciones',  icon: 'notifications' },
];

export default function Admin() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('stats');

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
        {activeTab === 'stats'          && <TabEstadisticas />}
        {activeTab === 'usuarios'       && <TabUsuarios />}
        {activeTab === 'adeudos'        && <TabAdeudos />}
        {activeTab === 'inventario'     && <TabInventario />}
        {activeTab === 'notificaciones' && <TabNotificaciones />}
      </div>
    </div>
  );
}
