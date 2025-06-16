'use client';

import { useClienteAuth } from '@/hooks/useClienteAuth';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function ClienteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { cliente, loading } = useClienteAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || loading) return;

    const publicRoutes = ['/cliente/login', '/cliente/registro'];
    const isPublicRoute = publicRoutes.includes(pathname);

    if (!cliente && !isPublicRoute) {
      console.log('No hay cliente autenticado, redirigiendo a login desde:', pathname);
      router.push(`/cliente/login?callbackUrl=${pathname}`);
    } else if (cliente && isPublicRoute) {
      console.log('Cliente autenticado en ruta pública, redirigiendo a dashboard desde:', pathname);
      router.push('/cliente');
    }
  }, [cliente, loading, isClient, pathname, router]);

  if (!isClient || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: '#FEBF18' }}></div>
      </div>
    );
  }

  if (!cliente && (pathname === '/cliente/login' || pathname === '/cliente/registro')) {
    return <>{children}</>;
  }

  if (!cliente) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/cliente">
                  <img
                    src="/logo.png"
                    alt="Logo"
                    className="h-8 w-auto"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <div className="ml-3 relative">
                <div className="flex items-center space-x-4">
                  <span className="text-gray-700">
                    {cliente.nombre} {cliente.apellidoPaterno}
                  </span>
                  <button
                    onClick={() => {
                      document.cookie = 'cliente_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
                      router.push('/cliente/login');
                    }}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white"
                    style={{ backgroundColor: '#FEBF18' }}
                  >
                    Cerrar sesión
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
} 