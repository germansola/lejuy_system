'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getToken } from '../lib/api';

// Con una sesión activa no se puede volver a la landing: se redirige al dashboard
// hasta que el usuario cierre sesión. Si el token venció, el dashboard lo borra y
// vuelve acá, así que no hay bucle.
export default function LandingGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [redirigiendo, setRedirigiendo] = useState(false);

  useEffect(() => {
    if (getToken()) {
      setRedirigiendo(true);
      // replace: la landing no queda en el historial, así "Atrás" no vuelve a ella.
      router.replace('/dashboard');
    }
  }, [router]);

  if (redirigiendo) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-lightpink">
        <p className="text-muted">Cargando…</p>
      </div>
    );
  }
  return <>{children}</>;
}
