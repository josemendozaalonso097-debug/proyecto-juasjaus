import React, { useMemo, useState } from 'react';
import { eventDateKey, formatEventDate, formatEventTime, toDateKey } from '../../utils/eventos';

const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export default function CalendarioEventos({ eventos = [], isAdmin, onCreate, onEdit, onDelete, compact = false }) {
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [selectedKey, setSelectedKey] = useState(() => toDateKey(new Date()));

  const calendarDays = useMemo(() => {
    const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
    const mondayOffset = (firstDay.getDay() + 6) % 7;
    const start = new Date(month.getFullYear(), month.getMonth(), 1 - mondayOffset);
    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      return date;
    });
  }, [month]);

  const eventsByDate = useMemo(() => eventos.reduce((groups, evento) => {
    const key = eventDateKey(evento.fecha);
    if (key) groups[key] = [...(groups[key] || []), evento];
    return groups;
  }, {}), [eventos]);

  const selectedEvents = eventsByDate[selectedKey] || [];
  const monthLabel = month.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
  const todayKey = toDateKey(new Date());

  const moveMonth = (amount) => {
    setMonth(current => new Date(current.getFullYear(), current.getMonth() + amount, 1));
  };

  const handleDayClick = (date) => {
    const key = toDateKey(date);
    setSelectedKey(key);
    if (isAdmin && eventsByDate[key]?.length === 0) onCreate?.(key);
  };

  return (
    <section className={`bg-white dark:bg-slate-800 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-slate-100 dark:border-slate-700 ${compact ? 'p-4' : 'p-5 sm:p-6'}`}>
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-xl shrink-0">
            <span className="material-symbols-outlined text-primary text-xl">calendar_month</span>
          </div>
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Calendario</h3>
            <p className="text-[11px] text-slate-400 capitalize truncate">{monthLabel}</p>
          </div>
        </div>
        {isAdmin && (
          <button
            type="button"
            onClick={() => onCreate?.(selectedKey)}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-primary text-white rounded-lg text-[11px] font-bold cursor-pointer hover:bg-red-700 transition-colors shrink-0"
          >
            <span className="material-symbols-outlined text-[15px]">add</span>
            Evento
          </button>
        )}
      </div>

      <div className="flex items-center justify-between mb-3">
        <button type="button" onClick={() => moveMonth(-1)} className="w-8 h-8 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-500 hover:text-primary cursor-pointer border-none bg-transparent" aria-label="Mes anterior">
          <span className="material-symbols-outlined text-lg">chevron_left</span>
        </button>
        <p className="text-sm font-black text-slate-700 dark:text-slate-200 capitalize">{monthLabel}</p>
        <button type="button" onClick={() => moveMonth(1)} className="w-8 h-8 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-500 hover:text-primary cursor-pointer border-none bg-transparent" aria-label="Mes siguiente">
          <span className="material-symbols-outlined text-lg">chevron_right</span>
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map(day => (
          <span key={day} className="text-[9px] font-black uppercase text-slate-400 py-1">{day}</span>
        ))}
        {calendarDays.map(date => {
          const key = toDateKey(date);
          const inMonth = date.getMonth() === month.getMonth();
          const hasEvents = Boolean(eventsByDate[key]?.length);
          const selected = key === selectedKey;
          return (
            <button
              type="button"
              key={key}
              onClick={() => handleDayClick(date)}
              className={`relative h-8 rounded-lg text-xs font-bold cursor-pointer border ${
                selected ? 'bg-primary text-white border-primary shadow-sm' :
                hasEvents ? 'bg-red-50 dark:bg-red-950/35 text-primary border-red-200 dark:border-red-900/50' :
                'bg-transparent border-transparent hover:bg-slate-100 dark:hover:bg-slate-700'
              } ${inMonth ? '' : 'opacity-30'} ${key === todayKey && !selected ? 'ring-1 ring-primary/50' : ''}`}
              aria-label={`${date.toLocaleDateString('es-MX')} ${hasEvents ? 'con eventos' : ''}`}
            >
              {date.getDate()}
              {hasEvents && <span className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${selected ? 'bg-white' : 'bg-primary'}`} />}
            </button>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60">
        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">
          {formatEventDate(selectedKey)}
        </p>
        {selectedEvents.length === 0 ? (
          <p className="text-xs text-slate-400 dark:text-slate-500">No hay eventos para este día.</p>
        ) : (
          <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
            {selectedEvents.map(event => (
              <div key={event.id} className="rounded-lg bg-red-50/70 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 px-3 py-2">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{event.titulo}</p>
                  {isAdmin && (
                    <div className="flex gap-1 shrink-0">
                      <button type="button" onClick={() => onEdit?.(event)} className="text-slate-400 hover:text-primary cursor-pointer border-none bg-transparent" aria-label="Editar evento">
                        <span className="material-symbols-outlined text-[14px]">edit</span>
                      </button>
                      <button type="button" onClick={() => onDelete?.(event.id)} className="text-slate-400 hover:text-primary cursor-pointer border-none bg-transparent" aria-label="Eliminar evento">
                        <span className="material-symbols-outlined text-[14px]">delete</span>
                      </button>
                    </div>
                  )}
                </div>
                {event.hora && <p className="text-[10px] font-bold text-primary mt-0.5">{formatEventTime(event.hora)} h</p>}
                {event.descripcion && <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{event.descripcion}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}