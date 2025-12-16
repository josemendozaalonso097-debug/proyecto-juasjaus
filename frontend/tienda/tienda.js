// Configuración del backend
const API_URL = 'http://localhost:8000/api';

let archivoComprobanteTransferencia = null;


// Verificar si hay un usuario logueado
window.onload = async function() {
    const token = localStorage.getItem('access_token');
    
    if (!token) {
        alert('Debes iniciar sesión primero');
        window.location.href = '../login.html';
        return;
    }
    
    // Verificar que el token sea válido
    try {
        const response = await fetch(`${API_URL}/auth/check-session`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            alert('Tu sesión ha expirado. Por favor inicia sesión nuevamente.');
            localStorage.removeItem('access_token');
            localStorage.removeItem('user');
            window.location.href = '../login.html';
            return;
        }
        
        const userData = await response.json();
        console.log('✅ Usuario autenticado en la tienda:', userData.nombre);
        
        // Renderizar historial si existe la función
        if (typeof renderizarHistorial === 'function') {
            renderizarHistorial();
        }
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error al verificar la sesión');
        window.location.href = '../login.html';
    }
}

// Base de datos de productos
const productosData = {
    // ... resto del código
    uniformes: [
        { id: 1, nombre: "Playera Blanca ", marca: "CBTis 258", precio: 350, imagen: "../imagenesTienda/BackgroundEraser_20251206_214733074.png", tallas: true },
        { id: 2, nombre: "Playera Gris", marca: "CBTis 258", precio: 350, imagen: "../imagenesTienda/BackgroundEraser_20251216_161735342.png", tallas: true },
        { id: 3, nombre: "Playera Deportiva", marca: "CBTis 258", precio: 280, imagen: "../imagenesTienda/BackgroundEraser_20251216_161748179.png", tallas: true },
        { id: 4, nombre: "Paquete completo", marca: "CBTis 258", precio: 600, imagen: "../imagenesTienda/cvtis.png", tallas: true },
        { id: 5, nombre: "Credencial", marca: "Credencial", precio: 100, imagen: "../imagenesTienda/IMG-20251216-WA0024.jpg", tallas: false }
    ],

    Libros: [
        { id: 6, nombre: "Pensamiento matematico", marca: "Libro", precio: 90, imagen: "../imagenesTienda/6475884.png", semestre: true },
        { id: 7, nombre: "Lengua y comunicacion", marca: "Libro", precio: 200, imagen: "../imagenesTienda/6475884.png", semestre: true },
        { id: 8, nombre: "Humanidades", marca: "Libro", precio: 100, imagen: "../imagenesTienda/6475884.png", semestre: true },
        { id: 9, nombre: "Socio emocional", marca: "Libro", precio: 90, imagen: "../imagenesTienda/6475884.png", semestre: true },
        { id: 10, nombre: "Ingles", marca: "Libro", precio: 90, imagen: "../imagenesTienda/6475884.png", semestre: true },
        { id: 11, nombre: "Sociales", marca: "Libro", precio: 100, imagen: "../imagenesTienda/6475884.png", semestre: true },
        { id: 12, nombre: "Conservacion de la energia", marca: "Libro 2do", precio: 140, imagen: "../imagenesTienda/6475884.png", tallas: false },
        { id: 13, nombre: "La materia y sus interacciones", marca: "Libro 1ro", precio: 150, imagen: "../imagenesTienda/6475884.png", tallas: false },
        { id: 14, nombre: "Ecosistemas", marca: "Libro 3ro", precio: 150, imagen: "../imagenesTienda/6475884.png", tallas: false },
        { id: 15, nombre: "Conciencia historica", marca: "Libros 4to y 5to", precio: 200, imagen: "../imagenesTienda/6475884.png", semestre: true },
        { id: 16, nombre: "Reacciones quimicas", marca: "Libro 4to", precio: 200, imagen: "../imagenesTienda/6475884.png", tallas: false },
        { id: 17, nombre: "Temas selectos de matematicas", marca: "Libro 4to y 5to", precio: 200, imagen: "../imagenesTienda/6475884.png", semestre: true },
        { id: 18, nombre: "La energia en los procesos de la vida diaria", marca: "Libro 5to", precio: 170, imagen: "../imagenesTienda/6475884.png", tallas: false },
        { id: 19, nombre: "Temas de filosofia", marca: "Libro 6to", precio: 160, imagen: "../imagenesTienda/6475884.png", tallas: false }
    ],
    
    tramites: [
        { id: 20, nombre: "Certificado", marca: "Documento", precio: 150, imagen: "../imagenesTienda/f71decb4816cd27d4460d37b314d2fbf-documento-de-grafico-plano.png", tallas: false },
        { id: 21, nombre: "Constancia", marca: "Documento", precio: 50, imagen: "../imagenesTienda/f71decb4816cd27d4460d37b314d2fbf-documento-de-grafico-plano.png", tallas: false },
        { id: 22, nombre: "Cardex", marca: "Documento", precio: 30, imagen: "../imagenesTienda/f71decb4816cd27d4460d37b314d2fbf-documento-de-grafico-plano.png", tallas: false },
        { id: 23, nombre: "Colegiatura", marca: "Documento", precio: 3000, imagen: "../imagenesTienda/f71decb4816cd27d4460d37b314d2fbf-documento-de-grafico-plano.png", tallas: false }
    ],
};

// Carrito de compras
let carrito = [];

