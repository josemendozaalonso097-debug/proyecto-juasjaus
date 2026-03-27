import { checkSessionToken } from '../api/auth.js';
import { cargarDatosPerfil, actualizarPerfil, cambiarFotoPerfil } from '../components/perfil.js';
import { inicializarPapeleria } from '../components/papeleria.js';
import { guardarEnHistorial } from '../utils/storage.js';
import { productosData } from '../api/tienda.js';
import { carrito, inicializarCarrito, vaciarCarrito, calcularTotal, actualizarCarrito } from '../components/carrito.js';
import { mostrarNotificacion } from '../utils/notificaciones.js';
import { addValidationIcon, removeValidationIcon, detectCardType } from '../components/pago.js';

// ========== SESIÓN Y PERFIL ==========
window.onload = async function() {
    const token = localStorage.getItem('access_token');
    if (!token) {
        alert('Debes iniciar sesión primero');
        window.location.href = '../login.html';
        return;
    }
    
    try {
        const response = await checkSessionToken(token);
        if (!response.ok) {
            alert('Tu sesión ha expirado. Por favor inicia sesión nuevamente.');
            localStorage.removeItem('access_token');
            localStorage.removeItem('user');
            window.location.href = '../login.html';
            return;
        }
        
        const userData = await response.json();
        console.log('✅ Usuario autenticado en la tienda:', userData.nombre);
        
        cargarDatosPerfil(userData);
        inicializarCarrito();
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error al verificar la sesión');
        window.location.href = '../login.html';
    }
};

document.addEventListener('DOMContentLoaded', function() {
    inicializarPapeleria();

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            const confirmLogout = confirm('¿Estás seguro que deseas cerrar sesión?');
            if (confirmLogout) {
                localStorage.removeItem('access_token');
                localStorage.removeItem('user');
                alert('Sesión cerrada correctamente');
                window.location.href = '../login.html';
            }
        });
    }

    const btnCarrito = document.querySelector('.button-carrito');
    if (btnCarrito) {
        btnCarrito.addEventListener('click', function() {
            document.querySelector('.sidebar-derecha')?.scrollIntoView({ behavior: 'smooth' });
        });
    }
});

