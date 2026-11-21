'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { AtSymbolIcon, CheckIcon, EnvelopeIcon, UserIcon } from '@heroicons/react/24/outline';
import { useRefreshUser, useUser } from '../../../dashboard/session';
import { cambiarMiEmail, cambiarMiNombre, cambiarMiNombreUsuario } from '../../../lib/api';
import { Card, CardHeader, Field, Notice, PasswordField, errorText, inputCls, outlineBtn, primaryBtn } from './ui';

// Mismas reglas que el back (Api/schemas.py).
const USERNAME_RE = /^[a-zA-Z0-9_.-]{3,50}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const icon = 'h-[18px] w-[18px]';

export default function AccountForm() {
  const user = useUser();
  const refreshUser = useRefreshUser();
  const [name, setName] = useState(user.name);
  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email);
  const [password, setPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const reset = () => {
    setName(user.name);
    setUsername(user.username);
    setEmail(user.email);
    setPassword('');
    setSubmitted(false);
    setError(null);
  };

  // Cuando cambian los datos guardados (por ejemplo, al terminar de guardar), se actualizan los
  // campos que no se estaban editando. Lo que sí se editó queda como está (si falló, no se pierde).
  const savedRef = useRef(user);
  useEffect(() => {
    const prev = savedRef.current;
    setName((v) => (v.trim() === prev.name ? user.name : v));
    setUsername((v) => (v.trim() === prev.username ? user.username : v));
    setEmail((v) => (v.trim().toLowerCase() === prev.email ? user.email : v));
    savedRef.current = user;
  }, [user]);

  const n = name.trim();
  const u = username.trim();
  const m = email.trim().toLowerCase();
  const changed = { name: n !== user.name, username: u !== user.username, email: m !== user.email };
  const dirty = changed.name || changed.username || changed.email;

  const errors = {
    name: !n ? 'Escribí tu nombre.' : null,
    username: !USERNAME_RE.test(u) ? 'Entre 3 y 50 caracteres: letras, números, punto, guion o guion bajo.' : null,
    email: !EMAIL_RE.test(m) ? 'Escribí un email válido.' : null,
    password: changed.email && !password ? 'Para cambiar el email, confirmá tu contraseña actual.' : null,
  };
  const show = (k: keyof typeof errors) => (submitted ? errors[k] : null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setSaved(false);
    setError(null);
    if (!dirty || Object.values(errors).some(Boolean)) return;

    setSaving(true);
    try {
      // Son tres endpoints: se llaman solo los que cambiaron. Si uno falla, los anteriores ya quedaron guardados.
      if (changed.name) await cambiarMiNombre(n);
      if (changed.username) await cambiarMiNombreUsuario(u);
      if (changed.email) await cambiarMiEmail(m, password);
      setSaved(true);
      setSubmitted(false);
      setPassword('');
    } catch (err) {
      setError(errorText(err));
    } finally {
      await refreshUser().catch(() => {});
      setSaving(false);
    }
  };

  return (
    <Card>
      <form onSubmit={submit} noValidate className="flex flex-col gap-5">
        <CardHeader
          icon={<UserIcon className="h-[22px] w-[22px]" strokeWidth={1.6} />}
          title="Editar usuario"
          subtitle="Tus datos para iniciar sesión y cómo te ven los demás."
        />

        <div className="grid grid-cols-1 items-start gap-5 md:grid-cols-2 md:gap-4">
          <Field label="Nombre completo" icon={<UserIcon className={icon} strokeWidth={1.6} />} error={show('name')}>
            <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" maxLength={120} />
          </Field>
          <Field
            label="Nombre de usuario"
            icon={<AtSymbolIcon className={icon} strokeWidth={1.6} />}
            help="Letras, números, punto o guion. Sin espacios."
            error={show('username')}
          >
            <input
              className={inputCls}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              maxLength={50}
            />
          </Field>
        </div>

        <Field
          label="Email"
          icon={<EnvelopeIcon className={icon} strokeWidth={1.6} />}
          help="Lo usás para iniciar sesión. Para cambiarlo te vamos a pedir tu contraseña actual."
          error={show('email')}
        >
          <input
            type="email"
            className={inputCls}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            maxLength={255}
          />
        </Field>

        {changed.email && (
          <PasswordField
            label="Contraseña actual"
            value={password}
            onChange={setPassword}
            placeholder="Para confirmar el cambio de email"
            autoComplete="current-password"
            error={show('password')}
          />
        )}

        {error && <Notice kind="error">{error}</Notice>}
        {saved && !dirty && <Notice kind="ok">Guardaste los cambios.</Notice>}

        <div className="flex flex-col-reverse gap-3 border-t border-line pt-5 sm:flex-row sm:justify-end">
          <button type="button" onClick={reset} disabled={!dirty || saving} className={outlineBtn}>
            Descartar
          </button>
          <button type="submit" disabled={!dirty || saving} className={primaryBtn}>
            <CheckIcon className="h-[18px] w-[18px]" strokeWidth={2} />
            {saving ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </Card>
  );
}
