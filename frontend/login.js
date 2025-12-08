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

// Obtener el formulario de registro
const signUpForm = document.querySelector('.sign-up form');
const signUpInputs = signUpForm.querySelectorAll('.input');

signUpForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const nombre = signUpInputs[0].value.trim();
    const email = signUpInputs[1].value.trim();
    const password = signUpInputs[2].value.trim();
    
    // Validaciones
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
    
    // Obtener usuarios existentes
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Verificar si el email ya existe
    if (users.find(u => u.email === email)) {
        alert('Este correo ya está registrado. Por favor inicia sesión.');
        return;
    }
    
    // Crear nuevo usuario
    const newUser = {
        id: Date.now(),
        nombre: nombre,
        email: email,
        password: password,
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Guardar sesión automáticamente
    sessionStorage.setItem('currentUser', JSON.stringify({
        id: newUser.id,
        nombre: newUser.nombre,
        email: newUser.email
    }));
    
    alert('¡Cuenta creada exitosamente!');
    
    // Redirigir a la página principal
    window.location.href = 'principal/index.html';
});


// ============================================
// FUNCIONALIDAD DE LOGIN CON EMAIL/PASSWORD
// ============================================

// Obtener el formulario de login
const signInForm = document.querySelector('.sign-in form');
const signInInputs = signInForm.querySelectorAll('.input');

signInForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const email = signInInputs[0].value.trim();
    const password = signInInputs[1].value.trim();
    
    // Validaciones
    if (!email || !password) {
        alert('Por favor llena todos los campos');
        return;
    }
    
    // Obtener usuarios registrados
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Buscar usuario
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        // Guardar sesión
        sessionStorage.setItem('currentUser', JSON.stringify({
            id: user.id,
            nombre: user.nombre,
            email: user.email
        }));
        
        alert(`¡Bienvenido ${user.nombre}!`);
        
        // Redirigir a la página principal
        window.location.href = 'principal/index.html';
    } else {
        alert('Email o contraseña incorrectos');
    }
});


// Login de google

function handleCredentialResponse(response) {
    const id_token = response.credential;
    
    // Aquí es donde envías el token a tu servidor Node.js
    fetch('/api/login/google', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: id_token }),
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            window.location.href = 'principal/index.html'; 
        } else {
            alert('Error de autenticación con Google: ' + data.message);
        }
    })
    .catch(error => console.error('Error de red:', error));
}


window.onload = function () {
    // Verificar si ya hay una sesión activa
    const currentUser = sessionStorage.getItem('currentUser');
    if (currentUser) {
        // Si ya está logueado, redirigir a principal
        window.location.href = 'principal/index.html';
        return;
    }
    
    // Inicializar Google Identity Services
    if (typeof google !== 'undefined' && google.accounts) {
        google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleCredentialResponse,
            ux_mode: 'popup' 
        });

        // Asignar el click al botón de Registro con Google
        const signupBtn = document.getElementById('google-signup-btn');
        if (signupBtn) {
            signupBtn.addEventListener('click', function(e) {
                e.preventDefault();
                google.accounts.id.prompt();
            });
        }

        // Asignar el click al botón de Login con Google
        const signinBtn = document.getElementById('google-signin-btn');
        if (signinBtn) {
            signinBtn.addEventListener('click', function(e) {
                e.preventDefault();
                google.accounts.id.prompt();
            });
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
modalForgot.addEventListener('click', function(e) {
    if (e.target === modalForgot) {
        modalForgot.classList.remove('active');
        emailForgotInput.value = '';
    }
});

// Ir a Sign up (cambiar a vista de registro)
if (goToSignup) {
    goToSignup.addEventListener('click', function(e) {
        e.preventDefault();
        modalForgot.classList.remove('active');
        emailForgotInput.value = '';
        // Activar la vista de registro
        container.classList.add('active');
    });
}

// Enviar email
if (sendForgotBtn) {
    sendForgotBtn.addEventListener('click', function() {
        const email = emailForgotInput.value.trim();
        
        if (!email) {
            alert('Please enter your email');
            return;
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Please enter a valid email address');
            return;
        }
        
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userExists = users.find(u => u.email === email);
        
        if (userExists) {
            alert(`✅ Password reset link sent to ${email}\n\n(This is a simulation)`);
            modalForgot.classList.remove('active');
            emailForgotInput.value = '';
        } else {
            alert('❌ No account found with that email address');
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