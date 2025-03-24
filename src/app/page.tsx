'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from "next/image";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirigir a la página de login
    router.replace('/auth/login');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">Redirigiendo...</h1>
        <p className="mt-2">Por favor espere un momento</p>
      </div>
    </div>
  );
}
