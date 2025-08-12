'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableCell, TableHead, TableRow } from '@/components/ui/table';
import { HiPencilAlt, HiArrowLeft } from 'react-icons/hi';
import { PresupuestoIndependienteCompleto } from '@/types/presupuesto-independiente';

interface PageProps {
  params: {
    id: string;
  };
}

export default function PresupuestoDetallePage({ params }: PageProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [presupuesto, setPresupuesto] = useState<PresupuestoIndependienteCompleto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Cargar el presupuesto al montar el componente
  useEffect(() => {
    const fetchPresupuesto = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/presupuestos-independientes/${params.id}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Presupuesto no encontrado');
          }
          throw new Error('Error al cargar el presupuesto');
        }
        const data = await response.json();
        setPresupuesto(data);
        setError('');
      } catch (err) {
        console.error('Error al cargar presupuesto:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar el presupuesto');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPresupuesto();
  }, [params.id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatUserName = (user: any) => {
    return `${user.nombre} ${user.apellido_paterno} ${user.apellido_materno || ''}`.trim();
  };

  const calcularSubtotal = (producto: any) => {
    const subtotal = producto.precio_venta * producto.cantidad;
    const extra = producto.precio_concepto_extra || 0;
    return subtotal + extra;
  };

  const calcularTotal = () => {
    if (!presupuesto) return 0;
    return presupuesto.productos_presupuesto_independiente.reduce((total, producto) => {
      return total + calcularSubtotal(producto);
    }, 0);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Cargando presupuesto...</div>
        </div>
      </div>
    );
  }

  if (error || !presupuesto) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center">
          <div className="text-red-500 mb-4">{error || 'Presupuesto no encontrado'}</div>
          <Button onClick={() => router.push('/dashboard/presupuestos')}>
            Volver a la lista
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard/presupuestos')}
            className="flex items-center gap-2"
          >
            <HiArrowLeft className="h-4 w-4" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{presupuesto.nombre}</h1>
            <p className="text-gray-600">Detalle del presupuesto</p>
          </div>
        </div>
        <Button
          onClick={() => router.push(`/dashboard/presupuestos/${presupuesto.id}/editar`)}
          className="flex items-center gap-2"
        >
          <HiPencilAlt className="h-4 w-4" />
          Editar
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información del presupuesto */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Información del Presupuesto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Nombre</label>
                <p className="text-lg font-semibold">{presupuesto.nombre}</p>
              </div>
              
              {presupuesto.cliente_nombre && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Cliente</label>
                  <p className="text-lg">{presupuesto.cliente_nombre}</p>
                </div>
              )}
              
              {presupuesto.descripcion && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Descripción</label>
                  <p className="text-sm">{presupuesto.descripcion}</p>
                </div>
              )}
              
              <div>
                <label className="text-sm font-medium text-gray-500">Fecha de creación</label>
                <p className="text-sm">{formatDate(presupuesto.created_at)}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Creado por</label>
                <p className="text-sm">{formatUserName(presupuesto.usuarios)}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Total</label>
                <p className="text-2xl font-bold text-green-600">
                  ${calcularTotal().toFixed(2)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de productos */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Productos y Servicios</CardTitle>
            </CardHeader>
            <CardContent>
              {presupuesto.productos_presupuesto_independiente.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No hay productos en este presupuesto
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead>Cantidad</TableHead>
                      <TableHead>Precio Unitario</TableHead>
                      <TableHead>Subtotal</TableHead>
                      <TableHead>Concepto Extra</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {presupuesto.productos_presupuesto_independiente.map((producto) => (
                      <TableRow key={producto.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {producto.productos?.nombre || 'Producto no encontrado'}
                            </div>
                            {producto.productos?.sku && (
                              <div className="text-sm text-gray-500">
                                SKU: {producto.productos.sku}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{producto.cantidad}</TableCell>
                        <TableCell>${producto.precio_venta.toFixed(2)}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              ${(producto.precio_venta * producto.cantidad).toFixed(2)}
                            </div>
                            {producto.precio_concepto_extra && producto.precio_concepto_extra > 0 && (
                              <div className="text-sm text-gray-500">
                                +${producto.precio_concepto_extra.toFixed(2)} extra
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {producto.concepto_extra ? (
                            <div>
                              <div className="text-sm">{producto.concepto_extra}</div>
                              {producto.precio_concepto_extra && producto.precio_concepto_extra > 0 && (
                                <div className="text-sm text-green-600">
                                  +${producto.precio_concepto_extra.toFixed(2)}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
