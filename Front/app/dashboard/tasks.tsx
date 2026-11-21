'use client';

import { Dispatch, ReactNode, SetStateAction, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Task, User } from '../components/Dashboard/data';
import { listarTareas } from '../lib/api';
import { DueNotification, dueNotifications } from '../components/Dashboard/notifications';

// Tareas y notificaciones compartidas por todas las páginas de /dashboard (board, menú lateral,
// campana de cada encabezado). Se cargan de la API al entrar al dashboard; el back ya filtra
// cuáles ve cada rol (admin y dueño, todas; el resto, solo las suyas).

interface TasksState {
  tasks: Task[];
  setTasks: Dispatch<SetStateAction<Task[]>>;
  loading: boolean;
  loadError: string | null;
  reload: () => void;
  notifications: DueNotification[];
  unread: Set<string>; // keys de notificaciones todavía no vistas
  markAllSeen: () => void;
  panelOpen: boolean;
  setPanelOpen: (open: boolean) => void;
}

const TasksContext = createContext<TasksState | null>(null);

export function useTasks(): TasksState {
  const ctx = useContext(TasksContext);
  if (!ctx) throw new Error('useTasks debe usarse dentro de TasksProvider');
  return ctx;
}

const seenKey = (userId: number) => `lejuy_notif_vistas_${userId}`;

// Las notificaciones vistas se recuerdan en este navegador (comodidad, no es crítico si se pierde).
function loadSeen(userId: number): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(seenKey(userId)) ?? '[]'));
  } catch {
    return new Set();
  }
}

export function TasksProvider({ user, children }: { user: User; children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    listarTareas()
      .then((list) => !cancelled && setTasks(list))
      .catch((e: unknown) => {
        if (!cancelled) setLoadError(e instanceof Error ? e.message : 'No se pudieron cargar las tareas');
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [user.id, reloadKey]);
  const [now, setNow] = useState(() => new Date());
  const [seen, setSeen] = useState<Set<string>>(() => loadSeen(user.id));
  const [panelOpen, setPanelOpen] = useState(false);

  // Recalcula cada minuto para que "quedan X h" se mantenga al día.
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const notifications = useMemo(() => dueNotifications(tasks, user, now), [tasks, user, now]);
  const unread = useMemo(
    () => new Set(notifications.filter((n) => !seen.has(n.key)).map((n) => n.key)),
    [notifications, seen],
  );

  const markAllSeen = () => {
    if (unread.size === 0) return;
    // Solo se guardan las actuales, así la lista no crece para siempre.
    const next = new Set(notifications.map((n) => n.key));
    setSeen(next);
    try {
      localStorage.setItem(seenKey(user.id), JSON.stringify(Array.from(next)));
    } catch {}
  };

  return (
    <TasksContext.Provider
      value={{ tasks, setTasks, loading, loadError, reload, notifications, unread, markAllSeen, panelOpen, setPanelOpen }}
    >
      {children}
    </TasksContext.Provider>
  );
}
