import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/jwt';

// Configurar para usar Node.js runtime
export const runtime = 'nodejs';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Solo procesar rutas de cliente
  if (!pathname.startsWith('/cliente') && !pathname.startsWith('/api/cliente')) {
    return NextResponse.next();
  }

  // Si es una ruta de API de cliente, permitir el acceso
  if (pathname.startsWith('/api/cliente')) {
    return NextResponse.next();
  }

  // Rutas públicas del sistema de clientes
  const publicRoutes = ['/cliente/login', '/cliente/registro'];
  if (publicRoutes.includes(pathname)) {
    // Si el usuario ya está autenticado como cliente, redirigir al dashboard
    const token = request.cookies.get('cliente_token');
    if (token) {
      try {
        const decoded = verifyToken(token.value);
        if (decoded) {
          return NextResponse.redirect(new URL('/cliente', request.url));
        }
      } catch (error) {
        console.error('Error verificando token de cliente:', error);
      }
    }
    return NextResponse.next();
  }

  // Verificar autenticación para rutas protegidas del sistema de clientes
  const token = request.cookies.get('cliente_token');
  
  if (!token) {
    const url = new URL('/cliente/login', request.url);
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }

  try {
    const decoded = verifyToken(token.value);
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

// Configurar el matcher para que solo aplique a rutas de cliente
export const config = {
  matcher: [
    '/cliente/:path*',
    '/api/cliente/:path*'
  ]
}; 