// Función para abrir el modal
function abrirModal(categoria) { 
    const modal = document.getElementById('productModal');
    const modalTitle = document.getElementById('modalTitle');
    const productosGrid = document.getElementById('productosGrid');
    
    const titulos = {
        uniformes: 'Uniformes y Credenciales',
        libros: 'Papelería',
        material: 'Material Escolar',
        tramites: 'Trámites y Documentos',
        informacion: 'Información',
        subir: 'Subir Papelería'
    };
    
    modalTitle.textContent = titulos[categoria] || 'Productos';
    productosGrid.innerHTML = '';
    
    const productos = productosData[categoria] || [];
    
    if (productos.length === 0) {
        productosGrid.innerHTML = '<p style="text-align: center; padding: 40px; color: #999;">No hay productos disponibles</p>';
        modal.style.display = 'block';
        return;
    }
    
    productos.forEach(producto => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        
        productCard.innerHTML = `
            <div class="product-image-container">
                <div class="product-image-placeholder">
                    ${producto.imagen ? `<img src="${producto.imagen}" alt="${producto.nombre}">` : '👕'}
                </div>
                <div class="price-badge">$${producto.precio}</div>
            </div>
            
            <div class="product-info">
                <p class="product-brand">${producto.marca}</p>
                <h2 class="product-title">${producto.nombre}</h2>
                
                ${producto.tallas ? `
                <div class="size-selector">
                    <p class="size-label">TALLA</p>
                    <div class="size-options">
                        <button class="size-btn" data-size="XS">XS</button>
                        <button class="size-btn active" data-size="S">S</button>
                        <button class="size-btn" data-size="M">M</button>
                        <button class="size-btn" data-size="L">L</button>
                        <button class="size-btn" data-size="XL">XL</button>
                    </div>
                </div>
                ` : ''}

                ${producto.semestre ? `
                <div class="size-selector">
                    <p class="size-label">SEMESTRE</p>
                    <div class="size-options">
                        <button class="size-btn" data-size="XS">I</button>
                        <button class="size-btn active" data-size="S">II</button>
                        <button class="size-btn" data-size="M">III</button>
                        <button class="size-btn" data-size="L">IV</button>
                        <button class="size-btn" data-size="XL">V</button>
                        <button class="size-btn" data-size="XL">VI</button>
                    </div>
                </div>
                ` : ''}
                
                <div class="product-actions">
                    <button class="btn-add-cart" onclick="agregarAlCarrito(${producto.id}, '${categoria}')">
                        Agregar al carrito
                    </button>
                    <button class="btn-icon">🛒</button>
                </div>
            </div>
        `;
        
        productosGrid.appendChild(productCard);
    });
    
    document.querySelectorAll('.size-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const parent = this.closest('.size-selector');
            parent.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    modal.style.display = 'block';
}

function cerrarModal() {
    const modal = document.getElementById('productModal');
    modal.style.display = 'none';
}

window.onclick = function(event) {
    const modal = document.getElementById('productModal');
    if (event.target == modal) {
        cerrarModal();
    }
}

function agregarAlCarrito(productoId, categoria) {
    let producto = null;
    for (let cat in productosData) {
        const found = productosData[cat].find(p => p.id === productoId);
        if (found) {
            producto = { ...found };
            break;
        }
    }
    
    if (!producto) return;
    
    if (producto.tallas) {
        const sizeBtn = document.querySelector('.size-btn.active');
        producto.tallaSeleccionada = sizeBtn ? sizeBtn.getAttribute('data-size') : 'S';
    }
    
    const existente = carrito.find(item => 
        item.id === productoId && 
        (!item.tallaSeleccionada || item.tallaSeleccionada === producto.tallaSeleccionada)
    );
    
    if (existente) {
        existente.cantidad++;
    } else {
        producto.cantidad = 1;
        carrito.push(producto);
    }
    
    actualizarCarrito();
    mostrarNotificacion(`${producto.nombre} agregado al carrito`);
    cerrarModal();
}

function actualizarCarrito() {
    const carritoContainer = document.getElementById('carritoContainer');

    // Guardar en localStorage
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
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; border-bottom: 1px solid #eee; margin-bottom: 8px;">
                <div>
                    <h4 style="font-size: 0.95em; color: #94272C; margin-bottom: 4px;">${item.nombre}</h4>
                    <p style="font-size: 0.85em; color: #666;">
                        $${item.precio} x ${item.cantidad}
                        ${item.tallaSeleccionada ? ` - Talla: ${item.tallaSeleccionada}` : ''}
                    </p>
                </div>
                <button onclick="eliminarDelCarrito(${index})" style="background: #e74c3c; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 0.85em;">✕</button>
            </div>
        `;
    });
    
    html += '</div>';
    html += `
        <div style="border-top: 2px solid #94272C; padding-top: 15px; margin-top: 15px;">
            <div style="display: flex; justify-content: space-between; font-size: 1.3em; font-weight: 700; color: #94272C;">
                <span>Total:</span>
                <span>$${total.toFixed(2)}</span>
            </div>
        </div>
    `;
    
    carritoContainer.innerHTML = html;
}

// Recuperar carrito guardado si existe
const carritoGuardado = localStorage.getItem('carrito');
if (carritoGuardado) {
    carrito = JSON.parse(carritoGuardado);
    actualizarCarrito();
}




function eliminarDelCarrito(index) {
    carrito.splice(index, 1);
    actualizarCarrito();
    mostrarNotificacion('Producto eliminado del carrito');
}

function mostrarNotificacion(mensaje) {
    const notif = document.createElement('div');
    notif.textContent = mensaje;
    notif.style.cssText = `
        position: fixed;
        top: 100px;
        right: 30px;
        background: linear-gradient(135deg, #27ae60 0%, #229954 100%);
        color: white;
        padding: 15px 25px;
        border-radius: 12px;
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        font-weight: 600;
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(notif);
    
    setTimeout(() => {
        notif.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => document.body.removeChild(notif), 300);
    }, 3000);
}

const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
        const confirmLogout = confirm('¿Estás seguro que deseas cerrar sesión?');
        if (confirmLogout) {
            sessionStorage.removeItem('currentUser');
            alert('Sesión cerrada correctamente');
            window.location.href = '../login.html';
        }
    });
}

