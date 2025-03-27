'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { HiPlus, HiPencilAlt, HiTrash } from 'react-icons/hi';
import axios from 'axios';

// Tipo para representar una marca
interface Marca {
  id: string;
  nombre: string;
  descripcion?: string;
  activo?: boolean;
}

export default function MarcasPage() {
  const { data: session } = useSession();
  
  // Estado para la lista de marcas
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Estado para controlar el formulario de marca
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMarca, setCurrentMarca] = useState<Partial<Marca>>({ nombre: '', descripcion: '' });
  const [isEditing, setIsEditing] = useState(false);

  // Cargar las marcas al montar el componente
  useEffect(() => {
    const fetchMarcas = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('/api/catalogo/marcas');
        setMarcas(response.data.map((marca: any) => ({
          ...marca,
          id: marca.id.toString()
        })));
        setError('');
      } catch (err) {
        console.error('Error al cargar marcas:', err);
        setError('Error al cargar los datos. Por favor, intente nuevamente.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMarcas();
  }, []);

  // Funciones para gestionar el formulario
  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentMarca({ nombre: '', descripcion: '' });
    setIsEditing(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentMarca({ ...currentMarca, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentMarca.nombre) return;
    
    try {
      if (isEditing && currentMarca.id) {
        // Actualizar una marca existente
        const response = await axios.put(`/api/catalogo/marcas/${currentMarca.id}`, currentMarca);
        setMarcas(marcas.map(marca => 
          marca.id === currentMarca.id 
            ? { ...response.data, id: response.data.id.toString() }
            : marca
        ));
      } else {
        // Agregar una nueva marca
        const response = await axios.post('/api/catalogo/marcas', currentMarca);
        const newMarca = { ...response.data, id: response.data.id.toString() };
        setMarcas([...marcas, newMarca]);
      }
      
      closeModal();
    } catch (err) {
      console.error('Error al guardar marca:', err);
      setError('Error al guardar los datos. Por favor, intente nuevamente.');
    }
  };

  const handleEdit = (marca: Marca) => {
    setCurrentMarca(marca);
    setIsEditing(true);
    openModal();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Está seguro de que desea eliminar esta marca?')) {
      return;
    }

    try {
      await axios.delete(`/api/catalogo/marcas/${id}`);
      setMarcas(marcas.filter(marca => marca.id !== id));
    } catch (err) {
      console.error('Error al eliminar marca:', err);
      setError('Error al eliminar la marca. Por favor, intente nuevamente.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Marcas de Celulares</h1>
        <button
          onClick={openModal}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <HiPlus className="-ml-1 mr-2 h-5 w-5" />
          Nueva Marca
        </button>
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tabla de marcas */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {marcas.map((marca) => (
            <li key={marca.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-blue-600 truncate">
                      {marca.nombre}
                    </p>
                    {marca.descripcion && (
                      <p className="mt-1 text-sm text-gray-500">
                        {marca.descripcion}
                      </p>
                    )}
                  </div>
                  <div className="ml-4 flex-shrink-0 flex space-x-2">
                    <button
                      onClick={() => handleEdit(marca)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <HiPencilAlt className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(marca.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <HiTrash className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Modal de formulario */}
      {isModalOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="mb-4">
                    <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
                      Nombre
                    </label>
                    <input
                      type="text"
                      name="nombre"
                      id="nombre"
                      value={currentMarca.nombre}
                      onChange={handleInputChange}
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700">
                      Descripción
                    </label>
                    <textarea
                      name="descripcion"
                      id="descripcion"
                      rows={3}
                      value={currentMarca.descripcion}
                      onChange={handleInputChange}
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    {isEditing ? 'Actualizar' : 'Crear'}
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