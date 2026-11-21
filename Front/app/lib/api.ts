// Cliente de la API de Lejuy (back/). La URL se configura en .env.local.
import type { Role } from '../components/Dashboard/data';

export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000').replace(/\/$/, '');

const TOKEN_KEY = 'lejuy_token';

// --- Token de sesión --------------------------------------------------------
// Con "Recordarme" va a localStorage (sobrevive al cerrar el navegador);
// sin él, a sessionStorage (se borra al cerrar la pestaña).

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string, recordar: boolean) {
  try {
    clearToken();
    (recordar ? localStorage : sessionStorage).setItem(TOKEN_KEY, token);
  } catch {
    // Almacenamiento bloqueado (modo privado estricto): la sesión no persiste.
  }
}

export function clearToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
  } catch {}
}

// --- Pedidos ----------------------------------------------------------------

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, { ...init, headers });
  } catch {
    throw new ApiError(0, 'No se pudo conectar con el servidor');
  }

  if (!res.ok) {
    // FastAPI devuelve { detail: "..." } o, en errores de validación, { detail: [...] }.
    const body = await res.json().catch(() => null);
    const detail =
      typeof body?.detail === 'string'
        ? body.detail
        : Array.isArray(body?.detail) && typeof body.detail[0]?.msg === 'string'
          ? `Dato inválido: ${body.detail[0].msg}`
          : 'Ocurrió un error inesperado';
    throw new ApiError(res.status, detail);
  }
  return (res.status === 204 ? undefined : await res.json()) as T;
}

// --- Endpoints --------------------------------------------------------------

export interface ApiUsuario {
  id: number;
  nombre_usuario: string;
  nombre_completo: string;
  rol: Role;
  email: string;
  telefono: string | null;
  foto_perfil: string | null;
  activo: boolean;
  creado_en: string;
}

export async function login(email: string, contrasena: string, recordar: boolean) {
  // El login sigue el estándar OAuth2: formulario (no JSON) con el email en el campo "username".
  const { access_token } = await request<{ access_token: string }>('/auth/login', {
    method: 'POST',
    body: new URLSearchParams({ username: email, password: contrasena }),
  });
  setToken(access_token, recordar);
}

export function getMe() {
  return request<ApiUsuario>('/auth/me');
}

// --- Usuarios (solo admin) --------------------------------------------------

export interface ApiUsuarioResumen {
  id: number;
  nombre_completo: string;
  email: string;
  rol: Role;
  creado_en: string;
  activo: boolean;
}

export interface NuevoUsuario {
  nombre_usuario: string;
  nombre_completo: string;
  email: string;
  contrasena: string;
  rol: Role;
}

export function listarUsuarios() {
  return request<ApiUsuarioResumen[]>('/usuarios');
}

export function crearUsuario(datos: NuevoUsuario) {
  return request<ApiUsuario>('/usuarios', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos),
  });
}

export function cambiarActivo(id: number, activo: boolean) {
  return request<ApiUsuario>(`/usuarios/${id}/${activo ? 'activar' : 'desactivar'}`, { method: 'PATCH' });
}
