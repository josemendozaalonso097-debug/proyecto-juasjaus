import { obtenerHistorial, obtenerUsuarioActual } from '../utils/storage.js';
import { generarPDFHistorial } from '../utils/pdf.js';

export function renderizarHistorial() {
    const historialContainer = document.querySelector('.historial-compras');
    const totalComprasElem = document.querySelector('.resumen-item strong');
    const totalGastadoElem = document.querySelector('.total-amount');

    if (!historialContainer) return;

    const historial = obtenerHistorial();

    console.log('🔍 Historial del usuario actual:', historial);
    console.log('👤 Usuario actual:', obtenerUsuarioActual());

    historialContainer.innerHTML = '';

    if (historial.length === 0) {
        historialContainer.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #999;">
                <p>No hay compras registradas aún</p>
            </div>
        `;
        if (totalComprasElem) totalComprasElem.textContent = '0';
        if (totalGastadoElem) totalGastadoElem.textContent = '$0.00 MXN';
        return;
    }

    let totalGastado = 0;

    historial.reverse().forEach(compra => {
        totalGastado += compra.total;

        const compraCard = document.createElement('div');
        compraCard.className = 'compra-card';
        
        const productosHTML = compra.productos.map(prod => 
            `${prod.nombre} x${prod.cantidad}${prod.tallaSeleccionada ? ` (${prod.tallaSeleccionada})` : ''}`
        ).join(' + ');

        let badgeHTML = '';
        if (compra.estado === 'Completado') {
            badgeHTML = '<span class="badge-completado">Completado</span>';
        } else {
            badgeHTML = '<span class="badge-pendiente">Pendiente</span>';
        }

        compraCard.innerHTML = `
            <div class="compra-fecha">${compra.fecha}</div>
            <div class="compra-info">
                <h3>${productosHTML}</h3>
                <div class="compra-badges">
                    ${badgeHTML}
                    <span class="badge-metodo">${compra.metodoPago}</span>
                </div>
            </div>
            <div class="compra-precio">$${compra.total.toFixed(2)} MXN</div>
        `;
        
        historialContainer.appendChild(compraCard);
    });

    if (totalComprasElem) totalComprasElem.getContext ? totalComprasElem.textContent = historial.length : null;
    if (totalGastadoElem) totalGastadoElem.textContent = `$${totalGastado.toFixed(2)} MXN`;
}

export function abrirHistorial() {
    renderizarHistorial();
    const modal = document.getElementById('modalHistorial');
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

export function cerrarHistorial() {
    const modal = document.getElementById('modalHistorial');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

export function inicializarHistorial() {
    const secondaryBtn = document.querySelector('.btn-secondary');
    if (secondaryBtn) {
        secondaryBtn.addEventListener('click', abrirHistorial);
    }

    const btnFacturas = document.querySelector('.btn-facturas');
    if (btnFacturas) {
        btnFacturas.addEventListener('click', generarPDFHistorial);
    }
}
