export const TOOLTIP_PREFERENCE_EVENT = 'cbtis-tooltip-preference';

export function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    return null;
  }
}

export function getUserPreferences(userId) {
  if (!userId) return {};
  try {
    return JSON.parse(localStorage.getItem(`prefs_${userId}`) || '{}');
  } catch {
    return {};
  }
}

export function isTooltipEnabled(userId) {
  return Boolean(getUserPreferences(userId).tooltips);
}

export function setTooltipEnabled(userId, enabled) {
  if (!userId) return;
  const nextPrefs = { ...getUserPreferences(userId), tooltips: Boolean(enabled) };
  localStorage.setItem(`prefs_${userId}`, JSON.stringify(nextPrefs));
  window.dispatchEvent(new CustomEvent(TOOLTIP_PREFERENCE_EVENT, {
    detail: { userId, enabled: Boolean(enabled) },
  }));
}