import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { CustomizationContext } from './customization-context';
import { DEFAULT_CUSTOMIZATIONS } from './customization-defaults';

export function CustomizationProvider({ children }) {
  const location = useLocation();
  // Las personalizaciones son una prueba: se mantienen solo en memoria durante
  // esta carga de la aplicación y nunca se leen ni escriben desde el servidor.
  const [customizations, setCustomizations] = useState(DEFAULT_CUSTOMIZATIONS);

  const updateCustomization = useCallback((surface, config) => {
    if (!Object.prototype.hasOwnProperty.call(DEFAULT_CUSTOMIZATIONS, surface)) {
      throw new Error('Superficie de personalización desconocida');
    }
    const temporaryConfig = {
      ...DEFAULT_CUSTOMIZATIONS[surface],
      ...config,
      sections: Array.isArray(config.sections) ? [...config.sections] : [...DEFAULT_CUSTOMIZATIONS[surface].sections],
    };
    setCustomizations((current) => ({ ...current, [surface]: temporaryConfig }));
    return temporaryConfig;
  }, []);

  const resetCustomization = useCallback((surface) => {
    if (!Object.prototype.hasOwnProperty.call(DEFAULT_CUSTOMIZATIONS, surface)) {
      throw new Error('Superficie de personalización desconocida');
    }
    setCustomizations((current) => ({ ...current, [surface]: DEFAULT_CUSTOMIZATIONS[surface] }));
    return DEFAULT_CUSTOMIZATIONS[surface];
  }, []);

  const getCustomization = useCallback(
    (surface) => customizations[surface] || DEFAULT_CUSTOMIZATIONS[surface] || DEFAULT_CUSTOMIZATIONS.cbtis,
    [customizations],
  );
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

  const value = useMemo(
    () => ({ customizations, loaded: true, getCustomization, updateCustomization, resetCustomization }),
    [customizations, getCustomization, updateCustomization, resetCustomization],
  );
  return <CustomizationContext.Provider value={value}>{children}</CustomizationContext.Provider>;
}
