'use client';

import { FormEvent, useState } from 'react';
import {
  EnvelopeIcon,
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
  UserIcon,
  UserPlusIcon,
} from '@heroicons/react/24/outline';
import { ROLES, ROLE_DESCRIPTION, ROLE_LABEL, Role } from '../data';

export interface NewUserValues {
  nombre: string;
  email: string;
  contrasena: string;
  rol: Role;
}

const EMPTY = { nombre: '', email: '', contrasena: '', rol: null as Role | null };

const inputBox =
  'flex h-12 items-center gap-2.5 rounded-[10px] border border-line bg-white px-3.5 focus-within:border-pink';
const inputCls = 'w-full bg-transparent text-[15px] text-textbl outline-none placeholder:text-muted';

export default function NewUserForm({ onCreate }: { onCreate: (v: NewUserValues) => Promise<string | null> }) {
  const [values, setValues] = useState(EMPTY);
  const [showPwd, setShowPwd] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<string | null>(null);

  const set = <K extends keyof typeof EMPTY>(k: K, v: (typeof EMPTY)[K]) => {
    setValues((prev) => ({ ...prev, [k]: v }));
    setError(null);
    setCreated(null);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const nombre = values.nombre.trim();
    const email = values.email.trim().toLowerCase();
    if (!nombre || !email) return setError('Completá el nombre y el email.');
    if (values.contrasena.length < 8) return setError('La contraseña debe tener al menos 8 caracteres.');
    if (!values.rol) return setError('Elegí un rol.');

    setSending(true);
    const err = await onCreate({ nombre, email, contrasena: values.contrasena, rol: values.rol });
    setSending(false);
    if (err) return setError(err);
    setValues(EMPTY);
    setShowPwd(false);
    setCreated(`Se creó el usuario de ${nombre}.`);
  };

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-5 rounded-2xl border border-line bg-white p-7">
      <div className="flex items-center gap-3.5">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-darkpink">
          <UserPlusIcon className="h-[22px] w-[22px] text-pink" strokeWidth={1.6} />
        </span>
        <div>
          <h2 className="text-xl font-semibold text-textbl">Nuevo usuario</h2>
          <p className="text-[13px] text-muted">Completá los datos para darle acceso al sistema.</p>
        </div>
      </div>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-textbl">Nombre completo</span>
        <span className={inputBox}>
          <UserIcon className="h-[18px] w-[18px] shrink-0 text-muted" strokeWidth={1.6} />
          <input
            className={inputCls}
            value={values.nombre}
            onChange={(e) => set('nombre', e.target.value)}
            placeholder="Ej. Juan Mamaní"
            autoComplete="off"
          />
        </span>
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-textbl">Email</span>
        <span className={inputBox}>
          <EnvelopeIcon className="h-[18px] w-[18px] shrink-0 text-muted" strokeWidth={1.6} />
          <input
            className={inputCls}
            type="email"
            value={values.email}
            onChange={(e) => set('email', e.target.value)}
            placeholder="nombre@lejuy.com.ar"
            autoComplete="off"
          />
        </span>
        <span className="text-xs text-muted">Lo va a usar para iniciar sesión.</span>
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-textbl">Contraseña</span>
        <span className={inputBox}>
          <LockClosedIcon className="h-[18px] w-[18px] shrink-0 text-muted" strokeWidth={1.6} />
          <input
            className={inputCls}
            type={showPwd ? 'text' : 'password'}
            value={values.contrasena}
            onChange={(e) => set('contrasena', e.target.value)}
            placeholder="Creá una contraseña"
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowPwd((s) => !s)}
            aria-label={showPwd ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            className="shrink-0 text-muted hover:text-textbl"
          >
            {showPwd ? (
              <EyeSlashIcon className="h-[18px] w-[18px]" strokeWidth={1.6} />
            ) : (
              <EyeIcon className="h-[18px] w-[18px]" strokeWidth={1.6} />
            )}
          </button>
        </span>
        <span className="text-xs text-muted">Mínimo 8 caracteres.</span>
      </label>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-medium text-textbl">Rol</legend>
        {ROLES.map((r) => {
          const selected = values.rol === r;
          return (
            <label
              key={r}
              className={`flex cursor-pointer items-start gap-3 rounded-xl border px-3.5 py-3 transition-colors ${
                selected ? 'border-pink bg-darkpink' : 'border-line bg-white hover:bg-lightpink'
              }`}
            >
              <input
                type="radio"
                name="rol"
                value={r}
                checked={selected}
                onChange={() => set('rol', r)}
                className="mt-1 h-[18px] w-[18px] shrink-0 accent-pink"
              />
              <span className="flex flex-col gap-0.5">
                <span className={`text-[15px] font-semibold ${selected ? 'text-pink' : 'text-textbl'}`}>
                  {ROLE_LABEL[r]}
                </span>
                <span className="text-[13px] text-muted">{ROLE_DESCRIPTION[r]}</span>
              </span>
            </label>
          );
        })}
      </fieldset>

      {error && <p className="rounded-[10px] bg-darkpink px-4 py-2.5 text-sm text-pink">{error}</p>}
      {created && <p className="rounded-[10px] bg-donesoft px-4 py-2.5 text-sm text-done">{created}</p>}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => {
            setValues(EMPTY);
            setError(null);
            setCreated(null);
          }}
          className="rounded-[10px] border border-line bg-white px-5 py-3.5 text-[15px] font-semibold text-textbl hover:bg-lightpink"
        >
          Limpiar
        </button>
        <button
          type="submit"
          disabled={sending}
          className="flex flex-1 items-center justify-center gap-2 rounded-[10px] bg-pink py-3.5 text-[15px] font-semibold text-white hover:opacity-90 disabled:opacity-60"
        >
          <UserPlusIcon className="h-[18px] w-[18px]" strokeWidth={1.8} />
          {sending ? 'Creando…' : 'Crear usuario'}
        </button>
      </div>
    </form>
  );
}
