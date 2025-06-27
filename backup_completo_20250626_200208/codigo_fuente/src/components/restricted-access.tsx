'use client';

import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';

interface RestrictedAccessProps {
  section: string;
  isErrorPage?: boolean;
}

export default function RestrictedAccess({ section, isErrorPage = false }: RestrictedAccessProps) {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full mx-auto p-8">
        <div className="text-center">
          <div className="mb-6">
            <Image
              src="/logo.png"
              alt="arregla.mx"
              width={200}
              height={60}
              className="mx-auto"
            />
          </div>
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
            <ShieldAlert className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Acceso Denegado
          </h1>
          <p className="text-gray-600 mb-8">
            {isErrorPage 
              ? 'No tienes permisos para acceder a esta página'
              : `No tienes permisos para acceder a la sección de ${section}. Por favor, contacta al administrador si crees que esto es un error.`
            }
          </p>
          <div className="space-y-4">
            <Link href="/dashboard">
              <Button className="w-full">
                Volver al Dashboard
              </Button>
            </Link>
            <Link href="/auth/logout">
              <Button variant="outline" className="w-full">
                Cerrar Sesión
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 