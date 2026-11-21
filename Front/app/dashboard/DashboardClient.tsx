'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../components/Dashboard/Sidebar';
import { User, initialsOf } from '../components/Dashboard/data';
import { ApiError, clearToken, getMe, getToken } from '../lib/api';
import { SessionContext } from './session';

// Valida la sesión y arma el marco común (menú lateral) de todas las páginas de /dashboard.
export default function DashboardClient({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!getToken()) {
      router.replace('/');
      return;
    }
    getMe()
      .then((me) =>
        setUser({ id: me.id, name: me.nombre_completo, initials: initialsOf(me.nombre_completo), role: me.rol }),
      )
      .catch((e: unknown) => {
        if (e instanceof ApiError && e.status === 401) {
          // Token vencido, inválido o usuario desactivado.
          clearToken();
          router.replace('/');
        } else {
          setError(e instanceof Error ? e.message : 'Ocurrió un error inesperado');
        }
      });
  }, [router]);

  const logout = () => {
    clearToken();
    router.replace('/');
  };

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-lightpink px-4 text-center">
        <p className="text-lg text-textbl">{error}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-full bg-pink px-6 py-2 font-medium text-white"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-lightpink">
        <p className="text-muted">Cargando…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-lightpink">
      <Sidebar user={user} onLogout={logout} />
      <SessionContext.Provider value={user}>{children}</SessionContext.Provider>
    </div>
  );
}
