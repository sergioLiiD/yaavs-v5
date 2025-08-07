'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { VentaProductosForm } from '@/components/venta-productos/VentaProductosForm';
import { AdminLayout } from '@/components/adminLayout';

export default function VentaProductosPage() {
  const { data: session } = useSession();

  if (!session) {
    return <div>Cargando...</div>;
  }

  return (
    <AdminLayout title="Venta de Productos">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Venta de Productos
          </h1>
          <VentaProductosForm />
        </div>
      </div>
    </AdminLayout>
  );
} 