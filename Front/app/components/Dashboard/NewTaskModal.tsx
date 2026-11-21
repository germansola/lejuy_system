'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { CalendarIcon, ChevronDownIcon, PlusIcon, UserIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { ApiUsuarioAsignable, listarAsignables } from '../../lib/api';
import {
  CAN_MANAGE_TASKS,
  CATEGORIES,
  CATEGORY_DOT,
  Category,
  PRIORITIES,
  PRIORITY_DOT,
  Priority,
  ROLE_LABEL,
  User,
  todayISO,
} from './data';

export interface NewTaskValues {
  title: string;
  description: string;
  category: Category;
  priority: Priority;
  start: string; // yyyy-mm-dd
  due: string | null; // yyyy-mm-dd, opcional
  assignee: { id: number; name: string };
}


const label = 'text-sm font-medium text-textbl';
const help = 'text-xs text-muted';
const box =
  'flex h-12 items-center gap-2.5 rounded-[10px] border bg-white px-3.5 focus-within:border-pink';
const input = 'w-full bg-transparent text-[15px] text-textbl outline-none placeholder:text-muted';

interface Props {
  open: boolean;
  currentUser: User;
  columnTitle: string;
  onClose: () => void;
  onCreate: (v: NewTaskValues) => Promise<void>; // si falla, el modal muestra el error y queda abierto
}

