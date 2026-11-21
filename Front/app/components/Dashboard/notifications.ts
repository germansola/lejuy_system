import { CAN_MANAGE_TASKS, Task, User } from './data';

// Avisa de las tareas sin terminar que vencen dentro de esta cantidad de días (o que ya vencieron).
export const DUE_SOON_DAYS = 3;

export type Urgency = 'overdue' | 'today' | 'soon';

export interface DueNotification {
  key: string; // id de tarea + fecha: si cambia el vencimiento, vuelve a avisar
  task: Task;
  urgency: Urgency;
  remaining: string; // ej. "Vence hoy · quedan 5 h"
}

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

// El vencimiento es un día completo: la tarea vence al terminar ese día (hora local).
function endOfDay(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d, 23, 59, 59, 999);
}

// Días calendario entre hoy y la fecha (0 = hoy, 1 = mañana, -1 = ayer).
function daysUntil(iso: string, now: Date): number {
  const [y, m, d] = iso.split('-').map(Number);
  const target = Date.UTC(y, m - 1, d);
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((target - today) / DAY);
}

function remainingText(iso: string, now: Date): { urgency: Urgency; remaining: string } {
  const days = daysUntil(iso, now);
  if (days < 0) {
    return { urgency: 'overdue', remaining: days === -1 ? 'Venció ayer' : `Venció hace ${-days} días` };
  }
  if (days === 0) {
    const ms = endOfDay(iso).getTime() - now.getTime();
    const left = ms >= HOUR ? `quedan ${Math.floor(ms / HOUR)} h` : `quedan ${Math.max(1, Math.ceil(ms / 60000))} min`;
    return { urgency: 'today', remaining: `Vence hoy · ${left}` };
  }
  if (days === 1) return { urgency: 'soon', remaining: 'Vence mañana · queda 1 día' };
  return { urgency: 'soon', remaining: `Vence en ${days} días` };
}

// Admin y dueño ven las de todos; el resto, solo las que tiene asignadas.
export function dueNotifications(tasks: Task[], user: User, now: Date): DueNotification[] {
  const seesAll = CAN_MANAGE_TASKS.includes(user.role);
  return tasks
    .filter((t) => t.status !== 'done' && t.due && (seesAll || t.assigneeId === user.id))
    .filter((t) => daysUntil(t.due!, now) <= DUE_SOON_DAYS)
    .sort((a, b) => a.due!.localeCompare(b.due!))
    .map((t) => ({ key: `${t.id}:${t.due}`, task: t, ...remainingText(t.due!, now) }));
}
