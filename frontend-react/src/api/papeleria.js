import { crearSolicitud } from './solicitudes';

export async function enviarPapeleria(datos) {
    return crearSolicitud({
        tipo: 'papeleria',
        titulo: datos.tipoDocumento === 'Otro' ? datos.otroDocumento : datos.tipoDocumento,
        detalle: [
            `Alumno: ${datos.alumno?.nombre || '—'}`,
            `Matrícula: ${datos.alumno?.matricula || '—'}`,
            `Grado y grupo: ${datos.alumno?.gradoGrupo || '—'}`,
            datos.observaciones ? `Observaciones: ${datos.observaciones}` : '',
        ].filter(Boolean).join('\n'),
        archivos: datos.archivos || [],
    });
}
