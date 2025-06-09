'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, memo } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';

const DashboardLayout = memo(function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FEBF19]"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  if (pathname?.startsWith('/dashboard/admin')) {
    return <>{children}</>;
  }

  return <AdminLayout>{children}</AdminLayout>;
});

DashboardLayout.displayName = 'DashboardLayout';

export default DashboardLayout; 