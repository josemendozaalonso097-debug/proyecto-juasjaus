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
    renderizarHistorial(); // Actualizar antes de abrir
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
        generarPDFHistorial();
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


function renderizarHistorial() {
    const historialContainer = document.querySelector('.historial-compras');
    const totalComprasElem = document.querySelector('.resumen-item strong');
    const totalGastadoElem = document.querySelector('.total-amount');

    if (!historialContainer) return;

    const historial = JSON.parse(localStorage.getItem('historialCompras')) || [];

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

    if (totalComprasElem) totalComprasElem.textContent = historial.length;
    if (totalGastadoElem) totalGastadoElem.textContent = `$${totalGastado.toFixed(2)} MXN`;
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


// ========== MODAL DE PAPELERÍA ==========

let archivosSubidos = [];

// Abrir modal de papelería
function abrirModalPapeleria() {
    const modalPapeleria = document.getElementById('modalPapeleria');
    if (modalPapeleria) {
        modalPapeleria.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Pre-llenar nombre y matrícula si están disponibles
        const userName = document.getElementById('user-name')?.textContent;
        const userMatricula = document.getElementById('user-matricula')?.textContent;
        
        if (userName && userName !== 'Usuario') {
            document.getElementById('nombreAlumno').value = userName;
        }
        if (userMatricula) {
            document.getElementById('matriculaAlumno').value = userMatricula;
        }
    }
}

// Cerrar modal de papelería
function cerrarModalPapeleria() {
    const modalPapeleria = document.getElementById('modalPapeleria');
    if (modalPapeleria) {
        modalPapeleria.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
    
    // Limpiar formulario
    document.getElementById('formPapeleria').reset();
    archivosSubidos = [];
    actualizarListaArchivos();
}

// Mostrar campo "Otro" cuando se selecciona
function mostrarCampoOtro() {
    const tipoDocumento = document.getElementById('tipoDocumento').value;
    const campoOtro = document.getElementById('campoOtro');
    const inputOtro = document.getElementById('otroDocumento');
    
    if (tipoDocumento === 'Otro') {
        campoOtro.style.display = 'block';
        inputOtro.required = true;
    } else {
        campoOtro.style.display = 'none';
        inputOtro.required = false;
    }
}

// Configurar zona de subida de archivos
document.addEventListener('DOMContentLoaded', function() {
    const uploadZone = document.getElementById('uploadZone');
    const archivosInput = document.getElementById('archivosInput');
    
    if (uploadZone && archivosInput) {
        // Click para abrir selector
        uploadZone.addEventListener('click', function() {
            archivosInput.click();
        });
        
        // Drag & Drop
        uploadZone.addEventListener('dragover', function(e) {
            e.preventDefault();
            e.stopPropagation();
            this.classList.add('dragover');
        });
        
        uploadZone.addEventListener('dragleave', function(e) {
            e.preventDefault();
            e.stopPropagation();
            this.classList.remove('dragover');
        });
        
        uploadZone.addEventListener('drop', function(e) {
            e.preventDefault();
            e.stopPropagation();
            this.classList.remove('dragover');
            
            const files = e.dataTransfer.files;
            agregarArchivos(files);
        });
        
        // Cambio de archivo
        archivosInput.addEventListener('change', function(e) {
            agregarArchivos(e.target.files);
        });
    }
});

// Agregar archivos a la lista
function agregarArchivos(files) {
    if (archivosSubidos.length >= 10) {
        alert('Ya has alcanzado el máximo de 10 archivos.');
        return;
    }
    
    Array.from(files).forEach(file => {
        if (archivosSubidos.length >= 10) {
            alert('Solo puedes subir un máximo de 10 archivos.');
            return;
        }
        
        // Validar tamaño (5MB máx)
        if (file.size > 5 * 1024 * 1024) {
            alert(`El archivo "${file.name}" es demasiado grande. Máximo 5MB.`);
            return;
        }
        
        // Validar tipo
        const tiposPermitidos = [
            'image/png', 'image/jpeg', 'image/jpg', 
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        
        if (!tiposPermitidos.includes(file.type)) {
            alert(`El archivo "${file.name}" no tiene un formato permitido.`);
            return;
        }
        
        // Agregar archivo
        archivosSubidos.push(file);
    });
    
    actualizarListaArchivos();
}

// Actualizar la lista visual de archivos
function actualizarListaArchivos() {
    const archivosLista = document.getElementById('archivosLista');
    const contador = document.getElementById('contadorArchivos');
    
    if (!archivosLista || !contador) return;
    
    // Actualizar contador
    contador.textContent = `${archivosSubidos.length} / 10 archivos`;
    
    // Limpiar lista
    archivosLista.innerHTML = '';
    
    // Agregar cada archivo
    archivosSubidos.forEach((file, index) => {
        const archivoItem = document.createElement('div');
        archivoItem.className = 'archivo-item';
        
        const icono = obtenerIconoArchivo(file.type);
        const tamano = formatearTamano(file.size);
        
        archivoItem.innerHTML = `
            <div class="archivo-info">
                <div class="archivo-icon">${icono}</div>
                <div class="archivo-detalles">
                    <div class="archivo-nombre">${file.name}</div>
                    <div class="archivo-tamano">${tamano}</div>
                </div>
            </div>
            <button type="button" class="btn-eliminar-archivo" onclick="eliminarArchivo(${index})">✕ Eliminar</button>
        `;
        
        archivosLista.appendChild(archivoItem);
    });
}

// Obtener icono según tipo de archivo
function obtenerIconoArchivo(tipo) {
    if (tipo.includes('image')) return '🖼️';
    if (tipo.includes('pdf')) return '📄';
    if (tipo.includes('word') || tipo.includes('document')) return '📝';
    return '📎';
}

// Formatear tamaño de archivo
function formatearTamano(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

// Eliminar archivo de la lista
function eliminarArchivo(index) {
    archivosSubidos.splice(index, 1);
    actualizarListaArchivos();
}

// Enviar formulario de papelería
document.addEventListener('DOMContentLoaded', function() {
    const formPapeleria = document.getElementById('formPapeleria');
    
    if (formPapeleria) {
        formPapeleria.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validar que haya al menos un archivo
            if (archivosSubidos.length === 0) {
                alert('Debes subir al menos un archivo.');
                return;
            }
            
            // Recopilar datos
            const datos = {
                alumno: {
                    nombre: document.getElementById('nombreAlumno').value,
                    matricula: document.getElementById('matriculaAlumno').value,
                    gradoGrupo: document.getElementById('gradoGrupo').value,
                    telefono: document.getElementById('telefonoAlumno').value
                },
                padre: {
                    nombre: document.getElementById('nombrePadre').value,
                    telefono: document.getElementById('telefonoPadre').value,
                    email: document.getElementById('emailPadre').value,
                    parentesco: document.getElementById('parentesco').value
                },
                tipoDocumento: document.getElementById('tipoDocumento').value,
                otroDocumento: document.getElementById('otroDocumento').value,
                observaciones: document.getElementById('observaciones').value,
                archivos: archivosSubidos.map(f => f.name),
                fecha: new Date().toLocaleString()
            };
            
            console.log('Datos a enviar:', datos);
            
            // Aquí harías el fetch al backend
            // Por ahora solo mostramos confirmación
            mostrarConfirmacionPapeleria(datos);
        });
    }
});

// Mostrar confirmación de envío
function mostrarConfirmacionPapeleria(datos) {
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
        z-index: 10001;
        text-align: center;
        max-width: 450px;
        border: 3px solid #27ae60;
    `;
    
    confirmacion.innerHTML = `
        <div style="font-size: 4em; margin-bottom: 20px;">✅</div>
        <h2 style="color: #27ae60; margin-bottom: 15px; font-size: 1.5em;">¡Documentos enviados!</h2>
        <p style="color: #666; margin-bottom: 15px; line-height: 1.6;">
            Tu papelería ha sido recibida exitosamente.<br>
            <strong>Tipo:</strong> ${datos.tipoDocumento}<br>
            <strong>Archivos:</strong> ${datos.archivos.length}<br><br>
            <strong>Estado: Pendiente de revisión</strong>
        </p>
        <p style="color: #999; font-size: 0.9em; margin-bottom: 20px;">
            Recibirás una notificación cuando sea validada.
        </p>
        <button onclick="cerrarConfirmacion(this)" style="
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
    cerrarModalPapeleria();
}

function cerrarConfirmacion(button) {
    button.parentElement.remove();
    document.body.style.overflow = 'auto';
}

// Conectar botón de papelería
const papeBtn = document.getElementById('pape-btn');
if (papeBtn) {
    papeBtn.addEventListener('click', function() {
        abrirModalPapeleria();
    });
}

// Cerrar modal al hacer clic fuera
window.addEventListener('click', function(event) {
    const modalPapeleria = document.getElementById('modalPapeleria');
    if (event.target === modalPapeleria) {
        cerrarModalPapeleria();
    }
});

// Cerrar con tecla ESC
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const modalPapeleria = document.getElementById('modalPapeleria');
        if (modalPapeleria && modalPapeleria.style.display === 'block') {
            cerrarModalPapeleria();
        }
    }
});

