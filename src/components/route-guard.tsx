'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, memo, useState } from 'react';

interface RouteGuardProps {
  children: React.ReactNode;
  requiredPermissions: string[];
  section: string;
}

const RouteGuard = memo(function RouteGuard({ children, requiredPermissions, section }: RouteGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);

  // Agregar debugging adicional
  useEffect(() => {
    console.log('🔍 RouteGuard montado:', {
      section,
      status,
      hasSession: !!session,
      pathname: typeof window !== 'undefined' ? window.location.pathname : 'N/A',
      timestamp: new Date().toISOString()
    });

    // Marcar como hidratado después de un delay más largo para rutas admin
    const delay = section === 'Usuarios' || section === 'Roles' ? 500 : 100;
    const hydrationTimeout = setTimeout(() => {
      setIsHydrated(true);
    }, delay);

    return () => clearTimeout(hydrationTimeout);
  }, [section, session]);

  const isAuthorized = useMemo(() => {
    // Si aún no está hidratado, no autorizar
    if (!isHydrated) return false;
    
    if (status === 'loading') return false;
    if (!session) return false;

    const userRole = session.user?.role;
    const userPermissions = session.user?.permissions || [];

    console.log('🔒 RouteGuard Debug:', {
      section,
      userRole,
      userPermissions,
      requiredPermissions
    });

    // Si el usuario es administrador, permitir acceso
    if (userRole === 'ADMINISTRADOR') {
      console.log('✅ Usuario es ADMINISTRADOR, acceso permitido');
      return true;
    }

    // Verificar si el usuario tiene al menos uno de los permisos requeridos
    const hasRequiredPermission = requiredPermissions.some(permission => 
      userPermissions.includes(permission)
    );

    console.log('🔍 Verificación de permisos:', {
      hasRequiredPermission,
      requiredPermissions,
      userPermissions
    });

    // Si no tiene el permiso requerido, verificar si tiene permisos específicos de punto
    if (!hasRequiredPermission) {
      const puntoPermissions = requiredPermissions.map(permission => 
        `PUNTO_${permission}`
      );
      
      const hasPuntoPermission = puntoPermissions.some(permission => 
        userPermissions.includes(permission)
      );

      console.log('🔍 Verificación de permisos de punto:', {
        hasPuntoPermission,
        puntoPermissions
      });

      return hasPuntoPermission;
    }

    console.log('✅ Permisos requeridos encontrados');
    return hasRequiredPermission;
  }, [session, status, requiredPermissions, isHydrated]);

  useEffect(() => {
    // No hacer nada si aún no está hidratado
    if (!isHydrated) return;
    
    if (status === 'loading') return;

    if (!session) {
      console.log('🚫 No hay sesión, redirigiendo a login');
      router.push('/auth/login');
      return;
    }

    if (!isAuthorized) {
      console.log('🚫 Usuario no autorizado para sección:', section, 'redirigiendo a dashboard');
      router.push('/dashboard');
    } else {
      console.log('✅ Usuario autorizado para sección:', section);
    }
  }, [session, status, isAuthorized, router, isHydrated]);

  // Mostrar loading mientras se verifica la sesión o se hidrata
  if (status === 'loading' || !isHydrated) {
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