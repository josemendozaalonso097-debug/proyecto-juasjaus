import React, { useState, useEffect } from 'react';

const INFORMACION_DATA = {
  nuevoIngreso: {
    titulo: "Nuevo Ingreso",
    contenido: (
      <div className="space-y-6">
        <div className="detalle-section">
          <h3 className="font-bold text-slate-800 dark:text-white border-b border-primary/10 pb-1 mb-2">📋 Documentos Requeridos</h3>
          <ul className="list-disc pl-5 text-sm text-slate-600 dark:text-slate-300 space-y-1">
            <li>Acta de nacimiento original y 2 copias</li>
            <li>CURP actualizado 2 copias</li>
            <li>8 fotografías tamaño infantil blanco y negro papel mate</li>
            <li>Comprobante de domicilio reciente original y 2 copias</li>
            <li>Credencial de elector de los padres a ambos lados 2 copias</li>
            <li>Certificado médico con tipo de sangre, original y 2 copias</li>
            <li>Certificado de secundaria original y 2 copias</li>
            <li>Credencial del servicio médico 2 copias <p className="text-xs text-slate-500 italic mt-0.5">(si no tiene, entonces, 2 copias de la hoja de asignación de número social)</p></li>
          </ul>
        </div>
        <div className="detalle-section">
          <h3 className="font-bold text-slate-800 dark:text-white border-b border-primary/10 pb-1 mb-2">💳 Costos de Inscripción</h3>
          <ul className="list-disc pl-5 text-sm text-slate-600 dark:text-slate-300 space-y-1">
            <li>Inscripción: $3,000.00 MXN</li>
            <li>Credencial: $100.00 MXN</li>
          </ul>
        </div>
        <div className="detalle-section">
          <h3 className="font-bold text-slate-800 dark:text-white border-b border-primary/10 pb-1 mb-2">📅 Fechas Importantes</h3>
          <ul className="list-disc pl-5 text-sm text-slate-600 dark:text-slate-300 space-y-1">
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
      <div className="space-y-6">
        <div className="detalle-section">
          <h3 className="font-bold text-slate-800 dark:text-white border-b border-primary/10 pb-1 mb-2">🎓 Becarios de la transformación</h3>
          <ul className="list-disc pl-5 text-sm text-slate-600 dark:text-slate-300 space-y-1">
            <li>Requisito: Promedio mínimo de 9.0</li>
            <li>Beneficio: 50% de descuento en colegiatura</li>
            <li>Duración: Todo el ciclo escolar</li>
            <li>Renovable cada semestre</li>
          </ul>
        </div>
        <div className="detalle-section">
          <h3 className="font-bold text-slate-800 dark:text-white border-b border-primary/10 pb-1 mb-2">💰 Beca Universal "Benito Juárez"</h3>
          <ul className="list-disc pl-5 text-sm text-slate-600 dark:text-slate-300 space-y-1">
            <li>Requisito: Situación económica comprobada</li>
            <li>Beneficio: $1,900.00 MXN mensuales</li>
            <li>Solicitud: Departamento de Becas</li>
          </ul>
        </div>
        <div className="detalle-section">
          <h3 className="font-bold text-slate-800 dark:text-white border-b border-primary/10 pb-1 mb-2">🏆 Beca Deportiva/Cultural</h3>
          <ul className="list-disc pl-5 text-sm text-slate-600 dark:text-slate-300 space-y-1">
            <li>Requisito: Participación activa en equipos</li>
            <li>Beneficio: 30% de descuento</li>
            <li>Aplica para: Deportes y actividades culturales</li>
            <li>Renovación por desempeño</li>
          </ul>
        </div>
        <div className="detalle-section">
          <h3 className="font-bold text-slate-800 dark:text-white border-b border-primary/10 pb-1 mb-2">👨‍👩‍👧‍👦 Beca fundación: Martínez Sada</h3>
          <ul className="list-disc pl-5 text-sm text-slate-600 dark:text-slate-300 space-y-1">
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
      <div className="space-y-6">
        <div className="detalle-section space-y-4">
          <div className="flex items-center gap-3">
            <div className="text-2xl">📞</div>
            <div>
              <h4 className="font-bold text-slate-800 dark:text-white text-sm">Control Escolar</h4>
              <p className="text-sm text-slate-600 dark:text-slate-300">+52 (81) 8397 1666</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-2xl">📧</div>
            <div>
              <h4 className="font-bold text-slate-800 dark:text-white text-sm">Correo Electrónico</h4>
              <p className="text-sm text-slate-600 dark:text-slate-300">cbtis258.dir@dgeti.sems.gob.mx</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-2xl">🕐</div>
            <div>
              <h4 className="font-bold text-slate-800 dark:text-white text-sm">Horario de Atención</h4>
              <p className="text-sm text-slate-600 dark:text-slate-300">Lunes a Viernes: 8:00 AM - 2:00 PM y Jueves: 8:00 AM - 6:00 PM</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-2xl">📍</div>
            <div>
              <h4 className="font-bold text-slate-800 dark:text-white text-sm">Dirección</h4>
              <p className="text-sm text-slate-600 dark:text-slate-300">Calle Doctor Plinio D. Ordóñez. #801, Col. Hacienda del Topo, Ciudad General Escobedo, Nuevo León.</p>
            </div>
          </div>
        </div>
      </div>
    )
  },
  faq: {
    titulo: "Preguntas Frecuentes",
    contenido: (
      <div className="space-y-4">
        {[
          { q: "¿Cuándo puedo solicitar una beca?", a: "Las solicitudes de beca se abren al inicio de cada semestre. Para alumnos de nuevo ingreso, pueden solicitarla desde el proceso de inscripción." },
          { q: "¿Cómo puedo pagar mi colegiatura?", a: "Puedes pagar en efectivo en escolares en la institución, transferencia bancaria, o mediante esta plataforma con tarjeta de débito/crédito." },
          { q: "¿Qué pasa si no pago a tiempo?", a: "Aún puedes asistir a clases y formar parte de todas las actividades, sin embargo se irán acumulando conforme a los pagos incumplidos." },
          { q: "¿Puedo obtener más de una beca?", a: "Sí, puedes tener más de una beca, sin embargo, algunas pueden venir con limitantes." },
          { q: "¿Cómo obtengo mi constancia o kardex de estudios?", a: "Solicítalos en Escolares con 3 días de anticipación. El costo de la constancia es de $50 MXN y el precio del kardex es de $30 MXN." },
          { q: "¿Ofrecen planes de pago?", a: "Sí, ofrecemos planes de pago a 3, 6 y 12 meses sin intereses. Acude a Servicios Financieros para más información." },
          { q: "¿Dónde descargo mis facturas?", a: "En esta plataforma, ve a 'Historial de Pagos' y presiona el botón 'Ver Facturas'. También puedes solicitarlas por correo a finanzas@cbtis258.edu.mx" }
        ].map((item, i) => (
          <div key={i} className="faq-item border-b border-slate-100 dark:border-slate-800 pb-3 last:border-b-0">
            <div className="faq-pregunta font-bold text-sm text-slate-850 dark:text-slate-100 mb-1">{item.q}</div>
            <div className="faq-respuesta text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{item.a}</div>
          </div>
        ))}
      </div>
    )
  }
};

