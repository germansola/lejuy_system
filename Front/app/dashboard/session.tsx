'use client';

import { createContext, useContext } from 'react';
import type { User } from '../components/Dashboard/data';

// Usuario logueado, disponible para todas las páginas dentro de /dashboard.
export const SessionContext = createContext<User | null>(null);

// Vuelve a pedir el usuario a la API (después de editar el perfil o la foto).
export const RefreshUserContext = createContext<() => Promise<void>>(async () => {});

export function useRefreshUser() {
  return useContext(RefreshUserContext);
}

export function useUser(): User {
  const user = useContext(SessionContext);
  if (!user) throw new Error('useUser debe usarse dentro de DashboardClient');
  return user;
}