document.querySelector('.button-carrito')?.addEventListener('click', function() {
    document.querySelector('.sidebar-derecha').scrollIntoView({ behavior: 'smooth' });
});

// ========== FUNCIONALIDAD MODAL DE PAGO ==========

// Calcular el total del carrito
function calcularTotal() {
    return carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
}

// Abrir modal de selección de método de pago
function abrirModalPago() {
    if (carrito.length === 0) {
        alert('Tu carrito está vacío. Agrega productos antes de pagar.');
        return;
    }
    
    const modalMetodo = document.getElementById('modalMetodoPago');
    if (modalMetodo) {
        modalMetodo.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

// Cerrar modal de método de pago
function cerrarModalMetodo() {
    const modalMetodo = document.getElementById('modalMetodoPago');
    if (modalMetodo) {
        modalMetodo.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Seleccionar método de pago
function seleccionarMetodo(metodo) {
    const total = calcularTotal();
    const modalMetodo = document.getElementById('modalMetodoPago');
    const modalPago = document.querySelector('.add-card-page');
    
    if (metodo === 'tarjeta') {
        // Cerrar modal de método
        if (modalMetodo) {
            modalMetodo.style.display = 'none';
        }
        
        // Actualizar total
        const totalElement = document.querySelector('.form h3');
        if (totalElement) {
            totalElement.textContent = `Total a pagar: $${total.toFixed(2)} MXN`;
        }
        
        // Abrir modal de tarjeta
        if (modalPago) {
            modalPago.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
        
    } else if (metodo === 'efectivo') {
        cerrarModalMetodo();
        alert(`💵 Pago en Efectivo\n\nTotal a pagar: $${total.toFixed(2)} MXN\n\nDirígete a la caja de la institución para realizar tu pago.`);
        
    } else if (metodo === 'transferencia') {
        cerrarModalMetodo();
        abrirModalTransferencia();
        
    } else if (metodo === 'oxxo') {
        cerrarModalMetodo();
        abrirModalDeposito(); 
   }
}

// Cerrar modal de pago de tarjeta
function cerrarModalPago() {
    const modalPago = document.querySelector('.add-card-page');
    if (modalPago) {
        modalPago.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Event listener para el botón de pagar
document.addEventListener('DOMContentLoaded', function() {
    const payBtn = document.getElementById('pay-button');
    if (payBtn) {
        payBtn.addEventListener('click', function() {
            abrirModalPago();
        });
    }
});

// Cerrar modal al hacer click fuera del formulario
document.addEventListener('click', function(event) {
    const modalPago = document.querySelector('.add-card-page');
    const modalMetodo = document.getElementById('modalMetodoPago');
    
    if (modalPago && event.target === modalPago) {
        cerrarModalPago();
    }
    
    if (modalMetodo && event.target === modalMetodo) {
        cerrarModalMetodo();
    }
});

// Cerrar con tecla ESC
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const modalMetodo = document.getElementById('modalMetodoPago');
        if (modalMetodo && modalMetodo.style.display === 'block') {
            cerrarModalMetodo();
        }
        
        const modalPago = document.querySelector('.add-card-page');
        if (modalPago && modalPago.style.display === 'flex') {
            cerrarModalPago();
        }
    }
});

function generarComprobanteTarjeta() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const total = calcularTotal();
    const nombreTarjeta = document.querySelector('input[name="input-name"]')?.value || 'No especificado';
    const numeroTarjeta = document.getElementById('serialCardNumber')?.value || 'XXXX XXXX XXXX XXXX';
    
    // Encabezado
    doc.setFillColor(148, 39, 44);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('CBTis 258', 105, 20, { align: 'center' });
    doc.setFontSize(14);
    doc.text('COMPROBANTE DE PAGO', 105, 32, { align: 'center' });
    
    // Información
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text(`Método: Tarjeta de Crédito/Débito`, 20, 55);
    doc.text(`Titular: ${nombreTarjeta}`, 20, 65);
    doc.text(`Tarjeta: ${numeroTarjeta}`, 20, 75);
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-MX')}`, 20, 85);
    
    // Tabla de productos
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('PRODUCTOS:', 20, 100);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(11);
    
    let y = 110;
    carrito.forEach(item => {
        const linea = `• ${item.nombre} x${item.cantidad}${item.tallaSeleccionada ? ` (${item.tallaSeleccionada})` : ''} - $${(item.precio * item.cantidad).toFixed(2)}`;
        doc.text(linea, 25, y);
        y += 8;
    });
    
    // Total
    doc.setDrawColor(148, 39, 44);
    doc.setLineWidth(0.5);
    doc.line(20, y + 5, 190, y + 5);
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text(`TOTAL: $${total.toFixed(2)} MXN`, 105, y + 15, { align: 'center' });
    
    // Pie
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('Gracias por tu compra', 105, y + 30, { align: 'center' });
    doc.text('CBTis 258 - Un motivo de orgullo', 105, y + 37, { align: 'center' });
    
    doc.save('comprobante_tarjeta.pdf');
}


// ================== GENERAR COMPROBANTE TARJETA ==================
function generarComprobanteTarjeta() {
    const total = calcularTotal();
    const nombreTarjeta = document.querySelector('input[name="input-name"]')?.value || 'No especificado';
    const numeroTarjeta = document.getElementById('serialCardNumber')?.value || 'XXXX XXXX XXXX XXXX';
    
    let contenido = `
COMPROBANTE DE PAGO
-----------------------------
Tipo de pago: Tarjeta
Titular: ${nombreTarjeta}
Número de tarjeta: ${numeroTarjeta}
Monto: $${total.toFixed(2)} MXN
-----------------------------
Productos:
${carrito.map(item => `- ${item.nombre} x ${item.cantidad} ${item.tallaSeleccionada ? '(Talla: ' + item.tallaSeleccionada + ')' : ''} - $${(item.precio * item.cantidad).toFixed(2)}`).join('\n')}
`;

    const blob = new Blob([contenido], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'comprobante_tarjeta.txt';
    a.click();
    URL.revokeObjectURL(url);
}

// ================== BOTÓN DE VERIFICAR PAGO ==================
const checkoutBtn = document.querySelector('.checkout-btn');
if (checkoutBtn) {
    checkoutBtn.addEventListener('click', function() {
        const total = calcularTotal();
        
        // Guardar en historial
        const fecha = new Date();
        const meses = ['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC'];
        const fechaFormato = `${fecha.getDate().toString().padStart(2, '0')}/${meses[fecha.getMonth()]}/${fecha.getFullYear()}`;
        
        const compra = {
            fecha: fechaFormato,
            metodoPago: 'Tarjeta',
            productos: carrito.map(item => ({
                nombre: item.nombre,
                precio: item.precio,
                cantidad: item.cantidad,
                tallaSeleccionada: item.tallaSeleccionada
            })),
            total: total,
            estado: 'Completado'
        };
        
        let historial = JSON.parse(localStorage.getItem('historialCompras')) || [];
        historial.push(compra);
        localStorage.setItem('historialCompras', JSON.stringify(historial));

        // ===== DESCARGAR COMPROBANTE =====

        // Generar PDF
const { jsPDF } = window.jspdf;
const doc = new jsPDF();
const nombreTarjeta = document.querySelector('input[name="input-name"]')?.value || 'No especificado';
const numeroTarjeta = document.getElementById('serialCardNumber')?.value || 'XXXX XXXX XXXX XXXX';

doc.setFillColor(148, 39, 44);
doc.rect(0, 0, 210, 40, 'F');
doc.setTextColor(255, 255, 255);
doc.setFontSize(24);
doc.text('CBTis 258', 105, 20, { align: 'center' });
doc.setFontSize(14);
doc.text('COMPROBANTE DE PAGO', 105, 32, { align: 'center' });

doc.setTextColor(0, 0, 0);
doc.setFontSize(12);
doc.text(`Método: Tarjeta`, 20, 55);
doc.text(`Titular: ${nombreTarjeta}`, 20, 65);
doc.text(`Tarjeta: ${numeroTarjeta}`, 20, 75);
doc.text(`Fecha: ${fechaFormato}`, 20, 85);

doc.setFontSize(14);
doc.setFont(undefined, 'bold');
doc.text('PRODUCTOS:', 20, 100);
doc.setFont(undefined, 'normal');
doc.setFontSize(11);

let y = 110;
carrito.forEach(item => {
    doc.text(`• ${item.nombre} x${item.cantidad}${item.tallaSeleccionada ? ` (${item.tallaSeleccionada})` : ''} - $${(item.precio * item.cantidad).toFixed(2)}`, 25, y);
    y += 8;
});

doc.setLineWidth(0.5);
doc.line(20, y + 5, 190, y + 5);
doc.setFontSize(16);
doc.setFont(undefined, 'bold');
doc.text(`TOTAL: $${total.toFixed(2)} MXN`, 105, y + 15, { align: 'center' });

doc.setFontSize(10);
doc.setFont(undefined, 'normal');
doc.setTextColor(100, 100, 100);
doc.text('Gracias por tu compra', 105, y + 30, { align: 'center' });

doc.save('comprobante_tarjeta.pdf');

        carrito = [];
        localStorage.removeItem('carrito');
        actualizarCarrito();
    }); // ← cierra addEventListener
} // ← cierra if (checkoutBtn)

    

// ========== VALIDACIÓN Y FORMATEO DE TARJETA ==========

document.addEventListener('DOMContentLoaded', function() {
    const cardNumberInput = document.getElementById('serialCardNumber');
    const expiryInput = document.getElementById('ExDate');
    const cvvInput = document.getElementById('cvv');
    const nameInput = document.querySelector('input[name="input-name"]');
    
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', function(e) {
            let raw = e.target.value.replace(/\D/g, '');
            raw = raw.slice(0, 16);
            
            let formatted = raw.replace(/(.{4})/g, '$1 ').trim();
            e.target.value = formatted;
            
            if (raw.length === 16) {
                addValidationIcon(cardNumberInput, true);
            } else {
                addValidationIcon(cardNumberInput, false);
            }
            
            detectCardType(raw);
        });
    }
    
    if (expiryInput) {
        expiryInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            
            if (value.length >= 2) {
                value = value.substring(0, 2) + '/' + value.substring(2, 4);
            }
            
            e.target.value = value;
            
            if (value.length === 5) {
                const [month, year] = value.split('/');
                if (parseInt(month) >= 1 && parseInt(month) <= 12) {
                    addValidationIcon(expiryInput, true);
                } else {
                    addValidationIcon(expiryInput, false);
                }
            } else {
                removeValidationIcon(expiryInput);
            }
        });
        
        expiryInput.addEventListener('keypress', function(e) {
            if (this.value.length >= 5) {
                e.preventDefault();
            }
        });
    }
    
    if (cvvInput) {
        cvvInput.addEventListener('input', function(e) {
            if (e.target.value.length > 4) {
                e.target.value = e.target.value.slice(0, 4);
            }
            
            if (e.target.value.length >= 3) {
                addValidationIcon(cvvInput, true);
            } else {
                removeValidationIcon(cvvInput);
            }
        });
    }
    
    if (nameInput) {
        nameInput.addEventListener('input', function(e) {
            if (e.target.value.trim().length >= 3) {
                addValidationIcon(nameInput, true);
            } else {
                removeValidationIcon(nameInput);
            }
        });
    }
});

