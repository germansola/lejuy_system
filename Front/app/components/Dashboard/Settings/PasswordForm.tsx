'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LockClosedIcon } from '@heroicons/react/24/outline';
import { cambiarMiContrasena, clearToken } from '../../../lib/api';
import { Card, CardHeader, Notice, PasswordField, errorText, primaryBtn } from './ui';

export default function PasswordForm() {
  const router = useRouter();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [repeat, setRepeat] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const errors = {
    current: !current ? 'Escribí tu contraseña actual.' : null,
    next:
      next.length < 8
        ? 'Tiene que tener al menos 8 caracteres.'
        : next.length > 128
          ? 'Puede tener hasta 128 caracteres.'
          : next === current
            ? 'Tiene que ser distinta de la actual.'
            : null,
    repeat: repeat !== next ? 'No coincide con la nueva contraseña.' : null,
  };
  const show = (k: keyof typeof errors) => (submitted ? errors[k] : null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setError(null);
    if (Object.values(errors).some(Boolean)) return;

    setSaving(true);
    try {
      await cambiarMiContrasena(current, next);
      // Con la contraseña nueva hay que volver a entrar: se cierra esta sesión.
      setDone(true);
      clearToken();
      setTimeout(() => router.replace('/'), 2000);
    } catch (err) {
      setError(errorText(err));
      setSaving(false);
    }
  };

  return (
    <Card>
      <form onSubmit={submit} noValidate className="flex flex-col gap-5">
        <CardHeader
          icon={<LockClosedIcon className="h-[22px] w-[22px]" strokeWidth={1.6} />}
          title="Cambiar contraseña"
          subtitle="Por seguridad, primero confirmá tu contraseña actual."
        />

        <PasswordField
          label="Contraseña actual"
          value={current}
          onChange={setCurrent}
          autoComplete="current-password"
          error={show('current')}
        />
        <div className="grid grid-cols-1 items-start gap-5 md:grid-cols-2 md:gap-4">
          <PasswordField
            label="Nueva contraseña"
            value={next}
            onChange={setNext}
            placeholder="Mínimo 8 caracteres"
            help="Usá letras y números."
            autoComplete="new-password"
            error={show('next')}
          />
          <PasswordField
            label="Repetir nueva contraseña"
            value={repeat}
            onChange={setRepeat}
            placeholder="Repetila"
            help="Tiene que coincidir con la nueva."
            autoComplete="new-password"
            error={show('repeat')}
          />
        </div>

        {error && <Notice kind="error">{error}</Notice>}
        {done && <Notice kind="ok">Contraseña actualizada. Te llevamos a iniciar sesión de nuevo…</Notice>}

        <div className="flex flex-col gap-3 border-t border-line pt-5 sm:flex-row sm:items-center">
          <p className="flex-1 text-[13px] text-muted">Al cambiarla, vas a tener que volver a iniciar sesión.</p>
          <button type="submit" disabled={saving} className={primaryBtn}>
            <LockClosedIcon className="h-[18px] w-[18px]" strokeWidth={1.8} />
            {saving ? 'Actualizando…' : 'Actualizar contraseña'}
          </button>
        </div>
      </form>
    </Card>
  );
}
