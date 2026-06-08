// src/utils/storage.js
export function obtenerUsuarioActual() {
    const userData = localStorage.getItem('user');
    if (!userData) return null;
    try {
        const user = JSON.parse(userData);
        return user?.id || null;
    } catch (e) {
        return null;
    }
}

export function obtenerClaveHistorial() {
    const userId = obtenerUsuarioActual();
    if (!userId) return null;
    return 'historialCompras_' + userId;
}

export function guardarEnHistorial(compra) {
    const claveHistorial = obtenerClaveHistorial();
    if (!claveHistorial) {
        console.error('No hay usuario logueado');
        return false;
    }
    
    let historial = [];
    try {
        const stored = localStorage.getItem(claveHistorial);
        historial = stored ? JSON.parse(stored) : [];
        if (!Array.isArray(historial)) historial = [];
    } catch (e) {
        historial = [];
    }
    
    historial.push(compra);
    localStorage.setItem(claveHistorial, JSON.stringify(historial));
    console.log('✅ Compra guardada para usuario:', obtenerUsuarioActual());
    return true;
}

export function obtenerHistorial() {
    const claveHistorial = obtenerClaveHistorial();
    if (!claveHistorial) {
        console.warn('No hay usuario logueado');
        return [];
    }
    
    try {
        const historial = localStorage.getItem(claveHistorial);
        const parsed = historial ? JSON.parse(historial) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        return [];
    }
}
