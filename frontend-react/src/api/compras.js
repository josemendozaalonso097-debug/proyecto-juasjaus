const BASE = '/api/compras';

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
  if (!response.ok) {
    const error = new Error(
      typeof data.detail === 'string' ? data.detail : data.detail?.message || 'No se pudo completar la operación'
    );
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
}

export function crearCompra(data) {
  return request('', { method: 'POST', body: JSON.stringify(data) });
}

export function obtenerMisCompras() {
  return request('/mine');
}

export function verificarCompra(verificationId) {
  return request('/admin/verify', {
    method: 'POST',
    body: JSON.stringify({ verification_id: verificationId }),
  });
}