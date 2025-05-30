import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Rutas públicas que no requieren autenticación
const publicPaths = [
  '/login',
  '/register',
  '/api/auth',
  '/api/cliente/login',
  '/api/cliente/register',
];

// Rutas protegidas que requieren autenticación
const protectedPaths = [
  '/dashboard',
  '/api/catalogo',
  '/api/usuarios',
  '/api/tickets',
  '/api/reparaciones',
  '/api/almacen',
  '/api/clientes',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Verificar si la ruta es pública
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Verificar si la ruta es protegida
  if (protectedPaths.some(path => pathname.startsWith(path))) {
    const token = await getToken({ req: request });
    
    if (!token) {
      const url = new URL('/login', request.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}; 