'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';

export default function AdminSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Marcar como hidratado después de un delay
    const hydrationTimeout = setTimeout(() => {
      setIsHydrated(true);
    }, 200);

    return () => clearTimeout(hydrationTimeout);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    console.log('🔧 AdminLayout Debug:', {
      status,
      userRole: session?.user?.role,
      userEmail: session?.user?.email,
      isHydrated
    });

    if (status === 'unauthenticated') {
      console.log('🚫 Usuario no autenticado, redirigiendo a login');
      router.push('/auth/login');
      return;
    }

    // Verificar que el usuario sea administrador
    if (status === 'authenticated' && session?.user?.role !== 'ADMINISTRADOR') {
      console.log('🚫 Usuario no es administrador, redirigiendo a dashboard');
      router.push('/dashboard');
      return;
    }

    if (status === 'authenticated' && session?.user?.role === 'ADMINISTRADOR') {
      console.log('✅ Usuario administrador confirmado');
    }
  }, [status, session, router, isHydrated]);

  // Mostrar loading mientras se hidrata o carga la sesión
  if (status === 'loading' || !isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FEBF19]"></div>
      </div>
    );
  }

  // Si no es administrador, no mostrar nada
  if (status === 'authenticated' && session?.user?.role !== 'ADMINISTRADOR') {
    return null;
  }

  // Si no está autenticado, no mostrar nada (el RouteGuard se encargará)
  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <AdminLayout>{children}</AdminLayout>
  );
} 