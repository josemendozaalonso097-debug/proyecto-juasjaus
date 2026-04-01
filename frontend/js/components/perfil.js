const LIMIT_ROL = 3;
const LIMIT_SEMESTRE = 10;

export function cargarDatosPerfil(user) {
    console.log('DEBUG: cargarDatosPerfil() con user.id =', user?.id);
    const userId = user.id;

    // Preferir perfil extendido por usuario
    const perfilRaw = userId ? localStorage.getItem(`perfil_${userId}`) : null;
    const perfil = perfilRaw ? JSON.parse(perfilRaw) : user;

    const nombre   = perfil.nombre   || user.nombre   || 'Usuario';
    const email    = perfil.email    || user.email    || '—';
    const rol      = perfil.rol      || user.rol      || 'estudiante';
    const semestre = perfil.semestre || user.semestre || '';

    const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

    setEl('modal-perfil-nombre', nombre);
    setEl('modal-perfil-rol', rol.charAt(0).toUpperCase() + rol.slice(1));
    setEl('modal-perfil-nombre-completo', nombre);
    setEl('modal-perfil-email', email);
    setEl('modal-perfil-rol-detalle', rol.charAt(0).toUpperCase() + rol.slice(1));
    setEl('modal-perfil-semestre', semestre ? `${semestre}° Semestre` : '—');

    // Mostrar/ocultar semestre según rol
    const filaSemestre = document.getElementById('fila-semestre');
    const editarSemestre = document.getElementById('editar-semestre-container');
    const esEstudiante = rol === 'estudiante';
    if (filaSemestre) filaSemestre.style.display = esEstudiante ? '' : 'none';
    if (editarSemestre) editarSemestre.style.display = esEstudiante ? '' : 'none';

    // Pre-rellenar campos de edición
    const inputNombre = document.getElementById('input-perfil-nombre');
    const inputSemestre = document.getElementById('input-perfil-semestre');
    const inputRol = document.getElementById('input-perfil-rol');

    if (inputNombre) inputNombre.value = nombre;
    if (inputSemestre && semestre) inputSemestre.value = semestre;
    if (inputRol) inputRol.value = rol;

    // Cargar estadísticas de cambios
    if (userId) {
        const cambiosRol = parseInt(localStorage.getItem(`cambios_rol_${userId}`) || '0', 10);
        const cambiosSemestre = parseInt(localStorage.getItem(`cambios_semestre_${userId}`) || '0', 10);

        const badgeRol = document.getElementById('badge-cambios-rol');
        const badgeSemestre = document.getElementById('badge-cambios-semestre');

        if (badgeRol) {
            const restRol = Math.max(0, LIMIT_ROL - cambiosRol);
            badgeRol.textContent = `${restRol} cambios restantes`;
            if (restRol === 0) {
                badgeRol.className = "text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-600";
                if (inputRol) inputRol.disabled = true;
            }
        }
        if (badgeSemestre) {
            const restSem = Math.max(0, LIMIT_SEMESTRE - cambiosSemestre);
            badgeSemestre.textContent = `${restSem} cambios restantes`;
            if (restSem === 0) {
                badgeSemestre.className = "text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-600";
                if (inputSemestre) inputSemestre.disabled = true;
            }
        }
    }

    // Actualizar nombre en el header
    const navName = document.getElementById('user-name-nav');
    if (navName) navName.textContent = nombre;

    const userNameEl = document.getElementById('user-name');
    if (userNameEl) userNameEl.textContent = nombre;

    // Actualizar badge de semestre en el dashboard (Cuenta Activa)
    const statusBadge = document.getElementById('status-badge');
    if (statusBadge) {
        if (rol === 'estudiante') {
            statusBadge.textContent = semestre ? `${semestre}° Semestre` : 'Sin semestre';
        } else {
            statusBadge.textContent = 'No aplica';
        }
    }

    if (userId) {
        const foto = localStorage.getItem(`foto_perfil_${userId}`);
        const DEFAULT_PHOTO = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2394272c'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E";
        const fotoUrl = foto || DEFAULT_PHOTO;

        const preview = document.getElementById('profilePhotoPreview');
        if (preview) preview.style.backgroundImage = `url("${fotoUrl}")`;

        const headerPhoto = document.getElementById('header-user-photo');
        if (headerPhoto) headerPhoto.style.backgroundImage = `url("${fotoUrl}")`;
    }
}

