import React, { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Cargar preferencia de localStorage (del Sidebar)
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const u = JSON.parse(user);
        const prefs = localStorage.getItem(`prefs_${u.id}`);
        if (prefs) {
          const parsed = JSON.parse(prefs);
          return parsed.darkMode || false;
        }
      } catch (e) {
        console.error('Error cargando preferencias:', e);
      }
    }
    // Fallback: usar preferencia del sistema
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    // Aplicar clase al elemento raíz
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    // Persistir la preferencia para el usuario actual
    try {
      const user = localStorage.getItem('user');
      if (user) {
        const u = JSON.parse(user);
        const prefsKey = `prefs_${u.id}`;
        const prefsRaw = localStorage.getItem(prefsKey);
        const prefs = prefsRaw ? JSON.parse(prefsRaw) : {};
        prefs.darkMode = !!isDarkMode;
        localStorage.setItem(prefsKey, JSON.stringify(prefs));
      } else {
        // fallback global key
        localStorage.setItem('prefs_global', JSON.stringify({ darkMode: !!isDarkMode }));
      }
    } catch (e) {
      console.error('Error persisting theme preference', e);
    }
  }, [isDarkMode]);

  // Escuchar cambios en localStorage desde otras pestañas
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const user = localStorage.getItem('user');
        if (user) {
          const u = JSON.parse(user);
          const prefs = localStorage.getItem(`prefs_${u.id}`);
          if (prefs) {
            const parsed = JSON.parse(prefs);
            setIsDarkMode(!!parsed.darkMode);
            return;
          }
        }
        // fallback to global prefs
        const global = localStorage.getItem('prefs_global');
        if (global) {
          const p = JSON.parse(global);
          setIsDarkMode(!!p.darkMode);
          return;
        }
      } catch (e) {
        console.error('Error al detectar cambios de storage:', e);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}
