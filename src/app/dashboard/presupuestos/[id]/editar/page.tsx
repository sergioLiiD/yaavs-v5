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

interface PresupuestoIndependienteCompleto {
  id: number;
  nombre: string;
  descripcion?: string;
  cliente_nombre?: string;
  usuario_id: number;
  total: number;
  created_at: string;
  updated_at: string;
  usuarios: {
    id: number;
    nombre: string;
    apellido_paterno: string;
    apellido_materno?: string;
  };
  productos_presupuesto_independiente: Array<{
    id: number;
    presupuesto_independiente_id: number;
    producto_id?: number;
    cantidad: number;
    precio_venta: number;
    concepto_extra?: string;
    precio_concepto_extra?: number;
    created_at: string;
    updated_at: string;
    productos?: {
      id: number;
      nombre: string;
      precio_promedio: number;
      tipo: string;
      sku: string;
      stock: number;
      marca?: { nombre: string };
      modelo?: { nombre: string };
    };
  }>;
}

interface PageProps {
  params: {
    id: string;
  };
}

export default function EditarPresupuestoPage({ params }: PageProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [presupuesto, setPresupuesto] = useState<PresupuestoIndependienteCompleto | null>(null);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Cargar el presupuesto y productos al montar el componente
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Cargar productos
        const productosResponse = await fetch('/api/productos');
        if (!productosResponse.ok) {
          throw new Error('Error al cargar los productos');
        }
        const productosData = await productosResponse.json();
        setProductos(productosData);

        // Cargar presupuesto
        const presupuestoResponse = await fetch(`/api/presupuestos-independientes/${params.id}`);
        if (!presupuestoResponse.ok) {
          if (presupuestoResponse.status === 404) {
            throw new Error('Presupuesto no encontrado');
          }
          throw new Error('Error al cargar el presupuesto');
        }
        const presupuestoData = await presupuestoResponse.json();
        setPresupuesto(presupuestoData);
        
        setError('');
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar los datos');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Cargando datos...</div>
        </div>
      </div>
    );
  }

  if (error || !presupuesto) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center">
          <div className="text-red-500 mb-4">{error || 'Presupuesto no encontrado'}</div>
          <button 
            onClick={() => router.push('/dashboard/presupuestos')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Volver a la lista
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Editar Presupuesto</h1>
        <p className="text-gray-600">Modifica el presupuesto: {presupuesto.nombre}</p>
      </div>

      <PresupuestoForm 
        presupuesto={presupuesto} 
        productos={productos} 
        isEditing={true} 
      />
    </div>
  );
}
