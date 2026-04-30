// js/utils/storage.js
export function obtenerUsuarioActual() {
    const userData = localStorage.getItem('user');
    if (!userData) return null;
    try {
        const user = JSON.parse(userData);
        return user.id;
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
    
    let historial = JSON.parse(localStorage.getItem(claveHistorial)) || [];
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
    
    const historial = localStorage.getItem(claveHistorial);
    return historial ? JSON.parse(historial) : [];
}
