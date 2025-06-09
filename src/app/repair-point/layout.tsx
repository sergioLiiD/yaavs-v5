'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { HiChartPie, HiTicket, HiLogout, HiUsers } from 'react-icons/hi';
import Link from 'next/link';
import { FaSpinner } from 'react-icons/fa';

export default function RepairPointLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const isLoginPage = pathname === '/repair-point/login';

  useEffect(() => {
    if (status === 'unauthenticated' && !isLoginPage) {
      router.push('/repair-point/login');
    }
  }, [status, isLoginPage, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <FaSpinner className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (!session) {
    return null;
  }

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/auth/login');
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
                  Punto de Reparación
                </h1>
              </div>
            </div>
            <div className="flex items-center">
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
              <Link
                href="/repair-point/clientes"
                className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  pathname?.includes('/repair-point/clientes')
                    ? 'bg-[#FEBF19] text-white'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <HiUsers className="mr-3 h-6 w-6" />
                Clientes
              </Link>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
} 