function detectCardType(cardNumber) {
    const cardNumberInput = document.getElementById('serialCardNumber');
    let cardType = '';
    
    const existingLogo = document.querySelector('.card-logo');
    if (existingLogo) {
        existingLogo.remove();
    }
    
    if (cardNumber.startsWith('4')) {
        cardType = 'visa';
    } else if (cardNumber.startsWith('5')) {
        cardType = 'mastercard';
    } else if (cardNumber.startsWith('37') || cardNumber.startsWith('34')) {
        cardType = 'amex';
    } else if (cardNumber.length < 1) {
        return;
    } else {
        cardType = 'generic';
    }
    
    if (cardNumber.length > 0) {
        const logo = document.createElement('div');
        logo.className = 'card-logo';
        logo.innerHTML = getCardLogo(cardType);
        
        const label = cardNumberInput.closest('.label');
        label.style.position = 'relative';
        label.appendChild(logo);
    }
}

function getCardLogo(type) {
    const logos = {
        visa: `<svg width="50" height="32" viewBox="0 0 50 32" fill="none">
                <rect width="50" height="32" rx="4" fill="#1434CB"/>
                <text x="25" y="20" font-family="Arial" font-weight="bold" font-size="12" fill="white" text-anchor="middle">VISA</text>
               </svg>`,
        mastercard: `<svg width="50" height="32" viewBox="0 0 50 32" fill="none">
                      <rect width="50" height="32" rx="4" fill="#EB001B"/>
                      <circle cx="19" cy="16" r="10" fill="#FF5F00" opacity="0.8"/>
                      <circle cx="31" cy="16" r="10" fill="#F79E1B" opacity="0.8"/>
                     </svg>`,
        amex: `<svg width="50" height="32" viewBox="0 0 50 32" fill="none">
                <rect width="50" height="32" rx="4" fill="#006FCF"/>
                <text x="25" y="20" font-family="Arial" font-weight="bold" font-size="10" fill="white" text-anchor="middle">AMEX</text>
               </svg>`,
        generic: `<svg width="50" height="32" viewBox="0 0 50 32" fill="none">
                   <rect width="50" height="32" rx="4" fill="#94272C"/>
                   <rect x="5" y="8" width="40" height="6" rx="2" fill="white" opacity="0.3"/>
                   <rect x="5" y="18" width="15" height="4" rx="1" fill="white" opacity="0.5"/>
                  </svg>`
    };
    
    return logos[type] || logos.generic;
}

