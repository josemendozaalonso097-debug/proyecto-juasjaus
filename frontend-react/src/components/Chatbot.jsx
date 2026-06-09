import React, { useState, useEffect, useRef } from 'react';

const ICON_BASE = '/CobraIcon/';

const TREE = {
  label: '¿Sobre qué te ayudo?',
  icon: 'CobraBienvenida',
  opts: [
    {
      text: 'Pagos y colegiaturas',
      icon: 'CobraDinero',
      sub: {
        label: 'Pagos — elige tu duda:',
        icon: 'CobraDinero',
        opts: [
          {
            text: '¿Cuánto cuesta la colegiatura?',
            icon: 'CobraDinero',
            answer: 'La colegiatura mensual es de $3,000 MXN. Los períodos de cobro son en enero (1er semestre) y julio (2do semestre). Revisa tu estado de pagos en la pantalla principal.'
          },
          {
            text: '¿Cómo puedo pagar?',
            icon: 'CobraDinero',
            sub: {
              label: 'Elige tu método de pago:',
              icon: 'CobraDinero',
              opts: [
                {
                  text: 'Tarjeta de crédito/débito',
                  icon: 'CobraDinero',
                  answer: 'Ve a Tienda → agrega al carrito → Pagar ahora → Tarjeta. Aceptamos Visa, Mastercard y AMEX. El comprobante en PDF se descarga automáticamente.'
                },
                {
                  text: 'OXXO o transferencia SPEI',
                  icon: 'CobraDinero',
                  answer: 'Selecciona Depósito OXXO o Transferencia bancaria. Te mostramos los datos del CBTis 258. Sube tu comprobante y quedará en estado Pendiente hasta verificación (1–2 días).'
                },
                {
                  text: 'Efectivo en caja escolar',
                  icon: 'CobraDinero',
                  answer: 'Pasa a la caja con tu monto exacto de $3,000 MXN. Horario: lun–vie 8:00–14:00 h, jueves hasta 18:00 h.'
                }
              ]
            }
          },
          {
            text: 'Ver historial y descargar facturas',
            icon: 'CobraDinero',
            answer: 'En tu panel principal presiona Historial de Pagos. Verás todas tus compras con fecha, monto y estado. Desde ahí puedes descargar todas tus facturas en PDF.'
          }
        ]
      }
    },
    {
      text: 'Subir papelería escolar',
      icon: 'CobraPape',
      answer: 'Presiona Subir Papelería en tu panel (ícono naranja). Llena datos del alumno y del tutor, selecciona el tipo de trámite (inscripción, reinscripción, beca, etc.), arrastra tus archivos (PDF, JPG, PNG — máx 5 MB c/u, hasta 10 archivos) y presiona Enviar Documentos.'
    },
    {
      text: 'Orientación educativa',
      icon: 'CobraOrienta',
      sub: {
        label: 'Orientación — ¿qué necesitas?',
        icon: 'CobraOrienta',
        opts: [
          {
            text: 'Reportar un incidente',
            icon: 'CobraOrienta',
            answer: 'En el modal de Orientación, ve a la pestaña Reportes. Describe lo ocurrido con detalle y presiona Enviar Reporte. El área de Orientación Educativa revisará tu caso a la brevedad.'
          },
          {
            text: 'Presentar una queja formal',
            icon: 'CobraOrienta',
            answer: 'Ve a la pestaña Quejas. Selecciona el tipo (bullying, mal trato de trabajador, inconformidad académica, instalaciones, etc.), agrega detalles y presiona Enviar Queja.'
          },
          {
            text: 'Cita con psicólogo o buzón',
            icon: 'CobraOrienta',
            sub: {
              label: '¿Qué necesitas?',
              icon: 'CobraOrienta',
              opts: [
                {
                  text: 'Solicitar cita con psicólogo',
                  icon: 'CobraOrienta',
                  answer: 'Ve a la pestaña Citas. Escribe el motivo de la cita (tu información es 100% confidencial) y elige turno matutino (7–13 h) o vespertino (13–19 h). El psicólogo se pondrá en contacto contigo.'
                },
                {
                  text: 'Enviar sugerencia al buzón',
                  icon: 'CobraOrienta',
                  answer: 'Ve a la pestaña Buzón en el modal de Orientación. Escribe tu sugerencia para mejorar el plantel y presiona Enviar al Buzón. Tu comentario llega directo a la dirección.'
                },
                {
                  text: 'Becas y apoyos disponibles',
                  icon: 'CobraApoyo',
                  answer: 'Becas disponibles: Becarios de la Transformación (promedio ≥ 9.0, 50% descuento), Beca Benito Juárez ($1,900/mes), Beca Deportiva/Cultural (30% descuento), Beca Martínez Sada (15–20% para hermanos). Solicítalas en el Departamento de Becas.'
                }
              ]
            }
          }
        ]
      }
    },
    {
      text: 'Mi cuenta y perfil',
      icon: 'CobraDuda',
      sub: {
        label: 'Cuenta — ¿qué necesitas?',
        icon: 'CobraDuda',
        opts: [
          {
            text: 'Actualizar datos de perfil',
            icon: 'CobraDuda',
            answer: 'Presiona tu foto de perfil en el header. Puedes cambiar nombre (sin límite), rol (máx. 3 veces) y semestre (máx. 10 veces). También puedes subir una nueva foto de perfil (máx. 3 MB). Los intentos restantes se muestran junto a cada campo.'
          },
          {
            text: 'Navegar entre panel y tienda',
            icon: 'CobraDuda',
            answer: 'Desde el panel principal presiona Ingresar a Tienda. Desde la tienda, abre el menú lateral tocando el logo del CBTis 258 en el header y selecciona Ir al Tablero. Tu sesión se mantiene activa en ambas páginas.'
          },
          {
            text: 'Información y contacto',
            icon: 'CobraDuda',
            answer: 'Tel: +52 (81) 8397-1666 · Email: cbtis258.dir@dgeti.sems.gob.mx · Horario: lun–vie 8:00–14:00 h, jueves hasta 18:00 h · Dirección: Dr. Plinio D. Ordóñez #801, Col. Hacienda del Topo, Gral. Escobedo, N.L.'
          }
        ]
      }
    }
  ]
};