// ========== MODALES DE PRODUCTOS ==========
export function abrirModal(categoria) { 
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

    const iconos = {
        uniformes: 'apparel',
        Libros: 'menu_book',
        libros: 'menu_book',
        tramites: 'description',
        material: 'backpack',
        informacion: 'info',
        subir: 'upload_file'
    };

    if(modalTitle) modalTitle.textContent = titulos[categoria] || titulos[categoria.toLowerCase()] || 'Productos';
    
    const modalIcon = document.getElementById('modalIcon');
    if (modalIcon) {
        modalIcon.textContent = iconos[categoria] || 'shopping_bag';
    }

    if(productosGrid) productosGrid.innerHTML = '';

    const tabsNav = document.getElementById('modalTabsNav');
    if (tabsNav) tabsNav.innerHTML = '';

    const productos = productosData[categoria] || [];

    if (productos.length === 0) {
        if(productosGrid) productosGrid.innerHTML = '<p style="text-align: center; padding: 40px; color: #999;">No hay productos disponibles</p>';
        if(modal) modal.style.display = 'block';
        return;
    }

    if (categoria === 'Libros') {
        const librosPorSemestre = {
            1: [6, 7, 8, 9, 10, 11, 13], 2: [6, 7, 8, 9, 10, 11, 12],
            3: [6, 7, 8, 9, 10, 11, 14], 4: [6, 7, 8, 9, 10, 11, 15, 17],
            5: [6, 7, 8, 9, 10, 11, 15, 16, 17, 18], 6: [6, 7, 8, 9, 10, 11, 19]
        };
        const semestresLabels = ['1er', '2do', '3er', '4to', '5to', '6to'];

        if(tabsNav) {
            tabsNav.innerHTML = `
                <div id="libros-tabs-nav" style="display: flex; border-bottom: 2px solid #e2e8f0; background: #fff; padding: 0 20px;">
                    ${semestresLabels.map((label, i) => `
                        <button class="libro-tab-btn" data-sem="${i + 1}" onclick="cambiarTabLibros(${i + 1})"
                            style="flex: 1; padding: 13px 6px; border: none; border-bottom: 3px solid ${i === 0 ? '#f20d0d' : 'transparent'};
                            background: transparent; color: ${i === 0 ? '#f20d0d' : '#64748b'}; font-weight: ${i === 0 ? '700' : '500'};
                            font-size: 0.88em; cursor: pointer; transition: all 0.2s; font-family: inherit;
                            white-space: nowrap; margin-bottom: -2px; text-align: center;">
                            ${label} Sem
                        </button>
                    `).join('')}
                </div>
            `;
        }

        window.cambiarTabLibros = function(sem) {
            document.querySelectorAll('.libro-tab-btn').forEach(btn => {
                const active = parseInt(btn.dataset.sem) === sem;
                btn.style.borderBottom = active ? '3px solid #f20d0d' : '3px solid transparent';
                btn.style.color = active ? '#f20d0d' : '#64748b';
                btn.style.fontWeight = active ? '700' : '500';
            });
            const ids = librosPorSemestre[sem] || [];
            const librosDelSem = productos.filter(p => ids.includes(p.id));
            const contenedor = document.getElementById('productosGrid');
            if(!contenedor) return;
            contenedor.innerHTML = '';
            librosDelSem.forEach(producto => {
                contenedor.appendChild(crearProductoCard(producto, categoria));
            });
        };

        window.cambiarTabLibros(1);
        if(modal) modal.style.display = 'block';
        return;
    }

    if(productosGrid) {
        productos.forEach(producto => {
            productosGrid.appendChild(crearProductoCard(producto, categoria));
        });
    }
    
    document.querySelectorAll('.size-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const parent = this.closest('.size-selector');
            parent.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    if(modal) modal.style.display = 'block';
}

function crearProductoCard(producto, categoria) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
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
            <div class="size-selector"><p class="size-label">TALLA</p>
                <div class="size-options">
                    <button class="size-btn" data-size="XS">XS</button><button class="size-btn active" data-size="S">S</button>
                    <button class="size-btn" data-size="M">M</button><button class="size-btn" data-size="L">L</button><button class="size-btn" data-size="XL">XL</button>
                </div>
            </div>` : ''}
            ${producto.semestre ? `
            <div class="size-selector"><p class="size-label">SEMESTRE</p>
                <div class="size-options">
                    <button class="size-btn" data-size="I">I</button><button class="size-btn active" data-size="II">II</button>
                    <button class="size-btn" data-size="III">III</button><button class="size-btn" data-size="IV">IV</button>
                    <button class="size-btn" data-size="V">V</button><button class="size-btn" data-size="VI">VI</button>
                </div>
            </div>` : ''}
            <div class="product-actions">
                <button type="button" class="btn-add-cart" data-id="${producto.id}" data-cat="${categoria}">Agregar al carrito</button>
                <button class="btn-icon">🛒</button>
            </div>
        </div>
    `;
    const addBtn = card.querySelector('.btn-add-cart');
    if (addBtn) addBtn.addEventListener('click', () => agregarAlCarritoWrapper(producto.id, categoria, card));
    return card;
}

