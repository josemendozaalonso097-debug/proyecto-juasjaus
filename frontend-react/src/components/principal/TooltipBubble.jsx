import React, { useEffect, useState } from 'react';
import { isTooltipEnabled, TOOLTIP_PREFERENCE_EVENT } from '../../utils/preferences';

export default function TooltipBubble({ userId, stepId, label = 'Ver explicación' }) {
  const [enabled, setEnabled] = useState(() => isTooltipEnabled(userId));

  useEffect(() => {
    const refresh = (event) => {
      if (!event.detail || event.detail.userId === userId) {
        setEnabled(isTooltipEnabled(userId));
      }
    };
    window.addEventListener(TOOLTIP_PREFERENCE_EVENT, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(TOOLTIP_PREFERENCE_EVENT, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, [userId]);

  if (!enabled) return null;

  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={() => window.dispatchEvent(new CustomEvent('cbtis-open-tour', { detail: { stepId } }))}
      className="ml-auto inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/5 text-sm font-black text-primary transition-all hover:scale-105 hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary/30"
    >
      ?
    </button>
  );
}