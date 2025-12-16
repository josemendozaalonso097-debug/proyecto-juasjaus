// Configuración del backend FastAPI
const API_URL = 'http://localhost:8000/api/auth';

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
    
    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ nombre, email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Guardar token en localStorage
            localStorage.setItem('access_token', data.access_token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            alert('¡Cuenta creada exitosamente!');
            // ✅ AGREGAR ESTE TIMEOUT

            await new Promise(resolve => setTimeout(resolve, 300));
            window.location.href = 'principal/index.html';

                //setTimeout(() => {
            //window.location.href = 'principal/index.html';
        //}, 100);
        } else {
            alert(data.detail || 'Error al crear cuenta');
            submitBtn.disable = false;
            submitBtn.textContent = originalText;
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error de conexión con el servidor');
        submitBtn.disable = false;
        submitBtn.textContent = originalText;
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
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Guardar token en localStorage
            localStorage.setItem('access_token', data.access_token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            alert(`¡Bienvenid@ ${data.user.nombre}!`);
            window.location.href = 'principal/index.html';
        } else {
            alert(data.detail || 'Email o contraseña incorrectos');
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
            body: JSON.stringify({ token: id_token }),
        });
        
        const data = await res.json();
        
        if (res.ok) {
            // Guardar token en localStorage
            localStorage.setItem('access_token', data.access_token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            alert(`¡Bienvenido ${data.user.nombre}!`);
            window.location.href = 'principal/index.html';
        } else {
            alert('Error de autenticación con Google: ' + data.detail);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error de conexión con el servidor');
    }
}

// ============================================
// INICIALIZACIÓN
// ============================================

window.onload = async function () {
    // Verificar si ya hay una sesión activa
    const token = localStorage.getItem('access_token');
    if (token) {
        try {
            const response = await fetch(`${API_URL}/check-session`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                window.location.href = 'principal/index.html';
                return;
            } else {
                // Token inválido, limpiar
                localStorage.removeItem('access_token');
                localStorage.removeItem('user');
            }
        } catch (error) {
            console.log('No hay sesión activa');
        }
    }
    
    // Inicializar Google Identity Services
    if (typeof google !== 'undefined' && google.accounts) {
        google.accounts.id.initialize({
            client_id: '518151220144-9bvr54odrsmi1lccf27eok450e15tfor.apps.googleusercontent.com', // CAMBIAR ESTO
            callback: handleCredentialResponse,
            ux_mode: 'popup'
        });

        const signupBtn = document.getElementById('google-signup-btn');
        if (signupBtn) {
            signupBtn.onclick = function() {
                google.accounts.id.prompt();
                return false;
            };
        }

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
            console.error('Error:', error);
            alert('Error de conexión con el servidor');
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