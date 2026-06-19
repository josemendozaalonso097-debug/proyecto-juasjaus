import { useState, useCallback } from 'react';
import { obtenerHistorial } from '../utils/storage';

export function useFinancial() {
  const [pendingCount, setPendingCount] = useState(0);
  const [nextPaymentDateText, setNextPaymentDateText] = useState('—');
  const [nextPaymentDateColor, setNextPaymentDateColor] = useState('');

  const updateFinancialStatus = useCallback((profileData) => {
    if (!profileData) return 0;

    const hoy = new Date();
    const mesActual = hoy.getMonth();
    const anioActual = hoy.getFullYear();

    let mesVencimientoText = 'Enero';
    let anioVencimientoText = anioActual;

    if (mesActual === 10 || mesActual === 11 || mesActual === 0) {
      mesVencimientoText = 'Enero';
      anioVencimientoText = mesActual === 0 ? anioActual : anioActual + 1;
    } else if (mesActual >= 4 && mesActual <= 6) {
      mesVencimientoText = 'Julio';
      anioVencimientoText = anioActual;
    } else if (mesActual > 0 && mesActual < 4) {
      mesVencimientoText = 'Julio';
      anioVencimientoText = anioActual;
    } else {
      mesVencimientoText = 'Enero';
      anioVencimientoText = anioActual + 1;
    }

    const textoFecha = `1 de ${mesVencimientoText} del ${anioVencimientoText}`;
    const rol = (profileData.rol || 'estudiante').toLowerCase();
    const semestreDelUsuario = parseInt(profileData.semestre || '1', 10);

    const historial = obtenerHistorial() || [];
    let pagosRealizados = 0;
    historial.forEach(compra => {
      if (compra.productos?.some(p => p.nombre.toLowerCase().includes('colegiatura'))) {
        pagosRealizados++;
      }
    });

    let pagosPendientes = 0;
    if (rol === 'estudiante') {
      pagosPendientes = Math.max(0, semestreDelUsuario - pagosRealizados);
    }

    setPendingCount(pagosPendientes);

    if (pagosPendientes === 0) {
      setNextPaymentDateText('No hay pagos pendientes');
      setNextPaymentDateColor('#27ae60');
    } else {
      setNextPaymentDateText(textoFecha);
      setNextPaymentDateColor('#e74c3c');
    }

    return pagosPendientes;
  }, []);

  return { pendingCount, nextPaymentDateText, nextPaymentDateColor, updateFinancialStatus };
}