function addValidationIcon(input, isValid) {
    removeValidationIcon(input);
    
    const icon = document.createElement('span');
    icon.className = 'validation-icon';
    
    if (isValid) {
        icon.innerHTML = '✓';
        icon.style.color = '#27ae60';
        input.style.borderColor = '#27ae60';
    } else {
        icon.innerHTML = '✕';
        icon.style.color = '#e74c3c';
        input.style.borderColor = '#e74c3c';
    }
    
    input.parentElement.style.position = 'relative';
    input.parentElement.appendChild(icon);
}

function removeValidationIcon(input) {
    const existingIcon = input.parentElement.querySelector('.validation-icon');
    if (existingIcon) {
        existingIcon.remove();
    }
    input.style.borderColor = '#97242c';
}

(function(){
  const payBtn = document.getElementById('pay-button');
  if (payBtn && typeof abrirModalPago === 'function') {
    payBtn.addEventListener('click', abrirModalPago);
  }
})();

// ========== MODAL DE DEPÓSITO ==========

let archivoComprobante = null;

function abrirModalDeposito() {
    const total = calcularTotal();
    
    // Actualizar el monto
    document.getElementById('montoDeposito').textContent = `$${total.toFixed(2)} MXN`;
    
    // Mostrar modal
    const modalDeposito = document.getElementById('modalDeposito');
    if (modalDeposito) {
        modalDeposito.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

function cerrarModalDeposito() {
    const modalDeposito = document.getElementById('modalDeposito');
    if (modalDeposito) {
        modalDeposito.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
    
    // Limpiar formulario
    limpiarFormularioDeposito();
}

// Funcionalidad de subida de archivo
document.addEventListener('DOMContentLoaded', function() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('comprobanteFile');
    
    if (uploadArea && fileInput) {
        uploadArea.addEventListener('click', function() {
            fileInput.click();
        });
        
        fileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                // Validar tamaño (5MB máx)
                if (file.size > 5 * 1024 * 1024) {
                    alert('El archivo es demasiado grande. Máximo 5MB.');
                    return;
                }
                
                // Validar tipo
                const tiposPermitidos = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
                if (!tiposPermitidos.includes(file.type)) {
                    alert('Solo se permiten archivos PNG, JPG o PDF.');
                    return;
                }
                
                archivoComprobante = file;
                mostrarArchivoSeleccionado(file.name);
            }
        });
    }
});

function mostrarArchivoSeleccionado(nombre) {
    document.getElementById('uploadArea').style.display = 'none';
    document.getElementById('archivoInfo').style.display = 'flex';
    document.getElementById('nombreArchivo').textContent = nombre;
}

function quitarArchivo() {
    archivoComprobante = null;
    document.getElementById('comprobanteFile').value = '';
    document.getElementById('uploadArea').style.display = 'block';
    document.getElementById('archivoInfo').style.display = 'none';
}

