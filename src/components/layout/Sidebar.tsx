import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { HiChevronDown, HiChevronRight } from 'react-icons/hi';
import { ShoppingCart, Package, Boxes, AlertCircle } from 'lucide-react';

interface MenuItem {
  title: string;
  path: string;
  icon?: React.ReactNode;
  submenu?: MenuItem[];
  requiredPermissions?: string[];
}

const menuItems: MenuItem[] = [
  {
    title: 'Dashboard',
    path: '/dashboard',
    requiredPermissions: ['DASHBOARD_VIEW']
  },
  {
    title: 'Tickets',
    path: '/dashboard/tickets',
    requiredPermissions: ['TICKETS_VIEW']
  },
  {
    title: 'Clientes',
    path: '/dashboard/clientes',
    requiredPermissions: ['CLIENTS_VIEW']
  },
  {
    title: 'Catálogos',
    path: '/dashboard/catalogo',
    requiredPermissions: ['CATALOG_VIEW'],
    submenu: [
      {
        title: 'Tipo de Servicio',
        path: '/dashboard/catalogo/tipo-servicio',
        requiredPermissions: ['CATALOG_VIEW']
      },
      {
        title: 'Status de Reparación',
        path: '/dashboard/catalogo/status-reparacion',
        requiredPermissions: ['CATALOG_VIEW']
      },
      {
        title: 'Proveedores',
        path: '/dashboard/catalogo/proveedores',
        requiredPermissions: ['CATALOG_VIEW']
      },
      {
        title: 'Reparaciones Frecuentes',
        path: '/dashboard/catalogo/reparaciones-frecuentes',
        requiredPermissions: ['CATALOG_VIEW']
      },
      {
        title: 'Check List',
        path: '/dashboard/catalogo/check-list',
        requiredPermissions: ['CATALOG_VIEW']
      }
    ]
  },
  {
    title: 'Inventario',
    path: '/dashboard/inventario',
    requiredPermissions: ['INVENTORY_VIEW'],
    submenu: [
      {
        title: 'Catálogo',
        path: '/dashboard/inventario/catalogo',
        requiredPermissions: ['INVENTORY_VIEW']
      },
      {
        title: 'Mínimos',
        path: '/dashboard/inventario/minimos',
        requiredPermissions: ['INVENTORY_VIEW']
      },
      {
        title: 'Stock',
        path: '/dashboard/inventario/stock',
        requiredPermissions: ['INVENTORY_VIEW']
      },
      {
        title: 'Movimientos',
        path: '/dashboard/inventario/movimientos',
        requiredPermissions: ['INVENTORY_VIEW']
      }
    ]
  },
  {
    title: 'Costos',
    path: '/dashboard/costos',
    requiredPermissions: ['COSTS_VIEW'],
    submenu: [
      {
        title: 'Precios de Venta',
        path: '/dashboard/costos/precios-venta',
        requiredPermissions: ['COSTS_VIEW']
      },
      {
        title: 'Precios de Compra',
        path: '/dashboard/costos/precios-compra',
        requiredPermissions: ['COSTS_VIEW']
      },
      {
        title: 'Márgenes',
        path: '/dashboard/costos/margenes',
        requiredPermissions: ['COSTS_VIEW']
      },
      {
        title: 'Historial',
        path: '/dashboard/costos/historial',
        requiredPermissions: ['COSTS_VIEW']
      }
    ]
  },
  {
    title: 'Administración',
    path: '/dashboard/admin',
    requiredPermissions: ['USERS_VIEW', 'ROLES_VIEW'],
    submenu: [
      {
        title: 'Usuarios',
        path: '/dashboard/admin/usuarios',
        requiredPermissions: ['USERS_VIEW']
      },
      {
        title: 'Roles',
        path: '/dashboard/admin/roles',
        requiredPermissions: ['ROLES_VIEW']
      },
      {
        title: 'Permisos',
        path: '/dashboard/admin/permisos',
        requiredPermissions: ['PERMISSIONS_VIEW']
      }
    ]
  },
  {
    title: 'Puntos de Recolección',
    path: '/dashboard/puntos-recoleccion',
    requiredPermissions: ['COLLECTION_POINTS_VIEW']
  }
];

const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const userPermissions = session?.user?.permissions || [];
  const [openMenus, setOpenMenus] = useState<string[]>(['Catálogos', 'Inventario']);
  
  // Filtrar elementos del menú según los permisos del usuario
  const filteredMenuItems = menuItems.filter(item => {
    // Si no se especifican permisos, todos pueden ver el elemento
    if (!item.requiredPermissions) return true;
    
    // Si el usuario es administrador, tiene acceso a todo
    if (session?.user?.role === 'ADMINISTRATOR') return true;
    
    // Verificar si el usuario tiene alguno de los permisos requeridos
    return item.requiredPermissions.some(permission => 
      userPermissions.includes(permission)
    );
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
      <div className="flex flex-col w-64">
        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto bg-white border-r">
          <div className="flex items-center flex-shrink-0 px-4">
            <img
              className="h-8 w-auto"
              src="/logo.png"
              alt="arregla.mx"
            />
          </div>
          <nav className="mt-5 flex-1 px-2 space-y-1">
            {filteredMenuItems.map((item) => (
              <div key={item.path}>
                {item.submenu ? (
                  <div>
                    <button
                      onClick={() => toggleMenu(item.title)}
                      className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full ${
                        openMenus.includes(item.title)
                          ? 'bg-gray-100 text-gray-900'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      {item.icon}
                      <span className="flex-1">{item.title}</span>
                      {openMenus.includes(item.title) ? (
                        <HiChevronDown className="ml-3 h-5 w-5" />
                      ) : (
                        <HiChevronRight className="ml-3 h-5 w-5" />
                      )}
                    </button>
                    {openMenus.includes(item.title) && (
                      <div className="pl-4 space-y-1">
                        {item.submenu
                          .filter(subItem => 
                            !subItem.requiredPermissions || 
                            session?.user?.role === 'ADMINISTRATOR' ||
                            subItem.requiredPermissions.some(permission => 
                              userPermissions.includes(permission)
                            )
                          )
                          .map((subItem) => (
                            <Link
                              key={subItem.path}
                              href={subItem.path}
                              className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                                pathname === subItem.path
                                  ? 'bg-gray-100 text-gray-900'
                                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                              }`}
                            >
                              {subItem.icon}
                              <span>{subItem.title}</span>
                            </Link>
                          ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href={item.path}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      pathname === item.path
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    {item.icon}
                    <span>{item.title}</span>
                  </Link>
                )}
              </div>
            ))}
          </nav>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar; 