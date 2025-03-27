'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Producto, InventarioMinimo } from '@prisma/client';
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
import { Edit2, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

type ProductoConInventarioMinimo = Producto & {
  inventarioMinimo: InventarioMinimo | null;
  marca: { nombre: string };
  modelo: { nombre: string };
};

export default function InventariosMinimosPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState<ProductoConInventarioMinimo | null>(null);
  const [newMinimo, setNewMinimo] = useState('0');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: productos, refetch } = useQuery<ProductoConInventarioMinimo[]>({
    queryKey: ['productos'],
    queryFn: async () => {
      const response = await fetch('/api/productos');
      return response.json();
    },
  });

  const handleEdit = async (productoId: number, cantidadMinima: number) => {
    try {
      const response = await fetch(`/api/inventarios-minimos/${productoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cantidadMinima }),
      });

      if (!response.ok) throw new Error('Error al actualizar el inventario mínimo');

      toast.success('Inventario mínimo actualizado correctamente');
      refetch();
    } catch (error) {
      toast.error('Error al actualizar el inventario mínimo');
    }
  };

  const handleDelete = async (productoId: number) => {
    try {
      const response = await fetch(`/api/inventarios-minimos/${productoId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Error al eliminar el inventario mínimo');

      toast.success('Inventario mínimo eliminado correctamente');
      refetch();
    } catch (error) {
      toast.error('Error al eliminar el inventario mínimo');
    }
  };

  const filteredProductos = productos?.filter((producto) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      producto.marca.nombre.toLowerCase().includes(searchLower) ||
      producto.modelo.nombre.toLowerCase().includes(searchLower) ||
      producto.nombre.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Gestión de Inventarios Mínimos</h1>
      
      <div className="mb-6">
        <Input
          placeholder="Buscar por marca, modelo o nombre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Marca
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Modelo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock Actual
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Inventario Mínimo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProductos?.map((producto) => (
              <tr key={producto.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {producto.marca.nombre}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {producto.modelo.nombre}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {producto.nombre}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {producto.stock}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {producto.inventarioMinimo?.cantidadMinima || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    producto.stock <= (producto.inventarioMinimo?.cantidadMinima || 0)
                      ? 'bg-red-100 text-red-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {producto.stock <= (producto.inventarioMinimo?.cantidadMinima || 0)
                      ? 'Stock Bajo'
                      : 'Stock Normal'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex gap-2">
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingProduct(producto);
                            setNewMinimo(producto.inventarioMinimo?.cantidadMinima.toString() || '0');
                            setIsDialogOpen(true);
                          }}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] z-50 w-full max-w-lg bg-white">
                        <DialogHeader className="px-6 pt-6 pb-4">
                          <DialogTitle className="text-lg font-medium text-gray-900">Editar Inventario Mínimo</DialogTitle>
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
                                setEditingProduct(null);
                                setNewMinimo('0');
                                setIsDialogOpen(false);
                              }}
                              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              Cancelar
                            </Button>
                            <Button
                              onClick={async () => {
                                await handleEdit(producto.id, parseInt(newMinimo));
                                setEditingProduct(null);
                                setNewMinimo('0');
                                setIsDialogOpen(false);
                              }}
                              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              Guardar
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(producto.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 