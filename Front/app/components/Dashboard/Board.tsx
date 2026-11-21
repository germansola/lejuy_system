'use client';

import { useEffect, useState } from 'react';
import { CalendarIcon, MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useTasks } from '../../dashboard/tasks';
import { cambiarEstadoTarea, crearTarea, eliminarTarea } from '../../lib/api';
import NotificationsBell from './NotificationsBell';
import TaskCard from './TaskCard';
import NewTaskModal, { NewTaskValues } from './NewTaskModal';
import TaskDetailModal from './TaskDetailModal';
import { CAN_MANAGE_TASKS, CATEGORIES, COLUMNS, Category, Status, User } from './data';

const DOT: Record<Status, string> = { todo: 'bg-todo', doing: 'bg-doing', done: 'bg-done' };
const COUNT: Record<Status, string> = {
  todo: 'bg-todosoft text-todo',
  doing: 'bg-doingsoft text-doing',
  done: 'bg-donesoft text-done',
};

export default function Board({ user }: { user: User }) {
  const { tasks, setTasks, loading, loadError, reload } = useTasks();
  // Error al mover una tarea, que se muestra arriba del board.
  const [actionError, setActionError] = useState<string | null>(null);
  const errorText = (e: unknown) => (e instanceof Error ? e.message : 'Ocurrió un error inesperado');
  const [category, setCategory] = useState<Category | 'Todas'>('Todas');
  const [query, setQuery] = useState('');
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [overStatus, setOverStatus] = useState<Status | null>(null);
  const canManage = CAN_MANAGE_TASKS.includes(user.role);
  // Columna en la que se crea la tarea nueva; null = modal cerrado.
  const [newIn, setNewIn] = useState<Status | null>(null);

  // Crea la tarea en la API y la agrega al final de la columna elegida.
  // Si falla, el error sube al modal (que queda abierto con lo que se escribió).
  const createTask = async (v: NewTaskValues) => {
    if (!newIn) return;
    const task = await crearTarea({
      titulo: v.title,
      descripcion: v.description,
      categoria: v.category,
      prioridad: v.priority,
      estado: newIn,
      fecha_inicio: v.start,
      fecha_vencimiento: v.due,
      asignado_a_id: v.assignee.id,
    });
    // Admin y dueño ven todas; el resto solo ve la tarea si quedó asignada a sí mismo.
    if (canManage || task.assigneeId === user.id) setTasks((prev) => [...prev, task]);
    setNewIn(null);
  };

  // Tarea abierta en el modal de detalle.
  const [openId, setOpenId] = useState<number | null>(null);
  const openTask = tasks.find((t) => t.id === openId) ?? null;

  // Desde otra página, una notificación trae acá con ?tarea=<id> para abrir su detalle.
  useEffect(() => {
    const id = Number(new URLSearchParams(window.location.search).get('tarea'));
    if (id) {
      setOpenId(id);
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);

  // Elimina en la API (solo admin y dueño) y recién ahí la saca del board.
  // Si falla, el error lo muestra el modal de detalle.
  const deleteTask = async (id: number) => {
    if (!canManage) return;
    await eliminarTarea(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setOpenId(null);
  };

  // Mueve la tarea a otra columna. Se ve el cambio al instante y, si la API lo rechaza,
  // vuelve a su columna original.
  const moveTask = async (id: number, status: Status) => {
    const task = tasks.find((t) => t.id === id);
    if (!task || task.status === status) return;
    setActionError(null);
    // Se quita y se agrega al final para que quede última en la columna destino.
    setTasks((prev) => [...prev.filter((t) => t.id !== id), { ...task, status }]);
    try {
      await cambiarEstadoTarea(id, status);
    } catch (e) {
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: task.status } : t)));
      setActionError(`No se pudo mover la tarea: ${errorText(e)}`);
    }
  };

  const endDrag = () => {
    setDraggingId(null);
    setOverStatus(null);
  };

  const q = query.trim().toLowerCase();
  const visible = tasks.filter(
    (t) =>
      (category === 'Todas' || t.category === category) &&
      (!q || t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)),
  );

  return (
    <main className="flex min-w-0 flex-1 flex-col gap-6 px-4 py-6 sm:px-9 sm:py-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-base text-muted">Hola, {user.name.split(' ')[0]}</p>
          <h1 className="text-[34px] font-semibold leading-tight text-textbl">Board de tareas</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex h-12 w-full items-center gap-2 rounded-[10px] border border-line bg-white px-3.5 sm:w-80">
            <MagnifyingGlassIcon className="h-[18px] w-[18px] text-muted" strokeWidth={1.6} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar tareas…"
              className="w-full bg-transparent text-base text-textbl outline-none placeholder:text-muted"
            />
          </label>
          <NotificationsBell onOpenTask={setOpenId} />
          <button
            onClick={() => setNewIn('todo')}
            className="flex items-center gap-2 rounded-[10px] bg-pink py-3.5 pl-[18px] pr-5 text-base font-semibold text-white hover:opacity-90"
          >
            <PlusIcon className="h-[18px] w-[18px]" strokeWidth={2} />
            Nueva tarea
          </button>
        </div>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {(['Todas', ...CATEGORIES] as const).map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`rounded-full px-3.5 py-[7px] text-sm font-medium transition-colors ${
                category === c ? 'bg-textbl text-white' : 'border border-line bg-white text-textbl hover:bg-lightpink'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <span className="flex items-center gap-2 text-sm font-medium text-muted">
          <CalendarIcon className="h-4 w-4" strokeWidth={1.6} />
          Sprint 12 · 18 nov – 1 dic
        </span>
      </div>

      {actionError && (
        <p role="alert" className="flex items-center justify-between gap-3 rounded-xl border border-pink/40 bg-darkpink px-4 py-3 text-sm font-medium text-pink">
          {actionError}
          <button type="button" onClick={() => setActionError(null)} className="text-xs font-semibold underline">
            Cerrar
          </button>
        </p>
      )}

      {loadError ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-2xl border border-line bg-white/60 px-4 py-16 text-center">
          <p className="text-base text-textbl">No se pudieron cargar las tareas: {loadError}</p>
          <button type="button" onClick={reload} className="rounded-full bg-pink px-6 py-2 font-medium text-white hover:opacity-90">
            Reintentar
          </button>
        </div>
      ) : loading ? (
        <div className="flex flex-1 items-center justify-center rounded-2xl border border-line bg-white/60 py-16">
          <p className="text-muted">Cargando tareas…</p>
        </div>
      ) : (
      <section className="grid flex-1 grid-cols-1 gap-5 lg:grid-cols-3">
        {COLUMNS.map(({ status, title }) => {
          const items = visible.filter((t) => t.status === status);
          return (
            <div
              key={status}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                if (overStatus !== status) setOverStatus(status);
              }}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node)) setOverStatus(null);
              }}
              onDrop={(e) => {
                e.preventDefault();
                const id = Number(e.dataTransfer.getData('text/plain'));
                if (id) moveTask(id, status);
                endDrag();
              }}
              className={`flex flex-col gap-3 rounded-2xl border px-3.5 py-4 transition-colors ${
                overStatus === status ? 'border-pink bg-darkpink/60' : 'border-line bg-white/60'
              }`}
            >
              <div className="flex items-center justify-between px-1 pb-1">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${DOT[status]}`} />
                  <h2 className="text-lg font-semibold text-textbl">{title}</h2>
                  <span className={`rounded-full px-2 py-px text-xs font-semibold ${COUNT[status]}`}>{items.length}</span>
                </div>
                <button aria-label={`Agregar tarea en ${title}`} onClick={() => setNewIn(status)}>
                  <PlusIcon className="h-[18px] w-[18px] text-muted" strokeWidth={1.6} />
                </button>
              </div>
              {items.map((t) => (
                <TaskCard
                  key={t.id}
                  task={t}
                  dragging={draggingId === t.id}
                  onDragStart={setDraggingId}
                  onDragEnd={endDrag}
                  onOpen={setOpenId}
                />
              ))}
              <button
                onClick={() => setNewIn(status)}
                className="flex items-center justify-center gap-1.5 rounded-[10px] border border-dashed border-line py-2.5 text-sm font-medium text-muted hover:bg-white"
              >
                <PlusIcon className="h-4 w-4" strokeWidth={1.6} />
                Agregar tarea
              </button>
            </div>
          );
        })}
      </section>
      )}

      <NewTaskModal
        open={newIn !== null}
        currentUser={user}
        columnTitle={COLUMNS.find((c) => c.status === newIn)?.title ?? 'Por hacer'}
        onClose={() => setNewIn(null)}
        onCreate={createTask}
      />

      <TaskDetailModal task={openTask} canDelete={canManage} onClose={() => setOpenId(null)} onDelete={deleteTask} />
    </main>
  );
}
