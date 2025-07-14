'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { HiPencilAlt, HiTrash } from 'react-icons/hi';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

type ProductoConInventarioMinimo = {
  id: number;
  nombre: string;
  stock: number;
  tipo: string;
  stock_minimo: number | null;
  marcas: { nombre: string } | null;
  modelos: { nombre: string } | null;
  proveedores: { nombre: string } | null;
};

export default function InventariosMinimosPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [newMinimo, setNewMinimo] = useState('0');

  const { data: productos, refetch } = useQuery<ProductoConInventarioMinimo[]>({
    queryKey: ['productos'],
    queryFn: async () => {
      console.log('Cargando productos...');
      const response = await fetch('/api/inventario/productos');
      if (!response.ok) {
        throw new Error('Error al cargar productos');
      }
      const data = await response.json();
      console.log('Datos cargados:', data);
      return data;
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
    gcTime: 0,
  });

  const handleEdit = async (productoId: number, cantidadMinima: number) => {
    try {
      console.log('Editando inventario mínimo:', { productoId, cantidadMinima });
      const response = await fetch(`/api/inventarios-minimos/${productoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cantidadMinima }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error en la respuesta:', errorData);
        throw new Error(errorData.error || 'Error al actualizar el inventario mínimo');
      }

      const productoActualizado = await response.json();
      console.log('Producto actualizado:', productoActualizado);

      // Cerrar el modal y limpiar el estado
      setEditingProductId(null);
      setNewMinimo('0');

      // Forzar una recarga completa de los datos
      await refetch();
      
      // Esperar un momento y forzar otra recarga para asegurar que los datos estén actualizados
      setTimeout(async () => {
        await refetch();
      }, 500);
      
      toast.success('Inventario mínimo actualizado correctamente');
    } catch (error) {
      console.error('Error al actualizar inventario mínimo:', error);
      toast.error(error instanceof Error ? error.message : 'Error al actualizar el inventario mínimo');
    }
  };

  const handleDelete = async (productoId: number) => {
    try {
      console.log('Eliminando inventario mínimo:', { productoId });
      const response = await fetch(`/api/inventarios-minimos/${productoId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error en la respuesta:', errorData);
        throw new Error(errorData.error || 'Error al eliminar el inventario mínimo');
      }

      const data = await response.json();
      console.log('Respuesta exitosa:', data);

      // Forzar una recarga completa de los datos
      await refetch();
      
      // Esperar un momento y forzar otra recarga para asegurar que los datos estén actualizados
      setTimeout(async () => {
        await refetch();
      }, 100);
      
      toast.success('Inventario mínimo eliminado correctamente');
    } catch (error) {
      console.error('Error al eliminar inventario mínimo:', error);
      toast.error(error instanceof Error ? error.message : 'Error al eliminar el inventario mínimo');
    }
  };

  const filteredProductos = productos?.filter((producto) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      producto.tipo === 'PRODUCTO' && (
        (producto.marcas?.nombre?.toLowerCase() || '').includes(searchLower) ||
        (producto.modelos?.nombre?.toLowerCase() || '').includes(searchLower) ||
        (producto.nombre?.toLowerCase() || '').includes(searchLower)
      )
    );
  });

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Gestión de Inventarios Mínimos de Productos</h1>
      
      <div className="mb-6">
        <Input
          placeholder="Buscar producto por marca, modelo o nombre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="relative">
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
            <div className="min-w-[1024px]">
              <table className="w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap sticky top-0 bg-gray-50">
                      Marca
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap sticky top-0 bg-gray-50">
                      Modelo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap sticky top-0 bg-gray-50">
                      Nombre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap sticky top-0 bg-gray-50">
                      Stock Actual
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-pre-line sticky top-0 bg-gray-50">
                      Inventario{'\n'}Mínimo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap sticky top-0 bg-gray-50">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap sticky top-0 bg-gray-50">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProductos?.map((producto) => (
                    <tr key={producto.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {producto.marcas?.nombre || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {producto.modelos?.nombre || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {producto.nombre}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {producto.stock}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {producto.stock_minimo || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          producto.stock <= (producto.stock_minimo || 0)
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {producto.stock <= (producto.stock_minimo || 0)
                            ? 'Stock Bajo'
                            : 'Stock Normal'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          <Dialog open={editingProductId === producto.id} onOpenChange={(open) => {
                            if (!open) setEditingProductId(null);
                            else {
                              setEditingProductId(producto.id);
                              setNewMinimo(producto.stock_minimo?.toString() || '0');
                            }
                          }}>
                            <DialogTrigger asChild>
                              <button
                                className="bg-[#FEBF19] text-gray-900 px-4 py-2 rounded-md hover:bg-[#FEBF19]/90 focus:outline-none focus:ring-2 focus:ring-[#FEBF19] focus:ring-offset-2"
                              >
                                <HiPencilAlt className="h-5 w-5" />
                              </button>
                            </DialogTrigger>
                            <DialogContent className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] z-50 w-full max-w-lg bg-white">
                              <DialogHeader className="px-6 pt-6 pb-4">
                                <DialogTitle className="text-lg font-medium text-gray-900">
                                  Editar Inventario Mínimo - {producto.nombre}
                                </DialogTitle>
                              </DialogHeader>
                              <div className="px-6 pb-4">
                                <div className="mb-4">
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Cantidad Mínima
                                  </label>
                                  <Input
                                    type="number"
                                    value={newMinimo}
                                    onChange={(e) => setNewMinimo(e.target.value)}
                                    min="0"
                                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-400 rounded-md h-12 px-4 text-gray-900"
                                  />
                                </div>
                                <div className="flex justify-end space-x-3">
                                  <Button
                                    variant="outline"
                                    onClick={() => {
                                      setEditingProductId(null);
                                      setNewMinimo('0');
                                    }}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                  >
                                    Cancelar
                                  </Button>
                                  <Button
                                    onClick={() => {
                                      handleEdit(producto.id, parseInt(newMinimo));
                                    }}
                                    className="px-4 py-2 text-sm font-medium text-gray-900 bg-[#FEBF19] border border-transparent rounded-md hover:bg-[#FEBF19]/90 focus:outline-none focus:ring-2 focus:ring-[#FEBF19] focus:ring-offset-2"
                                  >
                                    Guardar
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <button
                            onClick={() => handleDelete(producto.id)}
                            className="bg-[#FEBF19] text-gray-900 px-4 py-2 rounded-md hover:bg-[#FEBF19]/90 focus:outline-none focus:ring-2 focus:ring-[#FEBF19] focus:ring-offset-2"
                          >
                            <HiTrash className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 