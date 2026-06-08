import React from 'react';

const sectionsData = {
  nuevoIngreso: {
    titulo: "Nuevo Ingreso",
    contenido: (
      <div className="space-y-6 text-slate-700 dark:text-slate-300">
        <div className="detalle-section">
          <h3 className="font-bold text-lg text-primary mb-2">📋 Documentos Requeridos</h3>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>Acta de nacimiento original y 2 copias</li>
            <li>CURP actualizado 2 copias</li>
            <li>8 fotografías tamaño infantil blanco y negro papel mate</li>
            <li>Comprobante de domicilio reciente original y 2 copias</li>
            <li>Credencial de elector de los padres a ambos lados 2 copias</li>
            <li>Certificado médico con tipo de sangre, original y 2 copias</li>
            <li>Certificado de secundaria original y 2 copias</li>
            <li>
              Credencial del servicio médico 2 copias
              <p className="text-xs text-slate-500 mt-0.5">(si no tiene, entonces, 2 copias de la hoja de asignación de número social)</p>
            </li>
          </ul>
        </div>
        <div className="detalle-section">
          <h3 className="font-bold text-lg text-primary mb-2">💳 Costos de Inscripción</h3>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>Inscripción: $3,000.00 MXN</li>
            <li>Credencial: $100.00 MXN</li>
          </ul>
        </div>
        <div className="detalle-section">
          <h3 className="font-bold text-lg text-primary mb-2">📅 Fechas Importantes</h3>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>Preinscripción: 15 de Febrero - 15 de Marzo</li>
            <li>Publicación de resultados: 1 de Abril</li>
            <li>Inscripción: 15 de Abril - 30 de Abril</li>
            <li>Inicio de clases: 15 de Agosto</li>
          </ul>
        </div>
      </div>
    )
  },
  becas: {
    titulo: "Becas y Apoyos",
    contenido: (
      <div className="space-y-6 text-slate-700 dark:text-slate-300">
        <div className="detalle-section">
          <h3 className="font-bold text-lg text-primary mb-2">🎓 Becarios de la transformación</h3>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>Requisito: Promedio mínimo de 9.0</li>
            <li>Beneficio: 50% de descuento en colegiatura</li>
            <li>Duración: Todo el ciclo escolar</li>
            <li>Renovable cada semestre</li>
          </ul>
        </div>
        <div className="detalle-section">
          <h3 className="font-bold text-lg text-primary mb-2">💰 Beca Universal "Benito Juárez"</h3>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>Requisito: Situación económica comprobada</li>
            <li>Beneficio: $1,900.00 MXN mensuales</li>
            <li>Solicitud: Departamento de Becas</li>
          </ul>
        </div>
        <div className="detalle-section">
          <h3 className="font-bold text-lg text-primary mb-2">🏆 Beca Deportiva/Cultural</h3>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>Requisito: Participación activa en equipos</li>
            <li>Beneficio: 30% de descuento</li>
            <li>Aplica para: Deportes y actividades culturales</li>
            <li>Renovación por desempeño</li>
          </ul>
        </div>
        <div className="detalle-section">
          <h3 className="font-bold text-lg text-primary mb-2">👨‍👩‍👧‍👦 Beca fundación: Martínez Sada</h3>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>2 hermanos: 15% de descuento c/u</li>
            <li>3 o más hermanos: 20% de descuento c/u</li>
            <li>Aplica automáticamente</li>
          </ul>
        </div>
      </div>
    )
  },
  contacto: {
    titulo: "Contacto",
    contenido: (
      <div className="space-y-4 text-slate-700 dark:text-slate-300">
        <div className="flex gap-3 items-start p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
          <span className="text-2xl">📞</span>
          <div>
            <h4 className="font-bold text-sm text-slate-800 dark:text-white">Control Escolar</h4>
            <p className="text-sm">+52 (81) 8397 1666</p>
          </div>
        </div>
        <div className="flex gap-3 items-start p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
          <span className="text-2xl">📧</span>
          <div>
            <h4 className="font-bold text-sm text-slate-800 dark:text-white">Correo Electrónico</h4>
            <p className="text-sm">cbtis258.dir@dgeti.sems.gob.mx</p>
          </div>
        </div>
        <div className="flex gap-3 items-start p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
          <span className="text-2xl">🕐</span>
          <div>
            <h4 className="font-bold text-sm text-slate-800 dark:text-white">Horario de Atención</h4>
            <p className="text-sm">Lunes a Viernes: 8:00 AM - 2:00 PM y Jueves: 8:00 AM - 6:00 PM</p>
          </div>
        </div>
        <div className="flex gap-3 items-start p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
          <span className="text-2xl">📍</span>
          <div>
            <h4 className="font-bold text-sm text-slate-800 dark:text-white">Dirección</h4>
            <p className="text-sm">Calle Doctor Plinio D. Ordóñez. #801, Col. Hacienda del Topo, Ciudad General Escobedo, Nuevo León.</p>
          </div>
        </div>
      </div>
    )
  },
  faq: {
    titulo: "Preguntas Frecuentes",
    contenido: (
      <div className="space-y-4 text-slate-700 dark:text-slate-300">
        <div className="faq-item p-3 border-b border-slate-100 dark:border-slate-800">
          <div className="faq-pregunta font-bold text-sm text-slate-800 dark:text-white">¿Cuándo puedo solicitar una beca?</div>
          <div className="faq-respuesta text-sm text-slate-500 dark:text-slate-400 mt-1">Las solicitudes de beca se abren al inicio de cada semestre. Para alumnos de nuevo ingreso, pueden solicitarla desde el proceso de inscripción.</div>
        </div>
        <div className="faq-item p-3 border-b border-slate-100 dark:border-slate-800">
          <div className="faq-pregunta font-bold text-sm text-slate-800 dark:text-white">¿Cómo puedo pagar mi colegiatura?</div>
          <div className="faq-respuesta text-sm text-slate-500 dark:text-slate-400 mt-1">Puedes pagar en efectivo en escolares en la institución, transferencia bancaria, o mediante esta plataforma con tarjeta de débito/crédito.</div>
        </div>
        <div className="faq-item p-3 border-b border-slate-100 dark:border-slate-800">
          <div className="faq-pregunta font-bold text-sm text-slate-800 dark:text-white">¿Qué pasa si no pago a tiempo?</div>
          <div className="faq-respuesta text-sm text-slate-500 dark:text-slate-400 mt-1">Aun puedes asistir a clases y formar parte de todas las actividades, sin embargo se irán acumulando conforme a los pagos incumplidos.</div>
        </div>
        <div className="faq-item p-3 border-b border-slate-100 dark:border-slate-800">
          <div className="faq-pregunta font-bold text-sm text-slate-800 dark:text-white">¿Puedo obtener más de una beca?</div>
          <div className="faq-respuesta text-sm text-slate-500 dark:text-slate-400 mt-1">Sí, puedes tener más de una beca, sin embargo, algunas pueden venir con limitantes.</div>
        </div>
        <div className="faq-item p-3 border-b border-slate-100 dark:border-slate-800">
          <div className="faq-pregunta font-bold text-sm text-slate-800 dark:text-white">¿Cómo obtengo mi constancia o kardex de estudios?</div>
          <div className="faq-respuesta text-sm text-slate-500 dark:text-slate-400 mt-1">Solicítalos en Escolares con 3 días de anticipación. El costo de la constancia es de $50 MXN y el precio del kardex es de $30 MXN.</div>
        </div>
        <div className="faq-item p-3 border-b border-slate-100 dark:border-slate-800">
          <div className="faq-pregunta font-bold text-sm text-slate-800 dark:text-white">¿Ofrecen planes de pago?</div>
          <div className="faq-respuesta text-sm text-slate-500 dark:text-slate-400 mt-1">Sí, ofrecemos planes de pago a 3, 6 y 12 meses sin intereses. Acude a Servicios Financieros para más información.</div>
        </div>
        <div className="faq-item p-3">
          <div className="faq-pregunta font-bold text-sm text-slate-800 dark:text-white">¿Dónde descargo mis facturas?</div>
          <div className="faq-respuesta text-sm text-slate-500 dark:text-slate-400 mt-1">En esta plataforma, ve a "Historial de Pagos" y presiona el botón "Descargar Facturas". También puedes solicitarlas por correo a finanzas@cbtis258.edu.mx</div>
        </div>
      </div>
    )
  }
};

export default function ModalDetalle({ isOpen, onClose, section }) {
  if (!isOpen || !section) return null;

  const data = sectionsData[section];
  if (!data) return null;

  return (
    <div className="modal-detalle fixed inset-0 z-[1001] flex items-center justify-center bg-black/60 backdrop-blur-sm" id="modalDetalle">
      <div className="modal-detalle-content dark:bg-slate-900 dark:text-slate-100 relative w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col mx-4 max-h-[90vh]">
        <header className="bg-gradient-to-r from-primary to-red-800 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <img src="/imgs/yameharte.png" alt="CBTis 258" className="h-9 w-auto object-contain" />
            <div>
              <h2 className="text-white text-lg font-black leading-tight">CBTis 258</h2>
              <p id="detalleTitle" className="text-white/80 text-[11px] font-semibold uppercase tracking-widest">{data.titulo}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <span className="material-symbols-outlined text-white">close</span>
          </button>
        </header>

        <div className="detalle-contenido overflow-y-auto flex-1 p-6">
          {data.contenido}
        </div>
      </div>
    </div>
  );
}