export default function NewTaskModal({ open, currentUser, columnTitle, onClose, onCreate }: Props) {
  const canAssign = CAN_MANAGE_TASKS.includes(currentUser.role);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category | null>(null);
  const [priority, setPriority] = useState<Priority>('Media');
  const [start, setStart] = useState(todayISO);
  const [due, setDue] = useState('');
  const [assigneeId, setAssigneeId] = useState(currentUser.id);
  const [people, setPeople] = useState<ApiUsuarioAsignable[] | null>(null);
  const [peopleError, setPeopleError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  // Ref para que el efecto no dependa de onClose (si el padre pasa una función nueva
  // en cada render, el formulario se reiniciaría mientras el usuario escribe).
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // Cada vez que se abre, el formulario arranca limpio y con la fecha de inicio en hoy.
  useEffect(() => {
    if (!open) return;
    setTitle('');
    setDescription('');
    setCategory(null);
    setPriority('Media');
    setStart(todayISO());
    setDue('');
    setAssigneeId(currentUser.id);
    setSubmitted(false);
    setSaving(false);
    setSaveError(null);
    titleRef.current?.focus();

    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onCloseRef.current();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, currentUser.id]);

  // La lista de personas se pide una sola vez, la primera vez que se abre el modal.
  useEffect(() => {
    if (!open || !canAssign || people) return;
    let cancelled = false;
    setPeopleError(null);
    listarAsignables()
      .then((list) => !cancelled && setPeople(list))
      .catch((e: unknown) => {
        if (!cancelled) setPeopleError(e instanceof Error ? e.message : 'No se pudo cargar la lista de usuarios');
      });
    return () => {
      cancelled = true;
    };
  }, [open, canAssign, people]);

  if (!open) return null;

  const titleError = submitted && !title.trim() ? 'Escribí un título para la tarea.' : null;
  const categoryError = submitted && !category ? 'Elegí una etiqueta.' : null;
  const startError = submitted && !start ? 'Elegí una fecha de inicio.' : null;
  const dueError = submitted && due && start && due < start ? 'No puede ser anterior a la fecha de inicio.' : null;
  const hasErrors = !!(titleError || categoryError || startError || dueError);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setSubmitted(true);
    const t = title.trim();
    if (!t || !category || !start || (due && due < start)) return;
    const chosen = people?.find((p) => p.id === assigneeId);
    const assignee = chosen ? { id: chosen.id, name: chosen.nombre_completo } : { id: currentUser.id, name: currentUser.name };
    setSaving(true);
    setSaveError(null);
    try {
      await onCreate({ title: t, description: description.trim(), category, priority, start, due: due || null, assignee });
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'No se pudo crear la tarea');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#1f1a1a]/45 p-4 sm:items-center sm:py-10"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <form
        onSubmit={submit}
        noValidate
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-task-title"
        className="w-full max-w-[640px] overflow-hidden rounded-2xl bg-white shadow-[0_24px_48px_rgba(0,0,0,0.18)]"
      >
        <header className="flex items-center gap-3.5 border-b border-line px-5 pb-5 pt-6 sm:px-7">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-darkpink">
            <PlusIcon className="h-[22px] w-[22px] text-pink" strokeWidth={1.6} />
          </span>
          <div className="min-w-0 flex-1">
            <h2 id="new-task-title" className="text-xl font-semibold text-textbl">
              Nueva tarea
            </h2>
            <p className="text-[13px] text-muted">
              Completá los datos. La tarea se agrega en la columna «{columnTitle}».
            </p>
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

        <div className="flex flex-col gap-5 px-5 py-6 sm:px-7">
          {submitted && hasErrors && (
            <p className="rounded-[10px] bg-darkpink px-4 py-2.5 text-sm font-medium text-pink">
              Faltan datos o hay errores: revisá los campos marcados.
            </p>
          )}

          <label className="flex flex-col gap-2">
            <span className={label}>Título</span>
            <span className={`${box} ${titleError ? 'border-pink' : 'border-line'}`}>
              <input
                ref={titleRef}
                className={input}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej. Preparar lote 3 para siembra"
                maxLength={120}
                aria-invalid={!!titleError}
              />
            </span>
            {titleError && <span className="text-xs text-pink">{titleError}</span>}
          </label>

          <label className="flex flex-col gap-2">
            <span className={label}>Descripción</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Agregá detalles para quien la tenga que hacer…"
              maxLength={500}
              rows={4}
              className="resize-none rounded-[10px] border border-line bg-white px-3.5 py-3 text-[15px] text-textbl outline-none placeholder:text-muted focus:border-pink"
            />
            <span className={help}>Opcional · hasta 500 caracteres</span>
          </label>

          <fieldset className="flex flex-col gap-2.5">
            <legend className={`${label} mb-2.5`}>Etiqueta</legend>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((c) => {
                const selected = category === c;
                return (
                  <button
                    key={c}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setCategory(c)}
                    className={`flex items-center gap-2 rounded-full py-2 pl-2.5 pr-3 text-sm transition-colors ${
                      selected
                        ? 'border-[1.5px] border-pink bg-darkpink font-semibold text-pink'
                        : 'border border-line bg-white font-medium text-textbl hover:bg-lightpink'
                    }`}
                  >
                    <span className={`h-2 w-2 rounded-full ${CATEGORY_DOT[c]}`} />
                    {c}
                  </button>
                );
              })}
            </div>
            {categoryError && <span className="text-xs text-pink">{categoryError}</span>}
          </fieldset>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-4">
            <label className="flex flex-col gap-2">
              <span className={label}>Fecha de inicio</span>
              <span className={`${box} ${startError ? 'border-pink' : 'border-line'}`}>
                <CalendarIcon className="h-[18px] w-[18px] shrink-0 text-muted" strokeWidth={1.6} />
                <input type="date" className={input} value={start} onChange={(e) => setStart(e.target.value)} />
              </span>
              <span className={startError ? 'text-xs text-pink' : help}>
                {startError ?? 'Por defecto es hoy. Podés cambiarla.'}
              </span>
            </label>

            <label className="flex flex-col gap-2">
              <span className={label}>Fecha de vencimiento (opcional)</span>
              <span className={`${box} ${dueError ? 'border-pink' : 'border-line'}`}>
                <CalendarIcon className="h-[18px] w-[18px] shrink-0 text-muted" strokeWidth={1.6} />
                <input
                  type="date"
                  className={`${input} ${due ? '' : 'text-muted'}`}
                  value={due}
                  min={start || undefined}
                  onChange={(e) => setDue(e.target.value)}
                />
              </span>
              <span className={dueError ? 'text-xs text-pink' : help}>
                {dueError ?? 'Si la dejás vacía, la tarea no vence.'}
              </span>
            </label>
          </div>

          <fieldset className="flex flex-col gap-2.5">
            <legend className={`${label} mb-2.5`}>Prioridad</legend>
            <div className="grid grid-cols-3 gap-2.5">
              {PRIORITIES.map((p) => {
                const selected = priority === p;
                return (
                  <button
                    key={p}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setPriority(p)}
                    className={`flex h-[46px] items-center justify-center gap-2 rounded-[10px] text-[15px] transition-colors ${
                      selected
                        ? 'border-[1.5px] border-pink bg-darkpink font-semibold text-pink'
                        : 'border border-line bg-white font-medium text-textbl hover:bg-lightpink'
                    }`}
                  >
                    <span className={`h-2.5 w-2.5 rounded-full ${PRIORITY_DOT[p]}`} />
                    {p}
                  </button>
                );
              })}
            </div>
          </fieldset>

          {canAssign && (
            <label className="flex flex-col gap-2">
              <span className={label}>Asignar a</span>
              <span className={`${box} relative border-line`}>
                <UserIcon className="h-[18px] w-[18px] shrink-0 text-muted" strokeWidth={1.6} />
                <select
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(Number(e.target.value))}
                  disabled={!people}
                  className={`${input} cursor-pointer appearance-none pr-6 disabled:cursor-wait`}
                >
                  <option value={currentUser.id}>{currentUser.name} (vos)</option>
                  {people
                    ?.filter((p) => p.id !== currentUser.id)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombre_completo} · {ROLE_LABEL[p.rol]}
                      </option>
                    ))}
                </select>
                <ChevronDownIcon
                  className="pointer-events-none absolute right-3.5 h-[18px] w-[18px] text-muted"
                  strokeWidth={1.6}
                />
              </span>
              <span className={peopleError ? 'text-xs text-pink' : help}>
                {peopleError
                  ? `${peopleError}. Por ahora se te asigna a vos.`
                  : people
                    ? 'Por defecto te la asignás a vos.'
                    : 'Cargando usuarios…'}
              </span>
            </label>
          )}
        </div>

        <footer className="flex items-center gap-3 border-t border-line bg-lightpink px-5 pb-[22px] pt-[18px] sm:px-7">
          {saveError ? (
            <p role="alert" className="flex-1 text-[13px] font-medium text-pink">
              No se pudo crear la tarea: {saveError}
            </p>
          ) : (
            <p className="hidden flex-1 text-[13px] text-muted sm:block">Obligatorios: título, etiqueta y prioridad.</p>
          )}
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-[10px] border border-line bg-white px-5 py-3.5 text-[15px] font-semibold text-textbl hover:bg-lightpink sm:flex-none"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex flex-1 items-center justify-center gap-2 rounded-[10px] bg-pink py-3.5 pl-[18px] pr-[22px] text-[15px] font-semibold text-white hover:opacity-90 disabled:opacity-60 sm:flex-none"
          >
            <PlusIcon className="h-[18px] w-[18px]" strokeWidth={2} />
            {saving ? 'Creando…' : 'Crear tarea'}
          </button>
        </footer>
      </form>
    </div>
  );
}
