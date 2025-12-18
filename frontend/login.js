// ============================================
// CONFIGURACIÓN
// ============================================

const API_BASE = 'http://127.0.0.1:8000';
const API_URL = `${API_BASE}/api/auth`;

console.log('🔗 API URL:', API_URL);

const container = document.getElementById('container');
const registerBtn = document.getElementById('register');
const loginBtn = document.getElementById('login');

registerBtn.addEventListener('click', () => {
    container.classList.add("active");
});

loginBtn.addEventListener('click', () => {
    container.classList.remove("active");
});

// ============================================
// FUNCIONALIDAD DE REGISTRO
// ============================================

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
    
    console.log('📝 Datos:', { nombre, email });
    
    // Validaciones
    if (!nombre || !email || !password) {
        alert('Por favor llena todos los campos');
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        return;
    }
    
    if (password.length < 6) {
        alert('La contraseña debe tener al menos 6 caracteres');
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        return;
    }
    
    try {
        console.log('📡 Enviando a:', `${API_URL}/register`);
        
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ nombre, email, password })
        });
        
        console.log('📥 Status:', response.status);
        
        const data = await response.json();
        console.log('📦 Respuesta:', data);
        
        if (response.ok) {
            console.log('✅ ¡REGISTRO EXITOSO!');
            
            // Guardar token
            localStorage.setItem('access_token', data.access_token);
            localStorage.setItem('user', JSON.stringify({
    id: data.user.id,
    email: data.user.email
}));
            
            console.log('💾 Token guardado');
            
            alert('¡Cuenta creada exitosamente! 🎉');
            
            console.log('🔄 Redirigiendo...');
            
            localStorage.setItem('just_registered', 'true');
            // Redirigir
            window.location.href = 'principal/index.html';
            
        } else {
            console.log('❌ Error:', data.detail);
            alert(data.detail || 'Error al crear cuenta');
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
        alert('Error de conexión. Verifica que el backend esté corriendo en http://127.0.0.1:8000');
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
});

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
        alert('Por favor llena todos los campos');
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        return;
    }
    
    try {
        console.log('📡 Enviando login...');
        
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });
        
        console.log('📥 Status:', response.status);
        
        const data = await response.json();
        console.log('📦 Respuesta:', data);
        
        if (response.ok) {
            console.log('✅ ¡LOGIN EXITOSO!');
            
            localStorage.setItem('access_token', data.access_token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            alert(`¡Bienvenid@ ${data.user.nombre}! 🎉`);
            
            window.location.href = 'principal/index.html';
            
        } else {
            console.log('❌ Error:', data.detail);
            alert(data.detail || 'Email o contraseña incorrectos');
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
        alert('Error de conexión con el servidor');
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
});

// ============================================
// LOGIN CON GOOGLE
// ============================================

let googleInitialized = false;

async function handleCredentialResponse(response) {
    const id_token = response.credential;
    
    console.log('🔐 Token de Google recibido');
    
    try {
        const res = await fetch(`${API_URL}/login/google`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token: id_token })
        });
        
        const data = await res.json();
        
        if (res.ok) {
            localStorage.setItem('access_token', data.access_token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            alert(`¡Bienvenido ${data.user.nombre}!`);
            window.location.href = 'principal/index.html';
        } else {
            console.error('❌ Error:', data);
            alert('Error de autenticación con Google: ' + data.detail);
        }
    } catch (error) {
        console.error('❌ Error:', error);
        alert('Error de conexión con el servidor');
    }
}

function initializeGoogleSignIn() {
    if (typeof google === 'undefined' || !google.accounts) {
        console.log('⏳ Google SDK no cargado, reintentando...');
        setTimeout(initializeGoogleSignIn, 500);
        return;
    }
    
    if (googleInitialized) return;
    
    try {
        google.accounts.id.initialize({
            client_id: '518151220144-9bvr54odrsmi1lccf27eok450e15tfor.apps.googleusercontent.com',
            callback: handleCredentialResponse,
            ux_mode: 'popup',
            auto_select: false
        });
        
        googleInitialized = true;
        console.log('✅ Google Sign-In inicializado');
        
        const signupBtn = document.getElementById('google-signup-btn');
        if (signupBtn) {
            signupBtn.onclick = function(e) {
                e.preventDefault();
                google.accounts.id.prompt();
                return false;
            };
        }
        
        const signinBtn = document.getElementById('google-signin-btn');
        if (signinBtn) {
            signinBtn.onclick = function(e) {
                e.preventDefault();
                google.accounts.id.prompt();
                return false;
            };
        }
        
    } catch (error) {
        console.error('❌ Error inicializando Google:', error);
    }
}

// ============================================
// INICIALIZACIÓN
// ============================================

window.onload = async function () {
    console.log('🚀 Página cargada');
    
        // 🚩 EVITAR CHECK-SESSION JUSTO DESPUÉS DE REGISTRO
    if (localStorage.getItem('just_registered')) {
        console.log('🆕 Usuario recién registrado, saltando check-session');
        localStorage.removeItem('just_registered');
        initializeGoogleSignIn();
        return;
    }


    // Verificar sesión activa
    const token = localStorage.getItem('access_token');
    if (token) {
        console.log('🔑 Token encontrado, verificando...');
        try {
            const response = await fetch(`${API_URL}/check-session`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                console.log('✅ Sesión válida, redirigiendo...');
                window.location.href = 'principal/index.html';
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
    
    // Inicializar Google
    initializeGoogleSignIn();
    
    // Verificar backend
    console.log('🔍 Verificando backend...');
    try {
        const response = await fetch(`${API_BASE}/health`);
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
        modalForgot.classList.add('active');
    });
}

if (modalForgot) {
    modalForgot.addEventListener('click', function(e) {
        if (e.target === modalForgot) {
            modalForgot.classList.remove('active');
            if (emailForgotInput) emailForgotInput.value = '';
        }
    });
}

if (goToSignup) {
    goToSignup.addEventListener('click', function(e) {
        e.preventDefault();
        modalForgot.classList.remove('active');
        if (emailForgotInput) emailForgotInput.value = '';
        container.classList.add('active');
    });
}

if (sendForgotBtn) {
    sendForgotBtn.addEventListener('click', async function() {
        const email = emailForgotInput.value.trim();
        
        if (!email) {
            alert('Por favor ingresa tu email');
            return;
        }
        
        sendForgotBtn.disabled = true;
        sendForgotBtn.textContent = 'Enviando...';
        
        try {
            const response = await fetch(`${API_URL}/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email })
            });
            
            const data = await response.json();
            
            alert('✅ Si el correo existe, recibirás un email con instrucciones');
            modalForgot.classList.remove('active');
            emailForgotInput.value = '';
        } catch (error) {
            console.error('❌ Error:', error);
            alert('Error de conexión con el servidor');
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