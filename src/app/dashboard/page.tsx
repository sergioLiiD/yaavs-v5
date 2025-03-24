'use client';

import { useSession } from 'next-auth/react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function DashboardPage() {
  const { data: session, status } = useSession();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100">
        <div className="py-10">
          <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          </header>
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white shadow rounded-lg p-6 mt-6">
              <h2 className="text-xl font-semibold mb-4">Información de sesión</h2>
              <div className="bg-gray-100 p-4 rounded-md overflow-auto">
                <h3 className="font-medium mb-2">Estado: {status}</h3>
                <pre className="text-sm whitespace-pre-wrap">
                  {JSON.stringify(session, null, 2)}
                </pre>
              </div>
              <div className="mt-6">
                <h3 className="font-medium mb-2">Bienvenido, {session?.user?.name || 'Usuario'}</h3>
                <p className="text-gray-600">
                  Estás conectado como: {session?.user?.email || 'No disponible'}
                </p>
                <p className="text-gray-600">
                  Rol: {session?.user?.role || 'No disponible'}
                </p>
              </div>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
} 