export type Role = 'admin' | 'dueno' | 'encargado' | 'secretaria';
export type Status = 'todo' | 'doing' | 'done';
export type Category = 'Campo' | 'Cosecha' | 'Ventas' | 'Logística' | 'Stock';
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
  due: string;
  assignee: string;
  status: Status;
}

export interface User {
  id: number;
  name: string;
  initials: string;
  role: Role;
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

export const CATEGORIES: Category[] = ['Campo', 'Cosecha', 'Ventas', 'Logística', 'Stock'];

// "Germán Sola" -> "GS"; con una sola palabra, sus dos primeras letras.
export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Tareas de ejemplo hasta que exista su tabla en el backend.

export const TASKS: Task[] = [
  { id: 1, status: 'todo', category: 'Campo', priority: 'Alta', title: 'Preparar lote 3 para siembra', description: 'Rastrear y nivelar el suelo antes del jueves.', due: '24 nov', assignee: 'JM' },
  { id: 2, status: 'todo', category: 'Logística', priority: 'Media', title: 'Coordinar flete a San Salvador', description: 'Confirmar camión para 40 bolsas de poroto alubia.', due: '26 nov', assignee: 'LR' },
  { id: 3, status: 'todo', category: 'Ventas', priority: 'Media', title: 'Actualizar lista de precios', description: 'Ajustar precios de poroto negro y colorado.', due: '28 nov', assignee: 'GS' },
  { id: 4, status: 'todo', category: 'Stock', priority: 'Baja', title: 'Inventario del depósito', description: 'Contar bolsas por variedad y registrar mermas.', due: '29 nov', assignee: 'AT' },
  { id: 5, status: 'doing', category: 'Cosecha', priority: 'Alta', title: 'Cosecha de poroto alubia – lote 1', description: 'Avance del 60 %. Faltan 4 hectáreas.', due: 'Hoy', assignee: 'JM' },
  { id: 6, status: 'doing', category: 'Ventas', priority: 'Alta', title: 'Pedido de Distribuidora Norte', description: 'Preparar 120 bolsas de 25 kg para el envío.', due: '22 nov', assignee: 'LR' },
  { id: 7, status: 'doing', category: 'Campo', priority: 'Media', title: 'Reparar bomba de riego', description: 'Esperando el repuesto del proveedor.', due: '23 nov', assignee: 'AT' },
  { id: 8, status: 'done', category: 'Campo', priority: 'Media', title: 'Fumigación del lote 2', description: 'Completada sin novedades.', due: '18 nov', assignee: 'JM' },
  { id: 9, status: 'done', category: 'Logística', priority: 'Baja', title: 'Entrega en Palpalá', description: '60 bolsas entregadas y firmadas.', due: '17 nov', assignee: 'LR' },
  { id: 10, status: 'done', category: 'Ventas', priority: 'Media', title: 'Facturación de octubre', description: 'Facturas emitidas y enviadas.', due: '15 nov', assignee: 'GS' },
];
