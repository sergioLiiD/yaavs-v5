'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { AuthProvider } from '@/components/auth/AuthProvider';

export default function AdminSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FEBF19]"></div>
      </div>
    );
  }

  return (
    <AuthProvider>
      <AdminLayout>{children}</AdminLayout>
    </AuthProvider>
  );
} 