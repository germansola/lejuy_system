import { CalendarIcon } from '@heroicons/react/24/outline';
import { CATEGORY_TAG, Task, initialsOf, shortDate } from './data';

interface Props {
  task: Task;
  dragging?: boolean;
  onDragStart?: (id: number) => void;
  onDragEnd?: () => void;
  onOpen?: (id: number) => void;
}

export default function TaskCard({ task, dragging = false, onDragStart, onDragEnd, onOpen }: Props) {
  return (
    <article
      draggable={!!onDragStart}
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', String(task.id));
        e.dataTransfer.effectAllowed = 'move';
        onDragStart?.(task.id);
      }}
      onDragEnd={onDragEnd}
      // Un click sin arrastrar abre el detalle; el navegador no dispara click al terminar un drag.
      onClick={() => onOpen?.(task.id)}
      onKeyDown={(e) => {
        if (onOpen && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onOpen(task.id);
        }
      }}
      tabIndex={onOpen ? 0 : undefined}
      role={onOpen ? 'button' : undefined}
      aria-label={onOpen ? `Ver detalle de «${task.title}»` : undefined}
      className={`flex cursor-grab flex-col gap-3 rounded-xl border border-line bg-white p-[18px] shadow-[0_2px_6px_rgba(0,0,0,0.04)] outline-none transition hover:border-pink/40 focus-visible:border-pink active:cursor-grabbing ${
        dragging ? 'opacity-40' : task.status === 'done' ? 'opacity-80' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <span className={`rounded-full px-2.5 py-[3px] text-xs font-medium ${CATEGORY_TAG[task.category]}`}>
          {task.category}
        </span>
        <span className={`text-xs font-medium ${task.priority === 'Alta' ? 'text-pink' : 'text-muted'}`}>
          Prioridad {task.priority.toLowerCase()}
        </span>
      </div>
      <h3 className="text-base font-semibold text-textbl">{task.title}</h3>
      {task.description && <p className="line-clamp-2 text-[13px] leading-5 text-muted">{task.description}</p>}
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-[13px] text-muted">
          <CalendarIcon className="h-3.5 w-3.5" strokeWidth={1.6} />
          {task.due ? shortDate(task.due) : 'Sin vencimiento'}
        </span>
        <span
          title={task.assignee}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-pink text-[11px] font-semibold text-white"
        >
          {initialsOf(task.assignee)}
        </span>
      </div>
    </article>
  );
}
