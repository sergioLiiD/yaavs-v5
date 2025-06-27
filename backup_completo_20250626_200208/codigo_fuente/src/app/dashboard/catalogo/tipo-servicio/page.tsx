'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { HiPlus, HiPencilAlt, HiTrash } from 'react-icons/hi';
import axios from 'axios';
import { Table, TableHeader, TableBody, TableCell, TableHead, TableRow } from '@/components/ui/table';

// Tipo para representar un tipo de servicio
interface TipoServicio {
  id: string;
  nombre: string;
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
  const [currentTipoServicio, setCurrentTipoServicio] = useState<Partial<TipoServicio>>({ nombre: '', descripcion: '' });
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
    setCurrentTipoServicio({ nombre: '', descripcion: '' });
    setIsEditing(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentTipoServicio({ ...currentTipoServicio, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentTipoServicio.nombre) return;
    
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
    if (!window.confirm('¿Está seguro de que desea eliminar este tipo de servicio?')) {
      return;
    }

    try {
      await axios.delete(`/api/catalogo/tipos-servicio/${id}`);
      setTiposServicio(tiposServicio.filter(tipo => tipo.id !== id));
    } catch (err) {
      console.error('Error al eliminar tipo de servicio:', err);
      setError('Error al eliminar el tipo de servicio. Por favor, intente nuevamente.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Tipos de Servicio</h1>
        <button
          onClick={openModal}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-900 bg-[#FEBF19] hover:bg-[#FEBF19]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FEBF19] sm:ml-3 sm:w-auto sm:text-sm"
        >
          <HiPlus className="-ml-1 mr-2 h-5 w-5" />
          Nuevo Tipo de Servicio
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

      {/* Tabla de tipos de servicio */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tiposServicio.map((tipo) => (
              <TableRow key={tipo.id}>
                <TableCell>{tipo.nombre}</TableCell>
                <TableCell>{tipo.descripcion || '-'}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(tipo)}
                      className="bg-[#FEBF19] text-gray-900 px-4 py-2 rounded-md hover:bg-[#FEBF19]/90 focus:outline-none focus:ring-2 focus:ring-[#FEBF19] focus:ring-offset-2"
                    >
                      <HiPencilAlt className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(tipo.id)}
                      className="bg-[#FEBF19] text-gray-900 px-4 py-2 rounded-md hover:bg-[#FEBF19]/90 focus:outline-none focus:ring-2 focus:ring-[#FEBF19] focus:ring-offset-2"
                    >
                      <HiTrash className="h-5 w-5" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Modal de formulario */}
      {isModalOpen && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-6 pt-6 pb-4">
                  <div className="mb-4">
                    <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre
                    </label>
                    <input
                      type="text"
                      name="nombre"
                      id="nombre"
                      value={currentTipoServicio.nombre}
                      onChange={handleInputChange}
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-400 rounded-md h-12 px-4 text-gray-900"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">
                      Descripción
                    </label>
                    <textarea
                      name="descripcion"
                      id="descripcion"
                      rows={3}
                      value={currentTipoServicio.descripcion}
                      onChange={handleInputChange}
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-400 rounded-md px-4 py-3 text-gray-900"
                    />
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#FEBF19] text-base font-medium text-gray-900 hover:bg-[#FEBF19]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FEBF19] sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    {isEditing ? 'Actualizar' : 'Crear'}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FEBF19] sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
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