'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, memo } from 'react';

interface RouteGuardProps {
  children: React.ReactNode;
  requiredPermissions: string[];
  section: string;
}

const RouteGuard = memo(function RouteGuard({ children, requiredPermissions, section }: RouteGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const isAuthorized = useMemo(() => {
    if (status === 'loading') return false;
    if (!session) return false;

    const userRole = session.user?.role;
    const userPermissions = session.user?.permissions || [];

    // Si el usuario es administrador, permitir acceso
    if (userRole === 'ADMINISTRADOR') {
      return true;
    }

    // Verificar si el usuario tiene al menos uno de los permisos requeridos
    return requiredPermissions.some(permission => 
      userPermissions.includes(permission)
    );
  }, [session, status, requiredPermissions]);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/auth/login');
      return;
    }

    if (!isAuthorized) {
      router.push('/dashboard');
    }
  }, [session, status, isAuthorized, router]);

  // Mostrar loading mientras se verifica la sesión
  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FEBF19]"></div>
      </div>
    );
  }

  // Si no está autorizado, no renderizar nada
  if (!isAuthorized) {
    return null;
  }

  // Si está autorizado, renderizar el contenido
  return <>{children}</>;
});

RouteGuard.displayName = 'RouteGuard';

export default RouteGuard; 