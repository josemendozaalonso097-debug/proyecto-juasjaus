import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/admin';
import AdminLoader from './AdminLoader';
import ChartCard from './ChartCard';

export default function TabEstadisticas() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = () => {
      adminApi.getStats()
        .then(setStats)
        .catch(() => {})
        .finally(() => setLoading(false));
    };
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <AdminLoader />;
  if (!stats) return null;

  const colorMap = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600',
    red: 'bg-red-50 dark:bg-red-900/20 text-[#f20d0d]',
    orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600',
  };

  const cards = [
    { label: 'Total usuarios', value: stats.total_usuarios, icon: 'group', color: 'blue' },
    { label: 'Usuarios activos', value: stats.usuarios_activos, icon: 'person_check', color: 'green' },
    { label: 'Productos activos', value: stats.total_productos, icon: 'storefront', color: 'purple' },
    { label: 'Adeudos pendientes', value: stats.deudas_pendientes, icon: 'warning', color: 'red' },
    {
      label: 'Monto por cobrar',
      value: `$${stats.monto_deudas_pendientes.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`,
      icon: 'payments',
      color: 'orange',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {cards.map(c => (
          <div key={c.label} className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-800">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${colorMap[c.color]}`}>
              <span className="material-symbols-outlined text-xl">{c.icon}</span>
            </div>
            <p className="text-2xl font-black dark:text-white">{c.value}</p>
            <p className="text-xs text-slate-500 mt-1">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChartCard title="Usuarios por Semestre" data={stats.usuarios_por_semestre} keyX="semestre" keyY="count" color="#f20d0d" />
        <ChartCard title="Usuarios por Rol" data={stats.usuarios_por_rol} keyX="rol" keyY="count" color="#6e0404" />
        <ChartCard title="Productos por Categoría" data={stats.productos_por_categoria} keyX="categoria" keyY="count" color="#3b82f6" />
      </div>
    </div>
  );
}
