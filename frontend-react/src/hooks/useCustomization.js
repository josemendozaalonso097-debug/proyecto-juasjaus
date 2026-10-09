import { useContext } from 'react';
import { CustomizationContext } from '../context/customization-context';

export function useCustomization() {
  const context = useContext(CustomizationContext);
  if (!context) throw new Error('useCustomization debe usarse dentro de CustomizationProvider');
  return context;
}
