import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { getToken } from 'next-auth/jwt';

// Configurar para usar Node.js runtime
export const runtime = 'nodejs';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rutas públicas
  const publicRoutes = [
    '/auth/login',
    '/cliente/login',
    '/cliente/registro',
    '/api/cliente/registro',
    '/api/cliente/login',
    '/api/auth/session',
    '/api/auth/csrf',
    '/api/auth/providers',
    '/api/auth/callback',
    '/api/auth/signin',
    '/api/auth/signout',
    '/api/repair-point/auth'
  ];

  // Si es una ruta pública, permitir el acceso
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Rutas de cliente
  if (pathname.startsWith('/cliente') || pathname.startsWith('/api/cliente')) {
    const token = request.cookies.get('cliente_token');
    
    if (!token) {
      const url = new URL('/cliente/login', request.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }

    try {
      const decoded = await verifyToken(token.value);
      if (!decoded) {
        const url = new URL('/cliente/login', request.url);
        url.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(url);
      }
    } catch (error) {
      console.error('Error verificando token de cliente:', error);
      const url = new URL('/cliente/login', request.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  }

  // Rutas protegidas del sistema (dashboard y repair-point)
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/repair-point')) {
    const session = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    });

    if (!session) {
      const url = new URL('/auth/login', request.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }

    // Cualquier usuario autenticado puede acceder a todas las rutas
    return NextResponse.next();
  }

  return NextResponse.next();
}

// Configurar el matcher para que aplique a todas las rutas protegidas
export const config = {
  matcher: [
    '/cliente/:path*',
    '/api/cliente/:path*',
    '/dashboard/:path*',
    '/repair-point/:path*'
  ]
}; 