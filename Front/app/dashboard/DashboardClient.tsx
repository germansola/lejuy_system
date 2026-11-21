'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from '../components/Dashboard/Sidebar';
import MobileTopBar from '../components/Dashboard/MobileTopBar';
import { User, initialsOf } from '../components/Dashboard/data';
import { ApiError, ApiUsuario, clearToken, getMe, getToken, mediaUrl } from '../lib/api';
import { RefreshUserContext, SessionContext } from './session';
import { TasksProvider } from './tasks';

function userFromApi(me: ApiUsuario): User {
  return {
    id: me.id,
    name: me.nombre_completo,
    initials: initialsOf(me.nombre_completo),
    role: me.rol,
    username: me.nombre_usuario,
    email: me.email,
    photo: mediaUrl(me.foto_perfil),
  };
}

// Valida la sesión y arma el marco común (menú lateral) de todas las páginas de /dashboard.
export default function DashboardClient({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  // Menú móvil: se cierra al cambiar de página y con Escape; mientras está
  // abierto, la página de atrás no scrollea.
  useEffect(() => setMenuOpen(false), [pathname]);
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false);
    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = overflowPrevio;
      window.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!getToken()) {
      router.replace('/');
      return;
    }
    getMe()
      .then((me) => setUser(userFromApi(me)))
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

  const refreshUser = useCallback(async () => {
    setUser(userFromApi(await getMe()));
  }, []);

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
    <SessionContext.Provider value={user}>
      <RefreshUserContext.Provider value={refreshUser}>
        <TasksProvider user={user}>
          <div className="flex min-h-screen bg-lightpink">
            <Sidebar user={user} onLogout={logout} open={menuOpen} onClose={() => setMenuOpen(false)} />
            <div className="flex min-w-0 flex-1 flex-col">
              <MobileTopBar menuOpen={menuOpen} onOpenMenu={() => setMenuOpen(true)} />
              {children}
            </div>
          </div>
        </TasksProvider>
      </RefreshUserContext.Provider>
    </SessionContext.Provider>
  );
}