export function actualizarPerfil() {
    console.log('DEBUG: inicializando actualizarPerfil()');
    const userRaw = localStorage.getItem('user');
    if (!userRaw) return;
    const user = JSON.parse(userRaw);
    const userId = user.id;

    const inputNombre   = document.getElementById('input-perfil-nombre');
    const inputSemestre = document.getElementById('input-perfil-semestre');
    const inputRol      = document.getElementById('input-perfil-rol');
    const msg = document.getElementById('perfil-guardado-msg');

    const nuevoNombre   = inputNombre   ? inputNombre.value.trim() : '';
    const nuevoSemestre = inputSemestre ? inputSemestre.value      : '';
    const nuevoRol      = inputRol      ? inputRol.value           : '';

    if (!nuevoNombre) { alert('El nombre no puede estar vacío.'); return; }

    const perfilKey = `perfil_${userId}`;
    const perfilRaw = localStorage.getItem(perfilKey);
    const perfil = perfilRaw ? JSON.parse(perfilRaw) : { ...user };

    const cambiosRol = parseInt(localStorage.getItem(`cambios_rol_${userId}`) || '0', 10);
    const cambiosSemestre = parseInt(localStorage.getItem(`cambios_semestre_${userId}`) || '0', 10);

    const rolCambiado = nuevoRol !== (perfil.rol || user.rol);
    const semestreCambiado = nuevoSemestre !== (perfil.semestre || user.semestre);

    // Lógica de validación de límites
    if (rolCambiado && cambiosRol >= LIMIT_ROL) {
        alert('Has alcanzado el límite de cambios de rol.');
        return;
    }
    if (semestreCambiado && cambiosSemestre >= LIMIT_SEMESTRE) {
        alert('Has alcanzado el límite de cambios de semestre.');
        return;
    }

    // Si es el primer cambio de algo, pedir confirmación
    if ((rolCambiado && cambiosRol === 0) || (semestreCambiado && cambiosSemestre === 0)) {
        const tipo = rolCambiado ? 'Rol' : 'Semestre';
        const limite = rolCambiado ? LIMIT_ROL : LIMIT_SEMESTRE;
        
        mostrarModalConfirmacion(
            '¡Atención!',
            `Si cambias tu ${tipo}, solo tendrás ${limite} probabilidades de cambiarlo. ¿Deseas continuar?`,
            () => ejecutarActualizacion(user, perfil, nuevoNombre, nuevoRol, nuevoSemestre, rolCambiado, semestreCambiado)
        );
        return;
    }

    ejecutarActualizacion(user, perfil, nuevoNombre, nuevoRol, nuevoSemestre, rolCambiado, semestreCambiado);
}

