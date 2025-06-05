'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CollectionPoint } from '@/types/collection-point';
import { getCollectionPoints } from '@/services/collection-points';
import CollectionPointModal from '@/components/collection-points/CollectionPointModal';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function CollectionPointsPage() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [collectionPoints, setCollectionPoints] = useState<CollectionPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<CollectionPoint | null>(null);

  useEffect(() => {
    loadCollectionPoints();
  }, []);

  const loadCollectionPoints = async () => {
    try {
      setLoading(true);
      const points = await getCollectionPoints();
      setCollectionPoints(points);
      setError(null);
    } catch (error) {
      setError('Error al cargar los puntos de recolección');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedPoint(null);
    loadCollectionPoints();
  };

  const handleEdit = (point: CollectionPoint, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedPoint(point);
    setIsModalOpen(true);
  };

  const handleDelete = async (point: CollectionPoint, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('¿Estás seguro de que deseas eliminar este punto de recolección?')) {
      try {
        // Aquí iría la llamada a la API para eliminar el punto
        await fetch(`/api/puntos-recoleccion/${point.id}`, {
          method: 'DELETE',
        });
        loadCollectionPoints();
      } catch (error) {
        console.error('Error al eliminar el punto:', error);
        alert('Error al eliminar el punto de recolección');
      }
    }
  };

  const handleRowClick = (id: string) => {
    router.push(`/dashboard/collection-points/${id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Cargando puntos de recolección...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Puntos de Recolección</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-[#FEBF19] text-black rounded-md hover:bg-[#FEBF19]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FEBF19]"
        >
          Nuevo Punto de Recolección
        </button>
      </div>

      {collectionPoints.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-500">No hay puntos de recolección registrados</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Teléfono
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {collectionPoints.map((point) => (
                  <tr
                    key={point.id}
                    onClick={() => handleRowClick(point.id)}
                    className="hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {point.name}
                        {point.parent && (
                          <span className="ml-2 text-sm text-gray-500">
                            (Sucursal de {point.parent.name})
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{point.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{point.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {point.isHeadquarters ? (
                          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                            Principal
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                            Sucursal
                          </span>
                        )}
                        {point.isRepairPoint && (
                          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                            Reparación
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        Activo
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={(e) => handleEdit(point, e)}
                          className="text-[#FEBF19] hover:text-[#FEBF19]/80"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(point, e)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <CollectionPointModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        collectionPoint={selectedPoint}
      />
    </div>
  );
} 