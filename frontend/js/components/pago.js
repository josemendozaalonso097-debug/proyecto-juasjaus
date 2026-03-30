import { generarPDFComprobante } from '../utils/pdf.js';
import { carrito, calcularTotal, vaciarCarrito } from './carrito.js';
import { guardarEnHistorial, obtenerHistorial } from '../utils/storage.js';

export function inicializarPago(modo = 'principal') {
    const cardNumberInput = document.getElementById('serialCardNumber');
    const expiryInput = document.getElementById('ExDate');
    const cvvInput = document.getElementById('cvv');
    const nameInput = document.querySelector('input[name="input-name"]');
    
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', function(e) {
            let rawCursor = e.target.selectionStart;
            let raw = e.target.value.replace(/\D/g, '');
            raw = raw.slice(0, 16);
            let formatted = raw.replace(/(.{4})/g, '$1 ').trim();
            e.target.value = formatted;

            if (raw.length === 16){
                addValidationIcon(cardNumberInput, true);
            } else {
                addValidationIcon(cardNumberInput, false);
            }

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

    if (modo === 'principal') {
        const payBtn = document.getElementById('pay-btn');
        if (payBtn) {
            payBtn.addEventListener('click', function(e) {
                e.preventDefault();
                verificarLimiteColegiatura(abrirModalPago);
            });
        }
    }

    const checkoutBtn2 = document.querySelector('.checkout-btn');
    if (checkoutBtn2) {
        checkoutBtn2.addEventListener('click', function() {
            if (modo === 'tienda') {
                procesarCompraExitosa('Tarjeta');
                cerrarModalPago();
            } else {
                const producto = "Colegiatura Mensual";
                const precio = 1250;
                const compra = {
                    fecha: new Date().toLocaleDateString('es-MX'),
                    metodoPago: 'Tarjeta Bancaria',
                    estado: 'Completado',
                    productos: [{ nombre: producto, precio: precio, cantidad: 1 }],
                    total: precio
                };
                guardarEnHistorial(compra);
                cerrarModalPago();
                mostrarConfirmacionExt('Tarjeta Bancaria');
                
                if (window.actualizarProximoVencimiento) {
                    window.actualizarProximoVencimiento();
                }
            }
        });
    }

    if (modo === 'tienda') {
        const payBtn = document.getElementById('pay-button');
        if (payBtn) payBtn.addEventListener('click', abrirModalMetodo);

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

        window.cerrarModalPago = cerrarModalPago;
        window.cerrarModalDeposito = cerrarModalDeposito;
        window.cerrarModalTransferencia = cerrarModalTransferencia;
        window.seleccionarMetodo = seleccionarMetodo;
        window.cerrarModalMetodo = cerrarModalMetodo;

        window.enviarComprobante = () => {
            if (!window.archivoComprobanteDeposito) { alert('Sube un comprobante de pago.'); return; }
            procesarCompraExitosa('Depósito'); 
            cerrarModalDeposito(); 
        };
        window.enviarComprobanteTransferencia = () => { 
            if (!window.archivoComprobanteTransferencia) { alert('Sube un comprobante de pago.'); return; }
            procesarCompraExitosa('Transferencia'); 
            cerrarModalTransferencia(); 
        };
    }
}

