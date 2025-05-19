import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Rutas públicas que no requieren autenticación
const publicPaths = [
  '/auth/login',
  '/auth/error',
  '/auth/signin',
  '/auth/signout',
  '/cliente/login',
  '/cliente/registro',
  '/api/cliente/registro',
  '/api/auth',
  '/api/cliente/login',
];

// Rutas protegidas que requieren autenticación
const protectedPaths = [
  '/dashboard',
  '/api/admin',
  '/cliente/tickets',
  '/cliente/nuevo-ticket',
  '/cliente/perfil',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Verificar si la ruta actual es pública
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));

  // Verificar si la ruta actual es protegida
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));

  // Obtener el token de NextAuth
  const token = await getToken({ req: request });
  const clienteToken = request.cookies.get('cliente_token')?.value;

  // Si es una ruta pública, permitir el acceso
  if (isPublicPath) {
    return NextResponse.next();
  }

  // Si es una ruta protegida y no hay token, redirigir al login correspondiente
  if (isProtectedPath) {
    if (!token && !clienteToken) {
      const isClientePath = pathname.startsWith('/cliente');
      const loginUrl = isClientePath ? '/cliente/login' : '/auth/login';
      return NextResponse.redirect(new URL(loginUrl, request.url));
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
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}; 