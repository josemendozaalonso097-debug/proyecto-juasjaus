import { checkSessionToken } from '../api/auth.js';
import { cargarDatosPerfil } from '../components/perfil.js';
import { inicializarHistorial, renderizarHistorial } from '../components/historial.js';
import { inicializarPago } from '../components/pago.js';
import { inicializarModalesGlobales } from '../components/modales.js';
import { inicializarPapeleria } from '../components/papeleria.js';

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
        
        cargarDatosPerfil(userActualizado);
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error al verificar la sesión');
        window.location.href = '../login.html';
    }
};

document.addEventListener('DOMContentLoaded', function() {
    inicializarHistorial();
    renderizarHistorial();
    inicializarPago();
    inicializarModalesGlobales();
    inicializarPapeleria();

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async function() {
            const confirmLogout = confirm('¿Estás seguro que deseas cerrar sesión?');
            if (confirmLogout) {
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
});
