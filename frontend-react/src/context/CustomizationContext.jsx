import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { fetchCustomization, saveCustomization } from '../api/customization';
import { CustomizationContext } from './customization-context';

const DEFAULTS = {
  cbtis: {
    title: 'CBTis 258', tagline: 'Un motivo de orgullo', description: 'Portal escolar',
    logoUrl: '/imgs/yameharte.png', heroImageUrl: '/imgs/banner_mobile_new.jpg', catalogImageUrl: '',
    primaryColor: '#f20d0d', secondaryColor: '#6e0404', backgroundColor: '#f8f5f5',
    colorStyle: 'gradient', sections: ['pagos', 'eventos', 'tienda', 'tramites', 'seguimiento', 'orientacion'],
  },
  finanzas: {
    title: 'Financieros', tagline: 'Servicios escolares y pagos', description: 'Adquiere productos escolares o realiza tus trámites.',
    logoUrl: '/imgs/yameharte.png', heroImageUrl: '', catalogImageUrl: '', primaryColor: '#7c3aed', secondaryColor: '#4338ca',
    backgroundColor: '#f5f3ff', colorStyle: 'gradient', sections: ['seguimiento', 'tramites', 'orientacion', 'tienda'],
  },
  login: {
    title: 'CBTis 258', tagline: 'Un motivo de orgullo', description: 'Accede a tu cuenta institucional',
    logoUrl: '/imgs/yameharte.png', heroImageUrl: '/imgs/banner_mobile_new.jpg', catalogImageUrl: '',
    primaryColor: '#f20d0d', secondaryColor: '#6e0404', backgroundColor: '#f8f5f5', colorStyle: 'gradient', sections: [],
  },
};

export function CustomizationProvider({ children }) {
  const location = useLocation();
  const [customizations, setCustomizations] = useState(DEFAULTS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let alive = true;
    Promise.all(Object.keys(DEFAULTS).map(async (surface) => {
      try { return [surface, await fetchCustomization(surface)]; }
      catch { return [surface, DEFAULTS[surface]]; }
    })).then((entries) => {
      if (alive) {
        setCustomizations((current) => ({ ...current, ...Object.fromEntries(entries) }));
        setLoaded(true);
      }
    });
    return () => { alive = false; };
  }, []);

  const updateCustomization = useCallback(async (surface, config) => {
    if (!Object.prototype.hasOwnProperty.call(DEFAULTS, surface)) throw new Error('Superficie de personalización desconocida');
    const saved = await saveCustomization(surface, config);
    setCustomizations((current) => ({ ...current, [surface]: saved }));
    return saved;
  }, []);

  const getCustomization = useCallback((surface) => customizations[surface] || DEFAULTS[surface] || DEFAULTS.cbtis, [customizations]);
  const activeSurface = location.pathname.startsWith('/login') ? 'login' : 'cbtis';
  const activeTheme = getCustomization(activeSurface);
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--color-primary', activeTheme.primaryColor || '#f20d0d');
    root.style.setProperty('--color-primary-dark', activeTheme.secondaryColor || '#6e0404');
    root.style.setProperty('--color-primary-darker', activeTheme.secondaryColor || '#6e0404');
    root.style.setProperty('--color-primary-gradient', activeTheme.primaryColor || '#f20d0d');
    root.style.setProperty('--brand-background', activeTheme.backgroundColor || '#f8f5f5');
  }, [activeTheme]);

  const value = useMemo(() => ({ customizations, loaded, getCustomization, updateCustomization }), [customizations, loaded, getCustomization, updateCustomization]);
  return <CustomizationContext.Provider value={value}>{children}</CustomizationContext.Provider>;
}
