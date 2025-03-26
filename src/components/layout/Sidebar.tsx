import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { HiChevronDown, HiChevronRight } from 'react-icons/hi';
import { ShoppingCart, Package, Boxes, AlertCircle } from 'lucide-react';

interface MenuItem {
  name: string;
  href: string;
  icon: string;
  roles?: string[]; // Roles que pueden ver este menú
  submenu?: {
    name: string;
    href: string;
    icon: string;
  }[];
}

const menuItems: MenuItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
  { name: 'Tickets', href: '/tickets', icon: 'receipt' },
  { name: 'Clientes', href: '/clientes', icon: 'person' },
  { 
    name: 'Inventario', 
    href: '/dashboard/inventario', 
    icon: 'inventory',
    roles: ['ADMINISTRADOR', 'GERENTE', 'TECNICO'],
    submenu: [
      { name: 'Catálogo', href: '/dashboard/inventario/catalogo', icon: 'inventory_2' },
      { name: 'Stock', href: '/dashboard/inventario/stock', icon: 'inventory' },
      { name: 'Inventarios Mínimos', href: '/dashboard/inventario/minimos', icon: 'warning' },
    ]
  },
  { 
    name: 'Catálogos', 
    href: '/dashboard/catalogo', 
    icon: 'list',
    roles: ['ADMINISTRADOR', 'GERENTE'],
    submenu: [
      { name: 'Marcas', href: '/dashboard/catalogo/marcas', icon: 'branding' },
      { name: 'Modelos', href: '/dashboard/catalogo/modelos', icon: 'phone_iphone' },
      { name: 'Tipos de Servicio', href: '/dashboard/catalogo/tipo-servicio', icon: 'build' },
      { name: 'Proveedores', href: '/dashboard/catalogo/proveedores', icon: 'business' }
    ]
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
  const [openMenus, setOpenMenus] = useState<string[]>(['Catálogos', 'Inventario']);
  
  // Filtrar elementos del menú según el rol del usuario
  const filteredMenuItems = menuItems.filter(item => {
    // Si no se especifican roles, todos pueden ver el elemento
    if (!item.roles) return true;
    // Si se especifican roles, verificar si el usuario tiene uno de ellos
    return item.roles.includes(userRole);
  });

  const toggleMenu = (menuName: string) => {
    setOpenMenus(prev => 
      prev.includes(menuName) 
        ? prev.filter(name => name !== menuName)
        : [...prev, menuName]
    );
  };

  return (
    <aside className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64 bg-blue-800 text-white">
        <div className="flex items-center justify-center h-16 bg-blue-900">
          <span className="text-xl font-semibold">YAAVS</span>
        </div>
        
        <nav className="mt-5 flex-1 px-2 bg-blue-800 space-y-1">
          {filteredMenuItems.map((item) => {
            const isActive = pathname === item.href || 
                           pathname?.startsWith(`${item.href}/`) ||
                           (item.submenu?.some(subItem => 
                             pathname === subItem.href || 
                             pathname?.startsWith(`${subItem.href}/`)
                           ));
            const hasSubmenu = item.submenu && item.submenu.length > 0;
            const isSubmenuOpen = openMenus.includes(item.name);
            
            return (
              <div key={item.name}>
                {hasSubmenu ? (
                  <button
                    onClick={() => toggleMenu(item.name)}
                    className={`${
                      isActive
                        ? 'bg-blue-900 text-white'
                        : 'text-blue-100 hover:bg-blue-700'
                    } group flex items-center justify-between w-full px-2 py-2.5 text-sm font-medium rounded-md`}
                  >
                    <div className="flex items-center">
                      <span className="material-symbols-outlined mr-3 flex-shrink-0 h-6 w-6">
                        {item.icon}
                      </span>
                      {item.name}
                    </div>
                    {isSubmenuOpen ? (
                      <HiChevronDown className="h-5 w-5" />
                    ) : (
                      <HiChevronRight className="h-5 w-5" />
                    )}
                  </button>
                ) : (
                  <Link
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
                )}
                
                {hasSubmenu && isSubmenuOpen && (
                  <div className="ml-4 mt-1 space-y-1">
                    {item.submenu.map((subItem) => {
                      const isSubItemActive = pathname === subItem.href || pathname?.startsWith(`${subItem.href}/`);
                      return (
                        <Link
                          key={subItem.name}
                          href={subItem.href}
                          className={`${
                            isSubItemActive
                              ? 'bg-blue-900 text-white'
                              : 'text-blue-100 hover:bg-blue-700'
                          } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                        >
                          <span className="material-symbols-outlined mr-3 flex-shrink-0 h-5 w-5">
                            {subItem.icon}
                          </span>
                          {subItem.name}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
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