function enviarComprobante() {
    if (!archivoComprobante) {
        alert('Por favor selecciona un comprobante de pago.');
        return;
    }
    
    const total = calcularTotal();
    const referencia = document.getElementById('referenciaDeposito').value;
    const banco = document.getElementById('bancoOrigen').value;
    const fechaInput = document.getElementById('fechaDeposito').value;
    
    // Guardar en historial
    const fecha = new Date();
    const meses = ['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC'];
    const fechaFormato = `${fecha.getDate().toString().padStart(2, '0')}/${meses[fecha.getMonth()]}/${fecha.getFullYear()}`;
    
    const compra = {
        fecha: fechaFormato,
        metodoPago: 'Depósito',
        productos: carrito.map(item => ({
            nombre: item.nombre,
            precio: item.precio,
            cantidad: item.cantidad,
            tallaSeleccionada: item.tallaSeleccionada
        })),
        total: total,
        estado: 'Pendiente'
    };
    
    let historial = JSON.parse(localStorage.getItem('historialCompras')) || [];
    historial.push(compra);
    localStorage.setItem('historialCompras', JSON.stringify(historial));
    
    // ===== DESCARGAR COMPROBANTE =====
   
    // Generar PDF
const { jsPDF } = window.jspdf;
const doc = new jsPDF();
const nombreTarjeta = document.querySelector('input[name="input-name"]')?.value || 'No especificado';
const numeroTarjeta = document.getElementById('serialCardNumber')?.value || 'XXXX XXXX XXXX XXXX';

doc.setFillColor(148, 39, 44);
doc.rect(0, 0, 210, 40, 'F');
doc.setTextColor(255, 255, 255);
doc.setFontSize(24);
doc.text('CBTis 258', 105, 20, { align: 'center' });
doc.setFontSize(14);
doc.text('COMPROBANTE DE PAGO', 105, 32, { align: 'center' });

doc.setTextColor(0, 0, 0);
doc.setFontSize(12);
doc.text(`Método: Depósito`, 20, 55);
doc.text(`Titular: ${nombreTarjeta}`, 20, 65);
doc.text(`Tarjeta: ${numeroTarjeta}`, 20, 75);
doc.text(`Fecha: ${fechaFormato}`, 20, 85);

doc.setFontSize(14);
doc.setFont(undefined, 'bold');
doc.text('PRODUCTOS:', 20, 100);
doc.setFont(undefined, 'normal');
doc.setFontSize(11);

let y = 110;
carrito.forEach(item => {
    doc.text(`• ${item.nombre} x${item.cantidad}${item.tallaSeleccionada ? ` (${item.tallaSeleccionada})` : ''} - $${(item.precio * item.cantidad).toFixed(2)}`, 25, y);
    y += 8;
});

doc.setLineWidth(0.5);
doc.line(20, y + 5, 190, y + 5);
doc.setFontSize(16);
doc.setFont(undefined, 'bold');
doc.text(`TOTAL: $${total.toFixed(2)} MXN`, 105, y + 15, { align: 'center' });

doc.setFontSize(10);
doc.setFont(undefined, 'normal');
doc.setTextColor(100, 100, 100);
doc.text('Gracias por tu compra', 105, y + 30, { align: 'center' });

doc.save('comprobante_Deposito.pdf');
    
    const confirmacion = document.createElement('div');
    confirmacion.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 40px;
        border-radius: 20px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        z-index: 10003;
        text-align: center;
        max-width: 400px;
        border: 3px solid #27ae60;
    `;
    
    confirmacion.innerHTML = `
        <div style="font-size: 4em; margin-bottom: 20px;">✅</div>
        <h2 style="color: #27ae60; margin-bottom: 15px; font-size: 1.5em;">¡Comprobante recibido!</h2>
        <p style="color: #666; margin-bottom: 20px; line-height: 1.6;">
            Tu comprobante fue recibido exitosamente.<br>
            <strong>Estado: Pendiente de verificación</strong><br><br>
            Tu comprobante ha sido descargado automáticamente.
        </p>
        <button onclick="this.parentElement.remove(); document.body.style.overflow = 'auto';" style="
            background: #27ae60;
            color: white;
            border: none;
            padding: 12px 30px;
            border-radius: 10px;
            font-size: 1em;
            font-weight: 600;
            cursor: pointer;
        ">Entendido</button>
    `;
    
    document.body.appendChild(confirmacion);

    carrito = [];
    localStorage.removeItem('carrito');
    actualizarCarrito();
}


function mostrarConfirmacionDeposito() {
    const confirmacion = document.createElement('div');
    confirmacion.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 40px;
        border-radius: 20px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        z-index: 10003;
        text-align: center;
        max-width: 400px;
        border: 3px solid #27ae60;
    `;
    
    confirmacion.innerHTML = `
        <div style="font-size: 4em; margin-bottom: 20px;">✅</div>
        <h2 style="color: #27ae60; margin-bottom: 15px; font-size: 1.5em;">¡Comprobante recibido!</h2>
        <p style="color: #666; margin-bottom: 20px; line-height: 1.6;">
            Tu comprobante de depósito fue recibido exitosamente.<br>
            <strong>Estado: Pendiente de verificación</strong><br><br>
            Te notificaremos una vez que sea validado.
        </p>
        <button onclick="this.parentElement.remove(); document.body.style.overflow = 'auto';" style="
            background: #27ae60;
            color: white;
            border: none;
            padding: 12px 30px;
            border-radius: 10px;
            font-size: 1em;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
        ">Entendido</button>
    `;

    document.body.appendChild(confirmacion);
    document.body.style.overflow = 'hidden';
}

// Después de subir comprobante y dar clic en enviar
agregarHistorial({
    productos: [...carrito],
    metodoPago: 'Depósito',
    fecha: new Date().toLocaleString()
});


function limpiarFormularioDeposito() {
    quitarArchivo();
    document.getElementById('referenciaDeposito').value = '';
    document.getElementById('bancoOrigen').value = '';
    document.getElementById('fechaDeposito').value = '';
}

// Cerrar modal de depósito con ESC
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const modalDeposito = document.getElementById('modalDeposito');
        if (modalDeposito && modalDeposito.style.display === 'block') {
            cerrarModalDeposito();
        }
    }
});

// Cerrar al hacer click fuera
window.addEventListener('click', function(event) {
    const modalDeposito = document.getElementById('modalDeposito');
    if (event.target === modalDeposito) {
        cerrarModalDeposito();
    }
});



//let archivoComprobanteTransferencia = null;

