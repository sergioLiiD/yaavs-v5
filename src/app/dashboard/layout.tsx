'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => new QueryClient());
  const pathname = usePathname();
  
  // Determinar el título basado en la ruta actual
  const getTitle = () => {
    if (pathname.includes('/costos')) return 'Costos';
    if (pathname.includes('/inventario')) return 'Inventario';
    if (pathname.includes('/catalogo')) return 'Catálogo';
    return 'Dashboard';
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AdminLayout title={getTitle()}>
        {children}
      </AdminLayout>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
} 