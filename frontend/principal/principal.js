// Configuración del backend
const API_URL = 'http://localhost:8000/api';

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
        
        // Actualizar UI con datos del usuario
        const userName = document.getElementById('user-name');
        if (userName) {
            userName.textContent = userData.nombre;
        }

        const userMatricula = document.getElementById('user-matricula');
        if (userMatricula) {
            userMatricula.textContent = 'A' + String(userData.id).padStart(7, '0');
        }
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error al verificar la sesión');
        window.location.href = '../login.html';
    }
};

document.addEventListener('DOMContentLoaded', function() {
    
    // Obtener elementos
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


function abrirModalPago() {
    const modalPago = document.querySelector('.add-card-page');
    if (modalPago) {
        modalPago.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function cerrarModalPago() {
    const modalPago = document.querySelector('.add-card-page');
    if (modalPago) {
        modalPago.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const payBtn = document.getElementById('pay-btn');
    if (payBtn) {
        payBtn.addEventListener('click', function() {
            abrirModalPago();
        });
    }
});

document.addEventListener('click', function(event) {
    const modalPago = document.querySelector('.add-card-page');
    const form = document.querySelector('.form');
    
    if (modalPago && event.target === modalPago) {
        cerrarModalPago();
    }
});

document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const modalPago = document.querySelector('.add-card-page');
        if (modalPago && modalPago.style.display === 'flex') {
            cerrarModalPago();
        }
    }
});

const checkoutBtn = document.querySelector('.checkout-btn');
if (checkoutBtn) {
    checkoutBtn.addEventListener('click', function() {
        alert('Procesando pago...');
    });
}

// Botón de logout con backend
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', async function() {
        const confirmLogout = confirm('¿Estás seguro que deseas cerrar sesión?');
        if (confirmLogout) {
            // Limpiar localStorage
            localStorage.removeItem('access_token');
            localStorage.removeItem('user');
            
            alert('Sesión cerrada correctamente');
            window.location.href = '../login.html';
        }
    });
}

const secondaryBtn = document.querySelector('.btn-secondary');
if (secondaryBtn) {
    secondaryBtn.addEventListener('click', function() {
        abrirHistorial();
    });
}

const storeBtn = document.getElementById('store-btn');
if (storeBtn) {
    storeBtn.addEventListener('click', function() {
        window.location.href = '../tienda/tienda.html';
    });
}

// historial

function abrirHistorial() {
    document.getElementById('modalHistorial').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function cerrarHistorial() {
    document.getElementById('modalHistorial').style.display = 'none';
    document.body.style.overflow = 'auto';
}

window.addEventListener('click', function(event) {
    const modal = document.getElementById('modalHistorial');
    if (event.target == modal) {
        cerrarHistorial();
    }
});

document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const modal = document.getElementById('modalHistorial');
        if (modal && modal.style.display === 'block') {
            cerrarHistorial();
        }
    }
});
document.addEventListener('DOMContentLoaded', function() {
    const btnFacturas = document.querySelector('.btn-facturas');
    
    if (btnFacturas) {
        btnFacturas.addEventListener('click', function() {
            alert('Descargando facturas...');
        });
    }
});
const styleAnimations = document.createElement('style');
styleAnimations.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(styleAnimations);

const informacionData = {
    nuevoIngreso: {
        titulo: "Nuevo Ingreso",
        contenido: `
            <div class="detalle-section">
                <h3>📋 Documentos Requeridos</h3>
                <ul>
                    <li>Acta de nacimiento original y 2 copias</li>
                    <li>CURP actalizado 2 copias</li>
                    <li>8 fotografías tamaño infantil blanco y negro papel mate</li>
                    <li>Comprobante de domicilio reciente original y 2 copias</li>
                    <li>Credencial de elector de los padres a ambos lados 2 copias</li>
                    <li>Certificado medico con tipo de sangre, original y 2 copias</li>
                    <li>Certificado de secundaria original y 2 copias</li>
                    <li>Credencial del servivio medico 2 copias <p>(si no tiene, entonces, 2 copias de la hoja de asignacion de numero social</p></li>
                </ul>
            </div>
            <div class="detalle-section">
                <h3>💳 Costos de Inscripción</h3>
                <ul>
                    <li>Inscripción: $3,000.00 MXN</li>
                    <li>Credencial: $100.00 MXN</li>
                </ul>
            </div>
            <div class="detalle-section">
                <h3>📅 Fechas Importantes</h3>
                <ul>
                    <li>Preinscripción: 15 de Febrero - 15 de Marzo</li>
                    <li>Publicación de resultados: 1 de Abril</li>
                    <li>Inscripción: 15 de Abril - 30 de Abril</li>
                    <li>Inicio de clases: 15 de Agosto</li>
                </ul>
            </div>
        `
    },
    becas: {
        titulo: "Becas y Apoyos",
        contenido: `
            <div class="detalle-section">
                <h3>🎓 Becarios de la transformacion</h3>
                <ul>
                    <li>Requisito: Promedio mínimo de 9.0</li>
                    <li>Beneficio: 50% de descuento en colegiatura</li>
                    <li>Duración: Todo el ciclo escolar</li>
                    <li>Renovable cada semestre</li>
                </ul>
            </div>
            <div class="detalle-section">
                <h3>💰 Beca Universal "Benito Juarez"</h3>
                <ul>
                    <li>Requisito: Situación económica comprobada</li>
                    <li>Beneficio: $1,900.00 MXN mensuales</li>
                    <li>Solicitud: Departamento de Becas</li>
                </ul>
            </div>
            <div class="detalle-section">
                <h3>🏆 Beca Deportiva/Cultural</h3>
                <ul>
                    <li>Requisito: Participación activa en equipos</li>
                    <li>Beneficio: 30% de descuento</li>
                    <li>Aplica para: Deportes y actividades culturales</li>
                    <li>Renovación por desempeño</li>
                </ul>
            </div>
        `
    },
    contacto: {
        titulo: "Contacto",
        contenido: `
            <div class="detalle-section">
                <div class="contacto-item">
                    <div class="contacto-icon">📞</div>
                    <div class="contacto-info">
                        <h4>Control Escolar</h4>
                        <p>+52 (81) 8397 1666</p>
                    </div>
                </div>
                <div class="contacto-item">
                    <div class="contacto-icon">📧</div>
                    <div class="contacto-info">
                        <h4>Correo Electrónico</h4>
                        <p>cbtis258.dir@dgeti.sems.gob.mx</p>
                    </div>
                </div>
                <div class="contacto-item">
                    <div class="contacto-icon">🕐</div>
                    <div class="contacto-info">
                        <h4>Horario de Atención</h4>
                        <p>Lunes a Viernes: 8:00 AM - 2:00 PM y Jueves:8:00 AM - 6:00 PM</p>
                    </div>
                </div>
                <div class="contacto-item">
                    <div class="contacto-icon">📍</div>
                    <div class="contacto-info">
                        <h4>Dirección</h4>
                        <p>Calle Doctor Plinio D. Ordóñez. #801, Col. Hacienda del Topo, Ciudad General Escobedo, Nuevo León.</p>
                    </div>
                </div>
            </div>
        `
    },
    faq: {
        titulo: "Preguntas Frecuentes",
        contenido: `
            <div class="faq-item">
                <div class="faq-pregunta">¿Cuándo puedo solicitar una beca?</div>
                <div class="faq-respuesta">Las solicitudes de beca se abren al inicio de cada semestre.</div>
            </div>
            <div class="faq-item">
                <div class="faq-pregunta">¿Cómo puedo pagar mi colegiatura?</div>
                <div class="faq-respuesta">Puedes pagar en efectivo en la institución, transferencia bancaria, o mediante esta plataforma.</div>
            </div>
        `
    }
};

