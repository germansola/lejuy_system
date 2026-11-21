'use client';

import { createContext, useContext } from 'react';
import type { User } from '../components/Dashboard/data';

// Usuario logueado, disponible para todas las páginas dentro de /dashboard.
export const SessionContext = createContext<User | null>(null);

export function useUser(): User {
  const user = useContext(SessionContext);
  if (!user) throw new Error('useUser debe usarse dentro de DashboardClient');
  return user;
}
