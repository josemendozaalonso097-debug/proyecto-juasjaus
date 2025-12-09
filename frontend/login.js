// Configuración del backend
const API_URL = 'http://localhost:5000/api/auth';

// Elementos del DOM
const container = document.getElementById('container');
const registerBtn = document.getElementById('register');
const loginBtn = document.getElementById('login');

// Toggle entre Login y Registro
registerBtn.addEventListener('click', () => {
    container.classList.add("active");
});

loginBtn.addEventListener('click', () => {
    container.classList.remove("active");
});

// ============================================
// FUNCIONALIDAD DE REGISTRO CON EMAIL/PASSWORD
// ============================================

const signUpForm = document.querySelector('.sign-up form');
const signUpInputs = signUpForm.querySelectorAll('.input');

signUpForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const nombre = signUpInputs[0].value.trim();
    const email = signUpInputs[1].value.trim();
    const password = signUpInputs[2].value.trim();
    
    // Validaciones básicas
    if (!nombre || !email || !password) {
        alert('Por favor llena todos los campos');
        return;
    }
    
    if (password.length < 6) {
        alert('La contraseña debe tener al menos 6 caracteres');
        return;
    }
    
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Por favor ingresa un email válido');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ nombre, email, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert(data.message);
            // Pequeño delay antes de redirigir
            setTimeout(() => {
                window.location.href = 'principal/index.html';
            }, 100);
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error de conexión con el servidor');
    }
});

// ============================================
// FUNCIONALIDAD DE LOGIN CON EMAIL/PASSWORD
// ============================================

const signInForm = document.querySelector('.sign-in form');
const signInInputs = signInForm.querySelectorAll('.input');

signInForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = signInInputs[0].value.trim();
    const password = signInInputs[1].value.trim();
    
    if (!email || !password) {
        alert('Por favor llena todos los campos');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert(data.message);
            // Pequeño delay antes de redirigir
            setTimeout(() => {
                window.location.href = 'principal/index.html';
            }, 100);
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error de conexión con el servidor');
    }
});

// ============================================
// LOGIN CON GOOGLE
// ============================================

async function handleCredentialResponse(response) {
    const id_token = response.credential;
    
    try {
        const res = await fetch(`${API_URL}/login/google`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ token: id_token }),
        });
        
        const data = await res.json();
        
        if (data.success) {
            alert(data.message);
            // Pequeño delay antes de redirigir
            setTimeout(() => {
                window.location.href = 'principal/index.html';
            }, 100);
        } else {
            alert('Error de autenticación con Google: ' + data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error de conexión con el servidor');
    }
}

// ============================================
// INICIALIZACIÓN AL CARGAR LA PÁGINA
// ============================================

window.onload = async function () {
    // Verificar si ya hay una sesión activa
    try {
        const response = await fetch(`${API_URL}/check-session`, {
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (data.authenticated) {
            window.location.href = 'principal/index.html';
            return;
        }
    } catch (error) {
        console.log('No hay sesión activa');
    }
    
    // Inicializar Google Identity Services
    if (typeof google !== 'undefined' && google.accounts) {
        google.accounts.id.initialize({
            client_id: 'TU_GOOGLE_CLIENT_ID.apps.googleusercontent.com', // CAMBIAR ESTO
            callback: handleCredentialResponse,
            ux_mode: 'popup'
        });

        // Botón de Registro con Google
        const signupBtn = document.getElementById('google-signup-btn');
        if (signupBtn) {
            signupBtn.onclick = function() {
                google.accounts.id.prompt();
                return false;
            };
        }

        // Botón de Login con Google
        const signinBtn = document.getElementById('google-signin-btn');
        if (signinBtn) {
            signinBtn.onclick = function() {
                google.accounts.id.prompt();
                return false;
            };
        }
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

// Abrir modal
if (forgotLink) {
    forgotLink.addEventListener('click', function(e) {
        e.preventDefault();
        modalForgot.classList.add('active');
    });
}

// Cerrar modal al hacer click fuera
if (modalForgot) {
    modalForgot.addEventListener('click', function(e) {
        if (e.target === modalForgot) {
            modalForgot.classList.remove('active');
            if (emailForgotInput) emailForgotInput.value = '';
        }
    });
}

// Ir a Sign up (cambiar a vista de registro)
if (goToSignup) {
    goToSignup.addEventListener('click', function(e) {
        e.preventDefault();
        modalForgot.classList.remove('active');
        if (emailForgotInput) emailForgotInput.value = '';
        container.classList.add('active');
    });
}

// Enviar email de recuperación
if (sendForgotBtn) {
    sendForgotBtn.addEventListener('click', async function() {
        const email = emailForgotInput.value.trim();
        
        if (!email) {
            alert('Por favor ingresa tu email');
            return;
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Por favor ingresa un email válido');
            return;
        }
        
        try {
            const response = await fetch(`${API_URL}/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email })
            });
            
            const data = await response.json();
            
            if (data.success) {
                alert('✅ Si el correo existe, recibirás un email con instrucciones para recuperar tu contraseña');
                modalForgot.classList.remove('active');
                emailForgotInput.value = '';
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error de conexión con el servidor');
        }
    });
}

// Enviar con Enter
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