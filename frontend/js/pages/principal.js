import { checkSessionToken } from '../api/auth.js';
import { cargarDatosPerfil } from '../components/perfil.js';
import { inicializarHistorial, renderizarHistorial } from '../components/historial.js';
import { inicializarPago } from '../components/pago.js';
import { inicializarModalesGlobales } from '../components/modales.js';
import { inicializarPapeleria } from '../components/papeleria.js';
import { loadComponent } from '../utils/components.js';

document.addEventListener('DOMContentLoaded', async function() {
    // 1. Cargar Componentes HTML
    await loadComponent('header-container', '../components/header.html');
    await loadComponent('footer-container', '../components/footer.html');

    // Modales
    await loadComponent('modal-historial-container', '../components/modal-historial.html');
    await loadComponent('modal-informacion-container', '../components/modal-informacion.html');
    await loadComponent('modal-detalle-container', '../components/modal-detalle.html');
    await loadComponent('modal-pago-container', '../components/modal-pago.html');
    await loadComponent('modal-papeleria-container', '../components/modal-papeleria.html');
    await loadComponent('modal-perfil-container', '../components/modal-perfil.html');
    await loadComponent('modal-orientacion-container', '../components/modal-orientacion.html');

    // Mover event listeners que dependen del HTML cargado
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async function() {
            if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
                localStorage.removeItem('access_token');
                localStorage.removeItem('user');
                alert('Sesión cerrada correctamente');
                window.location.href = '../login.html';
            }
        });
    }

    const storeBtn = document.getElementById('store-btn');
    if (storeBtn) {
        storeBtn.addEventListener('click', function() {
            window.location.href = '../tienda/tienda.html';
        });
    }

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
        inicializarHistorial();
        renderizarHistorial();
        inicializarPago();
        inicializarModalesGlobales();
        inicializarPapeleria();
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error al verificar la sesión');
        window.location.href = '../login.html';
    }
});
