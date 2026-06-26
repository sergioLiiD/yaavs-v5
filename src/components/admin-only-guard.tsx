'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, memo } from 'react';

interface AdminOnlyGuardProps {
  children: React.ReactNode;
}

/** Solo usuarios con rol ADMINISTRADOR (no puntos de recolección) */
const AdminOnlyGuard = memo(function AdminOnlyGuard({ children }: AdminOnlyGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!ready || status === 'loading') return;
    if (!session) {
      router.push('/auth/login');
      return;
    }
    if (session.user.role !== 'ADMINISTRADOR') {
      router.push('/dashboard');
    }
  }, [ready, status, session, router]);

  if (status === 'loading' || !ready) {
    return (
      <div className="flex justify-center items-center min-h-[40vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#FEBF19]" />
      </div>
    );
  }

  if (!session || session.user.role !== 'ADMINISTRADOR') {
    return null;
  }

  return <>{children}</>;
});

AdminOnlyGuard.displayName = 'AdminOnlyGuard';

export default AdminOnlyGuard;
