import React, { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();

  const handleSignOut = async () => {
    await signOut({ redirect: true, callbackUrl: '/auth/login' });
  };

  return (
    <nav className="bg-white shadow-sm z-10">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 focus:text-gray-900"
            >
              <span className="material-symbols-outlined">
                {isOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
          
          <div className="flex items-center">
            <div className="md:hidden flex-shrink-0 flex items-center">
              <span className="text-blue-800 text-xl font-semibold">YAAVS</span>
            </div>
          </div>
          
          <div className="hidden md:flex items-center">
            <div className="flex-shrink-0">
              <span className="text-gray-900 text-lg">Sistema de Reparación de Celulares</span>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="ml-3 relative">
              <div>
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="flex text-sm border-2 border-transparent rounded-full focus:outline-none focus:border-gray-300 transition duration-150 ease-in-out"
                >
                  <span className="material-symbols-outlined text-gray-700">
                    account_circle
                  </span>
                  {session?.user?.name && (
                    <span className="hidden md:inline-block ml-1 text-sm text-gray-700">
                      {session.user.name}
                    </span>
                  )}
                </button>
              </div>
              
              {isOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg">
                  <div className="py-1 rounded-md bg-white shadow-xs">
                    {session?.user?.name && (
                      <div className="block px-4 py-2 text-sm text-gray-700 border-b border-gray-200">
                        <p className="font-medium">{session.user.name}</p>
                        <p className="text-xs text-gray-500">{session.user.email}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Rol: {session.user.role || 'Usuario'}
                        </p>
                      </div>
                    )}
                    <Link
                      href="/perfil"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Tu Perfil
                    </Link>
                    <Link
                      href="/configuracion"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Configuración
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Menú móvil */}
      {isOpen && (
        <div className="md:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              href="/dashboard"
              className="block pl-3 pr-4 py-2 border-l-4 border-blue-500 text-base font-medium text-blue-700 bg-blue-50 focus:outline-none focus:text-blue-800 focus:bg-blue-100 focus:border-blue-700 transition duration-150 ease-in-out"
            >
              Dashboard
            </Link>
            <Link
              href="/tickets"
              className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:text-gray-800 focus:bg-gray-50 focus:border-gray-300 transition duration-150 ease-in-out"
            >
              Tickets
            </Link>
            <Link
              href="/clientes"
              className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:text-gray-800 focus:bg-gray-50 focus:border-gray-300 transition duration-150 ease-in-out"
            >
              Clientes
            </Link>
            <Link
              href="/inventario"
              className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:text-gray-800 focus:bg-gray-50 focus:border-gray-300 transition duration-150 ease-in-out"
            >
              Inventario
            </Link>
            <div className="pl-3 pr-4 py-2">
              <Link
                href="/dashboard/inventario"
                className="block text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 focus:outline-none focus:text-gray-800 focus:bg-gray-50 transition duration-150 ease-in-out"
              >
                Gestión de Inventario
              </Link>
              <Link
                href="/inventarios/minimos"
                className="block text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 focus:outline-none focus:text-gray-800 focus:bg-gray-50 transition duration-150 ease-in-out"
              >
                Inventarios Mínimos
              </Link>
            </div>
            <Link
              href="/catalogos"
              className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:text-gray-800 focus:bg-gray-50 focus:border-gray-300 transition duration-150 ease-in-out"
            >
              Catálogos
            </Link>
            <Link
              href="/usuarios"
              className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:text-gray-800 focus:bg-gray-50 focus:border-gray-300 transition duration-150 ease-in-out"
            >
              Usuarios
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar; 