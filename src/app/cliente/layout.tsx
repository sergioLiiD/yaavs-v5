'use client';

import { useClienteAuth } from '@/hooks/useClienteAuth';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function ClienteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { cliente, loading, isAuthenticated } = useClienteAuth();
  const pathname = usePathname();

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
                <Link href="/cliente" className="text-xl font-bold text-blue-600">
                  YAAVS
                </Link>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  href="/cliente"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    pathname === '/cliente'
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  Inicio
                </Link>
                <Link
                  href="/cliente/tickets"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    pathname === '/cliente/tickets'
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  Mis Tickets
                </Link>
                <Link
                  href="/cliente/nuevo-ticket"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    pathname === '/cliente/nuevo-ticket'
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  Nuevo Ticket
                </Link>
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
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
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
} 