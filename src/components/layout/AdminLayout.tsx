'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
  HiClipboardList
} from 'react-icons/hi';
import Link from 'next/link';

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function AdminLayout({ children, title = 'Dashboard' }: AdminLayoutProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [catalogoOpen, setCatalogoOpen] = useState(false);

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

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/auth/login');
  };

  // Lista de enlaces del sidebar
  const sidebarLinks = [
    { href: '/dashboard', icon: HiChartPie, text: 'Dashboard', active: title === 'Dashboard' },
    { href: '/dashboard/tickets', icon: HiTicket, text: 'Tickets', active: title.includes('Tickets') },
    { href: '/dashboard/clientes', icon: HiUsers, text: 'Clientes', active: title.includes('Clientes') },
    { href: '/dashboard/dispositivos', icon: HiPhone, text: 'Dispositivos', active: title.includes('Dispositivos') },
    { href: '/dashboard/inventario', icon: HiShoppingBag, text: 'Inventario', active: title.includes('Inventario') },
    { href: '/dashboard/reportes', icon: HiClipboardCheck, text: 'Reportes', active: title.includes('Reportes') },
  ];

  const configLinks = [
    { href: '/dashboard/configuracion', icon: HiCog, text: 'Configuración', active: title.includes('Configuración') },
    { href: '/dashboard/perfil', icon: HiUser, text: 'Mi Perfil', active: title.includes('Perfil') },
  ];

  const catalogoLinks = [
    { href: '/dashboard/catalogo/tipo-servicio', icon: HiTag, text: 'Tipo de Servicio', active: title.includes('Tipo de Servicio') },
    { href: '/dashboard/catalogo/marcas', icon: HiDeviceMobile, text: 'Marcas de Celulares', active: title.includes('Marcas de Celulares') },
    { href: '/dashboard/catalogo/modelos', icon: HiPhone, text: 'Modelos de Celulares', active: title.includes('Modelos de Celulares') },
    { href: '/dashboard/catalogo/status-reparacion', icon: HiClipboardList, text: 'Estados de Reparación', active: title.includes('Estados de Reparación') },
    { href: '/dashboard/catalogo/proveedores', icon: HiShoppingBag, text: 'Proveedores', active: title.includes('Proveedores') },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar para desktop */}
      <div className={`fixed inset-y-0 left-0 z-10 w-64 transition-transform duration-300 ease-in-out transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="h-full overflow-y-auto py-4 px-3 bg-white border-r border-gray-200">
          <div className="flex items-center pl-2.5 mb-5">
            <img src="/logo.png" className="mr-3 h-6 sm:h-7" alt="YAAVS Logo" 
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
            <span className="self-center text-xl font-semibold whitespace-nowrap">YAAVS</span>
          </div>
          
          <div className="space-y-2">
            {/* Enlaces principales */}
            <ul className="space-y-2">
              {sidebarLinks.map((link, index) => (
                <li key={index}>
                  <Link 
                    href={link.href}
                    className={`flex items-center p-2 text-base font-normal rounded-lg hover:bg-gray-100 
                      ${link.active ? 'bg-gray-100 text-blue-600' : 'text-gray-900'}`}
                  >
                    <link.icon className={`w-6 h-6 ${link.active ? 'text-blue-600' : 'text-gray-500'}`} />
                    <span className="ml-3">{link.text}</span>
                  </Link>
                </li>
              ))}

              {/* Menú de Catálogo con submenús */}
              <li>
                <button
                  type="button"
                  className={`flex items-center w-full p-2 text-base font-normal text-gray-900 rounded-lg transition duration-75 group hover:bg-gray-100 ${
                    title.includes('Catálogo') && 'bg-gray-100'
                  }`}
                  onClick={toggleCatalogo}
                >
                  <HiCollection className={`w-6 h-6 text-gray-500 transition duration-75 ${
                    title.includes('Catálogo') && 'text-blue-600'
                  }`} />
                  <span className="flex-1 ml-3 text-left whitespace-nowrap">Catálogo</span>
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
                          ${link.active ? 'text-blue-600' : 'text-gray-900'}`}
                      >
                        <link.icon className={`w-5 h-5 mr-2 ${link.active ? 'text-blue-600' : 'text-gray-500'}`} />
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
                      ${link.active ? 'bg-gray-100 text-blue-600' : 'text-gray-900'}`}
                  >
                    <link.icon className={`w-6 h-6 ${link.active ? 'text-blue-600' : 'text-gray-500'}`} />
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

        {/* Menú móvil */}
        <div className={`lg:hidden fixed inset-0 z-30 bg-gray-800 bg-opacity-30 transition-opacity duration-200 ${
          mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`} onClick={toggleMobileMenu}>
          <div className="fixed inset-y-0 left-0 z-30 w-9/12 max-w-sm bg-white" onClick={e => e.stopPropagation()}>
            <div className="h-full overflow-y-auto p-4">
              <div className="flex items-center mb-5">
                <img src="/logo.png" className="mr-3 h-7" alt="YAAVS Logo" 
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
                <span className="self-center text-xl font-semibold">YAAVS</span>
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
                          ${link.active ? 'bg-gray-100 text-blue-600' : 'text-gray-900'}`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <link.icon className={`w-6 h-6 ${link.active ? 'text-blue-600' : 'text-gray-500'}`} />
                        <span className="ml-3">{link.text}</span>
                      </Link>
                    </li>
                  ))}
                  
                  {/* Menú de Catálogo con submenús para móvil */}
                  <li>
                    <button
                      type="button"
                      className={`flex items-center w-full p-2 text-base font-normal text-gray-900 rounded-lg transition duration-75 group hover:bg-gray-100 ${
                        title.includes('Catálogo') && 'bg-gray-100'
                      }`}
                      onClick={toggleCatalogo}
                    >
                      <HiCollection className={`w-6 h-6 text-gray-500 transition duration-75 ${
                        title.includes('Catálogo') && 'text-blue-600'
                      }`} />
                      <span className="flex-1 ml-3 text-left whitespace-nowrap">Catálogo</span>
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
                              ${link.active ? 'text-blue-600' : 'text-gray-900'}`}
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <link.icon className={`w-5 h-5 mr-2 ${link.active ? 'text-blue-600' : 'text-gray-500'}`} />
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
                          ${link.active ? 'bg-gray-100 text-blue-600' : 'text-gray-900'}`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <link.icon className={`w-6 h-6 ${link.active ? 'text-blue-600' : 'text-gray-500'}`} />
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

        {/* Contenido de la página */}
        <main className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
} 