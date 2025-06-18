'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { HiChartPie, HiTicket } from 'react-icons/hi';
import Link from 'next/link';
import { FaSpinner } from 'react-icons/fa';
import { RepairPointAuthProvider } from './providers';

export default function RepairPointLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RepairPointAuthProvider>
      <RepairPointLayoutContent>{children}</RepairPointLayoutContent>
    </RepairPointAuthProvider>
  );
}

function RepairPointLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isLoginPage = pathname === '/repair-point/login';

  useEffect(() => {
    const checkAccess = async () => {
      // Si estamos en la página de login y no hay sesión, permitir acceso
      if (isLoginPage && status === 'unauthenticated') {
        setLoading(false);
        return;
      }

      // Si estamos en la página de login y hay sesión, redirigir al dashboard
      if (isLoginPage && status === 'authenticated') {
        router.push('/repair-point');
        return;
      }

      // Si no estamos en login y no hay sesión, redirigir al login
      if (!isLoginPage && status === 'unauthenticated') {
        router.push('/repair-point/login');
        return;
      }

      // Si la sesión está cargando, esperar
      if (status === 'loading') {
        return;
      }

      // Si hay sesión y no estamos en login, verificar acceso
      if (status === 'authenticated' && !isLoginPage) {
        try {
          const response = await fetch('/api/repair-point/check-access');
          const data = await response.json();

          if (!response.ok || !data.hasAccess) {
            await signOut({ redirect: false });
            router.push('/repair-point/login');
            return;
          }

          setIsAdmin(data.isAdmin);
        } catch (error) {
          console.error('Error verificando acceso:', error);
          setError('Error al verificar acceso');
        } finally {
          setLoading(false);
        }
      }
    };

    checkAccess();
  }, [status, isLoginPage, router]);

  // Si estamos en la página de login, mostrar solo el contenido
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Mostrar spinner mientras carga
  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <FaSpinner className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  // Si hay error, mostrarlo
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error de Acceso</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => router.push('/repair-point/login')}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Volver al Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Si no hay sesión, no mostrar nada (la redirección se maneja en el useEffect)
  if (!session) {
    return null;
  }

  const handleSignOut = async () => {
    // Llamar directamente al endpoint de signout de NextAuth con el path correcto
    await fetch('/api/repair-point/auth/signout?callbackUrl=/repair-point/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    // Borrar cookies de sesión manualmente en todos los paths relevantes
    document.cookie = 'repair-point-session-token=; Max-Age=0; path=/repair-point';
    document.cookie = 'repair-point-session-token=; Max-Age=0; path=/';
    document.cookie = 'next-auth.session-token=; Max-Age=0; path=/';
    document.cookie = 'next-auth.session-token=; Max-Age=0; path=/repair-point';

    window.location.href = '/repair-point/login';
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-900">
                  {session.user.puntoRecoleccion?.nombre || 'Punto de Reparación'}
                  {isAdmin && (
                    <span className="ml-2 text-sm text-gray-500">
                      (Acceso Administrativo)
                    </span>
                  )}
                </h1>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-500 mr-4">
                {session.user.name}
              </span>
              <button
                onClick={handleSignOut}
                className="ml-4 px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar y contenido principal */}
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-sm h-[calc(100vh-4rem)]">
          <div className="h-full px-3 py-4">
            <div className="space-y-1">
              <Link
                href="/repair-point"
                className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  pathname === '/repair-point'
                    ? 'bg-[#FEBF19] text-white'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <HiChartPie className="mr-3 h-6 w-6" />
                Dashboard
              </Link>
              <Link
                href="/repair-point/tickets"
                className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  pathname?.includes('/repair-point/tickets')
                    ? 'bg-[#FEBF19] text-white'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <HiTicket className="mr-3 h-6 w-6" />
                Tickets
              </Link>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="flex-1 p-8">{children}</div>
      </div>
    </div>
  );
} 