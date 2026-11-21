'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { LockClosedIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import NotificationsBell from '../NotificationsBell';
import { useUser } from '../../../dashboard/session';
import { ApiError, ApiUsuarioResumen, cambiarActivo, crearUsuario, listarUsuarios } from '../../../lib/api';
import { ROLES, ROLE_LABEL, Role } from '../data';
import NewUserForm, { NewUserValues } from './NewUserForm';
import UsersTable from './UsersTable';

// El back pide un nombre de usuario; lo sacamos del email ("jmamani@lejuy.com.ar" -> "jmamani").
function usernameFromEmail(email: string, suffix = ''): string {
  const local = email.split('@')[0].toLowerCase().replace(/[^a-z0-9_.-]/g, '');
  return (local.padEnd(3, '0').slice(0, 50 - suffix.length) + suffix);
}

export default function UsersAdmin() {
  const me = useUser();
  const router = useRouter();
  const [users, setUsers] = useState<ApiUsuarioResumen[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<Role | 'todos'>('todos');
  const [rowError, setRowError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoadError(null);
    listarUsuarios()
      .then(setUsers)
      .catch((e: unknown) => setLoadError(e instanceof Error ? e.message : 'No se pudo cargar la lista'));
  }, []);

  useEffect(() => {
    if (me.role === 'admin') load();
  }, [me.role, load]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (users ?? []).filter(
      (u) =>
        (roleFilter === 'todos' || u.rol === roleFilter) &&
        (!q || u.nombre_completo.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)),
    );
  }, [users, query, roleFilter]);

  // Devuelve un mensaje de error, o null si salió bien.
  const handleCreate = async (v: NewUserValues): Promise<string | null> => {
    // Si el nombre de usuario derivado del email ya existe, se reintenta con un sufijo numérico.
    for (let intento = 0; intento < 3; intento++) {
      const suffix = intento === 0 ? '' : String(Math.floor(10 + Math.random() * 90));
      try {
        await crearUsuario({
          nombre_usuario: usernameFromEmail(v.email, suffix),
          nombre_completo: v.nombre,
          email: v.email,
          contrasena: v.contrasena,
          rol: v.rol,
        });
        load();
        return null;
      } catch (e) {
        const usernameTaken = e instanceof ApiError && e.status === 409 && e.message.includes('nombre de usuario');
        if (!usernameTaken) return e instanceof Error ? e.message : 'No se pudo crear el usuario';
      }
    }
    return 'No se pudo generar un nombre de usuario libre. Probá con otro email.';
  };

  const toggleActive = async (u: ApiUsuarioResumen) => {
    setRowError(null);
    try {
      await cambiarActivo(u.id, !u.activo);
      setUsers((prev) => prev?.map((x) => (x.id === u.id ? { ...x, activo: !u.activo } : x)) ?? null);
    } catch (e) {
      setRowError(e instanceof Error ? e.message : 'No se pudo actualizar el usuario');
    }
  };

  if (me.role !== 'admin') {
    return (
      <main className="flex flex-1 items-center justify-center p-8">
        <div className="max-w-md rounded-2xl border border-line bg-white p-8 text-center">
          <LockClosedIcon className="mx-auto h-8 w-8 text-pink" strokeWidth={1.6} />
          <h1 className="mt-3 text-xl font-semibold text-textbl">Sin acceso</h1>
          <p className="mt-1 text-muted">Solo un administrador puede gestionar usuarios y roles.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-w-0 flex-1 flex-col gap-6 px-4 py-6 sm:px-9 sm:py-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-base text-muted">Administración</p>
          <h1 className="text-[34px] font-semibold leading-tight text-textbl">Usuarios y roles</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2 rounded-full bg-darkpink py-2.5 pl-3.5 pr-4 text-sm font-medium text-pink">
            <LockClosedIcon className="h-4 w-4" strokeWidth={1.8} />
            Solo administradores
          </span>
          <NotificationsBell onOpenTask={(id) => router.push(`/dashboard?tarea=${id}`)} />
        </div>
      </header>

      <div className="grid items-start gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
        <NewUserForm onCreate={handleCreate} />

        <section className="flex min-w-0 flex-col gap-4 rounded-2xl border border-line bg-white px-6 py-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-semibold text-textbl">Usuarios</h2>
              {users && (
                <span className="rounded-full bg-lightpink px-2.5 py-px text-[13px] font-semibold text-muted">
                  {users.length}
                </span>
              )}
            </div>
            <label className="flex h-11 w-full items-center gap-2 rounded-[10px] border border-line bg-white px-3.5 focus-within:border-pink sm:w-[300px]">
              <MagnifyingGlassIcon className="h-[18px] w-[18px] text-muted" strokeWidth={1.6} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por nombre o email…"
                className="w-full bg-transparent text-sm text-textbl outline-none placeholder:text-muted"
              />
            </label>
          </div>

          <div className="flex flex-wrap gap-2">
            {(['todos', ...ROLES] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`rounded-full px-3.5 py-[7px] text-[13px] font-medium transition-colors ${
                  roleFilter === r ? 'bg-textbl text-white' : 'border border-line bg-white text-textbl hover:bg-lightpink'
                }`}
              >
                {r === 'todos' ? 'Todos' : ROLE_LABEL[r]}
              </button>
            ))}
          </div>

          {rowError && <p className="rounded-[10px] bg-darkpink px-4 py-2.5 text-sm text-pink">{rowError}</p>}

          {loadError ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <p className="text-textbl">{loadError}</p>
              <button onClick={load} className="rounded-full bg-pink px-5 py-2 text-sm font-medium text-white">
                Reintentar
              </button>
            </div>
          ) : users === null ? (
            <p className="py-10 text-center text-muted">Cargando usuarios…</p>
          ) : (
            <>
              <UsersTable users={visible} currentUserId={me.id} onToggleActive={toggleActive} />
              <p className="text-[13px] text-muted">
                Mostrando {visible.length} de {users.length} usuarios
              </p>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
