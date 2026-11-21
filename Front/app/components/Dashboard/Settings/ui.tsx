'use client';

import { ReactNode, useState } from 'react';
import { EyeIcon, EyeSlashIcon, LockClosedIcon } from '@heroicons/react/24/outline';

// Piezas compartidas por las tarjetas de Configuración (mismo estilo que el alta de usuarios).

export const inputCls = 'w-full bg-transparent text-[15px] text-textbl outline-none placeholder:text-muted';

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`flex flex-col gap-5 rounded-2xl border border-line bg-white p-5 sm:p-7 ${className}`}>{children}</section>;
}

export function CardHeader({ icon, title, subtitle }: { icon: ReactNode; title: string; subtitle: string }) {
  return (
    <div className="flex items-center gap-3.5">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-darkpink text-pink">{icon}</span>
      <div>
        <h2 className="text-xl font-semibold text-textbl">{title}</h2>
        <p className="text-[13px] text-muted">{subtitle}</p>
      </div>
    </div>
  );
}

export function Field({
  label,
  icon,
  help,
  error,
  children,
}: {
  label: string;
  icon: ReactNode;
  help?: string;
  error?: string | null;
  children: ReactNode;
}) {
  return (
    <label className="flex min-w-0 flex-col gap-2">
      <span className="text-sm font-medium text-textbl">{label}</span>
      <span
        className={`flex h-12 items-center gap-2.5 rounded-[10px] border bg-white px-3.5 focus-within:border-pink ${
          error ? 'border-pink' : 'border-line'
        }`}
      >
        <span className="shrink-0 text-muted">{icon}</span>
        {children}
      </span>
      {(error || help) && <span className={`text-xs ${error ? 'text-pink' : 'text-muted'}`}>{error ?? help}</span>}
    </label>
  );
}

export function PasswordField({
  label,
  value,
  onChange,
  placeholder,
  help,
  error,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  help?: string;
  error?: string | null;
  autoComplete: 'current-password' | 'new-password';
}) {
  const [show, setShow] = useState(false);
  return (
    <Field label={label} icon={<LockClosedIcon className="h-[18px] w-[18px]" strokeWidth={1.6} />} help={help} error={error}>
      <input
        type={show ? 'text' : 'password'}
        className={inputCls}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        className="shrink-0 text-muted hover:text-textbl"
      >
        {show ? <EyeSlashIcon className="h-[18px] w-[18px]" strokeWidth={1.6} /> : <EyeIcon className="h-[18px] w-[18px]" strokeWidth={1.6} />}
      </button>
    </Field>
  );
}

export function Notice({ kind, children }: { kind: 'error' | 'ok'; children: ReactNode }) {
  return (
    <p
      role={kind === 'error' ? 'alert' : 'status'}
      className={`rounded-[10px] px-4 py-2.5 text-sm ${kind === 'error' ? 'bg-darkpink text-pink' : 'bg-donesoft text-done'}`}
    >
      {children}
    </p>
  );
}

export const primaryBtn =
  'flex items-center justify-center gap-2 rounded-[10px] bg-pink px-5 py-3 text-[15px] font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50';
export const outlineBtn =
  'flex items-center justify-center gap-2 rounded-[10px] border border-line bg-white px-5 py-3 text-[15px] font-semibold text-textbl hover:bg-lightpink disabled:cursor-not-allowed disabled:opacity-50';

export const errorText = (e: unknown) => (e instanceof Error ? e.message : 'Ocurrió un error inesperado');
