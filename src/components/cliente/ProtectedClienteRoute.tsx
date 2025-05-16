'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useClienteAuth } from '@/hooks/useClienteAuth';

interface ProtectedClienteRouteProps {
  children: React.ReactNode;
}

export function ProtectedClienteRoute({ children }: ProtectedClienteRouteProps) {
  const { cliente, loading, isAuthenticated } = useClienteAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      const callbackUrl = encodeURIComponent(pathname || '/cliente');
      router.push(`/cliente/login?callbackUrl=${callbackUrl}`);
    }
  }, [loading, isAuthenticated, router, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
} 