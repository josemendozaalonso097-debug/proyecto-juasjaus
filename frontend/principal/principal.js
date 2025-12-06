// Verificar si hay un usuario logueado
window.onload = function() {
    const currentUser = sessionStorage.getItem('currentUser');
    if (!currentUser) {
        alert('Debes iniciar sesión primero');
        window.location.href = '../login.html';
        return;
    }

    const user = JSON.parse(currentUser);
    
    const userName = document.getElementById('user-name');
    if (userName) {
        userName.textContent = user.nombre;
    }

    const userMatricula = document.getElementById('user-matricula');
    if (userMatricula) {
        userMatricula.textContent = 'A' + String(user.id).padStart(7, '0');
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

// ===== OBTENER SVG DEL LOGO DE LA TARJETA =====
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
    // Remover icono anterior si existe
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
    
    // Insertar después del input
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


// Función para abrir el modal de pago
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
        // cerrarModalPago(); // Descomentar para cerrar después de procesar
    });
}

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

const secondaryBtn = document.querySelector('.btn-secondary');
if (secondaryBtn) {
    secondaryBtn.addEventListener('click', function() {
        abrirHistorial(); // Abre el modal
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
            // Aquí conectarás con tu backend Python más adelante
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

// ========== MODAL DE INFORMACIÓN ==========

// Datos de cada sección
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
            <div class="detalle-section">
                <h3>👨‍👩‍👧‍👦 Beca fundacion: Martinez Sada</h3>
                <ul>
                    <li>2 hermanos: 15% de descuento c/u</li>
                    <li>3 o más hermanos: 20% de descuento c/u</li>
                    <li>Aplica automáticamente</li>
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
                    <div class="contacto-icon">📞</div>
                    <div class="contacto-info">
                        <h4>Servicios Financieros</h4>
                        <p>+52 (81) 8397 1666</p>
                    </div>
                </div>
                <div class="contacto-item">
                    <div class="contacto-icon">📞</div>
                    <div class="contacto-info">
                        <h4>Departamento de Becas</h4>
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
                    <div class="contacto-icon">📧</div>
                    <div class="contacto-info">
                        <h4>Becas y Apoyos</h4>
                        <p>Becarios de la Transformación:+52 (81) 8220-6100</p>
                        <p>Secretaría de Educación de Nuevo León:+52 (81) 2020-5050</p>
                        <p>Beca Benito Juarez:+52 (55) 1162-0300</p>
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
                        <p>Calle Doctor Plinio D. Ordóñez. #801, Col. Hacienda del Topo, Ciudad General Escobedo, Nuevo León. </p>
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
                <div class="faq-respuesta">Las solicitudes de beca se abren al inicio de cada semestre. Para alumnos de nuevo ingreso, pueden solicitarla desde el proceso de inscripción.</div>
            </div>
            <div class="faq-item">
                <div class="faq-pregunta">¿Cómo puedo pagar mi colegiatura?</div>
                <div class="faq-respuesta">Puedes pagar en efectivo en escolares en la institucion, transferencia bancaria, o mediante esta plataforma con tarjeta de débito/crédito.</div>
            </div>
            <div class="faq-item">
                <div class="faq-pregunta">¿Qué pasa si no pago a tiempo?</div>
                <div class="faq-respuesta">Aun puedes asistir a clases y formar parte de todas las actividades, sin embargon se ian acumulando conforme a los pagos incumplidos.</div>
            </div>
            <div class="faq-item">
                <div class="faq-pregunta">¿Puedo obtener más de una beca?</div>
                <div class="faq-respuesta">Si, puedes tener mas de una beca, sin embargo, algunas pueden venir con limitantes.</div>
            </div>
            <div class="faq-item">
                <div class="faq-pregunta">¿Cómo obtengo mi constancia o cardex de estudios?</div>
                <div class="faq-respuesta">Solicítalos en Escolares con 3 días de anticipación. El costo de la constancia es de $50 MXN y el precio del cardex es de $30 MXM.</div>
            </div>
            <div class="faq-item">
                <div class="faq-pregunta">¿Ofrecen planes de pago?</div>
                <div class="faq-respuesta">Sí, ofrecemos planes de pago a 3, 6 y 12 meses sin intereses. Acude a Servicios Financieros para más información.</div>
            </div>
            <div class="faq-item">
                <div class="faq-pregunta">¿Dónde descargo mis facturas?</div>
                <div class="faq-respuesta">En esta plataforma, ve a "Historial de Pagos" y presiona el botón "Ver Facturas". También puedes solicitarlas por correo a finanzas@cbtis258.edu.mx</div>
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

// Función para abrir el modal de información
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
    
    // Actualizar título y contenido
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

document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const modalInfo = document.getElementById('modalInformacion');
        const modalDetalle = document.getElementById('modalDetalle');
        
        if (modalInfo && modalInfo.style.display === 'block') {
            cerrarInformacion();
        }
        
        if (modalDetalle && modalDetalle.style.display === 'block') {
            cerrarDetalle();
        }
    }
});