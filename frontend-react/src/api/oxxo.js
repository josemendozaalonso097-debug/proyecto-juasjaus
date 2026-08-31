const BASE = '/api/oxxo';

function authHeaders() {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request(path, options = {}) {
  const response = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { ...authHeaders(), ...(options.headers || {}) },
  });
  const data = response.status === 204 ? null : await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.detail || 'No se pudo completar la operación');
  return data;
}

export function crearPagoOxxo(data) {
  return request('/payments', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function obtenerPagosOxxo() {
  return request('/payments/mine');
}

export function confirmarPagoOxxo(code) {
  return request('/admin/scan', {
    method: 'POST',
    body: JSON.stringify({ code }),
  });
}