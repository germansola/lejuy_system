'use client';

import { useEffect, useState } from 'react';
import { User } from './data';

// Foto de perfil o, si no tiene (o no carga), sus iniciales sobre el color de la marca.
export default function Avatar({ user, className = '' }: { user: Pick<User, 'name' | 'initials' | 'photo'>; className?: string }) {
  const [failed, setFailed] = useState(false);
  // Una foto nueva merece otro intento aunque la anterior no haya cargado.
  useEffect(() => setFailed(false), [user.photo]);

  return (
    <span
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-pink font-semibold text-white ${className}`}
    >
      {user.photo && !failed ? (
        // <img> y no next/image: la foto viene de la API, que es otro origen.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={user.photo}
          alt={`Foto de ${user.name}`}
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        user.initials
      )}
    </span>
  );
}
