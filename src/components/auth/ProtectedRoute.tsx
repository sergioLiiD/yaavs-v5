'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
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
  const [authorized, setAuthorized] = useState(false);
  
  useEffect(() => {
    console.log('ProtectedRoute - Status:', status);
    console.log('ProtectedRoute - Session:', session);
    
    // Verificación cuando la sesión está lista
    if (status === 'loading') {
      // Esperando a que se cargue la sesión
      setAuthorized(false);
      return;
    }
    
    // Si el usuario no está autenticado, redirigir al login
    if (status === 'unauthenticated') {
      console.log('ProtectedRoute - No autenticado, redirigiendo a /auth/login');
      setAuthorized(false);
      router.push('/auth/login');
      return;
    }
    
    // Si hay roles requeridos y el usuario no tiene el rol adecuado
    if (
      status === 'authenticated' && 
      requiredRoles.length > 0 && 
      session?.user?.role && 
      !requiredRoles.includes(session.user.role)
    ) {
      console.log('ProtectedRoute - Sin permisos adecuados, redirigiendo a /dashboard');
      setAuthorized(false);
      router.push('/dashboard');
      return;
    }
    
    // Usuario autorizado
    console.log('ProtectedRoute - Usuario autorizado');
    setAuthorized(true);
  }, [status, session, router, requiredRoles]);
  
  // Mientras se carga, mostrar el spinner
  if (status === 'loading' || !authorized) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando autenticación...</p>
          <p className="mt-2 text-sm text-gray-500">Estado: {status}</p>
        </div>
      </div>
    );
  }
  
  // Renderizar el contenido si el usuario está autorizado
  return <>{children}</>;
} 