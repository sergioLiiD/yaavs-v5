'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { NivelUsuario } from '@/types/usuario';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredNivel?: NivelUsuario;
}

export function ProtectedRoute({ children, requiredNivel }: ProtectedRouteProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    console.log('ProtectedRoute - Status:', status);
    console.log('ProtectedRoute - Session:', session);
    console.log('ProtectedRoute - Required Nivel:', requiredNivel);
    console.log('ProtectedRoute - User:', session?.user);
    console.log('ProtectedRoute - User Role:', session?.user?.role);
    
    if (status === 'unauthenticated') {
      console.log('ProtectedRoute - No autenticado, redirigiendo a login');
      const callbackUrl = encodeURIComponent(pathname || '/dashboard');
      router.push(`/auth/login?callbackUrl=${callbackUrl}`);
      return;
    }

    if (session?.user && requiredNivel && session.user.role !== requiredNivel) {
      console.log('ProtectedRoute - Nivel insuficiente, redirigiendo a dashboard');
      console.log('ProtectedRoute - Nivel actual:', session.user.role);
      console.log('ProtectedRoute - Nivel requerido:', requiredNivel);
      router.push('/dashboard');
    }
  }, [session, status, router, pathname, requiredNivel]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  if (requiredNivel && session.user.role !== requiredNivel) {
    return null;
  }

  return <>{children}</>;
} 