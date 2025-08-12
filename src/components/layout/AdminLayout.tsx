'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { 
  HiAdjustments,
  HiChartPie, 
  HiClipboardCheck, 
  HiCog,
  HiLogout,
  HiMenu,
  HiPhone,
  HiShoppingBag,
  HiTicket,
  HiUser,
  HiUsers,
  HiX,
  HiViewList,
  HiCollection,
  HiTag,
  HiDeviceMobile,
  HiClipboardList,
  HiCube,
  HiCurrencyDollar,
  HiLocationMarker,
  HiUserGroup,
  HiKey
} from 'react-icons/hi';
import Link from 'next/link';

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function AdminLayout({ children, title = 'Dashboard' }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [catalogoOpen, setCatalogoOpen] = useState(false);
  const [inventarioOpen, setInventarioOpen] = useState(false);
  const [costosOpen, setCostosOpen] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);

  const userRole = session?.user?.role;
  const isRepairPointUser = userRole === 'ADMINISTRADOR_PUNTO' || userRole === 'USUARIO_PUNTO';

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
  };

  const toggleCatalogo = () => {
    setCatalogoOpen(!catalogoOpen);
  };

  const toggleInventario = () => {
    setInventarioOpen(!inventarioOpen);
  };

  const toggleCostos = () => {
    setCostosOpen(!costosOpen);
  };

  const toggleConfig = () => {
    setConfigOpen(!configOpen);
  };

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/auth/login?callbackUrl=/dashboard');
  };

  // Función para determinar qué enlaces puede ver el usuario según su rol
  const getFilteredMenuLinks = () => {
    const userRole = session?.user?.role;
    const userPermissions = session?.user?.permissions || [];
    
    console.log('🔍 AdminLayout Debug:', {
      userRole,
      userPermissions,
      session: session?.user
    });

    // Enlaces principales - todos los usuarios pueden ver estos
    const baseLinks = [
      { href: '/dashboard', icon: HiChartPie, text: 'Dashboard', active: pathname === '/dashboard' },
      { href: '/dashboard/tickets', icon: HiTicket, text: 'Tickets', active: pathname?.includes('/dashboard/tickets') },
      { href: '/dashboard/venta-productos', icon: HiShoppingBag, text: 'Venta de Productos', active: pathname?.includes('/dashboard/venta-productos') },
      { href: '/dashboard/presupuestos', icon: HiClipboardCheck, text: 'Presupuestos', active: pathname?.includes('/dashboard/presupuestos') },
      { href: '/dashboard/clientes', icon: HiUsers, text: 'Clientes', active: pathname?.includes('/dashboard/clientes') },
      { href: '/dashboard/cupones', icon: HiTag, text: 'Cupones', active: pathname?.includes('/dashboard/cupones') },
    ];

    // Enlaces adicionales según el rol
    const additionalLinks = [];

    // ADMINISTRADOR ve todo
    if (userRole === 'ADMINISTRADOR') {
      additionalLinks.push(
        { href: '/dashboard/reportes', icon: HiClipboardCheck, text: 'Reportes', active: pathname?.includes('/dashboard/reportes') },
        { href: '/dashboard/collection-points', icon: HiLocationMarker, text: 'Puntos de Recolección', active: pathname?.includes('/dashboard/collection-points') }
      );
    }

    // ADMINISTRADOR_PUNTO ve puntos de recolección
    if (userRole === 'ADMINISTRADOR_PUNTO') {
      additionalLinks.push(
        { href: '/dashboard/collection-points', icon: HiLocationMarker, text: 'Puntos de Recolección', active: pathname?.includes('/dashboard/collection-points') }
      );
    }

    const finalLinks = [...baseLinks, ...additionalLinks];
    console.log('🔍 Final menu links:', finalLinks.map(link => link.text));
    return finalLinks;
  };

  // Función para determinar qué submenús puede ver el usuario
  const canSeeSubmenu = (submenuType: string) => {
    const userRole = session?.user?.role;
    
    switch (submenuType) {
      case 'inventario':
        return userRole === 'ADMINISTRADOR';
      case 'catalogo':
        return userRole === 'ADMINISTRADOR';
      case 'costos':
        return userRole === 'ADMINISTRADOR';
      case 'configuracion':
        return userRole === 'ADMINISTRADOR';
      default:
        return false;
    }
  };

  // Lista de enlaces del sidebar filtrada por rol
  const sidebarLinks = getFilteredMenuLinks();

  const configLinks = [
    { href: '/dashboard/admin/usuarios', icon: HiUsers, text: 'Usuarios', active: pathname?.includes('/dashboard/admin/usuarios') },
    { href: '/dashboard/admin/roles', icon: HiAdjustments, text: 'Roles', active: pathname?.includes('/dashboard/admin/roles') },
    { href: '/dashboard/admin/configuracion', icon: HiCog, text: 'Configuración', active: pathname?.includes('/dashboard/admin/configuracion') },
    { href: '/dashboard/perfil', icon: HiUser, text: 'Mi Perfil', active: title.includes('Perfil') },
  ];

  const catalogoLinks = [
    { href: '/dashboard/catalogo/tipo-servicio', icon: HiTag, text: 'Tipo de Servicio', active: pathname?.includes('/dashboard/catalogo/tipo-servicio') },
    { href: '/dashboard/catalogo/marcas', icon: HiDeviceMobile, text: 'Marcas de Celulares', active: pathname?.includes('/dashboard/catalogo/marcas') },
    { href: '/dashboard/catalogo/modelos', icon: HiPhone, text: 'Modelos de Celulares', active: pathname?.includes('/dashboard/catalogo/modelos') },
    { href: '/dashboard/catalogo/status-reparacion', icon: HiClipboardList, text: 'Estados de Reparación', active: pathname?.includes('/dashboard/catalogo/status-reparacion') },
    { href: '/dashboard/catalogo/proveedores', icon: HiShoppingBag, text: 'Proveedores', active: pathname?.includes('/dashboard/catalogo/proveedores') },
    { href: '/dashboard/catalogo/reparaciones-frecuentes', icon: HiClipboardCheck, text: 'Reparaciones Frecuentes', active: pathname?.includes('/dashboard/catalogo/reparaciones-frecuentes') },
    { href: '/dashboard/catalogo/check-list', icon: HiClipboardCheck, text: 'Checklist de Verificación', active: pathname?.includes('/dashboard/catalogo/check-list') },
  ];

  const inventarioLinks = [
    {
      route: '/dashboard/inventario/catalogo',
      icon: HiShoppingBag,
      text: 'Catálogo',
      active: pathname?.includes('/dashboard/inventario/catalogo')
    },
    {
      route: '/dashboard/inventario/stock',
      icon: HiCube,
      text: 'Stock',
      active: pathname?.includes('/dashboard/inventario/stock')
    },
    {
      route: '/dashboard/inventario/minimos',
      icon: HiAdjustments,
      text: 'Inventarios Mínimos',
      active: pathname?.includes('/dashboard/inventario/minimos')
    }
  ];

  const costosLinks = [
    {
      route: '/dashboard/costos/precios-venta',
      icon: HiCurrencyDollar,
      text: 'Precios de Venta',
      active: pathname?.includes('/dashboard/costos/precios-venta')
    }
  ];

  const adminLinks = [
    {
      title: 'Administración',
      items: [
        {
          title: 'Usuarios',
          href: '/dashboard/admin/usuarios',
          icon: HiUsers
        },
        {
          title: 'Roles',
          href: '/dashboard/admin/roles',
          icon: HiUserGroup
        },
        {
          title: 'Permisos',
          href: '/dashboard/admin/permisos',
          icon: HiKey
        }
      ]
    }
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar para desktop */}
      <div className={`fixed inset-y-0 left-0 z-10 w-64 transition-transform duration-300 ease-in-out transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="h-full overflow-y-auto py-4 px-3 bg-white border-r border-gray-200">
          <div className="flex items-center pl-2.5 mb-5">
                            <img src="/logo.png" className="mr-3 h-18 sm:h-21" alt="arregla.mx Logo" 
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </div>
          
          <div className="space-y-2">
            {/* Enlaces principales */}
            <ul className="space-y-2">
              {sidebarLinks.map((link, index) => (
                <li key={index}>
                  <Link 
                    href={link.href}
                    className={`flex items-center p-2 text-base font-normal rounded-lg hover:bg-[#FEBF19]/10
                      ${link.active ? 'bg-[#FEBF19]/10 text-[#FEBF19]' : 'text-gray-900'}`}
                  >
                    <link.icon className={`w-6 h-6 ${link.active ? 'text-[#FEBF19]' : 'text-gray-500'}`} />
                    <span className="ml-3">{link.text}</span>
                  </Link>
                </li>
              ))}
            </ul>

            {/* Submenús filtrados por rol */}
            {canSeeSubmenu('inventario') && (
              <li>
                <button
                  type="button"
                  className={`flex items-center w-full p-2 text-base font-normal text-gray-900 rounded-lg transition duration-75 group hover:bg-[#FEBF19]/10 ${
                    title.includes('Inventario') && 'bg-[#FEBF19]/10'
                  }`}
                  onClick={toggleInventario}
                >
                  <HiShoppingBag className={`w-6 h-6 text-gray-500 transition duration-75 ${
                    title.includes('Inventario') && 'text-[#FEBF19]'
                  }`} />
                  <span className={`flex-1 ml-3 text-left whitespace-nowrap ${
                    title.includes('Inventario') && 'text-[#FEBF19]'
                  }`}>Inventario</span>
                  <svg className={`w-5 h-5 ${inventarioOpen ? 'rotate-180' : ''}`} aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path>
                  </svg>
                </button>
                <ul className={`${inventarioOpen ? 'block' : 'hidden'} py-2 space-y-2`}>
                  {inventarioLinks.map((link, index) => (
                    <li key={index}>
                      <Link
                        href={link.route}
                        className={`flex items-center p-2 pl-11 text-base font-normal rounded-lg hover:bg-[#FEBF19]/10 
                          ${link.active ? 'text-[#FEBF19] bg-[#FEBF19]/10' : 'text-gray-900'}`}
                      >
                        <link.icon className={`w-5 h-5 mr-2 ${link.active ? 'text-[#FEBF19]' : 'text-gray-500'}`} />
                        {link.text}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            )}

            {canSeeSubmenu('catalogo') && (
              <li>
                <button
                  type="button"
                  className={`flex items-center w-full p-2 text-base font-normal text-gray-900 rounded-lg transition duration-75 group hover:bg-[#FEBF19]/10 ${
                    title.includes('Catálogo') && 'bg-[#FEBF19]/10'
                  }`}
                  onClick={toggleCatalogo}
                >
                  <HiCollection className={`w-6 h-6 text-gray-500 transition duration-75 ${
                    title.includes('Catálogo') && 'text-[#FEBF19]'
                  }`} />
                  <span className={`flex-1 ml-3 text-left whitespace-nowrap ${
                    title.includes('Catálogo') && 'text-[#FEBF19]'
                  }`}>Catálogo</span>
                  <svg className={`w-5 h-5 ${catalogoOpen ? 'rotate-180' : ''}`} aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path>
                  </svg>
                </button>
                <ul className={`${catalogoOpen ? 'block' : 'hidden'} py-2 space-y-2`}>
                  {catalogoLinks.map((link, index) => (
                    <li key={index}>
                      <Link
                        href={link.href}
                        className={`flex items-center p-2 pl-11 text-base font-normal rounded-lg hover:bg-[#FEBF19]/10 
                          ${link.active ? 'text-[#FEBF19] bg-[#FEBF19]/10' : 'text-gray-900'}`}
                      >
                        <link.icon className={`w-5 h-5 mr-2 ${link.active ? 'text-[#FEBF19]' : 'text-gray-500'}`} />
                        {link.text}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            )}

            {canSeeSubmenu('costos') && (
              <li>
                <button
                  type="button"
                  className={`flex items-center w-full p-2 text-base font-normal text-gray-900 rounded-lg transition duration-75 group hover:bg-[#FEBF19]/10 ${
                    title.includes('Costos') && 'bg-[#FEBF19]/10'
                  }`}
                  onClick={toggleCostos}
                >
                  <HiCurrencyDollar className={`w-6 h-6 text-gray-500 transition duration-75 ${
                    title.includes('Costos') && 'text-[#FEBF19]'
                  }`} />
                  <span className={`flex-1 ml-3 text-left whitespace-nowrap ${
                    title.includes('Costos') && 'text-[#FEBF19]'
                  }`}>Costos</span>
                  <svg className={`w-5 h-5 ${costosOpen ? 'rotate-180' : ''}`} aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path>
                  </svg>
                </button>
                <ul className={`${costosOpen ? 'block' : 'hidden'} py-2 space-y-2`}>
                  {costosLinks.map((link, index) => (
                    <li key={index}>
                      <Link
                        href={link.route}
                        className={`flex items-center p-2 pl-11 text-base font-normal rounded-lg hover:bg-[#FEBF19]/10 
                          ${link.active ? 'text-[#FEBF19] bg-[#FEBF19]/10' : 'text-gray-900'}`}
                      >
                        <link.icon className={`w-5 h-5 mr-2 ${link.active ? 'text-[#FEBF19]' : 'text-gray-500'}`} />
                        {link.text}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            )}

            {canSeeSubmenu('configuracion') && (
              <li>
                <button
                  type="button"
                  className={`flex items-center w-full p-2 text-base font-normal text-gray-900 rounded-lg transition duration-75 group hover:bg-[#FEBF19]/10 ${
                    title.includes('Administración') && 'bg-[#FEBF19]/10'
                  }`}
                  onClick={toggleConfig}
                >
                  <HiUserGroup className={`w-6 h-6 text-gray-500 transition duration-75 ${
                    title.includes('Administración') && 'text-[#FEBF19]'
                  }`} />
                  <span className={`flex-1 ml-3 text-left whitespace-nowrap ${
                    title.includes('Administración') && 'text-[#FEBF19]'
                  }`}>Administración</span>
                  <svg className={`w-5 h-5 ${configOpen ? 'rotate-180' : ''}`} aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path>
                  </svg>
                </button>
                <ul className={`${configOpen ? 'block' : 'hidden'} py-2 space-y-2`}>
                  {adminLinks[0].items.map((link, index) => (
                    <li key={index}>
                      <Link
                        href={link.href}
                        className={`flex items-center p-2 pl-11 text-base font-normal rounded-lg hover:bg-[#FEBF19]/10 
                          ${pathname?.includes(link.href) ? 'text-[#FEBF19] bg-[#FEBF19]/10' : 'text-gray-900'}`}
                      >
                        <link.icon className={`w-5 h-5 mr-2 ${pathname?.includes(link.href) ? 'text-[#FEBF19]' : 'text-gray-500'}`} />
                        {link.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            )}
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Barra de navegación superior */}
        <header className="bg-white border-b sticky top-0 z-40">
          <div className="px-4 py-2.5 w-full flex items-center justify-between">
            <div className="flex items-center">
              <button 
                className="lg:hidden p-2 mr-2 text-gray-600 rounded-lg hover:bg-gray-100" 
                onClick={toggleMobileMenu}
              >
                {mobileMenuOpen ? <HiX className="h-6 w-6" /> : <HiMenu className="h-6 w-6" />}
              </button>
              <Link href="/dashboard" className="flex items-center">
                <img 
                  src="/logo.png" 
                  alt="arregla.mx Logo" 
                  className="h-12 w-auto"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={toggleSidebar} 
                className="hidden lg:flex p-2 text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <HiAdjustments className="h-5 w-5" />
              </button>
              
              {/* Menú de usuario */}
              <div className="relative">
                <div className="hidden md:flex items-center">
                  <span className="text-sm text-gray-500 mr-4">
                    {session?.user?.name || 'Admin'}
                  </span>
                  <button 
                    onClick={handleSignOut}
                    className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 rounded-md"
                  >
                    <HiLogout className="mr-2 h-5 w-5" />
                    Cerrar Sesión
                  </button>
                </div>
                <div className="relative md:hidden">
                  <button
                    onClick={toggleUserMenu}
                    className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-[#FEBF19]"
                  >
                    <span className="sr-only">Abrir menú de usuario</span>
                    <div className="h-8 w-8 rounded-full bg-[#FEBF19] flex items-center justify-center text-white">
                      {session?.user?.name?.[0]?.toUpperCase() || 'A'}
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Contenido de la página */}
        <main className="flex-1 overflow-y-auto p-4">
          {children}
        </main>

        {/* Menú móvil */}
        <div className={`lg:hidden fixed inset-0 z-30 bg-gray-800 bg-opacity-30 transition-opacity duration-200 ${
          mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`} onClick={toggleMobileMenu}>
          <div className="fixed inset-y-0 left-0 z-30 w-9/12 max-w-sm bg-white" onClick={e => e.stopPropagation()}>
            <div className="h-full overflow-y-auto p-4">
              <div className="flex items-center mb-5">
                <img src="/logo.png" className="mr-3 h-21" alt="arregla.mx Logo" 
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
                <button 
                  className="ml-auto inline-flex items-center p-2 text-gray-500 rounded-lg hover:bg-gray-100"
                  onClick={toggleMobileMenu}
                >
                  <HiX className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-2">
                {/* Enlaces principales */}
                <ul className="space-y-2">
                  {sidebarLinks.map((link, index) => (
                    <li key={index}>
                      <Link 
                        href={link.href}
                        className={`flex items-center p-2 text-base font-normal rounded-lg hover:bg-[#FEBF19]/10
                          ${link.active ? 'bg-[#FEBF19]/10 text-[#FEBF19]' : 'text-gray-900'}`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <link.icon className={`w-6 h-6 ${link.active ? 'text-[#FEBF19]' : 'text-gray-500'}`} />
                        <span className="ml-3">{link.text}</span>
                      </Link>
                    </li>
                  ))}
                  
                  {/* Menú de Inventario con submenús para móvil */}
                  <li>
                    <button
                      type="button"
                      className={`flex items-center w-full p-2 text-base font-normal text-gray-900 rounded-lg transition duration-75 group hover:bg-[#FEBF19]/10 ${
                        title.includes('Inventario') && 'bg-[#FEBF19]/10'
                      }`}
                      onClick={toggleInventario}
                    >
                      <HiShoppingBag className={`w-6 h-6 text-gray-500 transition duration-75 ${
                        title.includes('Inventario') && 'text-[#FEBF19]'
                      }`} />
                      <span className={`flex-1 ml-3 text-left whitespace-nowrap ${
                        title.includes('Inventario') && 'text-[#FEBF19]'
                      }`}>Inventario</span>
                      <svg className={`w-5 h-5 ${inventarioOpen ? 'rotate-180' : ''}`} aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path>
                      </svg>
                    </button>
                    <ul className={`${inventarioOpen ? 'block' : 'hidden'} py-2 space-y-2`}>
                      {inventarioLinks.map((link, index) => (
                        <li key={index}>
                          <Link
                            href={link.route}
                            className={`flex items-center p-2 pl-11 text-base font-normal rounded-lg hover:bg-[#FEBF19]/10 
                              ${link.active ? 'text-[#FEBF19] bg-[#FEBF19]/10' : 'text-gray-900'}`}
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <link.icon className={`w-5 h-5 mr-2 ${link.active ? 'text-[#FEBF19]' : 'text-gray-500'}`} />
                            {link.text}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </li>

                  {/* Menú de Catálogo con submenús para móvil */}
                  <li>
                    <button
                      type="button"
                      className={`flex items-center w-full p-2 text-base font-normal text-gray-900 rounded-lg transition duration-75 group hover:bg-[#FEBF19]/10 ${
                        title.includes('Catálogo') && 'bg-[#FEBF19]/10'
                      }`}
                      onClick={toggleCatalogo}
                    >
                      <HiCollection className={`w-6 h-6 text-gray-500 transition duration-75 ${
                        title.includes('Catálogo') && 'text-[#FEBF19]'
                      }`} />
                      <span className={`flex-1 ml-3 text-left whitespace-nowrap ${
                        title.includes('Catálogo') && 'text-[#FEBF19]'
                      }`}>Catálogo</span>
                      <svg className={`w-5 h-5 ${catalogoOpen ? 'rotate-180' : ''}`} aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path>
                      </svg>
                    </button>
                    <ul className={`${catalogoOpen ? 'block' : 'hidden'} py-2 space-y-2`}>
                      {catalogoLinks.map((link, index) => (
                        <li key={index}>
                          <Link
                            href={link.href}
                            className={`flex items-center p-2 pl-11 text-base font-normal rounded-lg hover:bg-[#FEBF19]/10 
                              ${link.active ? 'text-[#FEBF19] bg-[#FEBF19]/10' : 'text-gray-900'}`}
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <link.icon className={`w-5 h-5 mr-2 ${link.active ? 'text-[#FEBF19]' : 'text-gray-500'}`} />
                            {link.text}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </li>

                  {/* Menú de Costos con submenús para móvil */}
                  <li>
                    <button
                      type="button"
                      className={`flex items-center w-full p-2 text-base font-normal text-gray-900 rounded-lg transition duration-75 group hover:bg-[#FEBF19]/10 ${
                        title.includes('Costos') && 'bg-[#FEBF19]/10'
                      }`}
                      onClick={toggleCostos}
                    >
                      <HiCurrencyDollar className={`w-6 h-6 text-gray-500 transition duration-75 ${
                        title.includes('Costos') && 'text-[#FEBF19]'
                      }`} />
                      <span className={`flex-1 ml-3 text-left whitespace-nowrap ${
                        title.includes('Costos') && 'text-[#FEBF19]'
                      }`}>Costos</span>
                      <svg className={`w-5 h-5 ${costosOpen ? 'rotate-180' : ''}`} aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path>
                      </svg>
                    </button>
                    <ul className={`${costosOpen ? 'block' : 'hidden'} py-2 space-y-2`}>
                      {costosLinks.map((link, index) => (
                        <li key={index}>
                          <Link
                            href={link.route}
                            className={`flex items-center p-2 pl-11 text-base font-normal rounded-lg hover:bg-[#FEBF19]/10 
                              ${link.active ? 'text-[#FEBF19] bg-[#FEBF19]/10' : 'text-gray-900'}`}
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <link.icon className={`w-5 h-5 mr-2 ${link.active ? 'text-[#FEBF19]' : 'text-gray-500'}`} />
                            {link.text}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </li>
                </ul>
                
                <hr className="my-2 border-gray-200" />
                
                {/* Enlaces de configuración */}
                <ul className="space-y-2">
                  {configLinks.map((link, index) => (
                    <li key={index}>
                      <Link 
                        href={link.href}
                        className={`flex items-center p-2 text-base font-normal rounded-lg hover:bg-[#FEBF19]/10
                          ${link.active ? 'bg-[#FEBF19]/10 text-[#FEBF19]' : 'text-gray-900'}`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <link.icon className={`w-6 h-6 ${link.active ? 'text-[#FEBF19]' : 'text-gray-500'}`} />
                        <span className="ml-3">{link.text}</span>
                      </Link>
                    </li>
                  ))}
                  <li>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleSignOut();
                      }}
                      className="flex w-full items-center p-2 text-base font-normal text-red-600 rounded-lg hover:bg-red-50"
                    >
                      <HiLogout className="w-6 h-6 text-red-500" />
                      <span className="ml-3">Cerrar Sesión</span>
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}