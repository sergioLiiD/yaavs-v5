'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AdminLayout>
        {children}
      </AdminLayout>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
} 