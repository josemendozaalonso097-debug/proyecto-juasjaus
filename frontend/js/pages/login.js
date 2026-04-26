import { 
    registerSendOTP, registerVerifyOTP, loginUser, loginWithGoogleToken, 
    checkSessionToken, checkBackendHealth, sendForgotPasswordLink
} from '../api/auth.js?v=3';

const container = document.getElementById('container');
const loginBtn = document.getElementById('login');
const registerBtn = document.getElementById('register');

if (registerBtn) {
    registerBtn.addEventListener('click', () => {
        container.classList.add("active");
    });
}

if (loginBtn) {
    loginBtn.addEventListener('click', () => {
        container.classList.remove("active");
    });
}

// ============================================
// FUNCIONALIDAD DE REGISTRO
// ============================================

const rolSelect = document.getElementById('rol-select');
const semestreContainer = document.getElementById('semestre-container');
const semestreSelect = document.getElementById('semestre-select');

if (rolSelect && semestreContainer) {
    rolSelect.addEventListener('change', (e) => {
        if (e.target.value === 'estudiante') {
            semestreContainer.classList.remove('hidden');
        } else {
            semestreContainer.classList.add('hidden');
            if(semestreSelect) semestreSelect.value = '';
        }
    });
}

const signUpForm = document.querySelector('.sign-up form');
const signUpInputs = signUpForm.querySelectorAll('.input');

signUpForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    console.log('🎯 === INICIO DE REGISTRO ===');
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Registrando...';
    
    const nombre = signUpInputs[0].value.trim();
    const email = signUpInputs[1].value.trim();
    const password = signUpInputs[2].value.trim();
    
    const rol = rolSelect ? rolSelect.value : '';
    let semestre = '';
    
    console.log('📝 Datos:', { nombre, email, rol });
    
    if (!nombre || !email || !password || !rol) {
        showToast('Por favor llena todos los campos, incluyendo tu rol', 'warning');
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        return;
    }
    
    if (rol === 'estudiante') {
        semestre = semestreSelect ? semestreSelect.value : '';
        if (!semestre) {
            showToast('Por favor selecciona tu semestre', 'warning');
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
            return;
        }
        console.log('🎓 Semestre:', semestre);
    }
    
    if (password.length < 6) {
        showToast('La contraseña debe tener al menos 6 caracteres', 'warning');
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        return;
    }
    
    try {
        console.log('📡 Solicitando OTP...');
        const userData = { 
            nombre, 
            email, 
            password, 
            rol, 
            semestre: semestre ? parseInt(semestre) : null  // null en vez de "" para cumplir Optional[int]
        };
        const response = await registerSendOTP(userData);
        
        console.log('📥 Status:', response.status);
        const data = await response.json();
        console.log('📦 Respuesta:', data);
        
        if (response.ok) {
            console.log('✅ OTP Enviado exitosamente');
            showToast('Código enviado a tu correo', 'success');
            
            // Guardar para el modal
            window.currentRegisterEmail = email;
            window.currentRegisterUserParams = { nombre, rol, semestre: rol === 'estudiante' ? semestre : null };
            
            // Abrir modal y disparar timer
            openOtpModal();
            
        } else {
            console.log('❌ Error:', data.detail);
            showToast(data.detail || 'Error al iniciar registro', 'error');
        }
    } catch (error) {
        console.error('❌ Error:', error);
        showToast('Error de conexión. Verifica que el backend esté corriendo', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
});

// ============================================
// FUNCIONALIDAD DE OTP MODAL
// ============================================

const modalOtp = document.getElementById('modal-otp');
const otpInputs = document.querySelectorAll('.otp-input');
const verifyOtpBtn = document.getElementById('verify-otp-btn');
const resendOtpBtn = document.getElementById('resend-otp-btn');
const cancelOtpBtn = document.getElementById('cancel-otp-btn');
const otpTimerDisplay = document.getElementById('otp-timer');
let otpTimerInterval;

function openOtpModal() {
    modalOtp.classList.remove('hidden');
    // En Tailwind usamos 'hidden' para ocultar por lo general o manipulación de z-index
    // Si usamos z-[9999] con hidden, remover 'hidden' es suficiente
    startOtpTimer();
    otpInputs.forEach(input => input.value = '');
    verifyOtpBtn.disabled = true;
    resendOtpBtn.disabled = true;
    setTimeout(() => { if (otpInputs[0]) otpInputs[0].focus(); }, 100);
}

function closeOtpModal() {
    modalOtp.classList.add('hidden');
    clearInterval(otpTimerInterval);
    window.currentRegisterEmail = null;
}

