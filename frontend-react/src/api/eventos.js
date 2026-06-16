const BASE = '/api/eventos';

function authHeaders() {
    const token = localStorage.getItem('access_token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
}

export async function getEventos() {
    return fetch(BASE, { cache: 'no-store' });
}

export async function createEvento(data) {
    return fetch(BASE, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(data)
    });
}

export async function updateEvento(id, data) {
    return fetch(`${BASE}/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(data)
    });
}

export async function deleteEvento(id) {
    return fetch(`${BASE}/${id}`, {
        method: 'DELETE',
        headers: authHeaders()
    });
}
