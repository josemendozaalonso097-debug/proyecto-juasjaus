import { enviarPapeleria } from '../api/papeleria.js';

let archivosSubidos = [];

export function inicializarPapeleria() {
    const papeBtn = document.getElementById('pape-btn');
    if (papeBtn) {
        papeBtn.addEventListener('click', abrirModalPapeleria);
    }

    const tipoDoc = document.getElementById('tipoDocumento');
    if (tipoDoc) {
        tipoDoc.addEventListener('change', mostrarCampoOtro);
    }

    const uploadZone = document.getElementById('uploadZone');
    const archivosInput = document.getElementById('archivosInput');
    
    if (uploadZone && archivosInput) {
        uploadZone.addEventListener('click', () => archivosInput.click());
        
        uploadZone.addEventListener('dragover', function(e) {
            e.preventDefault();
            e.stopPropagation();
            this.classList.add('dragover');
        });
        
        uploadZone.addEventListener('dragleave', function(e) {
            e.preventDefault();
            e.stopPropagation();
            this.classList.remove('dragover');
        });
        
        uploadZone.addEventListener('drop', function(e) {
            e.preventDefault();
            e.stopPropagation();
            this.classList.remove('dragover');
            agregarArchivos(e.dataTransfer.files);
        });
        
        archivosInput.addEventListener('change', (e) => agregarArchivos(e.target.files));
    }

    const formPapeleria = document.getElementById('formPapeleria');
    if (formPapeleria) {
        formPapeleria.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            if (archivosSubidos.length === 0) {
                alert('Debes subir al menos un archivo.');
                return;
            }
            
            const datos = {
                alumno: {
                    nombre: document.getElementById('nombreAlumno').value,
                    matricula: document.getElementById('matriculaAlumno').value,
                    gradoGrupo: document.getElementById('gradoGrupo').value,
                    telefono: document.getElementById('telefonoAlumno').value
                },
                padre: {
                    nombre: document.getElementById('nombrePadre').value,
                    telefono: document.getElementById('telefonoPadre').value,
                    email: document.getElementById('emailPadre').value,
                    parentesco: document.getElementById('parentesco').value
                },
                tipoDocumento: document.getElementById('tipoDocumento').value,
                otroDocumento: document.getElementById('otroDocumento').value,
                observaciones: document.getElementById('observaciones').value,
                archivos: archivosSubidos.map(f => f.name),
                fecha: new Date().toLocaleString()
            };
            
            const btn = formPapeleria.querySelector('button[type="submit"]');
            const ogText = btn.textContent;
            btn.textContent = 'Enviando...';
            btn.disabled = true;

            await enviarPapeleria(datos);
            mostrarConfirmacionPapeleria(datos);
            
            btn.textContent = ogText;
            btn.disabled = false;
        });
    }

    window.addEventListener('click', function(event) {
        const modalPapeleria = document.getElementById('modalPapeleria');
        if (event.target === modalPapeleria) cerrarModalPapeleria();
    });

    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            const modalPapeleria = document.getElementById('modalPapeleria');
            if (modalPapeleria && modalPapeleria.style.display === 'flex') cerrarModalPapeleria();
        }
    });
}

function abrirModalPapeleria() {
    const modalPapeleria = document.getElementById('modalPapeleria');
    if (modalPapeleria) {
        modalPapeleria.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        const userName = document.getElementById('user-name')?.textContent;
        const userMatricula = document.getElementById('user-matricula')?.textContent;
        
        if (userName && userName !== 'Usuario') {
            const na = document.getElementById('nombreAlumno');
            if(na) na.value = userName;
        }
        if (userMatricula) {
            const ma = document.getElementById('matriculaAlumno');
            if(ma) ma.value = userMatricula;
        }
    }
}

