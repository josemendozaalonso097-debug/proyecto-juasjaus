// Verificar si hay un usuario logueado
window.onload = function() {
    const currentUser = sessionStorage.getItem('currentUser');
    
    if (!currentUser) {
        alert('Debes iniciar sesión primero');
        window.location.href = '../login.html';
        return;
    }
}

// Base de datos de productos
const productosData = {
    uniformes: [
        { id: 1, nombre: "Playera Blanca ", marca: "CBTis 258", precio: 350, imagen: "", tallas: true },
        { id: 2, nombre: "Playera Gris", marca: "CBTis 258", precio: 350, imagen: "", tallas: true },
        { id: 3, nombre: "Playera Deportiva", marca: "CBTis 258", precio: 280, imagen: "", tallas: true },
        { id: 4, nombre: "Paquete completo", marca: "CBTis 258", precio: 600, imagen: "", tallas: true },
        { id: 5, nombre: "Credencial", marca: "Credencial", precio: 100, imagen: "", tallas: false }
    ],
    papeleria: [
        { id: 6, nombre: "Libreta 100 hojas", marca: "Profesional", precio: 45, imagen: "", tallas: false },
        { id: 7, nombre: "Libreta 200 hojas", marca: "Profesional", precio: 75, imagen: "", tallas: false },
        { id: 8, nombre: "Juego de Plumas", marca: "Colores", precio: 55, imagen: "", tallas: false },
        { id: 9, nombre: "Kit Escolar", marca: "Básico", precio: 35, imagen: "", tallas: false }
    ],
    
    tramites: [
        { id: 16, nombre: "Certificado", marca: "Documento", precio: 150, imagen: "", tallas: false },
        { id: 17, nombre: "Constancia", marca: "Documento", precio: 50, imagen: "", tallas: false },
        { id: 18, nombre: "Cardex", marca: "Documento", precio: 30, imagen: "", tallas: false }
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
        papeleria: 'Papelería',
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
                    <p class="size-label">SIZE</p>
                    <div class="size-options">
                        <button class="size-btn" data-size="XS">XS</button>
                        <button class="size-btn active" data-size="S">S</button>
                        <button class="size-btn" data-size="M">M</button>
                        <button class="size-btn" data-size="L">L</button>
                        <button class="size-btn" data-size="XL">XL</button>
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
    
    if (metodo === 'tarjeta') {
        // Cerrar modal de método y abrir modal de tarjeta
        cerrarModalMetodo();
        
        const totalElement = document.querySelector('.form h3');
        if (totalElement) {
            totalElement.textContent = `Total a pagar: $${total.toFixed(2)} MXN`;
        }
        
        const modalPago = document.querySelector('.add-card-page');
        if (modalPago) {
            modalPago.style.display = 'flex';
        }
        
    } else if (metodo === 'efectivo') {
        cerrarModalMetodo();
        alert(`💵 Pago en Efectivo\n\nTotal a pagar: $${total.toFixed(2)} MXN\n\nDirígete a la caja de la institución para realizar tu pago.`);
        
    } else if (metodo === 'transferencia') {
        cerrarModalMetodo();
        alert(`🏦 Transferencia Bancaria\n\nTotal a pagar: $${total.toFixed(2)} MXN\n\nDatos bancarios:\nBanco: Banamex\nCuenta: 1234567890\nCLABE: 002180012345678901`);
        
    } else if (metodo === 'oxxo') {
        cerrarModalMetodo();
        alert(`🏪 Pago en OXXO\n\nTotal a pagar: $${total.toFixed(2)} MXN\n\nCódigo de pago: OXXO-${Math.floor(Math.random() * 1000000)}\n\nVálido por 3 días.`);
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

// Botón de verificar pago
const checkoutBtn = document.querySelector('.checkout-btn');
if (checkoutBtn) {
    checkoutBtn.addEventListener('click', function() {
        const total = calcularTotal();
        alert(`Procesando pago de $${total.toFixed(2)} MXN...`);
        
        // Aquí podrías vaciar el carrito después del pago exitoso
        // carrito = [];
        // actualizarCarrito();
        // cerrarModalPago();
    });
}

// ========== VALIDACIÓN Y FORMATEO DE TARJETA ==========

document.addEventListener('DOMContentLoaded', function() {
    const cardNumberInput = document.getElementById('serialCardNumber');
    const expiryInput = document.getElementById('ExDate');
    const cvvInput = document.getElementById('cvv');
    const nameInput = document.querySelector('input[name="input-name"]');
    
   if (cardNumberInput) {
    cardNumberInput.addEventListener('input', function(e) {
    let rawCursor = e.target.selectionStart; // Guardar la posición del cursor
    let raw = e.target.value.replace(/\D/g, ''); // Solo números
    raw = raw.slice(0, 16);

    // Formatear: añadir espacio cada 4 dígitos
    let formatted = raw.replace(/(.{4})/g, '$1 ').trim();

    e.target.value = formatted;

    if (raw.length ===16){
        addValidationIcon(cardNumberInput,true);
    } else {
        addValidationIcon(cardNumberInput,false);
    }

e.target.value = formatted;

    let newCursor = rawCursor;
    if (rawCursor % 5 === 0 && raw.length < 16) {
    newCursor++;
}

e.target.setSelectionRange(newCursor, newCursor);

    detectCardType(raw);

});
    }
    
    if (expiryInput) {
        expiryInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, ''); // Solo números
            
            if (value.length >= 2) {
                value = value.substring(0, 2) + '/' + value.substring(2, 4);
            }
            
            e.target.value = value;
            
            // Validar fecha
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
            // Limitar a 4 dígitos
            if (e.target.value.length > 4) {
                e.target.value = e.target.value.slice(0, 4);
            }
            
            // Validar
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
    
    // Remover logo anterior si existe
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
        return; // No mostrar nada si está vacío
    } else {
        cardType = 'generic';
    }
    
    if (cardNumber.length > 0) {
        const logo = document.createElement('div');
        logo.className = 'card-logo';
        logo.innerHTML = getCardLogo(cardType);
        
        // Insertar después del input
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
