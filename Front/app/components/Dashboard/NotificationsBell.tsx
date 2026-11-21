'use client';

import { useEffect, useRef, useState } from 'react';
import { BellIcon, CheckCircleIcon, ClockIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useTasks } from '../../dashboard/tasks';
import { CATEGORY_TAG, longDate } from './data';
import { DUE_SOON_DAYS, Urgency } from './notifications';

const URGENCY: Record<Urgency, { icon: typeof ClockIcon; badge: string; text: string; title: string }> = {
  overdue: { icon: ExclamationTriangleIcon, badge: 'bg-pink text-white', text: 'text-pink', title: 'Tarea vencida' },
  today: { icon: ClockIcon, badge: 'bg-darkpink text-pink', text: 'text-pink', title: 'Tarea por vencer' },
  soon: { icon: ClockIcon, badge: 'bg-doingsoft text-doing', text: 'text-doing', title: 'Tarea por vencer' },
};

// Campana del encabezado: contador de notificaciones sin ver y, al apretarla,
// el panel con las tareas que están por vencer.
export default function NotificationsBell({ onOpenTask }: { onOpenTask: (id: number) => void }) {
  const { notifications, unread, markAllSeen, panelOpen, setPanelOpen } = useTasks();
  // Las que eran nuevas al abrir el panel se siguen marcando como nuevas mientras esté abierto.
  const [fresh, setFresh] = useState<Set<string>>(new Set());
  const rootRef = useRef<HTMLDivElement>(null);
  const count = unread.size;

  useEffect(() => {
    if (!panelOpen) return;
    setFresh(new Set(unread));
    markAllSeen();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo al abrir el panel
  }, [panelOpen]);

  // Cerrar con Escape o con un click afuera.
  useEffect(() => {
    if (!panelOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setPanelOpen(false);
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setPanelOpen(false);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('mousedown', onDown);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('mousedown', onDown);
    };
  }, [panelOpen, setPanelOpen]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setPanelOpen(!panelOpen)}
        aria-label={count ? `Notificaciones: ${count} sin ver` : 'Notificaciones'}
        aria-expanded={panelOpen}
        aria-haspopup="dialog"
        className={`relative flex h-12 w-12 items-center justify-center rounded-[10px] border transition-colors ${
          count || panelOpen ? 'border-pink/40 bg-darkpink' : 'border-line bg-white hover:bg-lightpink'
        }`}
      >
        <BellIcon className={`h-5 w-5 ${count || panelOpen ? 'text-pink' : 'text-textbl'}`} strokeWidth={1.8} />
        {count > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-pink px-1.5 text-[11px] font-semibold leading-none text-white ring-2 ring-white">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {panelOpen && (
        // En celular, fondo oscuro detrás del panel; tocarlo lo cierra.
        <div aria-hidden="true" onClick={() => setPanelOpen(false)} className="fixed inset-0 z-30 bg-black/30 sm:hidden" />
      )}

      {panelOpen && (
        <div
          role="dialog"
          aria-label="Notificaciones"
          // En celular la campana queda a la izquierda: el panel va fijo, de borde a borde, debajo
          // de la barra superior. Desde sm se despliega bajo la campana, alineado a su derecha.
          className="fixed inset-x-3 top-[72px] z-40 flex max-h-[calc(100dvh-88px)] flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-[0_16px_40px_rgba(0,0,0,0.14)] sm:absolute sm:inset-x-auto sm:right-0 sm:top-[calc(100%+8px)] sm:max-h-none sm:w-[380px]"
        >
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-x-3 gap-y-1 border-b border-line px-4 py-3.5 sm:px-5 sm:py-4">
            <h2 className="text-base font-semibold text-textbl">Notificaciones</h2>
            <span className="text-xs text-muted">Vencen en {DUE_SOON_DAYS} días o menos</span>
          </div>

          {notifications.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-5 py-10 text-center">
              <CheckCircleIcon className="h-8 w-8 text-done" strokeWidth={1.6} />
              <p className="text-sm font-medium text-textbl">Todo al día</p>
              <p className="text-[13px] text-muted">No hay tareas por vencer.</p>
            </div>
          ) : (
            <ul className="min-h-0 flex-1 divide-y divide-line overflow-y-auto overscroll-contain sm:max-h-[420px]">
              {notifications.map(({ key, task, urgency, remaining }) => {
                const u = URGENCY[urgency];
                const isNew = fresh.has(key);
                return (
                  <li key={key}>
                    <button
                      type="button"
                      onClick={() => {
                        setPanelOpen(false);
                        onOpenTask(task.id);
                      }}
                      className={`flex w-full gap-3 px-4 py-3.5 text-left sm:px-5 sm:py-4 transition-colors hover:bg-lightpink ${
                        isNew ? 'bg-darkpink/40' : ''
                      }`}
                    >
                      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${u.badge}`}>
                        <u.icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
                      </span>
                      <span className="flex min-w-0 flex-1 flex-col gap-1">
                        <span className="flex items-center gap-2 text-xs font-medium text-muted">
                          {u.title}
                          {isNew && <span className="h-1.5 w-1.5 rounded-full bg-pink" aria-label="nueva" />}
                        </span>
                        <span className="truncate text-sm font-semibold text-textbl">{task.title}</span>
                        <span className={`text-[13px] font-semibold ${u.text}`}>{remaining}</span>
                        <span className="flex flex-wrap items-center gap-2 text-xs text-muted">
                          <span className={`rounded-full px-2 py-px font-medium ${CATEGORY_TAG[task.category]}`}>
                            {task.category}
                          </span>
                          {longDate(task.due!)} · {task.assignee}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
