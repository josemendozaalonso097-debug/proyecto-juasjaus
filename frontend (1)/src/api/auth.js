export const API_BASE = 'http://127.0.0.1:8000';
export const API_URL = `${API_BASE}/api/auth`;

export async function registerSendOTP(userData) {
    return await fetch(`${API_URL}/register-send-otp`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
    });
}

export async function registerVerifyOTP(email, code) {
    return await fetch(`${API_URL}/register-verify-otp`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code })
    });
}

export async function loginUser(email, password) {
    return await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
    });
}

export async function loginWithGoogleToken(id_token) {
    return await fetch(`${API_URL}/login/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: id_token })
    });
}

export async function checkSessionToken(token) {
    return await fetch(`${API_URL}/check-session`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
}

export async function checkBackendHealth() {
    return await fetch(`${API_BASE}/health`);
}

export async function sendForgotPasswordLink(email) {
    return await fetch(`${API_URL}/forgot-password`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
    });
}
