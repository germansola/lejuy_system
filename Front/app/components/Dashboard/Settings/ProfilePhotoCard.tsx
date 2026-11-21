'use client';

import { ChangeEvent, useRef, useState } from 'react';
import { ArrowUpTrayIcon, CameraIcon } from '@heroicons/react/24/outline';
import { useRefreshUser, useUser } from '../../../dashboard/session';
import { quitarMiFoto, subirMiFoto } from '../../../lib/api';
import Avatar from '../Avatar';
import { ROLE_LABEL } from '../data';
import { Card, Notice, errorText, outlineBtn } from './ui';

const MAX_BYTES = 2 * 1024 * 1024;
const TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export default function ProfilePhotoCard() {
  const user = useUser();
  const refreshUser = useRefreshUser();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<'subiendo' | 'quitando' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pick = () => fileRef.current?.click();

  const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // permite volver a elegir el mismo archivo
    if (!file) return;
    // Mismo control que el back, para avisar antes de subir. El back igual revisa el contenido real.
    if (!TYPES.includes(file.type)) return setError('La foto tiene que ser JPG, PNG o WebP.');
    if (file.size > MAX_BYTES) return setError('La foto no puede pesar más de 2 MB.');

    setError(null);
    setBusy('subiendo');
    try {
      await subirMiFoto(file);
      await refreshUser();
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(null);
    }
  };

  const remove = async () => {
    setError(null);
    setBusy('quitando');
    try {
      await quitarMiFoto();
      await refreshUser();
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(null);
    }
  };

  return (
    <Card className="items-center">
      <h2 className="self-stretch text-xl font-semibold text-textbl">Foto de perfil</h2>

      <div className="relative">
        <Avatar user={user} className={`h-32 w-32 text-[40px] ${busy ? 'opacity-60' : ''}`} />
        <button
          type="button"
          onClick={pick}
          disabled={!!busy}
          aria-label="Cambiar foto de perfil"
          className="absolute bottom-0 right-0 flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white text-textbl shadow-[0_2px_6px_rgba(0,0,0,0.12)] hover:bg-lightpink disabled:cursor-wait"
        >
          <CameraIcon className="h-5 w-5" strokeWidth={1.6} />
        </button>
      </div>

      <div className="flex flex-col items-center gap-1.5">
        <p className="text-lg font-semibold text-textbl">{user.name}</p>
        <span className="rounded-full bg-darkpink px-2.5 py-0.5 text-xs font-medium text-pink">{ROLE_LABEL[user.role]}</span>
      </div>

      <input ref={fileRef} type="file" accept={TYPES.join(',')} onChange={onFile} className="hidden" />

      <div className="flex w-full flex-col gap-1.5">
        <button type="button" onClick={pick} disabled={!!busy} className={outlineBtn}>
          <ArrowUpTrayIcon className="h-[18px] w-[18px]" strokeWidth={1.6} />
          {busy === 'subiendo' ? 'Subiendo…' : user.photo ? 'Cambiar foto' : 'Subir foto'}
        </button>
        {user.photo && (
          <button
            type="button"
            onClick={remove}
            disabled={!!busy}
            className="rounded-[10px] px-5 py-3 text-[15px] font-semibold text-pink hover:bg-darkpink disabled:opacity-50"
          >
            {busy === 'quitando' ? 'Quitando…' : 'Quitar foto'}
          </button>
        )}
      </div>

      {error && (
        <div className="w-full">
          <Notice kind="error">{error}</Notice>
        </div>
      )}
      <p className="text-center text-xs text-muted">JPG, PNG o WebP de hasta 2 MB. Se muestra recortada en círculo.</p>
    </Card>
  );
}