function cerrarModalPapeleria() {
    const modalPapeleria = document.getElementById('modalPapeleria');
    if (modalPapeleria) {
        modalPapeleria.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
    const form = document.getElementById('formPapeleria');
    if (form) form.reset();
    archivosSubidos = [];
    actualizarListaArchivos();
}

function mostrarCampoOtro() {
    const tipoDocumento = document.getElementById('tipoDocumento')?.value;
    const campoOtro = document.getElementById('campoOtro');
    const inputOtro = document.getElementById('otroDocumento');
    
    if (campoOtro && inputOtro) {
        if (tipoDocumento === 'Otro') {
            campoOtro.style.display = 'block';
            inputOtro.required = true;
        } else {
            campoOtro.style.display = 'none';
            inputOtro.required = false;
        }
    }
}

function agregarArchivos(files) {
    if (archivosSubidos.length >= 10) {
        alert('Ya has alcanzado el máximo de 10 archivos.');
        return;
    }
    
    Array.from(files).forEach(file => {
        if (archivosSubidos.length >= 10) return;
        if (file.size > 5 * 1024 * 1024) {
            alert(`El archivo "${file.name}" es demasiado grande. Máximo 5MB.`);
            return;
        }
        const tiposPermitidos = [
            'image/png', 'image/jpeg', 'image/jpg', 'application/pdf',
            'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        if (!tiposPermitidos.includes(file.type)) {
            alert(`El archivo "${file.name}" no tiene un formato permitido.`);
            return;
        }
        archivosSubidos.push(file);
    });
    actualizarListaArchivos();
}

function actualizarListaArchivos() {
    const archivosLista = document.getElementById('archivosLista');
    const contador = document.getElementById('contadorArchivos');
    
    if (!archivosLista || !contador) return;
    contador.textContent = `${archivosSubidos.length} / 10 archivos`;
    archivosLista.innerHTML = '';
    
    archivosSubidos.forEach((file, index) => {
        const doc = document.createElement('div');
        doc.className = 'archivo-item';
        
        let icono = '📎';
        if (file.type.includes('image')) icono = '🖼️';
        if (file.type.includes('pdf')) icono = '📄';
        if (file.type.includes('word') || file.type.includes('document')) icono = '📝';
        
        let tamano = file.size + ' B';
        if (file.size >= 1024 * 1024) tamano = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
        else if (file.size >= 1024) tamano = (file.size / 1024).toFixed(2) + ' KB';
        
        doc.innerHTML = `
            <div class="archivo-info">
                <div class="archivo-icon">${icono}</div>
                <div class="archivo-detalles">
                    <div class="archivo-nombre">${file.name}</div>
                    <div class="archivo-tamano">${tamano}</div>
                </div>
            </div>
            <button type="button" class="btn-eliminar-archivo" data-index="${index}">✕ Eliminar</button>
        `;
        archivosLista.appendChild(doc);
    });

    document.querySelectorAll('.btn-eliminar-archivo').forEach(btn => {
        btn.addEventListener('click', function() {
            eliminarArchivo(this.getAttribute('data-index'));
        });
    });
}

function eliminarArchivo(index) {
    archivosSubidos.splice(index, 1);
    actualizarListaArchivos();
}

function mostrarConfirmacionPapeleria(datos) {
    const confirmacion = document.createElement('div');
    confirmacion.style.cssText = `
        position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
        background: white; padding: 40px; border-radius: 20px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3); z-index: 10001;
        text-align: center; max-width: 450px; border: 3px solid #27ae60;
    `;
    confirmacion.innerHTML = `
        <div style="font-size: 4em; margin-bottom: 20px;">✅</div>
        <h2 style="color: #27ae60; margin-bottom: 15px; font-size: 1.5em;">¡Documentos enviados!</h2>
        <p style="color: #666; margin-bottom: 15px; line-height: 1.6;">
            Tu papelería ha sido recibida exitosamente.<br>
            <strong>Tipo:</strong> ${datos.tipoDocumento}<br>
            <strong>Archivos:</strong> ${datos.archivos.length}<br><br>
            <strong>Estado: Pendiente de revisión</strong>
        </p>
        <button class="cerrar-conf-btn" style="
            background: #27ae60; color: white; border: none;
            padding: 12px 30px; border-radius: 10px; font-weight: 600; cursor: pointer;
        ">Entendido</button>
    `;
    document.body.appendChild(confirmacion);
    
    confirmacion.querySelector('.cerrar-conf-btn').addEventListener('click', function() {
        confirmacion.remove();
        document.body.style.overflow = 'auto';
    });
    
    cerrarModalPapeleria();
}

window.abrirModalPapeleria = abrirModalPapeleria;
window.cerrarModalPapeleria = cerrarModalPapeleria;
