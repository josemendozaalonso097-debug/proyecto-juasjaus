import { checkSessionToken } from '../api/auth.js';
import { cargarDatosPerfil, actualizarPerfil, cambiarFotoPerfil } from '../components/perfil.js';
import { inicializarPapeleria } from '../components/papeleria.js';
import { inicializarCarrito } from '../components/carrito.js';
import { inicializarPago } from '../components/pago.js';
import { mostrarNotificacion } from '../utils/notificaciones.js';
import { abrirModal, cerrarModal } from '../components/productos.js';

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
    inicializarPago('tienda');

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