function startOtpTimer() {
    clearInterval(otpTimerInterval);
    let timeLeft = 120; // 2 minutes
    resendOtpBtn.disabled = true;
    
    otpTimerInterval = setInterval(() => {
        timeLeft--;
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        otpTimerDisplay.textContent = `0${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        
        if (timeLeft <= 0) {
            clearInterval(otpTimerInterval);
            otpTimerDisplay.textContent = "00:00";
            resendOtpBtn.disabled = false;
        }
    }, 1000);
}

// Lógica de Inputs OTP (Focus y Backspace)
if (otpInputs) {
    otpInputs.forEach((input, index) => {
        input.addEventListener('input', (e) => {
            if (e.target.value.length > 1) {
                e.target.value = e.target.value.slice(0, 1);
            }
            if (e.target.value !== '') {
                if (index < otpInputs.length - 1) {
                    otpInputs[index + 1].focus();
                }
            }
            checkOtpReady();
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && e.target.value === '') {
                if (index > 0) {
                    otpInputs[index - 1].focus();
                }
            }
        });
        
        input.addEventListener('paste', (e) => {
            e.preventDefault();
            const pastedData = e.clipboardData.getData('text').trim().replace(/[^0-9]/g, '').slice(0, 6);
            if (pastedData) {
                pastedData.split('').forEach((char, i) => {
                    if (otpInputs[i]) {
                        otpInputs[i].value = char;
                    }
                });
                const nextFocus = Math.min(pastedData.length, otpInputs.length - 1);
                otpInputs[nextFocus].focus();
                checkOtpReady();
            }
        });
    });
}

function checkOtpReady() {
    const isComplete = Array.from(otpInputs).every(input => input.value.trim() !== '');
    verifyOtpBtn.disabled = !isComplete;
}

if (verifyOtpBtn) {
    verifyOtpBtn.addEventListener('click', async () => {
        if (verifyOtpBtn.disabled) return;
        
        const code = Array.from(otpInputs).map(input => input.value).join('');
        if (code.length !== 6 || !window.currentRegisterEmail) return;
        
        const originalText = verifyOtpBtn.innerHTML;
        verifyOtpBtn.disabled = true;
        verifyOtpBtn.innerHTML = '<span class="material-symbols-outlined fa-spin">sync</span> Verificando...';
        
        try {
            const response = await registerVerifyOTP(window.currentRegisterEmail, code);
            const data = await response.json();
            
            if (response.ok) {
                console.log('✅ ¡REGISTRO EXITOSO TRAS OTP!');
                
                // Guardar login automático igual que el flujo anterior
                localStorage.setItem('access_token', data.access_token);
                const userProfile = {
                    id: data.user.id,
                    email: data.user.email,
                    nombre: window.currentRegisterUserParams.nombre,
                    rol: window.currentRegisterUserParams.rol,
                    semestre: window.currentRegisterUserParams.semestre
                };
                localStorage.setItem('user', JSON.stringify(userProfile));
                localStorage.setItem(`perfil_${data.user.id}`, JSON.stringify(userProfile));
                
                showToast('¡Cuenta creada exitosamente! 🎉', 'success');
                closeOtpModal();
                
                localStorage.setItem('just_registered', 'true');
                setTimeout(() => {
                    window.location.href = 'principal/index.html';
                }, 1000);
            } else {
                showToast(data.detail || 'Código incorrecto o expirado', 'error');
                verifyOtpBtn.disabled = false;
                verifyOtpBtn.innerHTML = originalText;
                
                if (data.detail === "El código ha expirado") {
                    resendOtpBtn.disabled = false;
                }
            }
        } catch(error) {
            console.error('❌ Error verifying OTP:', error);
            showToast('Error de conexión', 'error');
            verifyOtpBtn.disabled = false;
            verifyOtpBtn.innerHTML = originalText;
        }
    });
}

if (resendOtpBtn) {
    resendOtpBtn.addEventListener('click', async () => {
        if (resendOtpBtn.disabled) return;
        
        resendOtpBtn.disabled = true;
        const originalText = resendOtpBtn.textContent;
        resendOtpBtn.textContent = 'Enviando...';
        
        // Disparamos la misma petición de registro escondida para generar el mismo OTP
        const submitBtn = signUpForm.querySelector('button[type="submit"]');
        submitBtn.click(); // Trigger form to create new OTP
        
        setTimeout(() => {
            resendOtpBtn.textContent = 'Código reenviado';
        }, 1000);
    });
}

if (cancelOtpBtn) {
    cancelOtpBtn.addEventListener('click', () => {
        closeOtpModal();
    });
}

// ============================================
// FUNCIONALIDAD DE LOGIN
// ============================================

const signInForm = document.querySelector('.sign-in form');
const signInInputs = signInForm.querySelectorAll('.input');

signInForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    console.log('🎯 === INICIO DE LOGIN ===');
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Iniciando...';
    
    const email = signInInputs[0].value.trim();
    const password = signInInputs[1].value.trim();
    
    console.log('📝 Email:', email);
    
    if (!email || !password) {
        showToast('Por favor llena todos los campos', 'warning');
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        return;
    }
    
    try {
        console.log('📡 Enviando login...');
        const response = await loginUser(email, password);
        
        console.log('📥 Status:', response.status);
        const data = await response.json();
        console.log('📦 Respuesta:', data);
        
        if (response.ok) {
            console.log('✅ ¡LOGIN EXITOSO!');
            
            localStorage.setItem('access_token', data.access_token);
            localStorage.setItem('user', JSON.stringify(data.user));
            if (data.user.id) {
                const perfilGuardado = localStorage.getItem(`perfil_${data.user.id}`);
                if (!perfilGuardado) {
                    localStorage.setItem(`perfil_${data.user.id}`, JSON.stringify(data.user));
                }
            }
            
            showToast(`¡Bienvenid@ ${data.user.nombre}! 🎉`, 'success');
            setTimeout(() => {
                window.location.href = 'principal/index.html?splash=1';
            }, 1000);
        } else {
            console.log('❌ Error:', data.detail);
            showToast(data.detail || 'Email o contraseña incorrectos', 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    } catch (error) {
        console.error('❌ Error:', error);
        showToast('Error de conexión con el servidor', 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
});

// ============================================
// LOGIN CON GOOGLE
// ============================================

const GOOGLE_CLIENT_ID = '518151220144-9bvr54odrsmi1lccf27eok450e15tfor.apps.googleusercontent.com';

function googleOAuthPopup() {
    const redirectUri = encodeURIComponent(window.location.origin + window.location.pathname);
    const scope = encodeURIComponent('openid email profile');
    const nonce = Math.random().toString(36).substring(2);

    const url = `https://accounts.google.com/o/oauth2/v2/auth` +
        `?client_id=${GOOGLE_CLIENT_ID}` +
        `&redirect_uri=${redirectUri}` +
        `&response_type=id_token` +
        `&scope=${scope}` +
        `&nonce=${nonce}` +
        `&prompt=select_account`;

    const width = 500, height = 600;
    const left = (screen.width - width) / 2;
    const top = (screen.height - height) / 2;
    const popup = window.open(url, 'google-login', 
        `width=${width},height=${height},top=${top},left=${left}`);

    const interval = setInterval(() => {
        try {
            if (!popup || popup.closed) {
                clearInterval(interval);
                return;
            }
            const popupUrl = popup.location.href;
            if (popupUrl.includes('#')) {
                const hash = new URLSearchParams(popup.location.hash.substring(1));
                const id_token = hash.get('id_token');
                if (id_token) {
                    popup.close();
                    clearInterval(interval);
                    sendGoogleToken(id_token);
                }
            }
        } catch (e) {
            // Cross-origin
        }
    }, 200);
}

async function sendGoogleToken(id_token) {
    console.log('🔐 Token de Google recibido, enviando al backend...');
    try {
        const res = await loginWithGoogleToken(id_token);
        const data = await res.json();

        if (res.ok) {
            localStorage.setItem('access_token', data.access_token);
            localStorage.setItem('user', JSON.stringify(data.user));
            showToast(`¡Bienvenido ${data.user.nombre}! 🎉`, 'success');
            setTimeout(() => {
                window.location.href = 'principal/index.html?splash=1';
            }, 1000);
        } else {
            showToast('Error con Google: ' + (data.detail || 'Intenta de nuevo'), 'error');
        }
    } catch (error) {
        console.error('❌ Error:', error);
        showToast('Error de conexión con el servidor', 'error');
    }
}

document.getElementById('google-signup-btn').addEventListener('click', (e) => {
    e.preventDefault();
    googleOAuthPopup();
});

document.getElementById('google-signin-btn').addEventListener('click', (e) => {
    e.preventDefault();
    googleOAuthPopup();
});

// ============================================
// INICIALIZACIÓN
// ============================================

window.onload = async function () {
    console.log('🚀 Página cargada');
    
    if (localStorage.getItem('just_registered')) {
        console.log('🆕 Usuario recién registrado, saltando check-session');
        localStorage.removeItem('just_registered');
        return;
    }

    const token = localStorage.getItem('access_token');
    if (token) {
        console.log('🔑 Token encontrado, verificando...');

        // VERIFICAR PREFERENCIA DE LOGIN MANUAL
        const userRaw = localStorage.getItem('user');
        if (userRaw) {
            try {
                const user = JSON.parse(userRaw);
                if (user && user.id) {
                    const prefs = JSON.parse(localStorage.getItem(`prefs_${user.id}`)) || {};
                    if (prefs.manualLogin) {
                        console.log('🛑 Login Manual activo por preferencia del usuario. Deteniendo redirección.');
                        return;
                    }
                }
            } catch (e) {
                console.error('Error al procesar preferencias de login manual:', e);
            }
        }

        try {
            const response = await checkSessionToken(token);
            if (response.ok) {
                console.log('✅ Sesión válida, redirigiendo...');
                window.location.href = 'principal/index.html?splash=1';
                return;
            } else {
                console.log('⚠️ Token inválido');
                localStorage.removeItem('access_token');
                localStorage.removeItem('user');
            }
        } catch (error) {
            console.log('⚠️ Error verificando sesión');
            localStorage.removeItem('access_token');
            localStorage.removeItem('user');
        }
    }
    
    console.log('🔍 Verificando backend...');
    try {
        const response = await checkBackendHealth();
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Backend conectado:', data);
        }
    } catch (error) {
        console.error('❌ Backend NO responde:', error);
    }
};

// ============================================
// MODAL FORGOT PASSWORD
// ============================================

const modalForgot = document.getElementById('modal-forgot');
const forgotLink = document.getElementById('forgot-password-link');
const sendForgotBtn = document.getElementById('send-forgot-btn');
const emailForgotInput = document.getElementById('email-forgot');
const goToSignup = document.getElementById('go-to-signup');

if (forgotLink) {
    forgotLink.addEventListener('click', function(e) {
        e.preventDefault();
        modalForgot.classList.remove('hidden');
    });
}

if (modalForgot) {
    modalForgot.addEventListener('click', function(e) {
        if (e.target === modalForgot) {
            modalForgot.classList.add('hidden');
            if (emailForgotInput) emailForgotInput.value = '';
        }
    });
}

if (goToSignup) {
    goToSignup.addEventListener('click', function(e) {
        e.preventDefault();
        modalForgot.classList.add('hidden');
        if (emailForgotInput) emailForgotInput.value = '';
        document.getElementById('register').click();
    });
}

if (sendForgotBtn) {
    sendForgotBtn.addEventListener('click', async function() {
        const email = emailForgotInput.value.trim();
        
        if (!email) {
            showToast('Por favor ingresa tu email', 'warning');
            return;
        }
        
        sendForgotBtn.disabled = true;
        sendForgotBtn.textContent = 'Enviando...';
        
        try {
            const response = await sendForgotPasswordLink(email);
            const data = await response.json();
            
            showToast('Si el correo existe, recibirás un email con instrucciones', 'success');
            modalForgot.classList.add('hidden');
            emailForgotInput.value = '';
        } catch (error) {
            console.error('❌ Error:', error);
            showToast('Error de conexión con el servidor', 'error');
        } finally {
            sendForgotBtn.disabled = false;
            sendForgotBtn.textContent = 'Enviar Email';
        }
    });
}

if (emailForgotInput) {
    emailForgotInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendForgotBtn.click();
        }
    });
}

