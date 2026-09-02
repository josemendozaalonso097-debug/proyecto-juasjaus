const BASE = '/api/solicitudes';

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
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.detail || 'No se pudo completar la solicitud');
  }
  return data;
}

export function crearSolicitud(data) {
  return request('', { method: 'POST', body: JSON.stringify(data) });
}

export function obtenerMisSolicitudes() {
  return request('/mine');
}

export function obtenerSolicitudesAdmin(estado = '') {
  return request(`/admin${estado ? `?estado=${encodeURIComponent(estado)}` : ''}`);
}

export function actualizarSolicitudAdmin(id, data) {
  return request(`/admin/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}