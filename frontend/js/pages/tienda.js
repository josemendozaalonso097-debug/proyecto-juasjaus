import { checkSessionToken } from '../api/auth.js';
import { navigateTo, initPageReveal } from '../utils/pageTransition.js';
import { cargarDatosPerfil, actualizarPerfil, cambiarFotoPerfil } from '../components/perfil.js';
import { inicializarPapeleria } from '../components/papeleria.js';
import { inicializarCarrito } from '../components/carrito.js';
import { inicializarPago } from '../components/pago.js';
import { mostrarNotificacion } from '../utils/notificaciones.js';
import { abrirModal, cerrarModal } from '../components/productos.js';

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

        if (reveal) reveal();
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error al verificar la sesión');
        window.location.href = '../login.html';
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
