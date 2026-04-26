import { checkSessionToken } from '../api/auth.js?v=1';
import { navigateTo, initPageReveal } from '../utils/pageTransition.js?v=1';
import { cargarDatosPerfil, verificarCambioAutomatico } from '../components/perfil.js?v=2';
import { inicializarHistorial, renderizarHistorial } from '../components/historial.js?v=5';
import { inicializarPago } from '../components/pago.js?v=5';
import { inicializarModalesGlobales } from '../components/modales.js?v=2';
import { inicializarPapeleria } from '../components/papeleria.js?v=2';
import { loadComponent } from '../utils/components.js?v=1';
import { obtenerHistorial } from '../utils/storage.js?v=1';
import { inicializarSidebar } from '../components/sidebar.js?v=2';
// Nota: splash es manejado por inline script en <head> de index.html

document.addEventListener('DOMContentLoaded', async function() {
    const reveal = initPageReveal();
    // 1. Cargar Componentes HTML
    await loadComponent('header-container', '../../components/header.html?v=1');
    await loadComponent('footer-container', '../../components/footer.html?v=1');

    // Modales
    await loadComponent('modal-historial-container', '../../components/modal-historial.html?v=1');
    await loadComponent('modal-informacion-container', '../../components/modal-informacion.html?v=1');
    await loadComponent('modal-detalle-container', '../../components/modal-detalle.html?v=1');
    await loadComponent('modal-pago-container', '../../components/modal-pago.html?v=1');
    await loadComponent('modal-papeleria-container', '../../components/modal-papeleria.html?v=1');
    await loadComponent('modal-perfil-container', '../../components/modal-perfil.html?v=1');
    await loadComponent('modal-deuda-container', '../../components/modal-deuda.html?v=1');
    await loadComponent('modal-orientacion-container', '../../components/modal-orientacion.html?v=1');
    await loadComponent('modal-confirmacion-container', '../../components/modal-confirmacion.html?v=1');

    // Mover event listeners que dependen del HTML cargado
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async function() {
            if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
                localStorage.removeItem('access_token');
                localStorage.removeItem('user');
                showToast('Sesión cerrada correctamente', 'success');
                setTimeout(() => {
                    window.location.href = '../login.html';
                }, 1000);
            }
        });
    }

    const storeBtn = document.getElementById('store-btn');
    if (storeBtn) {
        storeBtn.addEventListener('click', function() {
            navigateTo('../tienda/tienda.html', 'right');
        });
    }

    // 2. Verificar Sesión
    const token = localStorage.getItem('access_token');
    if (!token) {
        showToast('Debes iniciar sesión primero', 'warning');
        setTimeout(() => {
            window.location.href = '../login.html';
        }, 1200);
        return;
    }
    
    try {
        const response = await checkSessionToken(token);
        if (!response.ok) {
            showToast('Tu sesión ha expirado. Por favor inicia sesión nuevamente.', 'error');
            localStorage.removeItem('access_token');
            localStorage.removeItem('user');
            setTimeout(() => {
                window.location.href = '../login.html';
            }, 1500);
            return;
        }
        
        const userData = await response.json();
        console.log('✅ Usuario autenticado:', userData.nombre);
        
        const userPrevRaw = localStorage.getItem('user');
        const userPrev = userPrevRaw ? JSON.parse(userPrevRaw) : {};
        const userActualizado = { ...userPrev, ...userData };
        localStorage.setItem('user', JSON.stringify(userActualizado));

        const perfilKey = `perfil_${userData.id}`;
        const perfilPrevRaw = localStorage.getItem(perfilKey);
        const perfilPrev = perfilPrevRaw ? JSON.parse(perfilPrevRaw) : {};
        const perfilActualizado = { ...perfilPrev, ...userData };
        localStorage.setItem(perfilKey, JSON.stringify(perfilActualizado));
        
        // 3. Inicializar Lógica Visual y Datos
        cargarDatosPerfil(userActualizado);
        verificarCambioAutomatico();
        inicializarHistorial();
        renderizarHistorial();
        inicializarPago();
        inicializarModalesGlobales();
        inicializarPapeleria();
        inicializarSidebar();
        
        actualizarProximoVencimiento();

        if (reveal) reveal();
        
    } catch (error) {

        console.error('Error:', error);
        showToast('Error al verificar la sesión', 'error');
        setTimeout(() => {
            window.location.href = '../login.html';
        }, 1200);
    }
});

