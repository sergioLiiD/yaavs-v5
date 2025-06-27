'use client';

import { SessionProvider } from 'next-auth/react';

export function RepairPointAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  );
} 