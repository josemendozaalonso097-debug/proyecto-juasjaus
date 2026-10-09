const API = '/api/customization';

function adminHeaders() {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function parseResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.detail || 'No se pudo guardar la personalización');
  return data;
}

export async function fetchCustomization(surface) {
  const response = await fetch(`${API}/${encodeURIComponent(surface)}`);
  return parseResponse(response);
}

export async function saveCustomization(surface, config) {
  const response = await fetch(`${API}/${encodeURIComponent(surface)}`, {
    method: 'PUT',
    headers: adminHeaders(),
    body: JSON.stringify(config),
  });
  return parseResponse(response);
}