// Abrir modal de transferencia
function abrirModalTransferencia() {
    const total = calcularTotal();

    document.getElementById('montoTransferencia').textContent =
        `$${total.toFixed(2)} MXN`;

    const modal = document.getElementById('modalTransferencia');
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';

    // 🔥 SUBIDA DE ARCHIVO TRANSFERENCIA (AQUÍ Y SOLO AQUÍ)
    const uploadArea = document.getElementById('uploadAreaTransferencia');
    const fileInput = document.getElementById('comprobanteFileTransferencia');

    if (!uploadArea || !fileInput) {
        console.error('❌ IDs de transferencia no existen');
        return;
    }

    uploadArea.onclick = () => fileInput.click();

    fileInput.onchange = (e) => {
        const file = e.target.files[0];
        if (file) procesarArchivoTransferencia(file);
    };
}



// Cerrar modal de transferencia
function cerrarModalTransferencia() {
    const modalTransferencia = document.getElementById('modalTransferencia');
    if (modalTransferencia) {
        modalTransferencia.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
    
    // Limpiar formulario
    limpiarFormularioTransferencia();
}

// Función para copiar texto al portapapeles
function copiarTexto(elementId) {
    const elemento = document.getElementById(elementId);
    if (!elemento) return;
    
    const texto = elemento.textContent;
    
    // Usar la API moderna del portapapeles
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(texto).then(() => {
            mostrarNotificacion('✓ Copiado al portapapeles');
        }).catch(err => {
            console.error('Error al copiar:', err);
            copiarTextoFallback(texto);
        });
    } else {
        // Fallback para navegadores antiguos
        copiarTextoFallback(texto);
    }
}

// Método fallback para copiar texto
function copiarTextoFallback(texto) {
    const textArea = document.createElement('textarea');
    textArea.value = texto;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        mostrarNotificacion('✓ Copiado al portapapeles');
    } catch (err) {
        console.error('Error al copiar:', err);
        alert('No se pudo copiar automáticamente. Por favor copia manualmente.');
    }
    
    document.body.removeChild(textArea);
}

// Inicializar funcionalidad de subida de archivo para deposito
document.addEventListener('DOMContentLoaded', function() {
    // TAMBIÉN inicializar subida para DEPÓSITO
    const uploadAreaDeposito = document.getElementById('uploadArea');
    const fileInputDeposito = document.getElementById('comprobanteFile');
    
    if (uploadAreaDeposito && fileInputDeposito) {
        uploadAreaDeposito.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            fileInputDeposito.click();
        });
        
        fileInputDeposito.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                // Validar tamaño (5MB máx)
                if (file.size > 5 * 1024 * 1024) {
                    alert('El archivo es demasiado grande. Máximo 5MB.');
                    return;
                }
                
                // Validar tipo
                const tiposPermitidos = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
                if (!tiposPermitidos.includes(file.type)) {
                    alert('Solo se permiten archivos PNG, JPG o PDF.');
                    return;
                }
                
                archivoComprobante = file;
                mostrarArchivoSeleccionado(file.name);
            }
        });
    }
});

//let archivoComprobanteTransferencia = null;


// Procesar archivo de transferencia
function procesarArchivoTransferencia(file) {
    // Validar tamaño (5MB máx)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
        alert('El archivo es demasiado grande. Máximo 5MB.');
        return;
    }
    
    // Validar tipo
    const tiposPermitidos = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
    if (!tiposPermitidos.includes(file.type)) {
        alert('Solo se permiten archivos PNG, JPG o PDF.');
        return;
    }
    
    // Archivo válido
    archivoComprobanteTransferencia = file;
    mostrarArchivoSeleccionadoTransferencia(file.name);
}

// Mostrar archivo seleccionado
function mostrarArchivoSeleccionadoTransferencia(nombre) {
    const uploadArea = document.getElementById('uploadAreaTransferencia');
    const archivoInfo = document.getElementById('archivoInfoTransferencia');
    const nombreArchivo = document.getElementById('nombreArchivoTransferencia');
    
    if (uploadArea && archivoInfo && nombreArchivo) {
        uploadArea.style.display = 'none';
        archivoInfo.style.display = 'flex';
        nombreArchivo.textContent = nombre;
    }
}

// Quitar archivo
function quitarArchivoTransferencia() {
    archivoComprobanteTransferencia = null;
    const fileInput = document.getElementById('comprobanteFileTransferencia');
    const uploadArea = document.getElementById('uploadAreaTransferencia');
    const archivoInfo = document.getElementById('archivoInfoTransferencia');
    
    if (fileInput) fileInput.value = '';
    if (uploadArea) uploadArea.style.display = 'block';
    if (archivoInfo) archivoInfo.style.display = 'none';
}

