// ==========================================================
// frontend/js/utils/pageTransition.js
// Transición de páginas estilo login (3 capas deslizantes)
//
// USO:
//   navigateTo(url, direction)  — sale con animación
//   initPageReveal()            — llama al final del init de cada página
// ==========================================================

const OVERLAY_HTML = `
<div id="pt-overlay" style="position:fixed;inset:0;z-index:99999;pointer-events:all;display:none;">
  <div id="pt-l1" style="position:absolute;inset:0;background:#730505;"></div>
  <div id="pt-l2" style="position:absolute;inset:0;background:#bc0a0a;"></div>
  <div id="pt-l3" style="position:absolute;inset:0;background:#f20d0d;">
    <div id="pt-center" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;color:white;opacity:0;">
      <div id="pt-ring" style="width:70px;height:70px;border-radius:50%;border:2.5px solid rgba(255,255,255,.3);border-top-color:white;margin:0 auto 12px;position:relative;animation:ptSpin 1s linear infinite;">
        <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:50px;height:50px;border-radius:50%;background:rgba(255,255,255,.15);"></div>
      </div>
      <div style="font-size:18px;font-weight:700;font-family:inherit;letter-spacing:-.3px;">CBTis 258</div>
      <div id="pt-hint" style="font-size:10px;color:rgba(255,255,255,.65);letter-spacing:3px;text-transform:uppercase;margin-top:5px;font-family:inherit;">Cargando...</div>
    </div>
  </div>
</div>`;

// ---- Helpers ----

function injectStyle() {
    if (document.getElementById('pt-style')) return;
    const s = document.createElement('style');
    s.id = 'pt-style';
    s.textContent = '@keyframes ptSpin{to{transform:rotate(360deg)}}';
    document.head.appendChild(s);
}

function injectLayers() {
    if (document.getElementById('pt-overlay')) return;
    injectStyle();
    document.body.insertAdjacentHTML('beforeend', OVERLAY_HTML);
}

function slide(el, to, dur, delay, ease) {
    return new Promise(resolve => {
        setTimeout(() => {
            el.style.transition = `transform ${dur}ms ${ease || 'cubic-bezier(0.4,0,0.2,1)'}`;
            el.style.transform = to;
            setTimeout(resolve, dur);
        }, delay || 0);
    });
}

function fade(el, val, dur, delay) {
    setTimeout(() => {
        el.style.transition = `opacity ${dur}ms ease`;
        el.style.opacity = String(val);
    }, delay || 0);
}

// ---- Lógica interna ----

async function coverScreen(direction, hint) {
    injectLayers();
    const ov  = document.getElementById('pt-overlay');
    const l1  = document.getElementById('pt-l1');
    const l2  = document.getElementById('pt-l2');
    const l3  = document.getElementById('pt-l3');
    const ctr = document.getElementById('pt-center');
    const hEl = document.getElementById('pt-hint');

    // Las capas entran desde la dirección correcta
    const from = direction === 'right' ? 'translateX(-105%)' : 'translateX(105%)';

    [l1, l2, l3].forEach(l => { l.style.transition = 'none'; l.style.transform = from; });
    ctr.style.transition = 'none';
    ctr.style.opacity = '0';
    if (hEl) hEl.textContent = hint || 'Cargando...';
    ov.style.display = 'block';

    await new Promise(r => setTimeout(r, 16)); // un frame para que el DOM pinte

    // Cascada de entrada
    slide(l1, 'translateX(0)', 270, 0);
    slide(l2, 'translateX(0)', 255, 65);
    await slide(l3, 'translateX(0)', 240, 130);

    // Loader visible
    fade(ctr, 1, 160, 0);
    await new Promise(r => setTimeout(r, 200));
}

function revealScreen(direction) {
    const ov  = document.getElementById('pt-overlay');
    const l1  = document.getElementById('pt-l1');
    const l2  = document.getElementById('pt-l2');
    const l3  = document.getElementById('pt-l3');
    const ctr = document.getElementById('pt-center');
    if (!ov) return;

    // Las capas salen hacia la MISMA dirección a la que viajamos
    const to      = direction === 'right' ? 'translateX(105%)' : 'translateX(-105%)';
    const easeOut = 'cubic-bezier(0.4,0,1,1)';

    fade(ctr, 0, 130, 0);
    setTimeout(() => {
        slide(l3, to, 255, 0,   easeOut);
        slide(l2, to, 255, 65,  easeOut);
        slide(l1, to, 255, 130, easeOut).then(() => {
            ov.style.display = 'none';
            ov.style.pointerEvents = 'none';
        });
    }, 140);
}

// ---- API pública ----

/**
 * Navega a otra página con animación.
 * @param {string} url       - URL destino
 * @param {string} direction - 'right' (→ tienda) | 'left' (← principal)
 */
export async function navigateTo(url, direction) {
    const hints = { right: 'Abriendo tienda...', left: 'Volviendo...' };
    await coverScreen(direction, hints[direction] || 'Cargando...');
    sessionStorage.setItem('pt_direction', direction);
    sessionStorage.setItem('pt_pending', '1');
    window.location.href = url;
}

/**
 * Llama esto al final del init de la página (cuando el contenido ya cargó).
 * Devuelve una función reveal() que debes ejecutar para quitar los paneles.
 * Si no hay transición pendiente, devuelve null.
 */
export function initPageReveal() {
    if (!sessionStorage.getItem('pt_pending')) return null;

    const direction = sessionStorage.getItem('pt_direction') || 'right';
    sessionStorage.removeItem('pt_pending');
    sessionStorage.removeItem('pt_direction');

    return function reveal() {
        // Quitar el overlay simple que se inyectó inline en el HTML
        const simple = document.getElementById('pt-simple-ov');

        injectLayers();
        const ov  = document.getElementById('pt-overlay');
        const l1  = document.getElementById('pt-l1');
        const l2  = document.getElementById('pt-l2');
        const l3  = document.getElementById('pt-l3');
        const ctr = document.getElementById('pt-center');

        // Poner las 3 capas cubiertas (sin animación) y el loader visible
        [l1, l2, l3].forEach(l => { l.style.transition = 'none'; l.style.transform = 'translateX(0)'; });
        ctr.style.transition = 'none';
        ctr.style.opacity = '1';
        ov.style.display = 'block';
        ov.style.pointerEvents = 'all';

        if (simple) simple.remove(); // quitar la cubierta simple

        // Esperar un frame y revelar
        setTimeout(() => revealScreen(direction), 80);
    };
}