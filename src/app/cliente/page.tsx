'use client';

import { useClienteAuth } from '@/hooks/useClienteAuth';
import Link from 'next/link';

export default function ClienteHomePage() {
  const { cliente } = useClienteAuth();

  return (
    <div className="space-y-6">
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Bienvenido, {cliente?.nombre} {cliente?.apellidoPaterno}
          </h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <p>
              Aquí puedes gestionar tus tickets de servicio y solicitar nuevas reparaciones.
            </p>
          </div>
          <div className="mt-5">
            <Link
              href="/cliente/nuevo-ticket"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#FEBF19] hover:bg-[#FEBF19]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FEBF19]"
            >
              Crear nuevo ticket
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Accesos rápidos
          </h3>
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              href="/cliente/tickets"
              className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#FEBF19]"
            >
              <div className="flex-1 min-w-0">
                <span className="absolute inset-0" aria-hidden="true" />
                <p className="text-sm font-medium text-gray-900">
                  Ver mis tickets
                </p>
                <p className="text-sm text-gray-500 truncate">
                  Consulta el estado de tus tickets
                </p>
              </div>
            </Link>

            <Link
              href="/cliente/nuevo-ticket"
              className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#FEBF19]"
            >
              <div className="flex-1 min-w-0">
                <span className="absolute inset-0" aria-hidden="true" />
                <p className="text-sm font-medium text-gray-900">
                  Nuevo ticket
                </p>
                <p className="text-sm text-gray-500 truncate">
                  Solicita una nueva reparación
                </p>
              </div>
            </Link>

            <Link
              href="/cliente/perfil"
              className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#FEBF19]"
            >
              <div className="flex-1 min-w-0">
                <span className="absolute inset-0" aria-hidden="true" />
                <p className="text-sm font-medium text-gray-900">
                  Mi perfil
                </p>
                <p className="text-sm text-gray-500 truncate">
                  Actualiza tu información personal
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 