function agregarAlCarritoWrapper(productoId, categoria, cardElement) {
    let producto = null;
    for (let cat in productosData) {
        const found = productosData[cat].find(p => p.id === productoId);
        if (found) { producto = { ...found }; break; }
    }
    if (!producto) return;
    
    if (producto.tallas || producto.semestre) {
        const sizeBtn = cardElement.querySelector('.size-btn.active');
        producto.tallaSeleccionada = sizeBtn ? sizeBtn.getAttribute('data-size') : 'S';
    }
    
    const existente = carrito.find(item => item.id === productoId && (!item.tallaSeleccionada || item.tallaSeleccionada === producto.tallaSeleccionada));
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

export function cerrarModal() {
    const modal = document.getElementById('productModal');
    if(modal) modal.style.display = 'none';
}

window.addEventListener('click', function(event) {
    const modal = document.getElementById('productModal');
    if (event.target === modal) cerrarModal();
});

// ========== PAGOS Y CHECKOUT ==========
export function abrirModalMetodo() {
    if (carrito.length === 0) {
        alert('Tu carrito está vacío. Agrega productos antes de pagar.');
        return;
    }
    const modalMetodo = document.getElementById('modalMetodoPago');
    if (modalMetodo) {
        modalMetodo.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

export function cerrarModalMetodo() {
    const modalMetodo = document.getElementById('modalMetodoPago');
    if (modalMetodo) {
        modalMetodo.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

export function seleccionarMetodo(metodo) {
    const total = calcularTotal();
    const modalMetodo = document.getElementById('modalMetodoPago');
    const modalPago = document.querySelector('.add-card-page');
    
    if (metodo === 'tarjeta') {
        if (modalMetodo) modalMetodo.style.display = 'none';
        const totalElement = document.querySelector('.form h3');
        if (totalElement) totalElement.textContent = `Total a pagar: $${total.toFixed(2)} MXN`;
        if (modalPago) { modalPago.style.display = 'flex'; document.body.style.overflow = 'hidden'; }
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

export function cerrarModalPago() {
    const modalPago = document.querySelector('.add-card-page');
    if (modalPago) {
        modalPago.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Validation event listeners mapping
document.addEventListener('DOMContentLoaded', function() {
    const payBtn = document.getElementById('pay-button');
    if (payBtn) payBtn.addEventListener('click', abrirModalMetodo);
    
    // Card inputs detection
    const cardNumberInput = document.getElementById('serialCardNumber');
    const expiryInput = document.getElementById('ExDate');
    const cvvInput = document.getElementById('cvv');
    const nameInput = document.querySelector('input[name="input-name"]');
    
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', function(e) {
            let raw = e.target.value.replace(/\D/g, '').slice(0, 16);
            e.target.value = raw.replace(/(.{4})/g, '$1 ').trim();
            addValidationIcon(cardNumberInput, raw.length === 16);
            detectCardType(raw);
        });
    }
    if (expiryInput) {
        expiryInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) value = value.substring(0, 2) + '/' + value.substring(2, 4);
            e.target.value = value;
            if (value.length === 5) {
                const [month, year] = value.split('/');
                addValidationIcon(expiryInput, parseInt(month) >= 1 && parseInt(month) <= 12);
            } else removeValidationIcon(expiryInput);
        });
    }
    if (cvvInput) {
        cvvInput.addEventListener('input', function(e) {
            if (e.target.value.length > 4) e.target.value = e.target.value.slice(0, 4);
            if (e.target.value.length >= 3) addValidationIcon(cvvInput, true);
            else removeValidationIcon(cvvInput);
        });
    }
    if (nameInput) {
        nameInput.addEventListener('input', function(e) {
            if (e.target.value.trim().length >= 3) addValidationIcon(nameInput, true);
            else removeValidationIcon(nameInput);
        });
    }
    
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            procesarCompraExitosa('Tarjeta', generarPDFComprobante);
            cerrarModalPago();
        });
    }
});

// Deposito & Transferencia Modals
function abrirModalDeposito() {
    document.getElementById('montoDeposito').textContent = `$${calcularTotal().toFixed(2)} MXN`;
    const modalDeposito = document.getElementById('modalDeposito');
    if (modalDeposito) { modalDeposito.style.display = 'block'; document.body.style.overflow = 'hidden'; }
}

function abrirModalTransferencia() {
    document.getElementById('montoTransferencia').textContent = `$${calcularTotal().toFixed(2)} MXN`;
    const m = document.getElementById('modalTransferencia');
    if(m) { m.style.display = 'block'; document.body.style.overflow = 'hidden'; }
}

function cerrarModalDeposito() {
    const modalDeposito = document.getElementById('modalDeposito');
    if (modalDeposito) { modalDeposito.style.display = 'none'; document.body.style.overflow = 'auto'; }
}

function cerrarModalTransferencia() {
    const m = document.getElementById('modalTransferencia');
    if (m) { m.style.display = 'none'; document.body.style.overflow = 'auto'; }
}

// File Upload Logic
document.addEventListener('DOMContentLoaded', function() {
    // Depósito
    const uploadAreaDep = document.getElementById('uploadArea');
    const fileInputDep = document.getElementById('comprobanteFile');
    if (uploadAreaDep && fileInputDep) {
        uploadAreaDep.addEventListener('click', () => fileInputDep.click());
        fileInputDep.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                document.getElementById('uploadArea').style.display = 'none';
                document.getElementById('archivoInfo').style.display = 'flex';
                document.getElementById('nombreArchivo').textContent = file.name;
                window.archivoComprobanteDeposito = file;
            }
        });
    }

    // Transferencia
    const uploadAreaTrans = document.getElementById('uploadAreaTransferencia');
    const fileInputTrans = document.getElementById('comprobanteFileTransferencia');
    if (uploadAreaTrans && fileInputTrans) {
        uploadAreaTrans.addEventListener('click', () => fileInputTrans.click());
        fileInputTrans.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                document.getElementById('uploadAreaTransferencia').style.display = 'none';
                document.getElementById('archivoInfoTransferencia').style.display = 'flex';
                document.getElementById('nombreArchivoTransferencia').textContent = file.name;
                window.archivoComprobanteTransferencia = file;
            }
        });
    }
});

