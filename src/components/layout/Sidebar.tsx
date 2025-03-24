import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface MenuItem {
  name: string;
  href: string;
  icon: string;
  roles?: string[]; // Roles que pueden ver este menú
}

const menuItems: MenuItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
  { name: 'Tickets', href: '/tickets', icon: 'receipt' },
  { name: 'Clientes', href: '/clientes', icon: 'person' },
  { 
    name: 'Inventario', 
    href: '/inventario', 
    icon: 'inventory',
    roles: ['ADMINISTRADOR', 'GERENTE', 'TECNICO'] 
  },
  { 
    name: 'Catálogos', 
    href: '/catalogos', 
    icon: 'list',
    roles: ['ADMINISTRADOR', 'GERENTE'] 
  },
  { 
    name: 'Usuarios', 
    href: '/usuarios', 
    icon: 'people',
    roles: ['ADMINISTRADOR'] 
  },
];

const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const userRole = session?.user?.role || '';
  
  // Filtrar elementos del menú según el rol del usuario
  const filteredMenuItems = menuItems.filter(item => {
    // Si no se especifican roles, todos pueden ver el elemento
    if (!item.roles) return true;
    // Si se especifican roles, verificar si el usuario tiene uno de ellos
    return item.roles.includes(userRole);
  });

  return (
    <aside className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64 bg-blue-800 text-white">
        <div className="flex items-center justify-center h-16 bg-blue-900">
          <span className="text-xl font-semibold">YAAVS</span>
        </div>
        
        <nav className="mt-5 flex-1 px-2 bg-blue-800 space-y-1">
          {filteredMenuItems.map((item) => {
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
                <p className="text-sm font-medium text-white">
                  {session?.user?.name || 'Usuario'}
                </p>
                <p className="text-xs font-medium text-blue-200">
                  {userRole || 'Sin rol asignado'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar; 