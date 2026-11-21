export type Role = 'admin' | 'dueno' | 'encargado' | 'secretaria';
export type Status = 'todo' | 'doing' | 'done';
export type Category = 'Campo' | 'Cosecha' | 'Ventas' | 'Logística' | 'Stock' | 'Otro';
export type Priority = 'Alta' | 'Media' | 'Baja';

export type Tool =
  | 'usuarios'
  | 'pedidos'
  | 'stock'
  | 'campo'
  | 'reportes';

export interface Task {
  id: number;
  title: string;
  description: string;
  category: Category;
  priority: Priority;
  start: string; // fecha de inicio, yyyy-mm-dd
  due: string | null; // fecha de vencimiento, yyyy-mm-dd; null = no vence
  assigneeId: number; // id del usuario asignado
  assignee: string; // nombre completo de a quién se le asignó
  assignedBy: string; // nombre completo de quién la creó/asignó
  status: Status;
}

export interface User {
  id: number;
  name: string;
  initials: string;
  role: Role;
  username: string;
  email: string;
  photo: string | null; // URL absoluta de la foto de perfil, o null si no tiene
}

export const ROLE_LABEL: Record<Role, string> = {
  admin: 'Administrador',
  dueno: 'Dueño',
  encargado: 'Encargado de campo',
  secretaria: 'Secretaría',
};

// Orden en que se muestran los roles (filtros y formulario de alta).
export const ROLES: Role[] = ['admin', 'dueno', 'encargado', 'secretaria'];

export const ROLE_DESCRIPTION: Record<Role, string> = {
  admin: 'Acceso completo, incluida la gestión de usuarios.',
  dueno: 'Ve todo el negocio: pedidos, stock, campo y reportes.',
  encargado: 'Board, stock, gestión de campo y reportes.',
  secretaria: 'Board, pedidos, stock y reportes.',
};

// Clases de la etiqueta de cada rol (mismos colores que en Figma).
export const ROLE_BADGE: Record<Role, string> = {
  admin: 'bg-darkpink text-pink',
  dueno: 'bg-textbl/10 text-textbl',
  encargado: 'bg-donesoft text-done',
  secretaria: 'bg-doingsoft text-doing',
};

// Herramientas que ve cada rol en el menú lateral (ver tabla "Herramientas por tipo de usuario" en Figma).
export const TOOLS_BY_ROLE: Record<Role, Tool[]> = {
  admin: ['usuarios', 'pedidos', 'stock', 'campo', 'reportes'],
  // Todo menos "Usuarios y roles", que es exclusivo del admin.
  dueno: ['pedidos', 'stock', 'campo', 'reportes'],
  encargado: ['stock', 'campo', 'reportes'],
  secretaria: ['pedidos', 'stock', 'reportes'],
};

export const COLUMNS: { status: Status; title: string }[] = [
  { status: 'todo', title: 'Por hacer' },
  { status: 'doing', title: 'En curso' },
  { status: 'done', title: 'Finalizadas' },
];

export const CATEGORIES: Category[] = ['Campo', 'Cosecha', 'Ventas', 'Logística', 'Stock', 'Otro'];

export const PRIORITIES: Priority[] = ['Alta', 'Media', 'Baja'];

// Solo admin y dueño pueden asignarle tareas a otra persona y eliminar tareas.
export const CAN_MANAGE_TASKS: Role[] = ['admin', 'dueno'];

// Clases de la etiqueta de cada categoría y color del punto de cada opción (mismos colores que en Figma).
export const CATEGORY_TAG: Record<Category, string> = {
  Campo: 'bg-donesoft text-done',
  Cosecha: 'bg-doingsoft text-doing',
  Ventas: 'bg-darkpink text-pink',
  Logística: 'bg-todosoft text-todo',
  Stock: 'bg-todosoft text-todo',
  Otro: 'bg-textbl/10 text-textbl',
};

export const CATEGORY_DOT: Record<Category, string> = {
  Campo: 'bg-done',
  Cosecha: 'bg-doing',
  Ventas: 'bg-pink',
  Logística: 'bg-todo',
  Stock: 'bg-todo',
  Otro: 'bg-textbl',
};

export const PRIORITY_DOT: Record<Priority, string> = { Alta: 'bg-pink', Media: 'bg-doing', Baja: 'bg-todo' };

// --- Fechas (yyyy-mm-dd, siempre en hora local) ------------------------------

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

// Hoy en formato yyyy-mm-dd (toISOString usaría UTC y de noche puede dar el día siguiente).
export function todayISO(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// "2026-11-24" -> "24 nov" (tarjetas). Si es hoy, "Hoy".
export function shortDate(iso: string): string {
  if (iso === todayISO()) return 'Hoy';
  const [, m, d] = iso.split('-').map(Number);
  return `${d} ${MONTHS[m - 1]}`;
}

// "2026-11-24" -> "24 nov 2026" (detalle de la tarea).
export function longDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

// "Germán Sola" -> "GS"; con una sola palabra, sus dos primeras letras.
export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