window.quitarArchivo = function() {
    window.archivoComprobanteDeposito = null;
    document.getElementById('comprobanteFile').value = '';
    document.getElementById('uploadArea').style.display = 'block';
    document.getElementById('archivoInfo').style.display = 'none';
};

window.quitarArchivoTransferencia = function() {
    window.archivoComprobanteTransferencia = null;
    document.getElementById('comprobanteFileTransferencia').value = '';
    document.getElementById('uploadAreaTransferencia').style.display = 'block';
    document.getElementById('archivoInfoTransferencia').style.display = 'none';
};

// Procesa una compra completada
function procesarCompraExitosa(metodoPago, pdfCallback) {
    const total = calcularTotal();
    const fecha = new Date();
    const meses = ['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC'];
    const fechaFormato = `${fecha.getDate().toString().padStart(2, '0')}/${meses[fecha.getMonth()]}/${fecha.getFullYear()}`;
    
    const compra = {
        fecha: fechaFormato,
        metodoPago: metodoPago,
        productos: carrito.map(item => ({
            nombre: item.nombre,
            precio: item.precio,
            cantidad: item.cantidad,
            tallaSeleccionada: item.tallaSeleccionada
        })),
        total: total,
        estado: metodoPago === 'Tarjeta' ? 'Completado' : 'Pendiente'
    };
    guardarEnHistorial(compra);
    
    if (pdfCallback) pdfCallback(metodoPago, fechaFormato, total);
    
    vaciarCarrito();
    if (metodoPago !== 'Tarjeta') mostrarConfirmacionExt(metodoPago);
}

function generarPDFComprobante(metodo, fechaFormato, total) {
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
    doc.text(`Método: ${metodo}`, 20, 55);
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
    doc.save(`comprobante_${metodo}.pdf`);
}

function mostrarConfirmacionExt(metodo) {
    const confirmacion = document.createElement('div');
    confirmacion.style.cssText = `
        position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
        background: white; padding: 40px; border-radius: 20px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3); z-index: 10003;
        text-align: center; max-width: 400px; border: 3px solid #27ae60;
    `;
    confirmacion.innerHTML = `
        <div style="font-size: 4em; margin-bottom: 20px;">✅</div>
        <h2 style="color: #27ae60; margin-bottom: 15px; font-size: 1.5em;">¡Comprobante recibido!</h2>
        <p style="color: #666; margin-bottom: 20px; line-height: 1.6;">
            Tu comprobante de ${metodo} fue recibido exitosamente.<br>
            <strong>Estado: Pendiente de verificación</strong><br><br>
            Te notificaremos una vez que sea validado.
        </p>
        <button onclick="this.parentElement.remove(); document.body.style.overflow = 'auto';" style="
            background: #27ae60; color: white; border: none; padding: 12px 30px;
            border-radius: 10px; font-size: 1em; font-weight: 600; cursor: pointer;
        ">Entendido</button>
    `;
    document.body.appendChild(confirmacion);
    document.body.style.overflow = 'hidden';
}

// Window exposes for HTML onclicks
window.abrirModal = abrirModal;
window.cerrarModal = cerrarModal;
window.seleccionarMetodo = seleccionarMetodo;
window.cerrarModalMetodo = cerrarModalMetodo;
window.actualizarPerfil = actualizarPerfil;
window.cambiarFotoPerfil = cambiarFotoPerfil;
window.copiarTexto = function(elementId) {
    const el = document.getElementById(elementId);
    if(el) {
        navigator.clipboard.writeText(el.textContent).then(() => mostrarNotificacion('✓ Copiado al portapapeles'));
    }
};
window.cerrarModalPago = cerrarModalPago;
window.cerrarModalDeposito = cerrarModalDeposito;
window.cerrarModalTransferencia = cerrarModalTransferencia;

window.enviarComprobante = () => {
    if (!window.archivoComprobanteDeposito) { alert('Sube un comprobante de pago.'); return; }
    procesarCompraExitosa('Depósito', generarPDFComprobante); 
    cerrarModalDeposito(); 
};
window.enviarComprobanteTransferencia = () => { 
    if (!window.archivoComprobanteTransferencia) { alert('Sube un comprobante de pago.'); return; }
    procesarCompraExitosa('Transferencia', generarPDFComprobante); 
    cerrarModalTransferencia(); 
};
