/**
 * Chatbot Cobra — CBTis 258
 * Componente autocontenido (CSS + HTML + lógica).
 * Se abre desde el sidebar vía  window.abrirChatbot()
 */
(function () {
  'use strict';

  /* ── Ruta base a CobraIcon/ ─────────────────────────────── */
  const ICON_BASE = '../CobraIcon/';

  /* ── Árbol de conversación ──────────────────────────────── */
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

  /* ── Inyectar CSS ───────────────────────────────────────── */
  var style = document.createElement('style');
  style.textContent = `
/* ── Chatbot Cobra — Variables ──────────────────────────── */
:root {
  --cb-red:       #C0392B;
  --cb-red-dark:  #922B21;
  --cb-red-light: #FADBD8;
  --cb-chat-bg:   #ECE5DD;
  --cb-bubble-bot:#FFFFFF;
  --cb-bubble-usr:#DCF8C6;
  --cb-opts-bg:   #F7F3EF;
  --cb-opt-border:#E8E0D8;
  --cb-text:      #111111;
  --cb-muted:     #8C8C8C;
  --cb-radius:    16px;
  --cb-panel-w:   480px;
  --cb-panel-h:   700px;
}

/* ── Overlay ────────────────────────────────────────────── */
#cb-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.35);
  z-index: 9998;
}
#cb-overlay.cb-visible { display: block; }

/* ── Panel ──────────────────────────────────────────────── */
#cb-panel {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0.85);
  width: var(--cb-panel-w);
  height: var(--cb-panel-h);
  border-radius: 20px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  z-index: 9999;
  box-shadow: 0 12px 40px rgba(0,0,0,0.22);
  opacity: 0;
  pointer-events: none;
  transition: transform .25s cubic-bezier(.34,1.3,.64,1), opacity .2s ease;
}
#cb-panel.cb-open {
  transform: translate(-50%, -50%) scale(1);
  opacity: 1;
  pointer-events: all;
}

/* ── Header ─────────────────────────────────────────────── */
#cb-header {
  background: var(--cb-red);
  padding: 12px 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}
#cb-avatar {
  width: 80px; height: 80px;
  border-radius: 50%;
  background: rgba(255,255,255,0.15);
  border: 3px solid rgba(255,255,255,0.4);
  flex-shrink: 0; overflow: hidden;
  display: flex; align-items: center; justify-content: center;
  transition: background .3s;
}
#cb-avatar img { width: 100%; height: 100%; object-fit: cover; }
#cb-header-info { flex: 1; display: flex; flex-direction: column; }
#cb-header-name { color: #fff; font-size: 17px; font-weight: 700; line-height: 1.3; }
#cb-header-status { color: rgba(255,255,255,0.85); font-size: 12.5px; display: flex; align-items: center; gap: 5px; }
#cb-status-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: #2ECC71; display: inline-block;
}
#cb-close {
  background: none; border: none; cursor: pointer;
  padding: 4px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  transition: background .15s;
}
#cb-close:hover { background: rgba(255,255,255,0.2); }

/* ── Mensajes ───────────────────────────────────────────── */
#cb-messages {
  flex: 1;
  background: var(--cb-chat-bg);
  overflow-y: auto;
  padding: 12px 10px 8px;
  display: flex; flex-direction: column; gap: 6px;
  scroll-behavior: smooth;
}
#cb-messages::-webkit-scrollbar { width: 3px; }
#cb-messages::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.15); border-radius: 4px; }

.cb-date-div { text-align: center; margin: 4px 0 6px; }
.cb-date-div span {
  background: #D4C9BF; color: #6B5D53;
  font-size: 10px; padding: 2px 10px; border-radius: 10px;
}

.cb-msg-row { display: flex; align-items: flex-end; gap: 6px; }
.cb-msg-row.cb-usr { justify-content: flex-end; }

.cb-msg-av {
  width: 26px; height: 26px; border-radius: 50%;
  background: var(--cb-red);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; overflow: hidden;
}
.cb-msg-av img { width: 100%; height: 100%; object-fit: cover; }

.cb-bwrap { display: flex; flex-direction: column; max-width: 210px; }
.cb-bwrap.cb-usr { align-items: flex-end; }

.cb-bubble {
  padding: 8px 11px; font-size: 12.5px;
  line-height: 1.5; color: var(--cb-text); word-break: break-word;
}
.cb-bubble.cb-bot {
  background: var(--cb-bubble-bot);
  border-radius: var(--cb-radius) var(--cb-radius) var(--cb-radius) 4px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.09);
}
.cb-bubble.cb-usr {
  background: var(--cb-bubble-usr);
  border-radius: var(--cb-radius) var(--cb-radius) 4px var(--cb-radius);
  box-shadow: 0 1px 2px rgba(0,0,0,0.09);
}
.cb-btime { font-size: 10px; color: var(--cb-muted); margin-top: 2px; padding: 0 2px; }

/* Typing dots */
.cb-typing { display: flex; gap: 4px; padding: 10px 12px;
  background: var(--cb-bubble-bot);
  border-radius: var(--cb-radius) var(--cb-radius) var(--cb-radius) 4px;
  width: fit-content; box-shadow: 0 1px 2px rgba(0,0,0,0.09);
}
.cb-tdot {
  width: 7px; height: 7px; background: #B0B0B0;
  border-radius: 50%; animation: cbTdot 1.2s infinite;
}
.cb-tdot:nth-child(2) { animation-delay: .18s; }
.cb-tdot:nth-child(3) { animation-delay: .36s; }
@keyframes cbTdot {
  0%,80%,100% { opacity: 0.3; transform: translateY(0); }
  40% { opacity: 1; transform: translateY(-3px); }
}

/* ── Opciones ───────────────────────────────────────────── */
#cb-options {
  background: var(--cb-opts-bg);
  border-top: 1px solid var(--cb-opt-border);
  padding: 10px 10px 12px;
  flex-shrink: 0; max-height: 220px; overflow-y: auto;
}
#cb-options::-webkit-scrollbar { width: 2px; }
#cb-options::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12); }
#cb-opt-label {
  font-size: 10px; font-weight: 700; color: var(--cb-muted);
  letter-spacing: .4px; text-transform: uppercase;
  margin-bottom: 7px; padding-left: 2px;
}
.cb-opt-btn {
  display: flex; align-items: center; gap: 9px;
  width: 100%; background: #fff;
  border: 1px solid var(--cb-opt-border);
  border-radius: 22px; padding: 8px 12px;
  margin-bottom: 6px; cursor: pointer; text-align: left;
  transition: background .15s, transform .1s; font-family: inherit;
}
.cb-opt-btn:hover { background: #FDECEA; border-color: var(--cb-red-light); }
.cb-opt-btn:active { transform: scale(0.98); }
.cb-opt-btn:last-child { margin-bottom: 0; }

.cb-opt-icon {
  width: 28px; height: 28px; border-radius: 50%;
  background: var(--cb-red-light);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.cb-opt-icon img { width: 18px; height: 18px; object-fit: contain; }
.cb-opt-icon svg { width: 14px; height: 14px; }
.cb-opt-text {
  flex: 1; font-size: 12px; font-weight: 600;
  color: var(--cb-text); line-height: 1.35;
}
.cb-opt-chev { color: var(--cb-red); flex-shrink: 0; }
.cb-opt-chev svg { width: 14px; height: 14px; display: block; }

.cb-back-btn {
  display: flex; align-items: center; gap: 5px;
  background: none; border: none; color: var(--cb-red);
  font-size: 11px; font-weight: 700; cursor: pointer;
  padding: 0 2px 7px; font-family: inherit; width: 100%;
}
.cb-back-btn svg { width: 12px; height: 12px; }

/* ── Responsive ─────────────────────────────────────────── */
@media (max-width: 420px) {
  #cb-panel {
    top: auto; left: 0; bottom: 0;
    transform: translateY(100%) !important;
    width: 100%; height: 92vh;
    border-radius: 20px 20px 0 0;
  }
  #cb-panel.cb-open {
    transform: translateY(0) !important;
  }
}
  `;
  document.head.appendChild(style);

  /* ── Inyectar HTML ──────────────────────────────────────── */
  var container = document.createElement('div');
  container.id = 'cb-root';
  container.innerHTML = `
    <!-- Panel del chat -->
    <div id="cb-panel" aria-hidden="true">
      <!-- Header -->
      <div id="cb-header">
        <div id="cb-avatar">
          <img id="cb-cobra-img" src="${ICON_BASE}CobraBienvenida.png" alt="Cobra"
               onerror="this.style.display='none';document.getElementById('cb-cobra-fb').style.display='flex'">
          <span id="cb-cobra-fb" style="display:none;width:100%;height:100%;align-items:center;justify-content:center">
            <svg viewBox="0 0 24 24" fill="white" width="20" height="20">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
            </svg>
          </span>
        </div>
        <div id="cb-header-info">
          <span id="cb-header-name">CobraBot </span>
          <span id="cb-header-status"><span id="cb-status-dot"></span>En línea</span>
        </div>
        <button id="cb-close" aria-label="Cerrar">
          <svg viewBox="0 0 24 24" fill="white" width="18" height="18">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>
      <!-- Área de mensajes -->
      <div id="cb-messages">
        <div class="cb-date-div"><span>Hoy</span></div>
      </div>
      <!-- Zona de opciones -->
      <div id="cb-options">
        <div id="cb-opt-label">¿Sobre qué te ayudo?</div>
        <div id="cb-opt-list"></div>
      </div>
    </div>
    <!-- Overlay -->
    <div id="cb-overlay"></div>
  `;
  document.body.appendChild(container);

  /* ── Estado ─────────────────────────────────────────────── */
  var stack   = [];
  var current = TREE;
  var isOpen  = false;

  /* ── Elementos ──────────────────────────────────────────── */
  var panel    = document.getElementById('cb-panel');
  var overlay  = document.getElementById('cb-overlay');
  var closeBtn = document.getElementById('cb-close');
  var msgArea  = document.getElementById('cb-messages');
  var optArea  = document.getElementById('cb-options');
  var optLabel = document.getElementById('cb-opt-label');
  var optList  = document.getElementById('cb-opt-list');
  var cobraImg = document.getElementById('cb-cobra-img');
  var cobraFb  = document.getElementById('cb-cobra-fb');

  /* ── Helpers ────────────────────────────────────────────── */
  function nowTime() {
    var d = new Date();
    return d.getHours() + ':' + String(d.getMinutes()).padStart(2, '0');
  }

  function scrollBottom() {
    msgArea.scrollTop = msgArea.scrollHeight;
  }

  function setCobra(iconName) {
    var src = ICON_BASE + iconName + '.png';
    cobraImg.style.display = '';
    cobraFb.style.display  = 'none';
    cobraImg.src = src;
    cobraImg.onerror = function () {
      this.style.display = 'none';
      cobraFb.style.display = 'flex';
    };
  }

  function makeOptIcon(iconName) {
    var wrap = document.createElement('div');
    wrap.className = 'cb-opt-icon';
    var img = document.createElement('img');
    img.src = ICON_BASE + iconName + '.png';
    img.alt = iconName;
    img.onerror = function () {
      this.remove();
      wrap.innerHTML = '<svg viewBox="0 0 24 24" fill="#C0392B"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/></svg>';
    };
    wrap.appendChild(img);
    return wrap;
  }

  var SVG_AVATAR = '<svg viewBox="0 0 24 24" fill="white" width="14" height="14"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/></svg>';

  function addBotBubble(text) {
    var row = document.createElement('div');
    row.className = 'cb-msg-row';
    row.innerHTML =
      '<div class="cb-msg-av">' + SVG_AVATAR + '</div>' +
      '<div class="cb-bwrap">' +
        '<div class="cb-bubble cb-bot">' + text + '</div>' +
        '<div class="cb-btime">' + nowTime() + '</div>' +
      '</div>';
    msgArea.appendChild(row);
    scrollBottom();
  }

  function addUserBubble(text) {
    var row = document.createElement('div');
    row.className = 'cb-msg-row cb-usr';
    row.innerHTML =
      '<div class="cb-bwrap cb-usr">' +
        '<div class="cb-bubble cb-usr">' + text + '</div>' +
        '<div class="cb-btime" style="text-align:right">' + nowTime() + ' ✓✓</div>' +
      '</div>';
    msgArea.appendChild(row);
    scrollBottom();
  }

  function withTyping(ms, callback) {
    var row = document.createElement('div');
    row.className = 'cb-msg-row';
    row.innerHTML =
      '<div class="cb-msg-av">' + SVG_AVATAR + '</div>' +
      '<div class="cb-typing">' +
        '<div class="cb-tdot"></div>' +
        '<div class="cb-tdot"></div>' +
        '<div class="cb-tdot"></div>' +
      '</div>';
    msgArea.appendChild(row);
    scrollBottom();
    setTimeout(function () {
      row.remove();
      callback();
    }, ms);
  }

  /* ── Render opciones ────────────────────────────────────── */
  function renderOptions(node) {
    optList.innerHTML = '';
    optLabel.textContent = node.label || '¿Qué necesitas?';
    setCobra(node.icon || 'CobraBienvenida');

    if (stack.length > 0) {
      var back = document.createElement('button');
      back.className = 'cb-back-btn';
      back.innerHTML =
        '<svg viewBox="0 0 24 24" fill="#C0392B"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>' +
        'Volver';
      back.onclick = function () {
        current = stack.pop();
        renderOptions(current);
      };
      optList.appendChild(back);
    }

    node.opts.forEach(function (opt) {
      var btn = document.createElement('button');
      btn.className = 'cb-opt-btn';
      btn.appendChild(makeOptIcon(opt.icon));

      var label = document.createElement('span');
      label.className = 'cb-opt-text';
      label.textContent = opt.text;
      btn.appendChild(label);

      var chev = document.createElement('span');
      chev.className = 'cb-opt-chev';
      chev.innerHTML = '<svg viewBox="0 0 24 24" fill="#C0392B"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>';
      btn.appendChild(chev);

      btn.onclick = function () { handleOption(opt); };
      optList.appendChild(btn);
    });
  }

  /* ── Manejo de opción ───────────────────────────────────── */
  function handleOption(opt) {
    addUserBubble(opt.text);
    setCobra(opt.icon || 'CobraDuda');

    optArea.style.opacity = '0.4';
    optArea.style.pointerEvents = 'none';

    withTyping(900, function () {
      optArea.style.opacity = '';
      optArea.style.pointerEvents = '';

      if (opt.answer) {
        addBotBubble(opt.answer);
        withTyping(700, function () {
          addBotBubble('¿Hay algo más en lo que te pueda ayudar?');
          setCobra('CobraDespedida');
          stack = [];
          current = TREE;
          renderOptions(current);
        });
      } else if (opt.sub) {
        addBotBubble('Claro, aquí tienes las opciones:');
        stack.push(current);
        current = opt.sub;
        renderOptions(current);
      }
    });
  }

  /* ── Abrir / cerrar ─────────────────────────────────────── */
  function openChat() {
    isOpen = true;
    panel.classList.add('cb-open');
    panel.setAttribute('aria-hidden', 'false');
    overlay.classList.add('cb-visible');
  }

  function closeChat() {
    isOpen = false;
    panel.classList.remove('cb-open');
    panel.setAttribute('aria-hidden', 'true');
    overlay.classList.remove('cb-visible');
  }

  closeBtn.addEventListener('click', closeChat);
  overlay.addEventListener('click', closeChat);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isOpen) closeChat();
  });

  /* ── API global para el sidebar ─────────────────────────── */
  window.abrirChatbot = function () {
    if (isOpen) {
      closeChat();
    } else {
      openChat();
    }
  };

  /* ── Inicializar ────────────────────────────────────────── */
  addBotBubble('Hola, soy <b>CobraBot</b>, el asistente virtual de Financieros 258. ¿En qué te puedo ayudar hoy?');
  renderOptions(TREE);

})();
