/**
 * Toast Notification System — CBTis 258
 * Reemplaza los alert() nativos con notificaciones flotantes premium.
 * Uso: showToast('Mensaje', 'success' | 'error' | 'warning' | 'info')
 */

(function() {
    'use strict';

    // Inyectar CSS
    const style = document.createElement('style');
    style.textContent = `
/* ── Toast Container ──────────────────────────── */
#toast-container {
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 100000;
    display: flex;
    flex-direction: column-reverse;
    gap: 10px;
    pointer-events: none;
}

/* ── Toast Item ───────────────────────────────── */
.toast-item {
    pointer-events: all;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 20px;
    border-radius: 14px;
    min-width: 300px;
    max-width: 420px;
    font-family: 'Lexend', 'Public Sans', sans-serif;
    font-size: 13.5px;
    font-weight: 500;
    line-height: 1.4;
    color: #fff;
    backdrop-filter: blur(16px) saturate(180%);
    -webkit-backdrop-filter: blur(16px) saturate(180%);
    box-shadow: 0 8px 32px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.1);
    transform: translateX(120%);
    opacity: 0;
    animation: toastSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    cursor: pointer;
    transition: transform 0.3s ease, opacity 0.3s ease;
}

.toast-item.toast-exit {
    animation: toastSlideOut 0.35s ease forwards;
}

/* ── Types ─────────────────────────────────────── */
.toast-success {
    background: linear-gradient(135deg, rgba(34,197,94,0.92), rgba(22,163,74,0.95));
    border: 1px solid rgba(255,255,255,0.15);
}
.toast-error {
    background: linear-gradient(135deg, rgba(239,68,68,0.92), rgba(220,38,38,0.95));
    border: 1px solid rgba(255,255,255,0.15);
}
.toast-warning {
    background: linear-gradient(135deg, rgba(245,158,11,0.92), rgba(217,119,6,0.95));
    border: 1px solid rgba(255,255,255,0.15);
}
.toast-info {
    background: linear-gradient(135deg, rgba(59,130,246,0.92), rgba(37,99,235,0.95));
    border: 1px solid rgba(255,255,255,0.15);
}

/* ── Icon ──────────────────────────────────────── */
.toast-icon {
    font-size: 20px;
    flex-shrink: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255,255,255,0.2);
    border-radius: 8px;
}

/* ── Progress bar ──────────────────────────────── */
.toast-progress {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 3px;
    background: rgba(255,255,255,0.4);
    border-radius: 0 0 14px 14px;
    animation: toastProgress var(--toast-duration, 4s) linear forwards;
}

/* ── Animations ────────────────────────────────── */
@keyframes toastSlideIn {
    from { transform: translateX(120%); opacity: 0; }
    to   { transform: translateX(0); opacity: 1; }
}
@keyframes toastSlideOut {
    from { transform: translateX(0); opacity: 1; }
    to   { transform: translateX(120%); opacity: 0; }
}
@keyframes toastProgress {
    from { width: 100%; }
    to   { width: 0%; }
}

/* ── Mobile ────────────────────────────────────── */
@media (max-width: 480px) {
    #toast-container {
        bottom: 16px;
        right: 16px;
        left: 16px;
    }
    .toast-item {
        min-width: unset;
        width: 100%;
    }
}
    `;
    document.head.appendChild(style);

    // Crear contenedor
    const container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);

    const ICONS = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
    };

    /**
     * Muestra una notificación toast.
     * @param {string} message - El mensaje a mostrar.
     * @param {'success'|'error'|'warning'|'info'} type - Tipo de notificación.
     * @param {number} duration - Duración en ms (default 4000).
     */
    window.showToast = function(message, type = 'info', duration = 4000) {
        const toast = document.createElement('div');
        toast.className = `toast-item toast-${type}`;
        toast.style.setProperty('--toast-duration', duration + 'ms');
        toast.style.position = 'relative';
        toast.style.overflow = 'hidden';

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
    };
})();
