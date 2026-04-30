// js/utils/splash.js

export function mostrarSplash() {
    // si no viene del login, no hace nada
    if (!localStorage.getItem('show_splash')) return
    localStorage.removeItem('show_splash')

    // Espera a que body exista antes de insertar el splash
    function _insertar() {
        const style = document.createElement('style')
        style.textContent = `
            @keyframes popIn {
                from { opacity: 0; transform: scale(0.7); }
                to   { opacity: 1; transform: scale(1); }
            }
            @keyframes fadeUp {
                from { opacity: 0; transform: translateY(12px); }
                to   { opacity: 1; transform: translateY(0); }
            }
            @keyframes spinRing {
                from { transform: rotate(0deg); }
                to   { transform: rotate(360deg); }
            }
            @keyframes bounceDot {
                0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
                40%           { transform: translateY(-8px); opacity: 1; background: white; }
            }
            #splash-screen {
                position: fixed;
                inset: 0;
                z-index: 99999;
                background: #94272C;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: opacity 0.5s ease;
            }
            #splash-inner {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 18px;
                animation: popIn 0.65s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
            }
            #splash-ring {
                position: relative;
                width: 120px;
                height: 120px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            #splash-ring-border {
                position: absolute;
                inset: 0;
                border-radius: 50%;
                border: 2.5px solid rgba(255,255,255,0.35);
                border-top-color: white;
                animation: spinRing 1.4s linear infinite;
            }
            #splash-logo-bg {
                width: 100px;
                height: 100px;
                border-radius: 50%;
                background: rgba(255,255,255,0.15);
                display: flex;
                align-items: center;
                justify-content: center;
            }
            #splash-logo-bg img {
                width: 64px;
                height: 64px;
                object-fit: contain;
            }
            #splash-title {
                color: white;
                font-size: 1.9rem;
                font-weight: 900;
                letter-spacing: -0.5px;
                font-family: 'Lexend', 'Montserrat', sans-serif;
                margin: 0;
                animation: fadeUp 0.5s ease 0.35s both;
            }
            #splash-sub {
                color: rgba(255,255,255,0.65);
                font-size: 0.72rem;
                font-weight: 600;
                letter-spacing: 3.5px;
                text-transform: uppercase;
                font-family: 'Lexend', 'Montserrat', sans-serif;
                margin: -10px 0 0;
                animation: fadeUp 0.5s ease 0.55s both;
            }
            #splash-dots {
                display: flex;
                gap: 8px;
                margin-top: 6px;
                animation: fadeUp 0.5s ease 0.7s both;
            }
            .splash-dot {
                width: 7px;
                height: 7px;
                border-radius: 50%;
                background: rgba(255,255,255,0.4);
            }
            .splash-dot:nth-child(1) { animation: bounceDot 1.1s ease infinite 0s; }
            .splash-dot:nth-child(2) { animation: bounceDot 1.1s ease infinite 0.18s; }
            .splash-dot:nth-child(3) { animation: bounceDot 1.1s ease infinite 0.36s; }
        `
        document.head.appendChild(style)

        const splash = document.createElement('div')
        splash.id = 'splash-screen'
        splash.innerHTML = `
            <div id="splash-inner">
                <div id="splash-ring">
                    <div id="splash-ring-border"></div>
                    <div id="splash-logo-bg">
                        <img src="/imgs/yameharte.png" alt="CBTis 258">
                    </div>
                </div>
                <p id="splash-title">CBTis 258</p>
                <p id="splash-sub">Un motivo de orgullo</p>
                <div id="splash-dots">
                    <div class="splash-dot"></div>
                    <div class="splash-dot"></div>
                    <div class="splash-dot"></div>
                </div>
            </div>
        `

        document.body.appendChild(splash)

        setTimeout(() => {
            splash.style.opacity = '0'
            setTimeout(() => {
                splash.remove()
                style.remove()
            }, 500)
        }, 2200)
    }

    // Si body ya existe, insertar de inmediato; si no, esperar DOMContentLoaded
    if (document.body) {
        _insertar()
    } else {
        document.addEventListener('DOMContentLoaded', _insertar, { once: true })
    }
}