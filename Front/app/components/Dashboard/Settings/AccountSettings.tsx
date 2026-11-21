'use client';

import { useRouter } from 'next/navigation';
import NotificationsBell from '../NotificationsBell';
import AccountForm from './AccountForm';
import PasswordForm from './PasswordForm';
import ProfilePhotoCard from './ProfilePhotoCard';

// Configuración > Mi cuenta: foto de perfil, datos de la cuenta y contraseña (cualquier rol).
export default function AccountSettings() {
  const router = useRouter();
  return (
    <main className="flex min-w-0 flex-1 flex-col gap-6 px-4 py-6 sm:px-9 sm:py-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-base text-muted">Tu cuenta</p>
          <h1 className="text-[34px] font-semibold leading-tight text-textbl">Configuración</h1>
        </div>
        <NotificationsBell onOpenTask={(id) => router.push(`/dashboard?tarea=${id}`)} />
      </header>

      <div className="grid items-start gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
        <ProfilePhotoCard />
        <div className="flex min-w-0 flex-col gap-6">
          <AccountForm />
          <PasswordForm />
        </div>
      </div>
    </main>
  );
}
