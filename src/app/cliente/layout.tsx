'use client';

import { useClienteAuth } from '@/hooks/useClienteAuth';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { HiMenu, HiX } from 'react-icons/hi';

export default function ClienteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { cliente, loading, isAuthenticated } = useClienteAuth();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Si estamos en las páginas de autenticación, no mostrar el layout
  if (pathname === '/cliente/login' || pathname === '/cliente/registro') {
    return <>{children}</>;
  }

  // Si está cargando, mostrar un spinner
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Si no está autenticado, no mostrar nada (el middleware se encargará de redirigir)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/cliente" className="flex items-center">
                  <img 
                    src="/logo.png" 
                    alt="YAAVS Logo" 
                    className="h-12 w-auto"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </Link>
              </div>
              <div className="hidden sm:flex sm:ml-6 sm:space-x-8">
                <Link
                  href="/cliente"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    pathname === '/cliente'
                      ? 'border-[#FEBF19] text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  Inicio
                </Link>
                <Link
                  href="/cliente/tickets"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    pathname === '/cliente/tickets'
                      ? 'border-[#FEBF19] text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  Mis Tickets
                </Link>
                <Link
                  href="/cliente/nuevo-ticket"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    pathname === '/cliente/nuevo-ticket'
                      ? 'border-[#FEBF19] text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  Nuevo Ticket
                </Link>
              </div>
            </div>
            <div className="hidden sm:flex sm:items-center">
              <div className="ml-3 relative">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-700">
                    {cliente?.nombre} {cliente?.apellidoPaterno}
                  </span>
                  <button
                    onClick={async () => {
                      await fetch('/api/cliente/logout', { method: 'POST' });
                      window.location.href = '/cliente/login';
                    }}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Cerrar sesión
                  </button>
                </div>
              </div>
            </div>
            <div className="flex items-center sm:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#FEBF19]"
              >
                <span className="sr-only">Abrir menú principal</span>
                {isMenuOpen ? (
                  <HiX className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <HiMenu className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Menú móvil */}
        <div className={`${isMenuOpen ? 'block' : 'hidden'} sm:hidden`}>
          <div className="pt-2 pb-3 space-y-1">
            <Link
              href="/cliente"
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                pathname === '/cliente'
                  ? 'border-[#FEBF19] text-[#FEBF19] bg-[#FEBF19]/10'
                  : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Inicio
            </Link>
            <Link
              href="/cliente/tickets"
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                pathname === '/cliente/tickets'
                  ? 'border-[#FEBF19] text-[#FEBF19] bg-[#FEBF19]/10'
                  : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Mis Tickets
            </Link>
            <Link
              href="/cliente/nuevo-ticket"
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                pathname === '/cliente/nuevo-ticket'
                  ? 'border-[#FEBF19] text-[#FEBF19] bg-[#FEBF19]/10'
                  : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Nuevo Ticket
            </Link>
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                <span className="text-base font-medium text-gray-800">
                  {cliente?.nombre} {cliente?.apellidoPaterno}
                </span>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <button
                onClick={async () => {
                  await fetch('/api/cliente/logout', { method: 'POST' });
                  window.location.href = '/cliente/login';
                }}
                className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
} 