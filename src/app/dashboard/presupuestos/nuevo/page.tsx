'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { PresupuestoForm } from '@/components/presupuestos/presupuesto-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Producto {
  id: number;
  nombre: string;
  precio_promedio: number;
  tipo: string;
  sku: string;
  stock: number;
  marca?: { nombre: string };
  modelo?: { nombre: string };
}

export default function NuevoPresupuestoPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Cargar productos al montar el componente
  useEffect(() => {
    const fetchProductos = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/productos');
        if (!response.ok) {
          throw new Error('Error al cargar los productos');
        }
        const data = await response.json();
        setProductos(data);
        setError('');
      } catch (err) {
        console.error('Error al cargar productos:', err);
        setError('Error al cargar los productos. Por favor, intente nuevamente.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductos();
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Cargando productos...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-red-500 text-center">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Nuevo Presupuesto</h1>
        <p className="text-gray-600">Crea un nuevo presupuesto independiente</p>
      </div>

      <PresupuestoForm productos={productos} />
    </div>
  );
}