export function detectCardType(cardNumber) {
    const cardNumberInput = document.getElementById('serialCardNumber');
    if (!cardNumberInput) return;
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
        if (label) {
            label.style.position = 'relative';
            label.appendChild(logo);
        }
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

export function addValidationIcon(input, isValid) {
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
    if (input.parentElement) {
        input.parentElement.style.position = 'relative';
        input.parentElement.appendChild(icon);
    }
}

export function removeValidationIcon(input) {
    if (input.parentElement) {
        const existingIcon = input.parentElement.querySelector('.validation-icon');
        if (existingIcon) {
            existingIcon.remove();
        }
    }
    input.style.borderColor = '#97242c';
}

export function abrirModalPago() {
    const modalPago = document.querySelector('.add-card-page');
    if (modalPago) {
        modalPago.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

export function cerrarModalPago() {
    const modalPago = document.querySelector('.add-card-page');
    if (modalPago) {
        modalPago.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// ========== TIENDA PAYMENT EXTENSIONS ==========
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

export function abrirModalDeposito() {
    document.getElementById('montoDeposito').textContent = `$${calcularTotal().toFixed(2)} MXN`;
    const modal = document.getElementById('modalDeposito');
    if (modal) { modal.style.display = 'block'; document.body.style.overflow = 'hidden'; }
}

export function abrirModalTransferencia() {
    document.getElementById('montoTransferencia').textContent = `$${calcularTotal().toFixed(2)} MXN`;
    const modal = document.getElementById('modalTransferencia');
    if(modal) { modal.style.display = 'block'; document.body.style.overflow = 'hidden'; }
}

export function cerrarModalDeposito() {
    const modal = document.getElementById('modalDeposito');
    if (modal) { modal.style.display = 'none'; document.body.style.overflow = 'auto'; }
}

export function cerrarModalTransferencia() {
    const modal = document.getElementById('modalTransferencia');
    if (modal) { modal.style.display = 'none'; document.body.style.overflow = 'auto'; }
}

export function procesarCompraExitosa(metodoPago) {
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
    
    generarPDFComprobante(metodoPago, fechaFormato, total, carrito);
    
    vaciarCarrito();
    mostrarConfirmacionExt(metodoPago);
}

export function mostrarConfirmacionExt(metodo) {
    const esTarjeta = metodo === 'Tarjeta' || metodo === 'Tarjeta Bancaria';
    const titulo = esTarjeta ? "¡Pago Exitoso!" : "¡Comprobante recibido!";
    const mensaje = esTarjeta 
        ? `Tu pago con ${metodo} se procesó correctamente.<br><strong>Estado: Completado</strong>`
        : `Tu comprobante de ${metodo} fue recibido exitosamente.<br><strong>Estado: Pendiente de verificación</strong><br><br>Te notificaremos una vez que sea validado.`;

    const confirmacion = document.createElement('div');
    confirmacion.style.cssText = `
        position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
        background: white; padding: 40px; border-radius: 20px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3); z-index: 10003;
        text-align: center; max-width: 400px; border: 3px solid #27ae60;
    `;
    confirmacion.innerHTML = `
        <div style="font-size: 4em; margin-bottom: 20px;">✅</div>
        <h2 style="color: #27ae60; margin-bottom: 15px; font-size: 1.5em;">${titulo}</h2>
        <p style="color: #666; margin-bottom: 20px; line-height: 1.6;">
            ${mensaje}
        </p>
        <button onclick="this.parentElement.remove(); document.body.style.overflow = 'auto';" style="
            background: #27ae60; color: white; border: none; padding: 12px 30px;
            border-radius: 10px; font-size: 1em; font-weight: 600; cursor: pointer;
        ">Entendido</button>
    `;
    document.body.appendChild(confirmacion);
    document.body.style.overflow = 'hidden';

    if (typeof confetti !== 'undefined') {
        lanzarConfeti();
    } else {
        const script = document.createElement('script');
        script.src = "https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js";
        script.onload = () => lanzarConfeti();
        document.body.appendChild(script);
    }
}

function lanzarConfeti() {
    var duration = 3 * 1000;
    var end = Date.now() + duration;

    (function frame() {
        confetti({
            particleCount: 5,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            zIndex: 10004
        });
        confetti({
            particleCount: 5,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            zIndex: 10004
        });

        if (Date.now() < end) {
            requestAnimationFrame(frame);
        }
    }());
}

export function verificarLimiteColegiatura(callback) {
    const userRaw = localStorage.getItem('user');
    if (!userRaw) {
        callback();
        return;
    }
    const user = JSON.parse(userRaw);
    const userId = user.id;

    // Leer perfil extendido que contiene el semestre actualizado
    const perfilRaw = userId ? localStorage.getItem(`perfil_${userId}`) : null;
    const perfil = perfilRaw ? JSON.parse(perfilRaw) : {};
    
    const rol = (perfil.rol || user.rol || 'estudiante').toLowerCase();
    const semestreStr = perfil.semestre || user.semestre || '1';

    console.log('🔒 Verificando límite — Rol:', rol, '| Semestre:', semestreStr);

    // Solo aplica límite si el rol es Estudiante
    if (rol === 'estudiante') {
        const semestreDelUsuario = parseInt(semestreStr, 10) || 1;
        const maxPagosPermitidos = Math.max(0, (6 - semestreDelUsuario) + 1);
        
        const historial = obtenerHistorial() || [];
        let count = 0;
        historial.forEach(compra => {
            if (compra.productos && compra.productos.some(p => p.nombre.toLowerCase().includes('colegiatura'))) {
                count++;
            }
        });

        console.log('🔒 Pagos realizados:', count, '| Máx permitidos:', maxPagosPermitidos);

        if (count >= maxPagosPermitidos) {
            mostrarModalLimite(callback, maxPagosPermitidos);
            return;
        }
    }
    
    callback();
}

function mostrarModalLimite(callback, maxPagos) {
    const confirmacion = document.createElement('div');
    confirmacion.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.5); z-index: 10005;
        display: flex; justify-content: center; align-items: center;
    `;
    
    const panel = document.createElement('div');
    panel.style.cssText = `
        background: white; padding: 40px; border-radius: 20px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3); text-align: center; max-width: 400px;
    `;
    
    const textoPagos = maxPagos === 1 ? '1 pago' : `${maxPagos} pagos`;
    
    panel.innerHTML = `
        <div style="font-size: 4em; margin-bottom: 20px;">⚠️</div>
        <h2 style="color: #e67e22; margin-bottom: 15px; font-size: 1.5em; font-weight: bold;">Límite de colegiaturas alcanzado</h2>
        <p style="color: #666; margin-bottom: 25px; line-height: 1.6;">
            De acuerdo a tu grado actual, has alcanzado tu límite de <strong>${textoPagos}</strong> de colegiatura correspondientes a lo que restaba de tu plan de estudios.<br><br>
            ¿Estás seguro de que quieres realizar otro pago adicional?
        </p>
        <div style="display: flex; gap: 15px; justify-content: center;">
            <button id="btn-cancel-limit" style="
                background: #f1f5f9; color: #64748b; border: none; padding: 12px 25px;
                border-radius: 10px; font-weight: bold; cursor: pointer; transition: 0.2s;
            ">Cancelar</button>
            <button id="btn-continue-limit" style="
                background: #e67e22; color: white; border: none; padding: 12px 25px;
                border-radius: 10px; font-weight: bold; cursor: pointer; transition: 0.2s;
            ">Sí, continuar</button>
        </div>
    `;
    
    confirmacion.appendChild(panel);
    document.body.appendChild(confirmacion);
    
    document.getElementById('btn-cancel-limit').addEventListener('click', () => {
        confirmacion.remove();
    });
    
    document.getElementById('btn-continue-limit').addEventListener('click', () => {
        confirmacion.remove();
        callback();
    });
}
