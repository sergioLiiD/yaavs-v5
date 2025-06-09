import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  console.log('Middleware - Iniciando middleware');
  console.log('Middleware - URL:', request.url);
  console.log('Middleware - Pathname:', request.nextUrl.pathname);

  const token = await getToken({ req: request });
  console.log('Middleware - Token:', token);

  // Si no hay token, redirigir al login
  if (!token) {
    if (request.nextUrl.pathname.startsWith('/dashboard') || 
        request.nextUrl.pathname.startsWith('/repair-point')) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
    return NextResponse.next();
  }

  // Verificar si el usuario es de un punto de reparación
  const userRole = token.role as string;
  const isRepairPointUser = userRole === 'ADMINISTRADOR_PUNTO' || userRole === 'OPERADOR_PUNTO';

  // Si es usuario de punto de reparación y no está en /repair-point, redirigir
  if (isRepairPointUser && !request.nextUrl.pathname.startsWith('/repair-point')) {
    return NextResponse.redirect(new URL('/repair-point', request.url));
  }

  // Si es usuario del sistema principal y está intentando acceder a /repair-point, redirigir
  if (!isRepairPointUser && request.nextUrl.pathname.startsWith('/repair-point')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Verificar permisos para rutas protegidas
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    // Si es administrador del sistema, permitir acceso
    if (userRole === 'ADMINISTRADOR') {
      return NextResponse.next();
    }

    // Verificar permisos específicos para la ruta
    const userPermissions = token.permissions as string[] || [];
    const requiredPermissions = getRequiredPermissions(request.nextUrl.pathname);

    if (!requiredPermissions.every(permission => userPermissions.includes(permission))) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

function getRequiredPermissions(pathname: string): string[] {
  // Mapeo de rutas a permisos requeridos
  const routePermissions: Record<string, string[]> = {
    '/dashboard/admin/usuarios': ['USERS_VIEW'],
    '/dashboard/admin/roles': ['ROLES_VIEW'],
    '/dashboard/admin/permisos': ['PERMISSIONS_VIEW'],
    // Agregar más rutas y permisos según sea necesario
  };

  return routePermissions[pathname] || [];
}

// Configurar las rutas que deben ser procesadas por el middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 