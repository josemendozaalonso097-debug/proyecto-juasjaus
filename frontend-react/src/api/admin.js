const BASE = '/api/admin';

function authHeaders() {
  const token = localStorage.getItem('access_token');
  return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
}

async function req(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: authHeaders(),
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  if (res.status === 204) return null;
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Error en la petición');
  return data;
}

export const adminApi = {
  getStats: () => req('GET', '/stats'),

  getUsuarios: (search = '') => req('GET', `/usuarios${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  updateUsuario: (id, data) => req('PUT', `/usuarios/${id}`, data),
  deleteUsuario: (id) => req('DELETE', `/usuarios/${id}`),

  getDeudas: (estado = '') => req('GET', `/deudas${estado ? `?estado=${estado}` : ''}`),
  createDeuda: (data) => req('POST', '/deudas', data),
  updateDeuda: (id, data) => req('PUT', `/deudas/${id}`, data),
  deleteDeuda: (id) => req('DELETE', `/deudas/${id}`),

  getInventario: () => req('GET', '/inventario'),
  updateStock: (id, stock) => req('PUT', `/inventario/${id}/stock`, { stock }),

  sendNotificacion: (data) => req('POST', '/notificaciones', data),
};
