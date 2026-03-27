export function cargarDatosPerfil(user) {
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
    if (inputNombre) inputNombre.value = nombre;
    if (inputSemestre && semestre) inputSemestre.value = semestre;

    // Actualizar nombre en el header
    const navName = document.getElementById('user-name-nav');
    if (navName) navName.textContent = nombre;

    const userNameEl = document.getElementById('user-name');
    if (userNameEl) userNameEl.textContent = nombre;

    if (userId) {
        const foto = localStorage.getItem(`foto_perfil_${userId}`);
        const DEFAULT_PHOTO = "https://lh3.googleusercontent.com/aida-public/AB6AXuDEQm0NeyozARQi9aBza43r16ZH_WPKEO3mRI2BvTcbKusRr55Irby19Z-_NuAIQCDgfpfzI00rr22gshKFT5RtRDRSNijam8EniCt4_gghz-Sj8qjN3HsbZmzLUslSveULtwhuHnnskV3qMU-rW5RftSQ18Gif6gQqRI23w4qqvvas_1GbHuR-SdXxNixDtg5E4yiG2YDIV0dEUIy90mzYUjwk5MtSqGqYKmL74aTzPniYHyDxtC09Uo9FvVrzlnVtrlv-ZWmR4QQ";
        const fotoUrl = foto || DEFAULT_PHOTO;

        const preview = document.getElementById('profilePhotoPreview');
        if (preview) preview.style.backgroundImage = `url('${fotoUrl}')`;

        const headerPhoto = document.getElementById('header-user-photo');
        if (headerPhoto) headerPhoto.style.backgroundImage = `url('${fotoUrl}')`;
    }
}

export function actualizarPerfil() {
    const userRaw = localStorage.getItem('user');
    if (!userRaw) return;
    const user = JSON.parse(userRaw);
    const userId = user.id;

    const inputNombre   = document.getElementById('input-perfil-nombre');
    const inputSemestre = document.getElementById('input-perfil-semestre');
    const msg = document.getElementById('perfil-guardado-msg');

    const nuevoNombre   = inputNombre   ? inputNombre.value.trim() : '';
    const nuevoSemestre = inputSemestre ? inputSemestre.value      : '';

    if (!nuevoNombre) { alert('El nombre no puede estar vacío.'); return; }

    const perfilKey = `perfil_${userId}`;
    const perfilRaw = localStorage.getItem(perfilKey);
    const perfil = perfilRaw ? JSON.parse(perfilRaw) : { ...user };

    perfil.nombre = nuevoNombre;
    if (nuevoSemestre) perfil.semestre = nuevoSemestre;

    localStorage.setItem(perfilKey, JSON.stringify(perfil));

    user.nombre = nuevoNombre;
    if (nuevoSemestre) user.semestre = nuevoSemestre;
    localStorage.setItem('user', JSON.stringify(user));

    cargarDatosPerfil(user);

    if (msg) {
        msg.classList.remove('hidden');
        setTimeout(() => msg.classList.add('hidden'), 3000);
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
