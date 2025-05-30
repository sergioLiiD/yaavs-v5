'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { HiPlus, HiPencilAlt, HiTrash } from 'react-icons/hi';
import axios from 'axios';
import { Table, TableHeader, TableBody, TableCell, TableHead, TableRow } from '@/components/ui/table';

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
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#FEBF19] hover:bg-[#FEBF19]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FEBF19] sm:ml-3 sm:w-auto sm:text-sm"
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {marcas.map((marca) => (
              <TableRow key={marca.id}>
                <TableCell>{marca.nombre}</TableCell>
                <TableCell>{marca.descripcion || '-'}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
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

            <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl mx-auto">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-8 pt-6 pb-6">
                  <div className="mb-6">
                    <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre
                    </label>
                    <input
                      type="text"
                      name="nombre"
                      id="nombre"
                      value={currentMarca.nombre}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ingrese el nombre de la marca"
                    />
                  </div>
                  <div className="mb-6">
                    <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-2">
                      Descripción
                    </label>
                    <textarea
                      name="descripcion"
                      id="descripcion"
                      value={currentMarca.descripcion}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ingrese una descripción de la marca"
                    />
                  </div>
                </div>
                <div className="bg-gray-50 px-8 py-4 sm:flex sm:flex-row-reverse">
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