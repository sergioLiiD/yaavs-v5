'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { HiPlus, HiPencilAlt, HiTrash } from 'react-icons/hi';
import axios from 'axios';

// Interfaces para representar los datos
interface StatusReparacion {
  id: string;
  nombre: string;
  descripcion?: string;
  color?: string;
  activo?: boolean;
}

export default function StatusReparacionPage() {
  const { data: session } = useSession();
  
  // Estado para la lista de status
  const [statusList, setStatusList] = useState<StatusReparacion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Estado para el modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<Partial<StatusReparacion>>({ 
    nombre: '', 
    descripcion: '',
    color: '#000000'
  });
  const [isEditing, setIsEditing] = useState(false);

  // Cargar status al montar el componente
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('/api/inventarios/status-reparacion');
        setStatusList(response.data.map((status: any) => ({
          ...status,
          id: status.id.toString()
        })));
        setError('');
      } catch (err) {
        console.error('Error al cargar status:', err);
        setError('Error al cargar los datos. Por favor, intente nuevamente.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatus();
  }, []);

  // Funciones para gestionar el formulario
  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentStatus({ nombre: '', descripcion: '', color: '#000000' });
    setIsEditing(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentStatus({ ...currentStatus, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentStatus.nombre) return;
    
    try {
      if (isEditing && currentStatus.id) {
        // Actualizar un status existente
        const response = await axios.put(`/api/inventarios/status-reparacion/${currentStatus.id}`, currentStatus);
        setStatusList(statusList.map(status => 
          status.id === currentStatus.id 
            ? { ...response.data, id: response.data.id.toString() }
            : status
        ));
      } else {
        // Agregar un nuevo status
        const response = await axios.post('/api/inventarios/status-reparacion', currentStatus);
        const newStatus = { ...response.data, id: response.data.id.toString() };
        setStatusList([...statusList, newStatus]);
      }
      
      closeModal();
    } catch (err: any) {
      console.error('Error al guardar status:', err);
      setError(err.response?.data?.error || 'Error al guardar los datos. Por favor, intente nuevamente.');
    }
  };

  const handleEdit = (status: StatusReparacion) => {
    setCurrentStatus(status);
    setIsEditing(true);
    openModal();
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Está seguro que desea eliminar este status?')) {
      try {
        await axios.delete(`/api/inventarios/status-reparacion/${id}`);
        setStatusList(statusList.filter(status => status.id !== id));
      } catch (err: any) {
        console.error('Error al eliminar status:', err);
        if (err.response?.data?.error?.includes('tiene tickets asociados')) {
          setError(`No se puede eliminar el status porque tiene ${err.response.data.count} tickets asociados.`);
        } else {
          setError('Error al eliminar el status. Por favor, intente nuevamente.');
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Status de Reparación</h1>
        <button
          onClick={openModal}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
        >
          <HiPlus className="mr-2" /> Nuevo Status
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
          <p className="mt-2 text-gray-500">Cargando status...</p>
        </div>
      ) : (
        /* Tabla de status */
        <div className="bg-white overflow-hidden shadow-sm rounded-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Color
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
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
                {statusList.map((status) => (
                  <tr key={status.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div 
                          className="h-4 w-4 rounded-full" 
                          style={{ backgroundColor: status.color || '#000000' }}
                        ></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{status.nombre}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">
                        {status.descripcion || <span className="text-gray-400 italic">Sin descripción</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(status)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        <HiPencilAlt className="inline w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(status.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <HiTrash className="inline w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {statusList.length === 0 && !isLoading && (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                      No hay status registrados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal para agregar/editar status */}
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
                      {isEditing ? 'Editar Status' : 'Nuevo Status'}
                    </h3>
                  </div>
                  <div className="mb-4">
                    <label htmlFor="nombre" className="block text-sm font-medium text-gray-800">
                      Nombre <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="nombre"
                      id="nombre"
                      value={currentStatus.nombre || ''}
                      onChange={handleInputChange}
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm text-sm text-gray-900 border-gray-300 rounded-md p-2 border"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="color" className="block text-sm font-medium text-gray-800">
                      Color <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1 flex items-center">
                      <input
                        type="color"
                        name="color"
                        id="color"
                        value={currentStatus.color || '#000000'}
                        onChange={handleInputChange}
                        className="h-10 w-20 rounded border-gray-300"
                        required
                      />
                      <span className="ml-2 text-sm text-gray-500">
                        {currentStatus.color || '#000000'}
                      </span>
                    </div>
                  </div>
                  <div className="mb-4">
                    <label htmlFor="descripcion" className="block text-sm font-medium text-gray-800">
                      Descripción
                    </label>
                    <textarea
                      name="descripcion"
                      id="descripcion"
                      rows={3}
                      value={currentStatus.descripcion || ''}
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
    </div>
  );
} 