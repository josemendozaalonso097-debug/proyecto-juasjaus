import { mostrarNotificacion } from '../utils/notificaciones.js?v=2';

export let carrito = [];

export function inicializarCarrito() {
    const carritoGuardado = localStorage.getItem('carrito');
    if (carritoGuardado) {
        carrito = JSON.parse(carritoGuardado);
        actualizarCarrito();
    }
}

export function vaciarCarrito() {
    carrito = [];
    localStorage.removeItem('carrito');
    actualizarCarrito();
}

export function calcularTotal() {
    return carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
}

export function eliminarDelCarrito(index) {
    carrito.splice(index, 1);
    actualizarCarrito();
    mostrarNotificacion('Producto eliminado del carrito');
}

export function actualizarCarrito() {
    const carritoContainer = document.getElementById('carritoContainer');
    if(!carritoContainer) return;

    localStorage.setItem('carrito', JSON.stringify(carrito));

    if (carrito.length === 0) {
        carritoContainer.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">No hay productos seleccionados</p>';
        return;
    }
    
    let total = 0;
    let html = '<div style="max-height: 400px; overflow-y: auto;">';
    
    carrito.forEach((item, index) => {
        const subtotal = item.precio * item.cantidad;
        total += subtotal;
        
        html += `
            <div class="carrito-item-wrap" style="display: flex; justify-content: space-between; align-items: center; padding: 12px; border-bottom: 1px solid #eee; margin-bottom: 8px;">
                <div>
                    <h4 class="carrito-item-title" style="font-size: 0.95em; color: #94272C; margin-bottom: 4px;">${item.nombre}</h4>
                    <p class="carrito-item-text" style="font-size: 0.85em; color: #666;">
                        $${item.precio} x ${item.cantidad}
                        ${item.tallaSeleccionada ? ` - Talla: ${item.tallaSeleccionada}` : ''}
                    </p>
                </div>
                <button type="button" class="btn-eliminar-item" data-index="${index}" style="background: #e74c3c; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 0.85em;">✕</button>
            </div>
        `;
    });
    
    html += '</div>';
    html += `
        <div class="carrito-total" style="border-top: 2px solid #94272C; padding-top: 15px; margin-top: 15px;">
            <div style="display: flex; justify-content: space-between; font-size: 1.3em; font-weight: 700; color: #94272C;">
                <span>Total:</span>
                <span>$${total.toFixed(2)}</span>
            </div>
        </div>
    `;
    
    carritoContainer.innerHTML = html;

    document.querySelectorAll('.btn-eliminar-item').forEach(btn => {
        btn.addEventListener('click', function() {
            eliminarDelCarrito(parseInt(this.getAttribute('data-index')));
        });
    });
}
