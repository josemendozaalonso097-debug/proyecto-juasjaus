import { navigateTo } from '../utils/pageTransition.js?v=2';

let sidebarInicializado = false;

export function inicializarSidebar() {
    if (sidebarInicializado) return;

    let user = null;
    const userRaw = localStorage.getItem('user');
    
    if (userRaw) {
        try {
            user = JSON.parse(userRaw);
        } catch (e) {
            console.error('Error al parsear usuario:', e);
        }
    }

    if (!user || !user.id) {
        console.warn('Sidebar: No se encontró usuario válido. Saltando.');
        return;
    }

    sidebarInicializado = true;
    const userId = user.id;
    const prefsKey = `prefs_${userId}`;

    // Cargar preferencias del usuario actual
    let prefs = {
        darkMode: false,
        largeText: false,
        manualLogin: false
    };

    try {
        const storedPrefs = localStorage.getItem(prefsKey);
        if (storedPrefs) {
            prefs = { ...prefs, ...JSON.parse(storedPrefs) };
        }
    } catch (e) {
        console.error('Error al cargar preferencias:', e);
    }

    // Aplicar preferencias iniciales
    aplicarPreferencias(prefs);

    // Inyectar HTML si no existe
    if (!document.getElementById('sidebar-wrapper')) {
        inyectarSidebarHTML(prefs);
    }

    // Configurar el trigger (Logo del Header)
    const configurarTrigger = () => {
        const trigger = document.getElementById('logo-sidebar-trigger');
        if (trigger) {
            trigger.onclick = () => toggleSidebar(true);
            console.log('✅ Sidebar trigger configurado');
        } else {
            // Intentar por unos segundos antes de desistir para no saturar
            if (window.sidebarRetries === undefined) window.sidebarRetries = 0;
            if (window.sidebarRetries < 50) {
                window.sidebarRetries++;
                setTimeout(configurarTrigger, 100);
            }
        }
    };
    configurarTrigger();
}

function aplicarPreferencias(prefs) {
    // Modo Oscuro
    if (prefs.darkMode) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }

    // Texto Grande
    if (prefs.largeText) {
        document.documentElement.classList.add('large-text');
    } else {
        document.documentElement.classList.remove('large-text');
    }
}

