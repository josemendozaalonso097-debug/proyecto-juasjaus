import { checkSessionToken } from '../api/auth.js?v=2';
import { navigateTo, initPageReveal } from '../utils/pageTransition.js?v=2';
import { cargarDatosPerfil, actualizarPerfil, cambiarFotoPerfil } from '../components/perfil.js?v=2';
import { inicializarPapeleria } from '../components/papeleria.js?v=2';
import { inicializarCarrito } from '../components/carrito.js?v=2';
import { inicializarPago } from '../components/pago.js?v=5';
import { mostrarNotificacion } from '../utils/notificaciones.js?v=2';
import { abrirModal, cerrarModal } from '../components/productos.js?v=2';

import { loadComponent } from '../utils/components.js';
import { inicializarSidebar } from '../components/sidebar.js?v=2';

// ========== SESIÓN Y PERFIL ==========
document.addEventListener('DOMContentLoaded', async function() {
    const reveal = initPageReveal();
    // 1. Cargar Componentes HTML
    await loadComponent('header-container', '../components/header.html');
    await loadComponent('footer-container', '../components/footer.html');

    // Modales
    await loadComponent('modal-productos-container', '../components/modal-productos.html');
    await loadComponent('modal-pago-container', '../components/modal-pago.html');
    await loadComponent('modal-papeleria-container', '../components/modal-papeleria.html');
    await loadComponent('modal-perfil-container', '../components/modal-perfil.html');

    // 2. Verificar Sesión
    const token = localStorage.getItem('access_token');
    if (!token) {
        showToast('Debes iniciar sesión primero', 'warning');
        setTimeout(() => { window.location.href = '../login.html'; }, 1200);
        return;
    }
    
    try {
        const response = await checkSessionToken(token);
        if (!response.ok) {
            showToast('Tu sesión ha expirado. Por favor inicia sesión nuevamente.', 'error');
            localStorage.removeItem('access_token');
            localStorage.removeItem('user');
            setTimeout(() => { window.location.href = '../login.html'; }, 1500);
            return;
        }
        
        const userData = await response.json();
        console.log('✅ Usuario autenticado en la tienda:', userData.nombre);
        
        // 3. Merge user data with local profile (preserves semestre, etc.)
        const userPrevRaw = localStorage.getItem('user');
        const userPrev = userPrevRaw ? JSON.parse(userPrevRaw) : {};
        const userActualizado = { ...userPrev, ...userData };
        localStorage.setItem('user', JSON.stringify(userActualizado));

        const perfilKey = `perfil_${userData.id}`;
        const perfilPrevRaw = localStorage.getItem(perfilKey);
        const perfilPrev = perfilPrevRaw ? JSON.parse(perfilPrevRaw) : {};
        const perfilActualizado = { ...perfilPrev, ...userData };
        localStorage.setItem(perfilKey, JSON.stringify(perfilActualizado));

        // 4. Inicializar Datos
        cargarDatosPerfil(userActualizado);
        inicializarCarrito();
        inicializarPapeleria();
        inicializarPago('tienda');
        inicializarSidebar();

        // Escuchadores que dependen del DOM inyectado
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function() {
                if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('user');
                    showToast('Sesión cerrada correctamente', 'success');
                    setTimeout(() => { window.location.href = '../login.html'; }, 1000);
                }
            });
        }

        const btnCarrito = document.querySelector('.button-carrito');
        if (btnCarrito) {
            btnCarrito.addEventListener('click', function() {
                document.querySelector('.sidebar-derecha')?.scrollIntoView({ behavior: 'smooth' });
            });
        }

        if (reveal) reveal();
        
    } catch (error) {
        console.error('Error:', error);
        showToast('Error al verificar la sesión', 'error');
        setTimeout(() => { window.location.href = '../login.html'; }, 1200);
    }
});

// Window exposes for HTML onclicks
window.actualizarPerfil = actualizarPerfil;
window.cambiarFotoPerfil = cambiarFotoPerfil;
window.copiarTexto = function(elementId) {
    const el = document.getElementById(elementId);
    if(el) {
        navigator.clipboard.writeText(el.textContent).then(() => mostrarNotificacion('✓ Copiado al portapapeles'));
    }
};
window.abrirModal = abrirModal;
window.cerrarModal = cerrarModal;
