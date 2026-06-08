// src/api/papeleria.js
import { API_BASE } from './auth.js';

export async function enviarPapeleria(datos) {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_BASE}/api/papeleria/enviar`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(datos)
    });
    if (!response.ok) {
        throw new Error('Error al enviar documentos');
    }
    return response.json();
}
