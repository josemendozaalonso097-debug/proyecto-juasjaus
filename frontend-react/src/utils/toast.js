/**
 * Toast Notification System — CBTis 258
 * Reemplaza los alert() nativos con notificaciones flotantes premium.
 * Uso: showToast('Mensaje', 'success' | 'error' | 'warning' | 'info')
 */

const ICONS = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
};

export function showToast(message, type = 'info', duration = 4000) {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast-item toast-${type}`;
    toast.style.setProperty('--toast-duration', duration + 'ms');

    toast.innerHTML = `
        <div class="toast-icon">${ICONS[type] || ICONS.info}</div>
        <span>${message}</span>
        <div class="toast-progress"></div>
    `;

    // Click to dismiss
    toast.addEventListener('click', () => dismiss(toast));

    container.appendChild(toast);

    // Auto dismiss
    const timer = setTimeout(() => dismiss(toast), duration);

    function dismiss(el) {
        clearTimeout(timer);
        el.classList.add('toast-exit');
        el.addEventListener('animationend', () => el.remove());
    }
}

// Exponer a window para compatibilidad 1:1 con scripts heredados
if (typeof window !== 'undefined') {
    window.showToast = showToast;
}
