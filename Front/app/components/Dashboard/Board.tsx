'use client';

import { useState } from 'react';
import { BellIcon, CalendarIcon, MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline';
import TaskCard from './TaskCard';
import { CATEGORIES, COLUMNS, Category, Status, Task, User } from './data';

const DOT: Record<Status, string> = { todo: 'bg-todo', doing: 'bg-doing', done: 'bg-done' };
const COUNT: Record<Status, string> = {
  todo: 'bg-todosoft text-todo',
  doing: 'bg-doingsoft text-doing',
  done: 'bg-donesoft text-done',
};

export default function Board({ user, tasks: initialTasks }: { user: User; tasks: Task[] }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [category, setCategory] = useState<Category | 'Todas'>('Todas');
  const [query, setQuery] = useState('');
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [overStatus, setOverStatus] = useState<Status | null>(null);

  // Mueve la tarea a otra columna. Por ahora solo en memoria.
  // TODO: llamar al backend (ej. PATCH /tareas/:id { status }) y revertir si falla.
  const moveTask = (id: number, status: Status) => {
    setTasks((prev) => {
      const task = prev.find((t) => t.id === id);
      if (!task || task.status === status) return prev;
      // Se quita y se agrega al final para que quede última en la columna destino.
      return [...prev.filter((t) => t.id !== id), { ...task, status }];
    });
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
          <button
            aria-label="Notificaciones"
            className="flex h-12 w-12 items-center justify-center rounded-[10px] border border-line bg-white"
          >
            <BellIcon className="h-5 w-5 text-textbl" strokeWidth={1.6} />
          </button>
          <button className="flex items-center gap-2 rounded-[10px] bg-pink py-3.5 pl-[18px] pr-5 text-base font-semibold text-white hover:opacity-90">
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
                <button aria-label={`Agregar tarea en ${title}`}>
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
                />
              ))}
              <button className="flex items-center justify-center gap-1.5 rounded-[10px] border border-dashed border-line py-2.5 text-sm font-medium text-muted hover:bg-white">
                <PlusIcon className="h-4 w-4" strokeWidth={1.6} />
                Agregar tarea
              </button>
            </div>
          );
        })}
      </section>
    </main>
  );
}
