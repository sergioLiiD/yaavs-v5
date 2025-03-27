'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { HiPlus, HiPencilAlt, HiTrash } from 'react-icons/hi';
import axios from 'axios';

// Interfaces para representar los datos
interface Marca {
  id: string;
  nombre: string;
}

interface Modelo {
  id: string;
  marcaId: string | number;
  nombre: string;
  descripcion?: string;
  imagen?: string;
  activo?: boolean;
  marca?: {
    id: number;
    nombre: string;
  };
}

export default function ModelosPage() {
  const { data: session } = useSession();
  
  // Estado para marcas y modelos
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [modelos, setModelos] = useState<Modelo[]>([]);
  const [isLoadingMarcas, setIsLoadingMarcas] = useState(true);
  const [isLoadingModelos, setIsLoadingModelos] = useState(false);
  const [error, setError] = useState('');
  
  // Estado para el filtro de marca
  const [marcaSeleccionada, setMarcaSeleccionada] = useState<string>('');
  
  // Estado para el modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentModelo, setCurrentModelo] = useState<Partial<Modelo>>({ 
    nombre: '', 
    descripcion: '',
    marcaId: ''
  });
  const [isEditing, setIsEditing] = useState(false);

  // Cargar marcas al montar el componente
  useEffect(() => {
    const fetchMarcas = async () => {
      try {
        setIsLoadingMarcas(true);
        const response = await axios.get('/api/catalogo/marcas');
        setMarcas(response.data.map((marca: any) => ({
          ...marca,
          id: marca.id.toString()
        })));
        setError('');
      } catch (err) {
        console.error('Error al cargar marcas:', err);
        setError('Error al cargar las marcas. Por favor, intente nuevamente.');
      } finally {
        setIsLoadingMarcas(false);
      }
    };

    fetchMarcas();
  }, []);

  // Cargar modelos cuando cambia la marca seleccionada
  useEffect(() => {
    const fetchModelos = async () => {
      if (!marcaSeleccionada) {
        setModelos([]);
        return;
      }
      
      try {
        setIsLoadingModelos(true);
        const response = await axios.get(`/api/catalogo/modelos?marcaId=${marcaSeleccionada}`);
        setModelos(response.data.map((modelo: any) => ({
          ...modelo,
          id: modelo.id.toString(),
          marcaId: modelo.marcaId.toString()
        })));
        setError('');
      } catch (err) {
        console.error('Error al cargar modelos:', err);
        setError('Error al cargar los modelos. Por favor, intente nuevamente.');
      } finally {
        setIsLoadingModelos(false);
      }
    };

    fetchModelos();
  }, [marcaSeleccionada]);

  // Funciones para gestionar el formulario
  const openModal = () => {
    setCurrentModelo({...currentModelo, marcaId: marcaSeleccionada});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentModelo({ nombre: '', descripcion: '', marcaId: marcaSeleccionada });
    setIsEditing(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCurrentModelo({ ...currentModelo, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentModelo.nombre || !currentModelo.marcaId) return;
    
    try {
      if (isEditing && currentModelo.id) {
        // Actualizar un modelo existente
        const response = await axios.put(`/api/catalogo/modelos/${currentModelo.id}`, currentModelo);
        setModelos(modelos.map(modelo => 
          modelo.id === currentModelo.id 
            ? { ...response.data, id: response.data.id.toString(), marcaId: response.data.marcaId.toString() }
            : modelo
        ));
      } else {
        // Agregar un nuevo modelo
        const response = await axios.post('/api/catalogo/modelos', currentModelo);
        const newModelo = { 
          ...response.data, 
          id: response.data.id.toString(),
          marcaId: response.data.marcaId.toString()
        };
        setModelos([...modelos, newModelo]);
      }
      
      closeModal();
    } catch (err: any) {
      console.error('Error al guardar modelo:', err);
      setError(err.response?.data?.error || 'Error al guardar los datos. Por favor, intente nuevamente.');
    }
  };

  const handleEdit = (modelo: Modelo) => {
    setCurrentModelo(modelo);
    setIsEditing(true);
    openModal();
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Está seguro que desea eliminar este modelo?')) {
      try {
        await axios.delete(`/api/catalogo/modelos/${id}`);
        setModelos(modelos.filter(modelo => modelo.id !== id));
      } catch (err: any) {
        console.error('Error al eliminar modelo:', err);
        if (err.response?.data?.error?.includes('tiene tickets asociados')) {
          setError(`No se puede eliminar el modelo porque tiene ${err.response.data.count} tickets asociados.`);
        } else {
          setError('Error al eliminar el modelo. Por favor, intente nuevamente.');
        }
      }
    }
  };

  const getNombreMarca = (marcaId: string): string => {
    const marca = marcas.find(m => m.id === marcaId);
    return marca ? marca.nombre : 'Desconocida';
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Modelos de Celulares</h1>
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

      {/* Selector de marca */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="max-w-lg">
          <label htmlFor="marca" className="block text-sm font-semibold text-gray-900 mb-2">
            Seleccione una marca
          </label>
          {isLoadingMarcas ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2"></div>
              <span className="text-gray-500">Cargando marcas...</span>
            </div>
          ) : (
            <select
              id="marca"
              name="marca"
              value={marcaSeleccionada}
              onChange={(e) => setMarcaSeleccionada(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base font-medium text-gray-900 border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="">-- Seleccione una marca --</option>
              {marcas.map((marca) => (
                <option key={marca.id} value={marca.id} className="text-gray-900 font-medium">
                  {marca.nombre}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {marcaSeleccionada && (
        <>
          {/* Botón para agregar modelo */}
          <div className="flex justify-end">
            <button
              onClick={openModal}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
            >
              <HiPlus className="mr-2" /> Nuevo Modelo
            </button>
          </div>

          {/* Estado de carga */}
          {isLoadingModelos ? (
            <div className="text-center py-10">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-500">Cargando modelos...</p>
            </div>
          ) : (
            /* Tabla de modelos */
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
                        Descripción
                      </th>
                      <th scope="col" className="relative px-6 py-3">
                        <span className="sr-only">Acciones</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {modelos.map((modelo) => (
                      <tr key={modelo.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {modelo.marca?.nombre || getNombreMarca(modelo.marcaId.toString())}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{modelo.nombre}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-500">
                            {modelo.descripcion || <span className="text-gray-400 italic">Sin descripción</span>}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleEdit(modelo)}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                            <HiPencilAlt className="inline w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(modelo.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <HiTrash className="inline w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {modelos.length === 0 && !isLoadingModelos && (
                      <tr>
                        <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                          No hay modelos registrados para esta marca
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {!marcaSeleccionada && (
        <div className="bg-white p-8 rounded-lg shadow-sm text-center">
          <p className="text-gray-600">Seleccione una marca para ver sus modelos</p>
        </div>
      )}

      {/* Modal para agregar/editar modelo */}
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
                      {isEditing ? 'Editar Modelo' : 'Nuevo Modelo'}
                    </h3>
                  </div>
                  <div className="mb-4">
                    <label htmlFor="marcaId" className="block text-sm font-medium text-gray-800">
                      Marca <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="marcaId"
                      name="marcaId"
                      value={currentModelo.marcaId?.toString() || ''}
                      onChange={handleInputChange}
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm text-sm text-gray-900 border-gray-300 rounded-md p-2 border"
                      required
                    >
                      <option value="">-- Seleccione una marca --</option>
                      {marcas.map((marca) => (
                        <option key={marca.id} value={marca.id}>
                          {marca.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-4">
                    <label htmlFor="nombre" className="block text-sm font-medium text-gray-800">
                      Nombre del Modelo <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="nombre"
                      id="nombre"
                      value={currentModelo.nombre || ''}
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
                      value={currentModelo.descripcion || ''}
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