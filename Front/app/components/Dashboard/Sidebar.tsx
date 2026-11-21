'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Squares2X2Icon,
  CalendarIcon,
  BellIcon,
  UsersIcon,
  TruckIcon,
  CubeIcon,
  MapIcon,
  ChartBarIcon,
  AdjustmentsHorizontalIcon,
  ArrowLeftOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { ROLE_LABEL, TOOLS_BY_ROLE, Tool, User } from './data';

type Icon = typeof Squares2X2Icon;

const GENERAL: { label: string; href: string; icon: Icon }[] = [
  { label: 'Board de tareas', href: '/dashboard', icon: Squares2X2Icon },
  { label: 'Calendario', href: '#', icon: CalendarIcon },
  { label: 'Notificaciones', href: '#', icon: BellIcon },
];

// href '#' = herramienta todavía sin pantalla.
const TOOLS: Record<Tool, { label: string; href: string; icon: Icon }> = {
  usuarios: { label: 'Usuarios y roles', href: '/dashboard/usuarios', icon: UsersIcon },
  pedidos: { label: 'Pedidos', href: '#', icon: TruckIcon },
  stock: { label: 'Stock de porotos', href: '#', icon: CubeIcon },
  campo: { label: 'Gestión de campo', href: '#', icon: MapIcon },
  reportes: { label: 'Reportes', href: '#', icon: ChartBarIcon },
};

function NavItem({ label, href, icon: Icon, active = false }: { label: string; href: string; icon: Icon; active?: boolean }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3.5 rounded-[10px] px-3 py-3 text-base transition-colors ${
        active ? 'bg-darkpink font-semibold text-pink' : 'text-textbl hover:bg-lightpink'
      }`}
    >
      <Icon className="h-[22px] w-[22px] text-textbl" strokeWidth={1.6} />
      {label}
    </Link>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="px-3 pb-1 pt-2 text-xs font-medium tracking-wider text-muted">{children}</p>;
}

export default function Sidebar({ user, onLogout }: { user: User; onLogout: () => void }) {
  const pathname = usePathname();
  const isActive = (href: string) => href !== '#' && pathname === href;

  return (
    <aside className="hidden w-[280px] shrink-0 flex-col gap-1.5 border-r border-line bg-white px-6 pb-6 pt-7 lg:flex">
      <Link href="/" className="flex items-center gap-3">
        <Image src="/images/Logo/lejuy.svg" alt="Logo de Lejuy" width={60} height={60} className="-my-2 -ml-2" />
        <div>
          <p className="text-[30px] font-bold leading-none text-pink">Lejuy</p>
          <p className="mt-1 text-[13px] text-muted">Sistema de gestión</p>
        </div>
      </Link>

      <div className="mt-[18px] flex items-center gap-3 rounded-xl bg-lightpink p-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pink text-base font-semibold text-white">
          {user.initials}
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-base font-semibold text-textbl">{user.name}</p>
          <span className="w-fit rounded-full bg-darkpink px-2 py-0.5 text-xs font-medium text-pink">
            {ROLE_LABEL[user.role]}
          </span>
        </div>
      </div>

      <div className="mt-3.5" />
      <SectionLabel>GENERAL</SectionLabel>
      {GENERAL.map((item) => (
        <NavItem key={item.label} {...item} active={isActive(item.href)} />
      ))}

      <SectionLabel>HERRAMIENTAS DEL ROL</SectionLabel>
      {TOOLS_BY_ROLE[user.role].map((tool) => (
        <NavItem key={tool} {...TOOLS[tool]} active={isActive(TOOLS[tool].href)} />
      ))}

      <div className="flex-1" />
      <NavItem label="Configuración" href="#" icon={AdjustmentsHorizontalIcon} />
      <button
        type="button"
        onClick={onLogout}
        className="flex items-center gap-3.5 rounded-[10px] px-3 py-3 text-left text-base text-textbl transition-colors hover:bg-lightpink"
      >
        <ArrowLeftOnRectangleIcon className="h-[22px] w-[22px] text-textbl" strokeWidth={1.6} />
        Cerrar sesión
      </button>
    </aside>
  );
}
