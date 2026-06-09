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
  }, [isDarkMode]);

  // Escuchar cambios en localStorage (cuando Sidebar cambia el modo oscuro)
  useEffect(() => {
    const handleStorageChange = () => {
      const user = localStorage.getItem('user');
      if (user) {
        try {
          const u = JSON.parse(user);
          const prefs = localStorage.getItem(`prefs_${u.id}`);
          if (prefs) {
            const parsed = JSON.parse(prefs);
            setIsDarkMode(parsed.darkMode || false);
          }
        } catch (e) {
          console.error('Error al detectar cambios:', e);
        }
      }
    };

    // Escuchar cambios en localStorage
    window.addEventListener('storage', handleStorageChange);
    
    // Escuchar cambios en el DOM (cuando Sidebar actualiza las prefs)
    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains('dark');
      const user = localStorage.getItem('user');
      if (user) {
        try {
          const u = JSON.parse(user);
          const prefs = localStorage.getItem(`prefs_${u.id}`);
          if (prefs) {
            const parsed = JSON.parse(prefs);
            setIsDarkMode(parsed.darkMode || false);
          }
        } catch (e) {}
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      observer.disconnect();
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