// Enviar comprobante de transferencia
function enviarComprobanteTransferencia() {
    if (!archivoComprobanteTransferencia) {
        alert('Por favor selecciona un comprobante de pago.');
        return;
    }

    const referencia = document.getElementById('referenciaTransferencia').value || 'N/A';
    const banco = document.getElementById('bancoOrigenTransferencia').value || 'N/A';
    const fecha = document.getElementById('fechaTransferencia').value || new Date().toISOString().split('T')[0];
    const total = calcularTotal();

    // ================== 1️⃣ GENERAR TXT ==================
   // Generar PDF
const { jsPDF } = window.jspdf;
const doc = new jsPDF();
const nombreTarjeta = document.querySelector('input[name="input-name"]')?.value || 'No especificado';
const numeroTarjeta = document.getElementById('serialCardNumber')?.value || 'XXXX XXXX XXXX XXXX';

doc.setFillColor(148, 39, 44);
doc.rect(0, 0, 210, 40, 'F');
doc.setTextColor(255, 255, 255);
doc.setFontSize(24);
doc.text('CBTis 258', 105, 20, { align: 'center' });
doc.setFontSize(14);
doc.text('COMPROBANTE DE PAGO', 105, 32, { align: 'center' });

doc.setTextColor(0, 0, 0);
doc.setFontSize(12);
doc.text(`Método: Transferencia`, 20, 55);
doc.text(`Titular: ${nombreTarjeta}`, 20, 65);
doc.text(`Tarjeta: ${numeroTarjeta}`, 20, 75);
//doc.text(`Fecha: ${fechaFormato}`, 20, 85);

doc.setFontSize(14);
doc.setFont(undefined, 'bold');
doc.text('PRODUCTOS:', 20, 100);
doc.setFont(undefined, 'normal');
doc.setFontSize(11);

let y = 110;
carrito.forEach(item => {
    doc.text(`• ${item.nombre} x${item.cantidad}${item.tallaSeleccionada ? ` (${item.tallaSeleccionada})` : ''} - $${(item.precio * item.cantidad).toFixed(2)}`, 25, y);
    y += 8;
});

doc.setLineWidth(0.5);
doc.line(20, y + 5, 190, y + 5);
doc.setFontSize(16);
doc.setFont(undefined, 'bold');
doc.text(`TOTAL: $${total.toFixed(2)} MXN`, 105, y + 15, { align: 'center' });

doc.setFontSize(10);
doc.setFont(undefined, 'normal');
doc.setTextColor(100, 100, 100);
doc.text('Gracias por tu compra', 105, y + 30, { align: 'center' });

doc.save('comprobante_transferencia.pdf');

    // ===== GUARDAR EN HISTORIAL (MISMO QUE DEPÓSITO) =====
const fechaObj = new Date();
const meses = ['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC'];
const fechaFormato = `${fechaObj.getDate().toString().padStart(2, '0')}/${meses[fechaObj.getMonth()]}/${fechaObj.getFullYear()}`;

const compra = {
    fecha: fechaFormato,
    metodoPago: 'Transferencia',
    productos: carrito.map(item => ({
        nombre: item.nombre,
        precio: item.precio,
        cantidad: item.cantidad,
        tallaSeleccionada: item.tallaSeleccionada
    })),
    total: total,
    estado: 'Pendiente'
};

let historial = JSON.parse(localStorage.getItem('historialCompras')) || [];
historial.push(compra);
localStorage.setItem('historialCompras', JSON.stringify(historial));


    // ================== 3️⃣ CERRAR + CONFIRMACIÓN ==================
    cerrarModalTransferencia();
    mostrarConfirmacionTransferencia();

    // ================== 4️⃣ VACIAR CARRITO ==================
carrito = [];
actualizarCarrito();

}


// Mostrar confirmación
function mostrarConfirmacionTransferencia() {
    const confirmacion = document.createElement('div');
    confirmacion.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 40px;
        border-radius: 20px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        z-index: 10003;
        text-align: center;
        max-width: 400px;
        border: 3px solid #27ae60;
    `;
    
    confirmacion.innerHTML = `
        <div style="font-size: 4em; margin-bottom: 20px;">✅</div>
        <h2 style="color: #27ae60; margin-bottom: 15px; font-size: 1.5em;">¡Comprobante recibido!</h2>
        <p style="color: #666; margin-bottom: 20px; line-height: 1.6;">
            Tu comprobante de transferencia fue recibido exitosamente.<br>
            <strong>Estado: Pendiente de verificación</strong><br><br>
            Te notificaremos una vez que sea validado.
        </p>
        <button onclick="this.parentElement.remove(); document.body.style.overflow = 'auto';" style="
            background: #27ae60;
            color: white;
            border: none;
            padding: 12px 30px;
            border-radius: 10px;
            font-size: 1em;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
        ">Entendido</button>
    `;
    
    document.body.appendChild(confirmacion);
    document.body.style.overflow = 'hidden';
}

agregarHistorial({
    productos: [...carrito],
    metodoPago: 'Transferencia',
    fecha: new Date().toLocaleString()
});


// Limpiar formulario
function limpiarFormularioTransferencia() {
    quitarArchivoTransferencia();
    const referencia = document.getElementById('referenciaTransferencia');
    const banco = document.getElementById('bancoOrigenTransferencia');
    const fecha = document.getElementById('fechaTransferencia');
    
    if (referencia) referencia.value = '';
    if (banco) banco.value = '';
    if (fecha) fecha.value = '';
}

// Cerrar con ESC
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const modalTransferencia = document.getElementById('modalTransferencia');
        if (modalTransferencia && modalTransferencia.style.display === 'block') {
            cerrarModalTransferencia();
        }
    }
});

// Cerrar al hacer click fuera
window.addEventListener('click', function(event) {
    const modalTransferencia = document.getElementById('modalTransferencia');
    if (event.target === modalTransferencia) {
        cerrarModalTransferencia();
    }
});

// ========== SISTEMA DE HISTORIAL UNIFICADO ==========

function agregarAlHistorialUnificado(metodoPago) {
    const fecha = new Date();
    const fechaFormato = `${fecha.getDate().toString().padStart(2, '0')}/${
        (fecha.getMonth() + 1).toString().padStart(2, '0')}/${
        fecha.getFullYear()}`;
    
    // Calcular total
    const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    
    // Crear el objeto de compra
    const compra = {
        fecha: fechaFormato,
        nombre: `Compra en Tienda - ${carrito.length} producto(s)`,
        precio: total,
        metodoPago: metodoPago,
        productos: carrito.map(item => ({
            nombre: item.nombre,
            cantidad: item.cantidad,
            precio: item.precio,
            tallaSeleccionada: item.tallaSeleccionada || null
        }))
    };
    
    // Obtener historial existente
    let historial = JSON.parse(localStorage.getItem('historial')) || [];
    
    // Agregar nueva compra
    historial.push(compra);
    
    // Guardar en localStorage
    localStorage.setItem('historial', JSON.stringify(historial));
    
    console.log('✅ Compra agregada al historial:', compra);
}

document.addEventListener('DOMContentLoaded', renderizarHistorial);