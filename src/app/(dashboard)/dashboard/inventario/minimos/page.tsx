'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Producto, InventarioMinimo } from '@prisma/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

type ProductoConInventarioMinimo = Producto & {
  inventarioMinimo: InventarioMinimo | null;
  marca: { nombre: string };
  modelo: { nombre: string };
};

export default function InventariosMinimosPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState<ProductoConInventarioMinimo | null>(null);
  const [newMinimo, setNewMinimo] = useState('0');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: productos, refetch } = useQuery<ProductoConInventarioMinimo[]>({
    queryKey: ['productos'],
    queryFn: async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/productos');
        if (!response.ok) throw new Error('Error al cargar los productos');
        return response.json();
      } catch (err) {
        setError('Error al cargar los datos. Por favor, intente nuevamente.');
        throw err;
      } finally {
        setIsLoading(false);
      }
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
      setIsModalOpen(false);
    } catch (error) {
      toast.error('Error al actualizar el inventario mínimo');
    }
  };

  const handleDelete = async (productoId: number) => {
    if (confirm('¿Está seguro que desea eliminar este inventario mínimo?')) {
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
    <ProtectedRoute>
      <div className="space-y-6">
        {/* Encabezado */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Inventarios Mínimos</h1>
          <div className="flex gap-4">
            <Input
              placeholder="Buscar por marca, modelo o nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>
        </div>

        {/* Mensaje de error */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Estado de carga */}
        {isLoading ? (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-500">Cargando productos...</p>
          </div>
        ) : (
          /* Tabla de productos */
          <div className="bg-white overflow-hidden shadow-sm rounded-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Marca
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Modelo
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Inventario Mínimo
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Acciones</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProductos?.map((producto) => (
                    <tr key={producto.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{producto.marca.nombre}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{producto.modelo.nombre}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{producto.nombre}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{producto.inventarioMinimo?.cantidadMinima || 0}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => {
                            setEditingProduct(producto);
                            setNewMinimo(producto.inventarioMinimo?.cantidadMinima.toString() || '0');
                            setIsModalOpen(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          <Edit2 className="inline w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(producto.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="inline w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredProductos?.length === 0 && !isLoading && (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                        No hay productos con inventario mínimo configurado
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal para editar inventario mínimo */}
      {isModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={() => setIsModalOpen(false)}>
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen"></span>&#8203;

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="mb-4">
                  <h3 className="text-xl font-semibold leading-6 text-gray-900">
                    Editar Inventario Mínimo
                  </h3>
                </div>
                <div className="mb-4">
                  <label htmlFor="cantidadMinima" className="block text-sm font-medium text-gray-800">
                    Cantidad Mínima <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="cantidadMinima"
                    value={newMinimo}
                    onChange={(e) => setNewMinimo(e.target.value)}
                    min="0"
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm text-sm text-gray-900 border-gray-300 rounded-md p-2 border"
                    required
                  />
                </div>
                <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => handleEdit(editingProduct.id, parseInt(newMinimo))}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:col-start-2 sm:text-sm"
                  >
                    Guardar
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
} 