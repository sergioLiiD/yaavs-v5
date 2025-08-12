'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { HiPlus, HiPencilAlt, HiTrash, HiEye } from 'react-icons/hi';
import { useRouter } from 'next/navigation';
import { Table, TableHeader, TableBody, TableCell, TableHead, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'react-hot-toast';
import { PresupuestoIndependienteCompleto } from '@/types/presupuesto-independiente';

export default function PresupuestosPage() {
  const { data: session } = useSession();
  const router = useRouter();
  
  // Estado para la lista de presupuestos
  const [presupuestos, setPresupuestos] = useState<PresupuestoIndependienteCompleto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Cargar los presupuestos al montar el componente
  useEffect(() => {
    const fetchPresupuestos = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/presupuestos-independientes');
        if (!response.ok) {
          throw new Error('Error al cargar los presupuestos');
        }
        const data = await response.json();
        setPresupuestos(data);
        setError('');
      } catch (err) {
        console.error('Error al cargar presupuestos:', err);
        setError('Error al cargar los datos. Por favor, intente nuevamente.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPresupuestos();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('¿Está seguro de que desea eliminar este presupuesto?')) {
      return;
    }

    try {
      const response = await fetch(`/api/presupuestos-independientes/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar el presupuesto');
      }

      setPresupuestos(presupuestos.filter(p => p.id !== id));
      toast.success('Presupuesto eliminado correctamente');
    } catch (error) {
      console.error('Error al eliminar presupuesto:', error);
      toast.error('Error al eliminar el presupuesto');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatUserName = (user: any) => {
    return `${user.nombre} ${user.apellido_paterno} ${user.apellido_materno || ''}`.trim();
  };

  const calcularTotal = (presupuesto: PresupuestoIndependienteCompleto) => {
    return presupuesto.productos_presupuesto_independiente.reduce((total, producto) => {
      const subtotal = producto.precio_venta * producto.cantidad;
      const extra = producto.precio_concepto_extra || 0;
      return total + subtotal + extra;
    }, 0);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Cargando presupuestos...</div>
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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Presupuestos</h1>
          <p className="text-gray-600">Gestiona los presupuestos independientes</p>
        </div>
        <Button
          onClick={() => router.push('/dashboard/presupuestos/nuevo')}
          className="flex items-center gap-2"
        >
          <HiPlus className="h-4 w-4" />
          Nuevo Presupuesto
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Presupuestos</CardTitle>
        </CardHeader>
        <CardContent>
          {presupuestos.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No hay presupuestos creados</p>
              <Button
                onClick={() => router.push('/dashboard/presupuestos/nuevo')}
                variant="outline"
              >
                Crear primer presupuesto
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Creado por</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {presupuestos.map((presupuesto) => (
                  <TableRow key={presupuesto.id}>
                    <TableCell className="font-medium">
                      {presupuesto.nombre}
                    </TableCell>
                    <TableCell>
                      {presupuesto.cliente_nombre || '-'}
                    </TableCell>
                    <TableCell>
                      {formatDate(presupuesto.created_at)}
                    </TableCell>
                    <TableCell>
                      {formatUserName(presupuesto.usuarios)}
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-green-600">
                        ${calcularTotal(presupuesto).toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/dashboard/presupuestos/${presupuesto.id}`)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <HiEye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/dashboard/presupuestos/${presupuesto.id}/editar`)}
                          className="text-orange-600 hover:text-orange-800"
                        >
                          <HiPencilAlt className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(presupuesto.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <HiTrash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