export default function Chatbot({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      text: 'Hola, soy <b>CobraBot</b>, el asistente virtual de Financieros 258. ¿En qué te puedo ayudar hoy?',
      time: getCurrentTime()
    }
  ]);
  const [current, setCurrent] = useState(TREE);
  const [stack, setStack] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [cobraIcon, setCobraIcon] = useState('CobraBienvenida');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  function getCurrentTime() {
    const d = new Date();
    return d.getHours() + ':' + String(d.getMinutes()).padStart(2, '0');
  }

  const handleOptionClick = (opt) => {
    // Add user bubble
    const userMsg = {
      id: Math.random().toString(),
      sender: 'user',
      text: opt.text,
      time: getCurrentTime()
    };
    setMessages(prev => [...prev, userMsg]);
    setCobraIcon(opt.icon || 'CobraDuda');
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);

      if (opt.answer) {
        // Direct answer
        const botMsg = {
          id: Math.random().toString(),
          sender: 'bot',
          text: opt.answer,
          time: getCurrentTime()
        };
        setMessages(prev => [...prev, botMsg]);

        // Add follow-up question after typing
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          const followUpMsg = {
            id: Math.random().toString(),
            sender: 'bot',
            text: '¿Hay algo más en lo que te pueda ayudar?',
            time: getCurrentTime()
          };
          setMessages(prev => [...prev, followUpMsg]);
          setCobraIcon('CobraDespedida');
          setStack([]);
          setCurrent(TREE);
        }, 700);
      } else if (opt.sub) {
        // Go deeper in the tree
        const botMsg = {
          id: Math.random().toString(),
          sender: 'bot',
          text: 'Claro, aquí tienes las opciones:',
          time: getCurrentTime()
        };
        setMessages(prev => [...prev, botMsg]);
        setStack(prev => [...prev, current]);
        setCurrent(opt.sub);
        setCobraIcon(opt.sub.icon || 'CobraDuda');
      }
    }, 900);
  };

  const handleBack = () => {
    if (stack.length > 0) {
      const newStack = [...stack];
      const previous = newStack.pop();
      setStack(newStack);
      setCurrent(previous);
      setCobraIcon(previous.icon || 'CobraBienvenida');
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        id="cb-overlay" 
        className="fixed inset-0 bg-black/35 z-[9998] block"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div 
        id="cb-panel" 
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] md:w-[420px] h-[86vh] md:h-[640px] max-h-[640px] bg-white dark:bg-slate-900 shadow-2xl rounded-2xl overflow-hidden flex flex-col z-[9999] opacity-100 pointer-events-all transition-all duration-300 md:bottom-auto md:right-auto md:rounded-2xl"
      >
        {/* Header */}
        <div id="cb-header" className="bg-[#C0392B] p-[12px_14px] flex items-center gap-[10px] shrink-0 text-white">
          <div id="cb-avatar" className="w-[52px] h-[52px] md:w-[64px] md:h-[64px] rounded-full bg-white/15 border-[3px] border-white/40 shrink-0 overflow-hidden flex items-center justify-center">
            <img 
              id="cb-cobra-img" 
              src={`${ICON_BASE}${cobraIcon}.png`} 
              alt="Cobra"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
              className="w-full h-full object-cover"
            />
            <span id="cb-cobra-fb" style={{ display: 'none' }} className="w-full h-full items-center justify-center">
              <svg viewBox="0 0 24 24" fill="white" width="20" height="20">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
              </svg>
            </span>
          </div>
          <div id="cb-header-info" className="flex-1 flex flex-col">
            <span id="cb-header-name" className="text-white text-[16px] md:text-[17px] font-bold leading-[1.3]">CobraBot </span>
            <span id="cb-header-status" className="text-white/85 text-[11px] md:text-[12.5px] flex items-center gap-[5px]">
              <span id="cb-status-dot" className="w-[7px] h-[7px] rounded-full bg-[#2ECC71] inline-block"></span>
              En línea
            </span>
          </div>
          <button onClick={onClose} id="cb-close" aria-label="Cerrar" className="bg-transparent border-none cursor-pointer p-[4px] rounded-full flex items-center justify-center hover:bg-white/20">
            <svg viewBox="0 0 24 24" fill="white" width="18" height="18">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>

        {/* Message Area */}
        <div id="cb-messages" className="flex-1 bg-[#ECE5DD] dark:bg-slate-900 overflow-y-auto p-[12px_10px_8px] flex flex-col gap-[6px] scroll-smooth">
          <div className="cb-date-div text-center m-[4px_0_6px]">
            <span className="bg-[#D4C9BF] dark:bg-slate-800 text-[#6B5D53] dark:text-slate-400 text-[10px] p-[2px_10px] rounded-[10px]">
              Hoy
            </span>
          </div>

          {messages.map((msg) => (
            <div key={msg.id} className={`cb-msg-row flex items-end gap-[6px] ${msg.sender === 'user' ? 'justify-end' : ''}`}>
              {msg.sender === 'bot' && (
                <div className="cb-msg-av w-[26px] h-[26px] rounded-full bg-[#C0392B] flex items-center justify-center shrink-0 overflow-hidden text-white">
                  <svg viewBox="0 0 24 24" fill="white" width="14" height="14">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
                  </svg>
                </div>
              )}
              <div className={`cb-bwrap flex flex-col max-w-[210px] md:max-w-[300px] ${msg.sender === 'user' ? 'items-end' : ''}`}>
                <div 
                  className={`cb-bubble p-[8px_11px] text-[12.5px] line-height-[1.5] word-break-break-word shadow-sm ${msg.sender === 'user' ? 'bg-[#DCF8C6] dark:bg-[#C0392B] dark:text-white rounded-[16px_16px_4px_16px]' : 'bg-white dark:bg-slate-800 text-[#111] dark:text-white rounded-[16px_16px_16px_4px]'}`}
                  dangerouslySetInnerHTML={{ __html: msg.text }}
                />
                <span className="cb-btime text-[10px] text-[#8C8C8C] mt-[2px] p-[0_2px]">
                  {msg.time} {msg.sender === 'user' ? '✓✓' : ''}
                </span>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="cb-msg-row flex items-end gap-[6px]">
              <div className="cb-msg-av w-[26px] h-[26px] rounded-full bg-[#C0392B] flex items-center justify-center shrink-0 overflow-hidden text-white">
                <svg viewBox="0 0 24 24" fill="white" width="14" height="14">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
                </svg>
              </div>
              <div className="cb-typing flex gap-[4px] p-[10px_12px] bg-white dark:bg-slate-800 rounded-[16px_16px_16px_4px] w-fit shadow-sm">
                <div className="cb-tdot w-[7px] h-[7px] bg-[#B0B0B0] rounded-full animate-[cbTdot_1.2s_infinite]"></div>
                <div className="cb-tdot w-[7px] h-[7px] bg-[#B0B0B0] rounded-full animate-[cbTdot_1.2s_infinite] [animation-delay:.18s]"></div>
                <div className="cb-tdot w-[7px] h-[7px] bg-[#B0B0B0] rounded-full animate-[cbTdot_1.2s_infinite] [animation-delay:.36s]"></div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Options Area */}
        <div id="cb-options" className="bg-[#F7F3EF] dark:bg-slate-800 border-t border-[#E8E0D8] dark:border-slate-700 p-[10px_10px_12px] shrink-0 max-h-[220px] overflow-y-auto">
          <div id="cb-opt-label" className="text-[10px] font-bold text-[#8C8C8C] tracking-[.4px] uppercase mb-[7px] pl-[2px]">
            {current.label || '¿Qué necesitas?'}
          </div>
          <div id="cb-opt-list" className="flex flex-col">
            {stack.length > 0 && (
              <button 
                onClick={handleBack}
                className="cb-back-btn flex items-center gap-[5px] bg-transparent border-none text-[#C0392B] text-[11px] font-bold cursor-pointer p-[0_2px_7px] font-inherit w-full hover:underline"
              >
                <svg viewBox="0 0 24 24" fill="#C0392B" width="12" height="12">
                  <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
                </svg>
                Volver
              </button>
            )}

            {current.opts.map((opt, i) => (
              <button 
                key={i} 
                onClick={() => handleOptionClick(opt)}
                className="cb-opt-btn flex items-center gap-[9px] w-full bg-white dark:bg-slate-700 border border-[#E8E0D8] dark:border-slate-600 rounded-[22px] p-[8px_12px] mb-[6px] cursor-pointer text-left transition-all hover:bg-[#FDECEA] dark:hover:bg-[#C0392B]/20 active:scale-[0.98] font-inherit last:mb-0"
              >
                <div className="cb-opt-icon w-[28px] h-[28px] rounded-full bg-[#FADBD8] dark:bg-red-950 flex items-center justify-center shrink-0">
                  <img 
                    src={`${ICON_BASE}${opt.icon}.png`} 
                    alt={opt.icon}
                    onError={(e) => {
                      e.target.remove();
                    }}
                    className="w-[18px] h-[18px] object-contain"
                  />
                </div>
                <span className="cb-opt-text flex-1 text-[12px] font-semibold text-[#111] dark:text-white leading-[1.35]">{opt.text}</span>
                <span className="cb-opt-chev text-[#C0392B] shrink-0">
                  <svg viewBox="0 0 24 24" fill="#C0392B" width="14" height="14" className="block">
                    <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                  </svg>
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