function inyectarSidebarHTML(prefs) {
    const isTienda = window.location.pathname.includes('tienda');
    const navUrl = isTienda ? '../principal/index.html' : '../tienda/tienda.html';
    const navText = isTienda ? 'Ir al Tablero' : 'Ir a la Tienda';
    const navIcon = isTienda ? 'dashboard' : 'storefront';
    const navDirection = isTienda ? 'left' : 'right';

    const wrapper = document.createElement('div');
    wrapper.id = 'sidebar-wrapper';
    wrapper.innerHTML = `
        <style>
            #sidebar-main, #sidebar-prefs {
                transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            }
            .sr-only {
                position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); border: 0;
            }
        </style>
        <!-- Overlay -->
        <div id="sidebar-overlay" class="fixed inset-0 bg-black/40 backdrop-blur-sm opacity-0 pointer-events-none transition-opacity duration-300 z-[10001]"></div>
        
        <!-- Sidebar Principal -->
        <div id="sidebar-main" class="fixed top-0 left-0 h-full w-[320px] bg-white dark:bg-slate-900 shadow-[20px_0_50px_rgba(0,0,0,0.1)] dark:shadow-[20px_0_50px_rgba(0,0,0,0.3)] transform -translate-x-full z-[10002] flex flex-col border-r border-slate-100 dark:border-slate-800">
            <div class="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <div class="p-2 bg-primary/10 rounded-xl">
                        <img src="../imgs/yameharte.png" alt="Logo" class="h-6 w-auto">
                    </div>
                    <h2 class="text-xl font-black dark:text-white tracking-tight">Menú Sistema</h2>
                </div>
                <button id="close-sidebar" class="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400">
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>
            
            <div class="flex-grow py-6 overflow-y-auto">
                <div class="px-4 mb-4">
                    <p class="text-[10px] font-black uppercase tracking-[2px] text-slate-400 px-4 mb-2">Accesos Rápidos</p>
                    <button
                        id="sidebar-nav-btn"
                        class="flex items-center gap-4 px-4 py-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group w-full text-left"
                    >
                        <div class="p-2.5 bg-primary/5 rounded-xl group-hover:bg-primary/10 transition-colors">
                            <span class="material-symbols-outlined text-primary text-[22px] group-hover:scale-110 transition-transform">${navIcon}</span>
                        </div>
                        <span class="font-bold text-slate-700 dark:text-slate-200">${navText}</span>
                    </button>
                    
                    <button id="open-prefs" class="w-full flex items-center gap-4 px-4 py-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group text-left">
                        <div class="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 transition-colors">
                            <span class="material-symbols-outlined text-blue-500 text-[22px] group-hover:rotate-45 transition-transform">settings</span>
                        </div>
                        <span class="font-bold text-slate-700 dark:text-slate-200">Preferencias</span>
                        <span class="material-symbols-outlined ml-auto text-slate-300 group-hover:translate-x-1 transition-transform">chevron_right</span>
                    </button>
                </div>
            </div>
            
            <div class="p-8 border-t border-slate-100 dark:border-slate-800">
                <button id="sidebar-logout" class="w-full flex items-center justify-center gap-3 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-2xl hover:opacity-90 transition-all shadow-lg active:scale-[0.98]">
                    <span class="material-symbols-outlined text-[20px]">logout</span>
                    Cerrar Sesión
                </button>
            </div>
        </div>

        <!-- Sidebar Preferencias -->
        <div id="sidebar-prefs" class="fixed top-0 left-0 h-full w-[320px] bg-white dark:bg-slate-900 shadow-[20px_0_50px_rgba(0,0,0,0.1)] dark:shadow-[20px_0_50px_rgba(0,0,0,0.3)] transform -translate-x-full z-[10003] flex flex-col border-r border-slate-100 dark:border-slate-800">
            <div class="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center gap-4">
                <button id="back-to-main" class="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400">
                    <span class="material-symbols-outlined">arrow_back</span>
                </button>
                <h2 class="text-xl font-black dark:text-white tracking-tight">Preferencias</h2>
            </div>
            
            <div class="p-6 space-y-2 overflow-y-auto">
                <p class="text-[10px] font-black uppercase tracking-[2px] text-slate-400 px-2 mb-4">Personalización</p>
                
                <!-- Dark Mode -->
                <div class="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all">
                    <div>
                        <p class="font-bold text-slate-700 dark:text-slate-200 text-sm">Modo Oscuro</p>
                        <p class="text-[11px] text-slate-500 font-medium">Interfaz en tonos oscuros</p>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" id="pref-dark-mode" class="sr-only peer" ${prefs.darkMode ? 'checked' : ''}>
                        <div class="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                </div>

                <!-- Large Text -->
                <div class="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all">
                    <div>
                        <p class="font-bold text-slate-700 dark:text-slate-200 text-sm">Texto Grande</p>
                        <p class="text-[11px] text-slate-500 font-medium">Mayor tamaño de fuentes</p>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" id="pref-large-text" class="sr-only peer" ${prefs.largeText ? 'checked' : ''}>
                        <div class="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                </div>

                <div class="h-4"></div>
                <p class="text-[10px] font-black uppercase tracking-[2px] text-slate-400 px-2 mb-4">Seguridad</p>

                <!-- Manual Login -->
                <div class="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all">
                    <div>
                        <p class="font-bold text-slate-700 dark:text-slate-200 text-sm">Acceso Manual</p>
                        <p class="text-[11px] text-slate-500 font-medium">Desactiva inicio automático</p>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" id="pref-manual-login" class="sr-only peer" ${prefs.manualLogin ? 'checked' : ''}>
                        <div class="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(wrapper);

    // Event Listeners UI
    document.getElementById('sidebar-overlay').onclick = () => toggleSidebar(false);
    document.getElementById('close-sidebar').onclick = () => toggleSidebar(false);
    document.getElementById('sidebar-nav-btn').addEventListener('click', () => {
        navigateTo(navUrl, navDirection);});
    document.getElementById('open-prefs').onclick = () => togglePrefs(true);
    document.getElementById('back-to-main').onclick = () => togglePrefs(false);
    
    document.getElementById('sidebar-logout').onclick = () => {
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.click(); // Reusar lógica existente si hay
        } else {
            if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
                localStorage.removeItem('access_token');
                localStorage.removeItem('user');
                window.location.href = '../login.html';
            }
        }
    };

    // Lógica de actualización de preferencias
    const userRaw = localStorage.getItem('user');
    const user = JSON.parse(userRaw);
    const prefsKey = `prefs_${user.id}`;

    const updatePrefs = (newPrefs) => {
        prefs = { ...prefs, ...newPrefs };
        localStorage.setItem(prefsKey, JSON.stringify(prefs));
        aplicarPreferencias(prefs);
    };

    document.getElementById('pref-dark-mode').onchange = (e) => updatePrefs({ darkMode: e.target.checked });
    document.getElementById('pref-large-text').onchange = (e) => updatePrefs({ largeText: e.target.checked });
    document.getElementById('pref-manual-login').onchange = (e) => updatePrefs({ manualLogin: e.target.checked });
}

function toggleSidebar(show) {
    const sidebar = document.getElementById('sidebar-main');
    const overlay = document.getElementById('sidebar-overlay');
    if (show) {
        sidebar.classList.remove('-translate-x-full');
        overlay.classList.add('opacity-100');
        overlay.classList.remove('opacity-0', 'pointer-events-none');
        document.body.style.overflow = 'hidden';
    } else {
        sidebar.classList.add('-translate-x-full');
        togglePrefs(false);
        overlay.classList.remove('opacity-100');
        overlay.classList.add('opacity-0', 'pointer-events-none');
        document.body.style.overflow = '';
    }
}

function togglePrefs(show) {
    const prefsPanel = document.getElementById('sidebar-prefs');
    if (show) {
        prefsPanel.classList.remove('-translate-x-full');
    } else {
        prefsPanel.classList.add('-translate-x-full');
    }
}
