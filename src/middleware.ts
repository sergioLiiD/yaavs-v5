import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import { NivelUsuario } from '@/types/usuario';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    console.log('Middleware - Token:', token);
    console.log('Middleware - Path:', req.nextUrl.pathname);
    
    const isAuth = !!token;
    const isApiRoute = req.nextUrl.pathname.startsWith('/api');
    const isUsuariosRoute = req.nextUrl.pathname.startsWith('/dashboard/usuarios');

    console.log('Middleware - Is Auth:', isAuth);
    console.log('Middleware - Is API Route:', isApiRoute);
    console.log('Middleware - Is Usuarios Route:', isUsuariosRoute);

    // Si no está autenticado y no es una ruta de API, redirigir a login
    if (!isAuth && !isApiRoute) {
      console.log('Middleware - No autenticado, redirigiendo a login');
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }

    // Si es una ruta de API y no está autenticado, devolver 401
    if (!isAuth && isApiRoute) {
      console.log('Middleware - No autenticado en API, devolviendo 401');
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Si está autenticado y es una ruta protegida, verificar el rol
    if (isAuth && ((isApiRoute && req.nextUrl.pathname.startsWith('/api/usuarios')) || isUsuariosRoute)) {
      console.log('Middleware - Token Role:', token.role);
      console.log('Middleware - Required Role:', NivelUsuario.ADMINISTRADOR);
      
      if (token.role !== NivelUsuario.ADMINISTRADOR) {
        console.log('Middleware - Nivel insuficiente, redirigiendo a dashboard');
        if (isApiRoute) {
          return NextResponse.json(
            { error: 'No autorizado' },
            { status: 401 }
          );
        }
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        console.log('Middleware - Authorized Callback - Token:', token);
        return true; // Permitir que la página se cargue y manejar la redirección en el componente
      },
    },
  }
);

export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*'],
}; 