function ejecutarActualizacion(user, perfil, nuevoNombre, nuevoRol, nuevoSemestre, rolCambiado, semestreCambiado) {
    const userId = user.id;
    const perfilKey = `perfil_${userId}`;

    perfil.nombre = nuevoNombre;
    perfil.rol = nuevoRol;
    if (nuevoSemestre) perfil.semestre = nuevoSemestre;

    if (rolCambiado) {
        const c = parseInt(localStorage.getItem(`cambios_rol_${userId}`) || '0', 10);
        localStorage.setItem(`cambios_rol_${userId}`, c + 1);
    }
    if (semestreCambiado) {
        const c = parseInt(localStorage.getItem(`cambios_semestre_${userId}`) || '0', 10);
        localStorage.setItem(`cambios_semestre_${userId}`, c + 1);
    }

    localStorage.setItem(perfilKey, JSON.stringify(perfil));

    user.nombre = nuevoNombre;
    user.rol = nuevoRol;
    if (nuevoSemestre) user.semestre = nuevoSemestre;
    localStorage.setItem('user', JSON.stringify(user));

    cargarDatosPerfil(user);

    const msg = document.getElementById('perfil-guardado-msg');
    if (msg) {
        msg.classList.remove('hidden');
        setTimeout(() => msg.classList.add('hidden'), 3000);
    }
    
    const modalConfirm = document.getElementById('modalConfirmacion');
    if (modalConfirm) modalConfirm.classList.add('hidden');
}

export function mostrarModalConfirmacion(titulo, mensaje, onConfirm) {
    const modal = document.getElementById('modalConfirmacion');
    const titleEl = document.getElementById('confirm-title');
    const msgEl = document.getElementById('confirm-msg');
    const btn = document.getElementById('confirm-accept-btn');

    if (modal && titleEl && msgEl && btn) {
        titleEl.textContent = titulo;
        msgEl.textContent = mensaje;
        
        // Clonar botón para limpiar listeners viejos
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        
        newBtn.onclick = onConfirm;
        modal.classList.remove('hidden');
    }
}

export function verificarCambioAutomatico() {
    const userRaw = localStorage.getItem('user');
    if (!userRaw) return;
    const user = JSON.parse(userRaw);
    if (!user.id || user.rol !== 'estudiante') return;

    const hoy = new Date();
    const mes = hoy.getMonth(); // 0-11 (Jan=0, Jul=6)
    const anio = hoy.getFullYear();
    
    // Periodos: "Enero" (mes 0) y "Julio" (mes 6)
    if (mes !== 0 && mes !== 6) return;

    const periodoKey = `${anio}-${mes}`;
    const ultimoUpdate = localStorage.getItem(`ultimo_auto_update_${user.id}`);

    if (ultimoUpdate === periodoKey) return; // Ya se hizo este periodo

    // Incrementar semestre
    const perfilKey = `perfil_${user.id}`;
    const perfilRaw = localStorage.getItem(perfilKey);
    const perfil = perfilRaw ? JSON.parse(perfilRaw) : user;

    let semestreActual = parseInt(perfil.semestre || '1', 10);
    if (semestreActual < 6) {
        semestreActual++;
        perfil.semestre = semestreActual.toString();
        user.semestre = perfil.semestre;

        localStorage.setItem(perfilKey, JSON.stringify(perfil));
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem(`ultimo_auto_update_${user.id}`, periodoKey);

        console.log(`🚀 Semestre actualizado automáticamente a ${semestreActual}°`);
        cargarDatosPerfil(user);
        
        // Opcional: Notificación visual
        alert(`¡Felicidades! Has pasado al ${semestreActual}° semestre.`);
    }
}

export function cambiarFotoPerfil(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
        alert('La imagen es demasiado grande. Máximo 3MB.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const base64 = e.target.result;

        const preview = document.getElementById('profilePhotoPreview');
        if (preview) preview.style.backgroundImage = `url('${base64}')`;

        const headerPhoto = document.getElementById('header-user-photo');
        if (headerPhoto) headerPhoto.style.backgroundImage = `url('${base64}')`;

        const userRaw = localStorage.getItem('user');
        if (userRaw) {
            const user = JSON.parse(userRaw);
            if (user.id) localStorage.setItem(`foto_perfil_${user.id}`, base64);
        }
    };
    reader.readAsDataURL(file);
}

// Ensure the profile functions are available globally if buttons call them via inline onclick
window.actualizarPerfil = actualizarPerfil;
window.cambiarFotoPerfil = cambiarFotoPerfil;
window.verificarCambioAutomatico = verificarCambioAutomatico;
