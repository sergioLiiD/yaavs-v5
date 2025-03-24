'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: string[]; // Roles permitidos para acceder a la ruta
}

export function ProtectedRoute({ 
  children,
  requiredRoles = [] 
}: ProtectedRouteProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  useEffect(() => {
    // Si el usuario no está autenticado, redirigir al login
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
    
    // Si hay roles requeridos y el usuario no tiene el rol adecuado
    if (
      status === 'authenticated' && 
      requiredRoles.length > 0 && 
      session?.user?.role && 
      !requiredRoles.includes(session.user.role)
    ) {
      // Redirigir a una página de acceso denegado o al dashboard
      router.push('/dashboard');
    }
  }, [status, session, router, requiredRoles]);
  
  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // Solo mostrar el contenido si el usuario está autenticado
  if (status === 'authenticated') {
    // Si hay roles requeridos, verificar que el usuario tenga acceso
    if (
      requiredRoles.length === 0 || 
      (session?.user?.role && requiredRoles.includes(session.user.role))
    ) {
      return <>{children}</>;
    }
  }
  
  // Por defecto, no mostrar nada mientras se redirige
  return null;
} 