function actualizarProximoVencimiento() {
    const nextDateElement = document.getElementById('next-date');
    if (!nextDateElement) return;

    const hoy = new Date();
    const mesActual = hoy.getMonth(); // 0-11
    const anioActual = hoy.getFullYear();
    
    let semestreCobro = 1;
    let mesVencimientoText = 'Enero';
    let anioVencimientoText = anioActual;
    let mostrarDeuda = false;
    
    // Ventana para Enero (Noviembre, Diciembre, Enero)
    if (mesActual === 10 || mesActual === 11 || mesActual === 0) {
        semestreCobro = 1;
        mesVencimientoText = 'Enero';
        anioVencimientoText = (mesActual === 0) ? anioActual : anioActual + 1;
        mostrarDeuda = true;
    }
    // Ventana para Julio (Mayo, Junio, Julio)
    else if (mesActual >= 4 && mesActual <= 6) {
        semestreCobro = 2;
        mesVencimientoText = 'Julio';
        anioVencimientoText = anioActual;
        mostrarDeuda = true;
    }

    const textoFecha = `1 de ${mesVencimientoText} del ${anioVencimientoText}`;

    const userRaw = localStorage.getItem('user');
    const user = userRaw ? JSON.parse(userRaw) : {};
    const perfilRaw = user.id ? localStorage.getItem(`perfil_${user.id}`) : null;
    const perfil = perfilRaw ? JSON.parse(perfilRaw) : user;
    
    const rol = (perfil.rol || user.rol || 'estudiante').toLowerCase();
    const semestreDelUsuario = parseInt(perfil.semestre || user.semestre || '1', 10);

    const historial = obtenerHistorial() || [];
    let pagosRealizados = 0;
    historial.forEach(compra => {
        if (compra.productos && compra.productos.some(p => p.nombre.toLowerCase().includes('colegiatura'))) {
            pagosRealizados++;
        }
    });

    let pagosPendientes = 0;

    // Solo calculamos deuda para estudiantes
    if (rol === 'estudiante') {
        // En teoría, un alumno en Semestre N, debe haber pagado N colegiaturas en total su carrera.
        // Pero depende de si ya pasamos la fecha de cobro del semestre actual.
        // Simplificación: si estamos en semestre de cobro, se espera N pagos. Si no, N-1.
        let pagosEsperados = semestreDelUsuario - 1; 
        if (mostrarDeuda) {
            pagosEsperados = semestreDelUsuario; // Estamos en época de cobro, ya debería pagar la actual
        }
        
        pagosPendientes = Math.max(0, pagosEsperados - pagosRealizados);
    }
    
    // Elements for "Estado de Pago"
    const estadoContainer = document.querySelector('.flex-grow.flex.flex-col.items-center');
    if (estadoContainer) {
        if (pagosPendientes > 0) {
            // DEUDA ACTIVA (Cruz roja)
            estadoContainer.innerHTML = `
                <div class="relative inline-flex items-center justify-center w-36 h-36 rounded-full mb-6">
                    <svg class="w-full h-full text-red-200 dark:text-red-900/40" viewBox="0 0 36 36">
                        <path class="stroke-current" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke-linecap="round" stroke-width="2.5"></path>
                    </svg>
                    <svg class="w-full h-full text-red-500 absolute top-0 left-0" viewBox="0 0 36 36">
                        <path class="stroke-current" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke-dasharray="100, 100" stroke-linecap="round" stroke-width="2.5"></path>
                    </svg>
                    <div class="absolute bg-red-500/10 w-24 h-24 rounded-full flex items-center justify-center">
                        <span class="material-symbols-outlined text-5xl text-red-500">close</span>
                    </div>
                </div>
                <h4 class="text-2xl font-bold leading-tight tracking-[-0.015em] mb-3 text-slate-800 dark:text-slate-100">Tienes <strong class="text-red-500">${pagosPendientes}</strong> pago(s) pendiente(s)</h4>
                <p class="text-slate-500 dark:text-slate-400 text-base max-w-md">Hemos detectado un atraso en tu cuenta. Por favor regulariza tu situación.</p>
            `;
            
            // Mostrar modal global
            if (window.mostrarModalDeuda) {
                window.mostrarModalDeuda(pagosPendientes);
            }
        } else {
            // AL CORRIENTE (Palomita verde)
            estadoContainer.innerHTML = `
                <div class="relative inline-flex items-center justify-center w-36 h-36 rounded-full mb-6">
                    <svg class="w-full h-full text-slate-200 dark:text-slate-700" viewBox="0 0 36 36">
                        <path class="stroke-current" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke-linecap="round" stroke-width="2.5"></path>
                    </svg>
                    <svg class="w-full h-full text-green-500 absolute top-0 left-0" viewBox="0 0 36 36">
                        <path class="stroke-current" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke-dasharray="100, 100" stroke-linecap="round" stroke-width="2.5"></path>
                    </svg>
                    <div class="absolute bg-green-500/10 w-24 h-24 rounded-full flex items-center justify-center">
                        <span class="material-symbols-outlined text-5xl text-green-500">check</span>
                    </div>
                </div>
                <h4 class="text-2xl font-bold leading-tight tracking-[-0.015em] mb-3 text-slate-800 dark:text-slate-100">Tienes <strong class="text-primary">0</strong> pagos pendientes</h4>
                <p class="text-slate-500 dark:text-slate-400 text-base max-w-md">Tu cuenta está al corriente. ¡Gracias por tu puntualidad y compromiso con tu educación!</p>
            `;
        }
    }

    if (pagosPendientes === 0) {
        // No debe nada de este semestre
        nextDateElement.textContent = 'No hay pagos pendientes';
        nextDateElement.style.color = '#27ae60'; // Verde
    } else {
        // Debe
        nextDateElement.textContent = textoFecha;
        nextDateElement.style.color = '#e74c3c'; // Rojo
    }

    // -------- Mobile next-date --------
    const nextDateMobile = document.getElementById('next-date-mobile');
    if (nextDateMobile) {
        nextDateMobile.textContent = pagosPendientes === 0 ? 'Sin deuda' : textoFecha;
    }

    // -------- Mobile payment status card --------
    const estadoMobile = document.getElementById('estado-container-global-mobile');
    if (estadoMobile) {
        if (pagosPendientes > 0) {
            estadoMobile.innerHTML = `
                <div style="background:white;border-radius:16px;padding:20px;border:1px solid rgba(228,190,186,0.15);">
                    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px;">
                        <div>
                            <h3 style="font-family:'Plus Jakarta Sans',sans-serif;font-size:1rem;font-weight:700;color:#1a1c1d;margin-bottom:6px;">Estados de pago</h3>
                            <div style="display:inline-flex;align-items:center;background:#ffdad6;border-radius:999px;padding:3px 10px;font-size:11px;font-weight:700;color:#93000a;">
                                <span style="width:6px;height:6px;border-radius:50%;background:#ba1a1a;display:inline-block;margin-right:6px;"></span>
                                ${pagosPendientes} pago(s) pendiente(s)
                            </div>
                        </div>
                        <div style="width:52px;height:52px;border-radius:50%;background:#ffdad6;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                            <span class="material-symbols-outlined" style="color:#ba1a1a;font-size:22px;">warning</span>
                        </div>
                    </div>
                    <p style="font-family:'Manrope',sans-serif;font-size:0.8rem;color:#5b403d;margin-bottom:14px;">Tienes pagos atrasados. Regulariza tu situación a tiempo.</p>
                    <button onclick="document.getElementById('info-btn').click()" style="width:100%;background:#af101a;color:white;padding:12px;border-radius:10px;font-weight:700;border:none;cursor:pointer;font-family:'Manrope',sans-serif;font-size:0.875rem;">
                        Ver detalles
                    </button>
                </div>`;
        } else {
            estadoMobile.innerHTML = `
                <div style="background:white;border-radius:16px;padding:20px;border:1px solid rgba(228,190,186,0.15);">
                    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px;">
                        <div>
                            <h3 style="font-family:'Plus Jakarta Sans',sans-serif;font-size:1rem;font-weight:700;color:#1a1c1d;margin-bottom:6px;">Estados de pago</h3>
                            <div style="display:inline-flex;align-items:center;background:#e8f5e9;border-radius:999px;padding:3px 10px;font-size:11px;font-weight:700;color:#1b5e20;">
                                <span style="width:6px;height:6px;border-radius:50%;background:#27ae60;display:inline-block;margin-right:6px;"></span>
                                Al corriente
                            </div>
                        </div>
                        <div style="width:52px;height:52px;border-radius:50%;background:#e8f5e9;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                            <span class="material-symbols-outlined" style="color:#27ae60;font-size:22px;">check_circle</span>
                        </div>
                    </div>
                    <p style="font-family:'Manrope',sans-serif;font-size:0.8rem;color:#5b403d;margin-bottom:14px;">Tu cuenta está al corriente. ¡Gracias por tu puntualidad!</p>
                    <button disabled style="width:100%;background:#e2e2e4;color:#5b403d;padding:12px;border-radius:10px;font-weight:700;border:none;cursor:not-allowed;font-family:'Manrope',sans-serif;font-size:0.875rem;opacity:0.7;">
                        Sin deuda
                    </button>
                </div>`;
        }
    }
}

window.actualizarProximoVencimiento = actualizarProximoVencimiento;
