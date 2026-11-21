'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Bars3Icon } from '@heroicons/react/24/outline';
import { SIDEBAR_ID } from './Sidebar';

// Barra superior solo para pantallas chicas (debajo de lg), donde el menú lateral
// está oculto: el botón ☰ lo abre.
export default function MobileTopBar({ menuOpen, onOpenMenu }: { menuOpen: boolean; onOpenMenu: () => void }) {
  return (
    <div className="sticky top-0 z-20 flex items-center gap-3 border-b border-line bg-white px-4 py-2.5 lg:hidden">
      <button
        type="button"
        onClick={onOpenMenu}
        aria-label="Abrir menú"
        aria-expanded={menuOpen}
        aria-controls={SIDEBAR_ID}
        className="-ml-1 rounded-lg p-2 text-textbl hover:bg-lightpink"
      >
        <Bars3Icon className="h-7 w-7" strokeWidth={1.8} />
      </button>
      <Link href="/dashboard" className="flex items-center gap-2">
        <Image src="/images/Logo/lejuy.svg" alt="Logo de Lejuy" width={36} height={36} />
        <span className="text-xl font-bold text-pink">Lejuy</span>
      </Link>
    </div>
  );
}
