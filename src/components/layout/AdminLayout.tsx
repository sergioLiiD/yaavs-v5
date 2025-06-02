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
  HiLocationMarker
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
    router.push('/auth/login');
  };

  // Lista de enlaces del sidebar
  const sidebarLinks = [
    { href: '/dashboard', icon: HiChartPie, text: 'Dashboard', active: pathname === '/dashboard' },
    { href: '/dashboard/tickets', icon: HiTicket, text: 'Tickets', active: pathname?.includes('/dashboard/tickets') },
    { href: '/dashboard/clientes', icon: HiUsers, text: 'Clientes', active: pathname?.includes('/dashboard/clientes') },
    { href: '/dashboard/reportes', icon: HiClipboardCheck, text: 'Reportes', active: pathname?.includes('/dashboard/reportes') },
    { href: '/dashboard/collection-points', icon: HiLocationMarker, text: 'Puntos de Recolección', active: pathname?.includes('/dashboard/collection-points') },
  ];

  const configLinks = [
    { href: '/dashboard/usuarios', icon: HiUsers, text: 'Usuarios', active: title.includes('Usuarios') },
    { href: '/dashboard/configuracion', icon: HiCog, text: 'Configuración', active: title.includes('Configuración') },
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

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar para desktop */}
      <div className={`fixed inset-y-0 left-0 z-10 w-64 transition-transform duration-300 ease-in-out transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="h-full overflow-y-auto py-4 px-3 bg-white border-r border-gray-200">
          <div className="flex items-center pl-2.5 mb-5">
            <img src="/logo.png" className="mr-3 h-18 sm:h-21" alt="YAAVS Logo" 
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
                    className={`flex items-center p-2 text-base font-normal rounded-lg hover:bg-gray-100 
                      ${link.active ? 'bg-[#FEBF19]/10 text-[#FEBF19]' : 'text-gray-900'}`}
                  >
                    <link.icon className={`w-6 h-6 ${link.active ? 'text-[#FEBF19]' : 'text-gray-500'}`} />
                    <span className="ml-3">{link.text}</span>
                  </Link>
                </li>
              ))}

              {/* Menú de Inventario con submenús */}
              <li>
                <button
                  type="button"
                  className={`flex items-center w-full p-2 text-base font-normal text-gray-900 rounded-lg transition duration-75 group hover:bg-gray-100 ${
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
                        className={`flex items-center p-2 pl-11 text-base font-normal rounded-lg hover:bg-gray-100 
                          ${link.active ? 'text-[#FEBF19] bg-[#FEBF19]/10' : 'text-gray-900'}`}
                      >
                        <link.icon className={`w-5 h-5 mr-2 ${link.active ? 'text-[#FEBF19]' : 'text-gray-500'}`} />
                        {link.text}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>

              {/* Menú de Catálogo con submenús */}
              <li>
                <button
                  type="button"
                  className={`flex items-center w-full p-2 text-base font-normal text-gray-900 rounded-lg transition duration-75 group hover:bg-gray-100 ${
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
                        className={`flex items-center p-2 pl-11 text-base font-normal rounded-lg hover:bg-gray-100 
                          ${link.active ? 'text-[#FEBF19] bg-[#FEBF19]/10' : 'text-gray-900'}`}
                      >
                        <link.icon className={`w-5 h-5 mr-2 ${link.active ? 'text-[#FEBF19]' : 'text-gray-500'}`} />
                        {link.text}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>

              {/* Menú de Costos con submenús */}
              <li>
                <button
                  type="button"
                  className={`flex items-center w-full p-2 text-base font-normal text-gray-900 rounded-lg transition duration-75 group hover:bg-gray-100 ${
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
                        className={`flex items-center p-2 pl-11 text-base font-normal rounded-lg hover:bg-gray-100 
                          ${link.active ? 'text-[#FEBF19] bg-[#FEBF19]/10' : 'text-gray-900'}`}
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
                    className={`flex items-center p-2 text-base font-normal rounded-lg hover:bg-gray-100
                      ${link.active ? 'bg-[#FEBF19]/10 text-[#FEBF19]' : 'text-gray-900'}`}
                  >
                    <link.icon className={`w-6 h-6 ${link.active ? 'text-[#FEBF19]' : 'text-gray-500'}`} />
                    <span className="ml-3">{link.text}</span>
                  </Link>
                </li>
              ))}
              <li>
                <button
                  onClick={handleSignOut}
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
                <span className="self-center whitespace-nowrap text-xl font-semibold text-gray-900">
                  {title}
                </span>
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
                <button 
                  onClick={toggleUserMenu}
                  className="flex text-sm rounded-full focus:ring-4 focus:ring-gray-300"
                >
                  <img 
                    className="w-8 h-8 rounded-full border-2 border-blue-500"
                    src="https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff"
                    alt="User settings"
                  />
                </button>
                
                {/* Menú desplegable */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white divide-y divide-gray-100 rounded-lg shadow z-50">
                    <div className="px-4 py-3">
                      <span className="block text-sm text-gray-900">
                        {session?.user?.name || 'Admin'}
                      </span>
                      <span className="block text-sm text-gray-500 truncate">
                        {session?.user?.email || 'admin@example.com'}
                      </span>
                    </div>
                    <ul className="py-2">
                      <li>
                        <Link href="/dashboard/perfil" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          <HiUser className="mr-2 h-5 w-5" />
                          Mi Perfil
                        </Link>
                      </li>
                      <li>
                        <Link href="/dashboard/configuracion" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          <HiCog className="mr-2 h-5 w-5" />
                          Configuración
                        </Link>
                      </li>
                      <li>
                        <button 
                          onClick={handleSignOut}
                          className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                        >
                          <HiLogout className="mr-2 h-5 w-5" />
                          Cerrar Sesión
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
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
                <img src="/logo.png" className="mr-3 h-21" alt="YAAVS Logo" 
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
                        className={`flex items-center p-2 text-base font-normal rounded-lg hover:bg-gray-100 
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
                      className={`flex items-center w-full p-2 text-base font-normal text-gray-900 rounded-lg transition duration-75 group hover:bg-gray-100 ${
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
                            className={`flex items-center p-2 pl-11 text-base font-normal rounded-lg hover:bg-gray-100 
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
                      className={`flex items-center w-full p-2 text-base font-normal text-gray-900 rounded-lg transition duration-75 group hover:bg-gray-100 ${
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
                            className={`flex items-center p-2 pl-11 text-base font-normal rounded-lg hover:bg-gray-100 
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
                      className={`flex items-center w-full p-2 text-base font-normal text-gray-900 rounded-lg transition duration-75 group hover:bg-gray-100 ${
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
                            className={`flex items-center p-2 pl-11 text-base font-normal rounded-lg hover:bg-gray-100 
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
                        className={`flex items-center p-2 text-base font-normal rounded-lg hover:bg-gray-100
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