document.addEventListener('DOMContentLoaded', renderizarHistorial);

function generarPDFHistorial() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const historial = JSON.parse(localStorage.getItem('historialCompras')) || [];
    
    if (historial.length === 0) {
        alert('No hay compras en el historial');
        return;
    }
    
    // Encabezado
    doc.setFillColor(148, 39, 44);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('CBTis 258', 105, 20, { align: 'center' });
    doc.setFontSize(14);
    doc.text('HISTORIAL DE FACTURAS', 105, 32, { align: 'center' });
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text(`Generado: ${new Date().toLocaleDateString('es-MX')}`, 105, 50, { align: 'center' });
    
    let y = 65;
    let totalGastado = 0;
    
    historial.forEach((compra, i) => {
        if (y > 250) {
            doc.addPage();
            y = 20;
        }
        
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text(`Compra #${i + 1} - ${compra.fecha}`, 20, y);
        doc.setFont(undefined, 'normal');
        doc.setFontSize(10);
        doc.text(`Método: ${compra.metodoPago}`, 20, y + 7);
        doc.text(`Estado: ${compra.estado}`, 20, y + 14);
        
        compra.productos.forEach((prod, j) => {
            doc.text(`• ${prod.nombre} x${prod.cantidad} - $${(prod.precio * prod.cantidad).toFixed(2)}`, 25, y + 21 + (j * 6));
        });
        
        doc.setFont(undefined, 'bold');
        doc.text(`Subtotal: $${compra.total.toFixed(2)} MXN`, 20, y + 21 + (compra.productos.length * 6) + 5);
        
        doc.setDrawColor(200, 200, 200);
        doc.line(20, y + 28 + (compra.productos.length * 6), 190, y + 28 + (compra.productos.length * 6));
        
        totalGastado += compra.total;
        y += 35 + (compra.productos.length * 6);
    });
    
    // Total final
    doc.setFillColor(240, 240, 240);
    doc.rect(0, y, 210, 20, 'F');
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(148, 39, 44);
    doc.text(`TOTAL GASTADO: $${totalGastado.toFixed(2)} MXN`, 105, y + 13, { align: 'center' });
    
    doc.save('historial_facturas.pdf');
}