// ============================================
// TOGGLE PASSWORD VISIBILITY
// ============================================

document.querySelectorAll('.toggle-password').forEach(icon => {
    icon.addEventListener('click', () => {
        const input = icon.previousElementSibling;

        if (input.type === "password") {
            input.type = "text";
            icon.classList.remove("fa-eye");
            icon.classList.add("fa-eye-slash");
        } else {
            input.type = "password";
            icon.classList.remove("fa-eye-slash");
            icon.classList.add("fa-eye");
        }
    });
});

// ============================================
// VALIDACIÓN EN TIEMPO REAL
// ============================================

document.querySelectorAll('.sign-in .input, .sign-up .input').forEach(input => {
    input.addEventListener('input', () => {
        const val = input.value.trim();
        if (input.type === 'email') {
            const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
            input.style.borderColor = val.length === 0 ? '' : valid ? '#22c55e' : '#ef4444';
            input.style.boxShadow = val.length === 0 ? '' : valid ? '0 0 0 3px rgba(34,197,94,0.15)' : '0 0 0 3px rgba(239,68,68,0.15)';
        } else if (input.type === 'password') {
            const valid = val.length >= 6;
            input.style.borderColor = val.length === 0 ? '' : valid ? '#22c55e' : '#ef4444';
            input.style.boxShadow = val.length === 0 ? '' : valid ? '0 0 0 3px rgba(34,197,94,0.15)' : '0 0 0 3px rgba(239,68,68,0.15)';
        }
    });
});
