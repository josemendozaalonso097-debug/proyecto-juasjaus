export function inicializarPago() {
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

    const payBtn = document.getElementById('pay-btn');
    if (payBtn) {
        payBtn.addEventListener('click', abrirModalPago);
    }
    
    const checkoutBtn2 = document.querySelector('.checkout-btn');
    if (checkoutBtn2) {
        checkoutBtn2.addEventListener('click', function() {
            // Import dynamically to avoid circular dep if needed, but here we can just dispatch event or call history
            // Actually, we need agregarCompra which is in tienda.js? No, 'agregarCompra' is not in principal.js
            // Wait, principal.js calls agregarCompra("Colegiatura Mensual", 1250);
            // We should use the global window.guardarEnHistorial or import it
            const producto = "Colegiatura Mensual";
            const precio = 1250;
            const compra = {
                fecha: new Date().toLocaleDateString('es-MX'),
                metodoPago: 'Tarjeta Bancaria',
                estado: 'Completado',
                productos: [{ nombre: producto, precio: precio, cantidad: 1 }],
                total: precio
            };
            import('../utils/storage.js').then(module => {
                module.guardarEnHistorial(compra);
                cerrarModalPago();
                alert('Pago procesado correctamente y agregado al historial.');
            });
        });
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
