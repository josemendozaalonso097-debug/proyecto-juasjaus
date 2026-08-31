const MONTHS = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

export function eventDateKey(value) {
  if (!value) return null;
  const text = String(value).trim();
  const isoMatch = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;

  const spanishMatch = text.toLowerCase().match(/(\d{1,2})\s*(?:de\s*)?([a-záéíóú]+)(?:\s*de\s*(\d{4}))?/i);
  if (spanishMatch) {
    const month = MONTHS.indexOf(spanishMatch[2].normalize('NFD').replace(/[\u0300-\u036f]/g, ''));
    if (month !== -1) {
      const year = spanishMatch[3] || new Date().getFullYear();
      return `${year}-${String(month + 1).padStart(2, '0')}-${String(Number(spanishMatch[1])).padStart(2, '0')}`;
    }
  }

  const parsed = new Date(text);
  if (Number.isNaN(parsed.getTime())) return null;
  return toDateKey(parsed);
}

export function toDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function formatEventDate(value) {
  const key = eventDateKey(value);
  if (!key) return value || 'Fecha pendiente';
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatEventTime(value) {
  if (!value) return '';
  return String(value).slice(0, 5);
}