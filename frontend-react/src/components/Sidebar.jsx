import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { showToast } from '../utils/toast';
import { ThemeContext } from '../context/ThemeContext';

export default function Sidebar({ isOpen, onClose, onOpenChatbot, onOpenOrientacion }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isTienda = location.pathname.includes('tienda');

  const [user, setUser] = useState(null);
  const [prefs, setPrefs] = useState({
    darkMode: false,
    largeText: false,
    manualLogin: false
  });
  const [activePanel, setActivePanel] = useState('main'); // 'main' or 'prefs'

  useEffect(() => {
    const userRaw = localStorage.getItem('user');
    try {
      if (userRaw) {
        const u = JSON.parse(userRaw);
        setUser(u);
        const prefsKey = `prefs_${u.id}`;
        const storedPrefs = localStorage.getItem(prefsKey);
        if (storedPrefs) {
          const parsed = JSON.parse(storedPrefs);
          setPrefs(parsed);
          aplicarPreferencias(parsed);
          return;
        }
      }
      // fallback: load global prefs if no user or no user prefs
      const global = localStorage.getItem('prefs_global');
      if (global) {
        const parsed = JSON.parse(global);
        setPrefs(p => ({ ...p, ...parsed }));
        aplicarPreferencias({ ...prefs, ...parsed });
      }
    } catch (e) {
      console.error('Error parseando datos iniciales en Sidebar:', e);
    }
  }, [isOpen]);

    // Integración con ThemeContext para controlar el modo oscuro centralizado
    const { isDarkMode, toggleDarkMode } = useContext(ThemeContext);

  const aplicarPreferencias = (newPrefs) => {
    if (newPrefs.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    if (newPrefs.largeText) {
      document.documentElement.classList.add('large-text');
    } else {
      document.documentElement.classList.remove('large-text');
    }
  };

  const updatePreference = (key, value) => {
    const newPrefs = { ...prefs, [key]: value };
    setPrefs(newPrefs);
    try {
      if (key === 'darkMode') {
        // Delegate dark mode handling to ThemeContext
        toggleDarkMode();
      } else {
        if (user) {
          localStorage.setItem(`prefs_${user.id}`, JSON.stringify(newPrefs));
        } else {
          localStorage.setItem('prefs_global', JSON.stringify(newPrefs));
        }
        aplicarPreferencias(newPrefs);
      }
    } catch (e) {
      console.error('Error persisting prefs:', e);
    }
  };

  const handleLogout = () => {
    if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      showToast('Sesión cerrada correctamente', 'success');
      onClose();
      setTimeout(() => {
        navigate('/login');
      }, 1000);
    }
  };

  const handleNavigate = () => {
    onClose();
    if (isTienda) {
      navigate('/principal');
    } else {
      navigate('/tienda');
    }
  };

  if (!isOpen) return null;

  return (
    <div id="sidebar-wrapper">
      {/* Overlay */}
      <div 
        id="sidebar-overlay" 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[10001] transition-opacity duration-300 opacity-100"
        onClick={onClose}
      />
      
      {/* Sidebar Principal */}
      <div 
        id="sidebar-main" 
        className={`fixed top-0 left-0 h-full w-[320px] bg-white dark:bg-slate-900 shadow-[20px_0_50px_rgba(0,0,0,0.1)] dark:shadow-[20px_0_50px_rgba(0,0,0,0.3)] z-[10002] flex flex-col border-r border-slate-100 dark:border-slate-800 transition-transform duration-300 ${activePanel === 'main' ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <img src="/imgs/yameharte.png" alt="Logo" className="h-6 w-auto" />
            </div>
            <h2 className="text-xl font-black dark:text-white tracking-tight">Menú Sistema</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400 cursor-pointer">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <div className="flex-grow py-6 overflow-y-auto">
          <div className="px-4 mb-4">
            <p className="text-[10px] font-black uppercase tracking-[2px] text-slate-400 px-4 mb-2">Accesos Rápidos</p>
            
            <button
              onClick={handleNavigate}
              className="flex items-center gap-4 px-4 py-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group w-full text-left cursor-pointer"
            >
              <div class="p-2.5 bg-primary/5 rounded-xl group-hover:bg-primary/10 transition-colors">
                <span class="material-symbols-outlined text-primary text-[22px] group-hover:scale-110 transition-transform">
                  {isTienda ? 'dashboard' : 'storefront'}
                </span>
              </div>
              <span class="font-bold text-slate-700 dark:text-slate-200">
                {isTienda ? 'Ir al Tablero' : 'Ir a la Tienda'}
              </span>
            </button>
            
            <button 
              onClick={() => setActivePanel('prefs')} 
              className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group text-left cursor-pointer"
            >
              <div class="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 transition-colors">
                <span class="material-symbols-outlined text-blue-500 text-[22px] group-hover:rotate-45 transition-transform">settings</span>
              </div>
              <span class="font-bold text-slate-700 dark:text-slate-200">Preferencias</span>
              <span class="material-symbols-outlined ml-auto text-slate-300 group-hover:translate-x-1 transition-transform">chevron_right</span>
            </button>

            <button 
              onClick={() => { onClose(); onOpenChatbot(); }} 
              className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group text-left cursor-pointer"
            >
              <div class="p-2.5 bg-red-50 dark:bg-red-900/20 rounded-xl group-hover:bg-red-100 dark:group-hover:bg-red-900/40 transition-colors">
                <span class="material-symbols-outlined text-red-500 text-[22px] group-hover:scale-110 transition-transform">smart_toy</span>
              </div>
              <span class="font-bold text-slate-700 dark:text-slate-200">Cobra Asistente</span>
            </button>
          </div>
        </div>
        
        <div className="p-8 border-t border-slate-100 dark:border-slate-800">
          <button 
            onClick={handleLogout} 
            className="w-full flex items-center justify-center gap-3 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-2xl hover:opacity-90 transition-all shadow-lg active:scale-[0.98] cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Sidebar Preferencias */}
      <div 
        id="sidebar-prefs" 
        className={`fixed top-0 left-0 h-full w-[320px] bg-white dark:bg-slate-900 shadow-[20px_0_50px_rgba(0,0,0,0.1)] dark:shadow-[20px_0_50px_rgba(0,0,0,0.3)] z-[10003] flex flex-col border-r border-slate-100 dark:border-slate-800 transition-transform duration-300 ${activePanel === 'prefs' ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center gap-4">
          <button onClick={() => setActivePanel('main')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400 cursor-pointer">
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
                checked={isDarkMode}
                onChange={(e) => updatePreference('darkMode', e.target.checked)}
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
                onChange={(e) => updatePreference('largeText', e.target.checked)}
              />
              <div className="w-10 h-5 bg-slate-400 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div class="h-4"></div>
          <p class="text-[10px] font-black uppercase tracking-[2px] text-slate-400 px-2 mb-4">Seguridad</p>

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
                onChange={(e) => updatePreference('manualLogin', e.target.checked)}
              />
              <div className="w-10 h-5 bg-slate-400 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
