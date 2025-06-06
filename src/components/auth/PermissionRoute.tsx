'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

interface PermissionRouteProps {
  children: React.ReactNode;
  requiredPermissions: string[];
}

export function PermissionRoute({ children, requiredPermissions }: PermissionRouteProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === 'unauthenticated') {
      const callbackUrl = encodeURIComponent(pathname || '/dashboard');
      router.push(`/auth/login?callbackUrl=${callbackUrl}`);
      return;
    }

    if (session?.user) {
      const userPermissions = session.user.permisos || [];
      console.log('Ruta:', pathname);
      console.log('Permisos requeridos:', requiredPermissions);
      console.log('Permisos del usuario:', userPermissions);

      const hasRequiredPermissions = requiredPermissions.every(permission =>
        userPermissions.includes(permission)
      );

      if (!hasRequiredPermissions) {
        console.log('Acceso denegado: Permisos insuficientes');
        router.push('/dashboard');
      }
    }
  }, [session, status, router, pathname, requiredPermissions]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FEBF19]"></div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  const userPermissions = session.user.permisos || [];
  const hasRequiredPermissions = requiredPermissions.every(permission =>
    userPermissions.includes(permission)
  );

  if (!hasRequiredPermissions) {
    return null;
  }

  return <>{children}</>;
} 