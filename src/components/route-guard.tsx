'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import RestrictedAccess from './restricted-access';

interface RouteGuardProps {
  children: React.ReactNode;
  requiredPermissions: string[];
  section: string;
}

export default function RouteGuard({ children, requiredPermissions, section }: RouteGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    if (status === 'authenticated') {
      setIsLoading(false);
    }
  }, [status, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FEBF19]"></div>
      </div>
    );
  }

  if (!session?.user?.permisos) {
    return <RestrictedAccess section={section} />;
  }

  const hasPermission = requiredPermissions.some(permission => 
    session.user.permisos.includes(permission)
  );

  if (!hasPermission) {
    return <RestrictedAccess section={section} />;
  }

  return <>{children}</>;
} 