const infoBtn = document.getElementById('info-btn');
if (infoBtn) {
    infoBtn.addEventListener('click', function() {
        abrirInformacion();
    });
}

function abrirInformacion() {
    document.getElementById('modalInformacion').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function cerrarInformacion() {
    document.getElementById('modalInformacion').style.display = 'none';
    document.body.style.overflow = 'auto';
}

function abrirSeccion(seccion) {
    const data = informacionData[seccion];
    if (!data) return;
    
    document.getElementById('detalleTitle').textContent = data.titulo;
    document.getElementById('detalleContenido').innerHTML = data.contenido;
    
    cerrarInformacion();
    document.getElementById('modalDetalle').style.display = 'block';
}

function cerrarDetalle() {
    document.getElementById('modalDetalle').style.display = 'none';
    document.body.style.overflow = 'auto';
}

window.addEventListener('click', function(event) {
    const modalInfo = document.getElementById('modalInformacion');
    const modalDetalle = document.getElementById('modalDetalle');
    
    if (event.target === modalInfo) {
        cerrarInformacion();
    }
    
    if (event.target === modalDetalle) {
        cerrarDetalle();
    }
});

function cargarHistorial() {
    const historial = JSON.parse(localStorage.getItem('historial')) || [];
    return historial;
}

function guardarHistorial(historial) {
    localStorage.setItem('historial', JSON.stringify(historial));
}

function renderizarHistorial() {
    const historial = cargarHistorial();
    const historialContainer = document.querySelector('.historial-compras');
    const totalComprasElem = document.querySelector('.resumen-item strong');
    const totalGastadoElem = document.querySelector('.total-amount');

    if (!historialContainer) return;

    historialContainer.innerHTML = '';

    let totalGastado = 0;

    historial.forEach(compra => {
        totalGastado += compra.precio;

        const compraCard = document.createElement('div');
        compraCard.className = 'compra-card';
        compraCard.innerHTML = `
            <div class="compra-fecha">${compra.fecha}</div>
            <div class="compra-info">
                <h3>${compra.nombre}</h3>
                <div class="compra-badges">
                    <span class="badge-entregado">Entregado</span>
                </div>
            </div>
            <div class="compra-precio">$${compra.precio.toFixed(2)} MXN</div>
        `;
        historialContainer.appendChild(compraCard);
    });

    if (totalComprasElem) totalComprasElem.textContent = historial.length;
    if (totalGastadoElem) totalGastadoElem.textContent = '$' + totalGastado.toFixed(2) + ' MXN';
}

function agregarCompra(nombre, precio) {
    const historial = cargarHistorial();
    const fecha = new Date();
    const fechaFormato = fecha.getDate().toString().padStart(2, '0') + '/' +
                         (fecha.getMonth() + 1).toString().padStart(2, '0') + '/' +
                         fecha.getFullYear();

    historial.push({
        nombre: nombre,
        precio: parseFloat(precio),
        fecha: fechaFormato
    });

    guardarHistorial(historial);
    renderizarHistorial();
}

const checkoutBtn2 = document.querySelector('.checkout-btn');
if (checkoutBtn2) {
    checkoutBtn2.addEventListener('click', function() {
        const producto = "Colegiatura Mensual";
        const precio = 1250;

        agregarCompra(producto, precio);
        cerrarModalPago();
        alert('Pago procesado correctamente y agregado al historial.');
    });
}

document.addEventListener('DOMContentLoaded', renderizarHistorial);