export default function InformacionModal({ isOpen, onClose }) {
  const [activeSection, setActiveSection] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        if (activeSection) {
          setActiveSection(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, activeSection]);

  if (!isOpen) return null;

  return (
    <>
      {/* Main Info Menu Modal */}
      {!activeSection ? (
        <div 
          className="fixed inset-0 z-[1001] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          id="modalInformacion"
          onClick={(e) => { if (e.target.id === 'modalInformacion') onClose(); }}
        >
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-primary/10 flex flex-col">
            <header className="bg-gradient-to-r from-primary to-red-800 px-6 py-4 flex items-center justify-between shrink-0 text-white">
              <div className="flex items-center gap-3">
                <img src="/imgs/yameharte.png" alt="CBTis 258" className="h-9 w-auto object-contain" />
                <div>
                  <h2 className="text-white text-lg font-black leading-tight">CBTis 258</h2>
                  <p className="text-white/80 text-[11px] font-semibold uppercase tracking-widest">Información General</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors cursor-pointer text-white">
                <span className="material-symbols-outlined">close</span>
              </button>
            </header>

            <div className="p-6 space-y-4">
              {[
                { key: 'nuevoIngreso', label: 'Nuevo Ingreso', desc: 'Requisitos, costos y calendario', icon: 'app_registration', color: 'bg-orange-500' },
                { key: 'becas', label: 'Becas y Apoyos', desc: 'Apoyos federales e internos', icon: 'school', color: 'bg-teal-500' },
                { key: 'contacto', label: 'Contacto', desc: 'Canales oficiales de atención', icon: 'contact_phone', color: 'bg-blue-500' },
                { key: 'faq', label: 'Preguntas Frecuentes', desc: 'Respuestas a dudas comunes', icon: 'quiz', color: 'bg-purple-500' }
              ].map((sec) => (
                <button
                  key={sec.key}
                  onClick={() => setActiveSection(sec.key)}
                  className="w-full flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 text-left transition-all cursor-pointer group"
                >
                  <div className={`p-3 rounded-lg text-white ${sec.color} group-hover:scale-105 transition-transform`}>
                    <span className="material-symbols-outlined text-white block">{sec.icon}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">{sec.label}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{sec.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Section Details Overlay Modal */
        <div 
          className="fixed inset-0 z-[1001] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          id="modalDetalle"
          onClick={(e) => { if (e.target.id === 'modalDetalle') setActiveSection(null); }}
        >
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-primary/10 flex flex-col max-h-[90vh]">
            <header className="bg-gradient-to-r from-primary to-red-800 px-6 py-4 flex items-center justify-between shrink-0 text-white">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setActiveSection(null)} 
                  className="p-1 hover:bg-white/20 rounded-lg transition-colors cursor-pointer text-white mr-1"
                >
                  <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h2 className="text-white text-lg font-black leading-tight" id="detalleTitle">
                  {INFORMACION_DATA[activeSection]?.titulo}
                </h2>
              </div>
              <button 
                onClick={() => { setActiveSection(null); onClose(); }} 
                className="p-2 hover:bg-white/20 rounded-full transition-colors cursor-pointer text-white"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </header>

            <div className="p-6 overflow-y-auto" id="detalleContenido">
              {INFORMACION_DATA[activeSection]?.contenido}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
