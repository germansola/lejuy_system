'use client';

import { ReactNode, useEffect, useRef, useState } from 'react';
import {
  CalendarIcon,
  ExclamationTriangleIcon,
  FlagIcon,
  TrashIcon,
  UserIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { CATEGORY_TAG, COLUMNS, PRIORITY_DOT, Status, Task, initialsOf, longDate, todayISO } from './data';

const STATUS_DOT: Record<Status, string> = { todo: 'bg-todo', doing: 'bg-doing', done: 'bg-done' };

interface Props {
  task: Task | null; // null = modal cerrado
  canDelete: boolean;
  onClose: () => void;
  onDelete: (id: number) => Promise<void>; // si falla, el modal muestra el error
}

function Info({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5 rounded-xl border border-line bg-white px-4 py-3">
      <span className="flex items-center gap-1.5 text-xs font-medium text-muted">
        {icon}
        {label}
      </span>
      <div className="text-[15px] font-medium text-textbl">{children}</div>
    </div>
  );
}

function Person({ name }: { name: string }) {
  return (
    <span className="flex items-center gap-2.5">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-pink text-[10px] font-semibold text-white">
        {initialsOf(name)}
      </span>
      <span className="truncate">{name}</span>
    </span>
  );
}

export default function TaskDetailModal({ task, canDelete, onClose, onDelete }: Props) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const open = task !== null;

  useEffect(() => {
    if (!open) return;
    setConfirming(false);
    setDeleting(false);
    setDeleteError(null);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onCloseRef.current();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, task?.id]);

  if (!task) return null;

  const icon = 'h-3.5 w-3.5';
  const overdue = task.due !== null && task.due < todayISO() && task.status !== 'done';
  const statusTitle = COLUMNS.find((c) => c.status === task.status)?.title;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#1f1a1a]/45 p-4 sm:items-center sm:py-10"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-detail-title"
        className="w-full max-w-[560px] overflow-hidden rounded-2xl bg-white shadow-[0_24px_48px_rgba(0,0,0,0.18)]"
      >
        <header className="flex items-start gap-3 border-b border-line px-5 pb-5 pt-6 sm:px-7">
          <div className="flex min-w-0 flex-1 flex-col gap-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-2.5 py-[3px] text-xs font-medium ${CATEGORY_TAG[task.category]}`}>
                {task.category}
              </span>
              <span className="flex items-center gap-1.5 rounded-full border border-line px-2.5 py-[3px] text-xs font-medium text-textbl">
                <span className={`h-2 w-2 rounded-full ${STATUS_DOT[task.status]}`} />
                {statusTitle}
              </span>
            </div>
            <h2 id="task-detail-title" className="text-xl font-semibold leading-snug text-textbl">
              {task.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-line bg-white hover:bg-lightpink"
          >
            <XMarkIcon className="h-[18px] w-[18px] text-textbl" strokeWidth={1.6} />
          </button>
        </header>

        <div className="flex flex-col gap-5 bg-lightpink px-5 py-6 sm:px-7">
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-textbl">Descripción</span>
            <p className={`whitespace-pre-line text-[15px] leading-6 ${task.description ? 'text-textbl' : 'text-muted'}`}>
              {task.description || 'Sin descripción.'}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Info icon={<UserIcon className={icon} strokeWidth={1.8} />} label="Asignada a">
              <Person name={task.assignee} />
            </Info>
            <Info icon={<UserIcon className={icon} strokeWidth={1.8} />} label="Asignada por">
              <Person name={task.assignedBy} />
            </Info>
            <Info icon={<CalendarIcon className={icon} strokeWidth={1.8} />} label="Fecha de inicio">
              {longDate(task.start)}
            </Info>
            <Info icon={<CalendarIcon className={icon} strokeWidth={1.8} />} label="Fecha de vencimiento">
              {task.due ? (
                <span className={`flex flex-wrap items-center gap-2 ${overdue ? 'text-pink' : ''}`}>
                  {longDate(task.due)}
                  {overdue && (
                    <span className="rounded-full bg-darkpink px-2 py-px text-xs font-semibold text-pink">Vencida</span>
                  )}
                </span>
              ) : (
                <span className="text-muted">Sin vencimiento</span>
              )}
            </Info>
            <Info icon={<FlagIcon className={icon} strokeWidth={1.8} />} label="Prioridad">
              <span className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${PRIORITY_DOT[task.priority]}`} />
                {task.priority}
              </span>
            </Info>
          </div>
        </div>

        <footer className="flex flex-wrap items-center gap-3 border-t border-line px-5 pb-[22px] pt-[18px] sm:px-7">
          {confirming ? (
            <>
              <p className="flex min-w-[200px] flex-1 items-center gap-2 text-sm font-medium text-pink">
                <ExclamationTriangleIcon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.8} />
                {deleteError ? `No se pudo eliminar: ${deleteError}` : '¿Eliminar esta tarea? No se puede deshacer.'}
              </p>
              <button
                type="button"
                onClick={() => {
                  setConfirming(false);
                  setDeleteError(null);
                }}
                className="rounded-[10px] border border-line bg-white px-5 py-3 text-[15px] font-semibold text-textbl hover:bg-lightpink"
              >
                Cancelar
              </button>
              <button
                type="button"
                autoFocus
                disabled={deleting}
                onClick={async () => {
                  setDeleting(true);
                  setDeleteError(null);
                  try {
                    await onDelete(task.id); // si sale bien, el board cierra el modal
                  } catch (e) {
                    setDeleteError(e instanceof Error ? e.message : 'Ocurrió un error inesperado');
                  } finally {
                    setDeleting(false);
                  }
                }}
                className="flex items-center gap-2 rounded-[10px] bg-pink px-5 py-3 text-[15px] font-semibold text-white hover:opacity-90 disabled:opacity-60"
              >
                <TrashIcon className="h-[18px] w-[18px]" strokeWidth={1.8} />
                {deleting ? 'Eliminando…' : 'Sí, eliminar'}
              </button>
            </>
          ) : (
            <>
              {canDelete && (
                <button
                  type="button"
                  onClick={() => setConfirming(true)}
                  className="flex items-center gap-2 rounded-[10px] border border-pink/40 bg-white px-4 py-3 text-[15px] font-semibold text-pink hover:bg-darkpink"
                >
                  <TrashIcon className="h-[18px] w-[18px]" strokeWidth={1.8} />
                  Eliminar tarea
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="ml-auto rounded-[10px] bg-textbl px-6 py-3 text-[15px] font-semibold text-white hover:opacity-90"
              >
                Cerrar
              </button>
            </>
          )}
        </footer>
      </section>
    </div>
  );
}
