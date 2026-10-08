export async function submitInstitutionRequest(payload) {
  const response = await fetch('/api/institution-requests', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.detail || 'No se pudo enviar la solicitud. Intenta de nuevo.');
  }
  return data;
}
