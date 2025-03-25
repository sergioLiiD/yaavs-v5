'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AdminLayout from '@/components/layout/AdminLayout';
import { HiPlus, HiPencilAlt, HiTrash } from 'react-icons/hi';
import axios from 'axios';

// Tipo para representar un tipo de servicio
interface TipoServicio {
  id: string;
  concepto: string;
  descripcion?: string;
  activo?: boolean;
}

export default function TipoServicioPage() {
  const { data: session } = useSession();
  
  // Estado para la lista de tipos de servicio
  const [tiposServicio, setTiposServicio] = useState<TipoServicio[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Estado para controlar el formulario de tipo de servicio
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTipoServicio, setCurrentTipoServicio] = useState<Partial<TipoServicio>>({ concepto: '', descripcion: '' });
  const [isEditing, setIsEditing] = useState(false);

  // Cargar los tipos de servicio al montar el componente
  useEffect(() => {
    const fetchTiposServicio = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('/api/catalogo/tipos-servicio');
        setTiposServicio(response.data.map((tipo: any) => ({
          ...tipo,
          id: tipo.id.toString()
        })));
        setError('');
      } catch (err) {
        console.error('Error al cargar tipos de servicio:', err);
        setError('Error al cargar los datos. Por favor, intente nuevamente.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTiposServicio();
  }, []);

  // Funciones para gestionar el formulario
  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentTipoServicio({ concepto: '', descripcion: '' });
    setIsEditing(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentTipoServicio({ ...currentTipoServicio, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentTipoServicio.concepto) return;
    
    try {
      if (isEditing && currentTipoServicio.id) {
        // Actualizar un tipo de servicio existente
        const response = await axios.put(`/api/catalogo/tipos-servicio/${currentTipoServicio.id}`, currentTipoServicio);
        setTiposServicio(tiposServicio.map(tipo => 
          tipo.id === currentTipoServicio.id 
            ? { ...response.data, id: response.data.id.toString() }
            : tipo
        ));
      } else {
        // Agregar un nuevo tipo de servicio
        const response = await axios.post('/api/catalogo/tipos-servicio', currentTipoServicio);
        const newTipoServicio = { ...response.data, id: response.data.id.toString() };
        setTiposServicio([...tiposServicio, newTipoServicio]);
      }
      
      closeModal();
    } catch (err) {
      console.error('Error al guardar tipo de servicio:', err);
      setError('Error al guardar los datos. Por favor, intente nuevamente.');
    }
  };

  const handleEdit = (tipoServicio: TipoServicio) => {
    setCurrentTipoServicio(tipoServicio);
    setIsEditing(true);
    openModal();
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Está seguro que desea eliminar este tipo de servicio?')) {
      try {
        await axios.delete(`/api/catalogo/tipos-servicio/${id}`);
        setTiposServicio(tiposServicio.filter(tipo => tipo.id !== id));
      } catch (err) {
        console.error('Error al eliminar tipo de servicio:', err);
        setError('Error al eliminar el tipo de servicio. Por favor, intente nuevamente.');
      }
    }
  };

  return (
    <ProtectedRoute>
      <AdminLayout title="Catálogo - Tipo de Servicio">
        <div className="space-y-6">
          {/* Encabezado */}
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">Tipos de Servicio</h1>
            <button
              onClick={openModal}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
            >
              <HiPlus className="mr-2" /> Nuevo Tipo de Servicio
            </button>
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
              <p className="mt-2 text-gray-500">Cargando tipos de servicio...</p>
            </div>
          ) : (
            /* Tabla de tipos de servicio */
            <div className="bg-white overflow-hidden shadow-sm rounded-lg">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Concepto
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Descripción
                      </th>
                      <th scope="col" className="relative px-6 py-3">
                        <span className="sr-only">Acciones</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tiposServicio.map((tipo) => (
                      <tr key={tipo.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{tipo.concepto}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-500">
                            {tipo.descripcion || <span className="text-gray-400 italic">Sin descripción</span>}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleEdit(tipo)}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                            <HiPencilAlt className="inline w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(tipo.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <HiTrash className="inline w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {tiposServicio.length === 0 && !isLoading && (
                      <tr>
                        <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                          No hay tipos de servicio registrados
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal para agregar/editar tipo de servicio */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" onClick={closeModal}>
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>

              <span className="hidden sm:inline-block sm:align-middle sm:h-screen"></span>&#8203;

              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <form onSubmit={handleSubmit}>
                  <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div className="mb-4">
                      <h3 className="text-xl font-semibold leading-6 text-gray-900">
                        {isEditing ? 'Editar Tipo de Servicio' : 'Nuevo Tipo de Servicio'}
                      </h3>
                    </div>
                    <div className="mb-4">
                      <label htmlFor="concepto" className="block text-sm font-medium text-gray-800">
                        Concepto <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="concepto"
                        id="concepto"
                        value={currentTipoServicio.concepto}
                        onChange={handleInputChange}
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm text-sm text-gray-900 border-gray-300 rounded-md p-2 border"
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label htmlFor="descripcion" className="block text-sm font-medium text-gray-800">
                        Descripción
                      </label>
                      <textarea
                        name="descripcion"
                        id="descripcion"
                        rows={3}
                        value={currentTipoServicio.descripcion || ''}
                        onChange={handleInputChange}
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm text-sm text-gray-900 border-gray-300 rounded-md p-2 border"
                      />
                      <p className="mt-1 text-xs text-gray-600">Esta descripción es opcional</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button
                      type="submit"
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      {isEditing ? 'Actualizar' : 'Guardar'}
                    </button>
                    <button
                      type="button"
                      onClick={closeModal}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </AdminLayout>
    </ProtectedRoute>
  );
} 