'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

export default function ProtectedRoute({ 
  children, 
  requiredRoles = [] 
}: ProtectedRouteProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    console.log('ProtectedRoute - Current pathname:', pathname);
    console.log('ProtectedRoute - Session status:', status);
    console.log('ProtectedRoute - Session data:', session);
    
    // Si se está cargando la sesión, no hacer nada aún
    if (status === 'loading') {
      console.log('ProtectedRoute - Session is loading');
      return;
    }
    
    // Si no hay sesión, redirigir a la página de login
    if (status === 'unauthenticated') {
      console.log('ProtectedRoute - User is unauthenticated, redirecting to login');
      router.push(`/auth/login?callbackUrl=${encodeURIComponent(pathname || '/dashboard')}`);
      return;
    }
    
    // Verificar el rol si se requiere
    if (
      status === 'authenticated' && 
      requiredRoles.length > 0 && 
      session?.user?.role && 
      !requiredRoles.includes(session.user.role)
    ) {
      console.log('ProtectedRoute - User does not have required role:', {
        userRole: session.user.role,
        requiredRoles
      });
      router.push('/unauthorized');
      return;
    }
    
    console.log('ProtectedRoute - Access granted');
  }, [status, session, router, pathname, requiredRoles]);

  // Mientras se carga la sesión, mostrar un indicador de carga
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Si no tiene sesión, no mostrar nada (la redirección se maneja en el useEffect)
  if (status === 'unauthenticated') {
    return null;
  }

  // Si tiene rol requerido o no se especifica rol, mostrar el contenido
  if (
    status === 'authenticated' && 
    (requiredRoles.length === 0 || 
     (session?.user?.role && requiredRoles.includes(session.user.role)))
  ) {
    return <>{children}</>;
  }

  // Caso no manejado, no mostrar nada
  return null;
} 