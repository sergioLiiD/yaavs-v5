import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const menuItems = [
  { name: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
  { name: 'Tickets', href: '/tickets', icon: 'receipt' },
  { name: 'Clientes', href: '/clientes', icon: 'person' },
  { name: 'Inventario', href: '/inventario', icon: 'inventory' },
  { name: 'Catálogos', href: '/catalogos', icon: 'list' },
  { name: 'Usuarios', href: '/usuarios', icon: 'people' },
];

const Sidebar: React.FC = () => {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64 bg-blue-800 text-white">
        <div className="flex items-center justify-center h-16 bg-blue-900">
          <span className="text-xl font-semibold">YAAVS</span>
        </div>
        
        <nav className="mt-5 flex-1 px-2 bg-blue-800 space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`${
                  isActive
                    ? 'bg-blue-900 text-white'
                    : 'text-blue-100 hover:bg-blue-700'
                } group flex items-center px-2 py-2.5 text-sm font-medium rounded-md`}
              >
                <span className="material-symbols-outlined mr-3 flex-shrink-0 h-6 w-6">
                  {item.icon}
                </span>
                {item.name}
              </Link>
            );
          })}
        </nav>
        
        <div className="flex-shrink-0 flex border-t border-blue-700 p-4">
          <div className="flex-shrink-0 w-full group block">
            <div className="flex items-center">
              <div className="ml-3">
                <p className="text-sm font-medium text-white">Usuario Actual</p>
                <Link 
                  href="/auth/login" 
                  className="text-xs font-medium text-blue-200 hover:text-white"
                >
                  Cerrar Sesión
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar; 