import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Sidebar({ isOpen, onClose, onOpenChatbot }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showPrefs, setShowPrefs] = useState(false);
  const [prefs, setPrefs] = useState({
    darkMode: false,
    largeText: false,
    manualLogin: false
  });

  useEffect(() => {
    const userRaw = localStorage.getItem('user');
    if (userRaw) {
      try {
        const parsed = JSON.parse(userRaw);
        setUser(parsed);
        if (parsed.id) {
          const storedPrefs = localStorage.getItem(`prefs_${parsed.id}`);
          if (storedPrefs) {
            const parsedPrefs = JSON.parse(storedPrefs);
            setPrefs(parsedPrefs);
            aplicarPreferencias(parsedPrefs);
          }
        }
      } catch (e) {
        console.error('Error parsing user/prefs:', e);
      }
    }
  }, [isOpen]);

  const aplicarPreferencias = (p) => {
    if (p.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    if (p.largeText) {
      document.documentElement.classList.add('large-text');
    } else {
      document.documentElement.classList.remove('large-text');
    }
  };

  const updatePrefs = (newPrefs) => {
    const updated = { ...prefs, ...newPrefs };
    setPrefs(updated);
    if (user?.id) {
      localStorage.setItem(`prefs_${user.id}`, JSON.stringify(updated));
    }
    aplicarPreferencias(updated);
  };

  const handleLogout = () => {
    if (window.confirm('¿Estás seguro que deseas cerrar sesión?')) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      if (window.showToast) {
        window.showToast('Sesión cerrada correctamente', 'success');
      }
      setTimeout(() => {
        navigate('/login');
      }, 1000);
    }
  };

  const isTienda = window.location.pathname.includes('tienda');
  const navUrl = isTienda ? '/principal' : '/tienda';
  const navText = isTienda ? 'Ir al Tablero' : 'Ir a la Tienda';
  const navIcon = isTienda ? 'dashboard' : 'storefront';

  return (
    <>
      <style>{`
        #sidebar-main, #sidebar-prefs {
          transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .sr-only {
          position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); border: 0;
        }
      `}</style>
      
      {/* Overlay */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 z-[10001] ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      ></div>

      {/* Sidebar Principal */}
      <div
        id="sidebar-main"
        className={`fixed top-0 left-0 h-full w-[320px] bg-white dark:bg-slate-900 shadow-[20px_0_50px_rgba(0,0,0,0.1)] dark:shadow-[20px_0_50px_rgba(0,0,0,0.3)] z-[10002] flex flex-col border-r border-slate-100 dark:border-slate-800 ${
          isOpen && !showPrefs ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <img src="/imgs/yameharte.png" alt="Logo" className="h-6 w-auto" />
            </div>
            <h2 className="text-xl font-black dark:text-white tracking-tight">Menú Sistema</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="flex-grow py-6 overflow-y-auto">
          <div className="px-4 mb-4">
            <p className="text-[10px] font-black uppercase tracking-[2px] text-slate-400 px-4 mb-2">Accesos Rápidos</p>
            <button
              onClick={() => {
                onClose();
                navigate(navUrl);
              }}
              className="flex items-center gap-4 px-4 py-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group w-full text-left"
            >
              <div className="p-2.5 bg-primary/5 rounded-xl group-hover:bg-primary/10 transition-colors">
                <span className="material-symbols-outlined text-primary text-[22px] group-hover:scale-110 transition-transform">{navIcon}</span>
              </div>
              <span className="font-bold text-slate-700 dark:text-slate-200">{navText}</span>
            </button>

            <button
              onClick={() => setShowPrefs(true)}
              className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group text-left"
            >
              <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 transition-colors">
                <span className="material-symbols-outlined text-blue-500 text-[22px] group-hover:rotate-45 transition-transform">settings</span>
              </div>
              <span className="font-bold text-slate-700 dark:text-slate-200">Preferencias</span>
              <span className="material-symbols-outlined ml-auto text-slate-300 group-hover:translate-x-1 transition-transform">chevron_right</span>
            </button>

            <button
              onClick={() => {
                onClose();
                if (onOpenChatbot) onOpenChatbot();
              }}
              className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group text-left"
            >
              <div className="p-2.5 bg-red-50 dark:bg-red-900/20 rounded-xl group-hover:bg-red-100 dark:group-hover:bg-red-900/40 transition-colors">
                <span className="material-symbols-outlined text-red-500 text-[22px] group-hover:scale-110 transition-transform">smart_toy</span>
              </div>
              <span className="font-bold text-slate-700 dark:text-slate-200">Cobra Asistente</span>
            </button>
          </div>
        </div>

        <div className="p-8 border-t border-slate-100 dark:border-slate-800">
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-3 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-2xl hover:opacity-90 transition-all shadow-lg active:scale-[0.98]">
            <span className="material-symbols-outlined text-[20px]">logout</span>
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Sidebar Preferencias */}
      <div
        id="sidebar-prefs"
        className={`fixed top-0 left-0 h-full w-[320px] bg-white dark:bg-slate-900 shadow-[20px_0_50px_rgba(0,0,0,0.1)] dark:shadow-[20px_0_50px_rgba(0,0,0,0.3)] z-[10003] flex flex-col border-r border-slate-100 dark:border-slate-800 ${
          isOpen && showPrefs ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center gap-4">
          <button onClick={() => setShowPrefs(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h2 className="text-xl font-black dark:text-white tracking-tight">Preferencias</h2>
        </div>

        <div className="p-6 space-y-2 overflow-y-auto">
          <p className="text-[10px] font-black uppercase tracking-[2px] text-slate-400 px-2 mb-4">Personalización</p>

          {/* Dark Mode */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all">
            <div>
              <p className="font-bold text-slate-700 dark:text-slate-200 text-sm">Modo Oscuro</p>
              <p className="text-[11px] text-slate-500 font-medium">Interfaz en tonos oscuros</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={prefs.darkMode}
                onChange={(e) => updatePrefs({ darkMode: e.target.checked })}
              />
              <div className="w-10 h-5 bg-slate-400 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          {/* Large Text */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all">
            <div>
              <p className="font-bold text-slate-700 dark:text-slate-200 text-sm">Texto Grande</p>
              <p className="text-[11px] text-slate-500 font-medium">Mayor tamaño de fuentes</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={prefs.largeText}
                onChange={(e) => updatePrefs({ largeText: e.target.checked })}
              />
              <div className="w-10 h-5 bg-slate-400 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="h-4"></div>
          <p className="text-[10px] font-black uppercase tracking-[2px] text-slate-400 px-2 mb-4">Seguridad</p>

          {/* Manual Login */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all">
            <div>
              <p className="font-bold text-slate-700 dark:text-slate-200 text-sm">Acceso Manual</p>
              <p className="text-[11px] text-slate-500 font-medium">Desactiva inicio automático</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={prefs.manualLogin}
                onChange={(e) => updatePrefs({ manualLogin: e.target.checked })}
              />
              <div className="w-10 h-5 bg-slate-400 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
      </div>
    </>
  );
}
