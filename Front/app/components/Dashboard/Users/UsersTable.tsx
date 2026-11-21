'use client';

import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import type { ApiUsuarioResumen } from '../../../lib/api';
import { ROLE_BADGE, ROLE_LABEL, initialsOf } from '../data';

const fecha = (iso: string) =>
  new Date(iso).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' });

interface Props {
  users: ApiUsuarioResumen[];
  currentUserId: number;
  onToggleActive: (u: ApiUsuarioResumen) => void;
}

export default function UsersTable({ users, currentUserId, onToggleActive }: Props) {
  return (
    <div className="overflow-x-auto rounded-xl border border-line">
      <table className="w-full min-w-[620px] text-left">
        <thead className="bg-lightpink text-[11px] font-semibold tracking-wider text-muted">
          <tr>
            <th className="px-4 py-2.5">USUARIO</th>
            <th className="px-3 py-2.5">ROL</th>
            <th className="px-3 py-2.5">ESTADO</th>
            <th className="px-3 py-2.5">ALTA</th>
            <th className="w-12 px-3 py-2.5">
              <span className="sr-only">Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-10 text-center text-muted">
                No hay usuarios que coincidan con la búsqueda.
              </td>
            </tr>
          )}
          {users.map((u) => {
            const isMe = u.id === currentUserId;
            return (
              <tr key={u.id} className="border-t border-line first:border-t-0">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white ${
                        u.activo ? 'bg-pink' : 'bg-todo'
                      }`}
                    >
                      {initialsOf(u.nombre_completo)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-[15px] font-semibold text-textbl">
                        {u.nombre_completo}
                        {isMe && <span className="ml-1.5 text-xs font-medium text-muted">(vos)</span>}
                      </p>
                      <p className="truncate text-[13px] text-muted">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3">
                  <span className={`whitespace-nowrap rounded-full px-2.5 py-[3px] text-xs font-medium ${ROLE_BADGE[u.rol]}`}>
                    {ROLE_LABEL[u.rol]}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <span className="flex items-center gap-1.5 text-[13px] font-medium">
                    <span className={`h-2 w-2 rounded-full ${u.activo ? 'bg-done' : 'bg-todo'}`} />
                    <span className={u.activo ? 'text-textbl' : 'text-muted'}>{u.activo ? 'Activo' : 'Inactivo'}</span>
                  </span>
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-[13px] text-muted">{fecha(u.creado_en)}</td>
                <td className="px-3 py-3">
                  {!isMe && (
                    <Menu as="div" className="relative">
                      <Menu.Button
                        aria-label={`Acciones para ${u.nombre_completo}`}
                        className="rounded-lg p-1 text-muted hover:bg-lightpink hover:text-textbl"
                      >
                        <EllipsisVerticalIcon className="h-5 w-5" strokeWidth={1.8} />
                      </Menu.Button>
                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                      >
                        <Menu.Items className="absolute right-0 z-10 mt-1 w-40 rounded-xl border border-line bg-white p-1 shadow-lg focus:outline-none">
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                onClick={() => onToggleActive(u)}
                                className={`w-full rounded-lg px-3 py-2 text-left text-sm ${
                                  active ? 'bg-lightpink' : ''
                                } ${u.activo ? 'text-pink' : 'text-done'}`}
                              >
                                {u.activo ? 'Desactivar' : 'Activar'}
                              </button>
                            )}
                          </Menu.Item>
                        </Menu.Items>
                      </Transition>
                    </Menu>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
