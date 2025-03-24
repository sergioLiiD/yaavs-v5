'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AdminLayout from '@/components/layout/AdminLayout';
import { HiPlus, HiPencilAlt, HiTrash } from 'react-icons/hi';

// Tipo para representar una marca
interface Marca {
  id: string;
  nombre: string;
  descripcion?: string;
}

export default function MarcasPage() {
  const { data: session } = useSession();
  const [marcas, setMarcas] = useState<Marca[]>([
    // Datos de ejemplo
    { id: '1', nombre: 'Apple', descripcion: 'Fabricante de iPhone, iPad y otros dispositivos' },
    { id: '2', nombre: 'Samsung', descripcion: 'Fabricante de la serie Galaxy y otros dispositivos' },
    { id: '3', nombre: 'Xiaomi', descripcion: 'Fabricante de teléfonos inteligentes y dispositivos inteligentes' },
    { id: '4', nombre: 'Huawei', descripcion: '' },
    { id: '5', nombre: 'Motorola', descripcion: 'Fabricante histórico de teléfonos celulares' },
  ]);
  
  // Estado para controlar el formulario de marca
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMarca, setCurrentMarca] = useState<Partial<Marca>>({ nombre: '', descripcion: '' });
  const [isEditing, setIsEditing] = useState(false);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentMarca.nombre) return;

    if (isEditing && currentMarca.id) {
      // Actualizar una marca existente
      setMarcas(marcas.map(marca => 
        marca.id === currentMarca.id 
          ? { ...marca, ...currentMarca } as Marca 
          : marca
      ));
    } else {
      // Agregar una nueva marca
      const newMarca: Marca = {
        id: Date.now().toString(),
        nombre: currentMarca.nombre,
        descripcion: currentMarca.descripcion
      };
      setMarcas([...marcas, newMarca]);
    }
    
    closeModal();
  };

  const handleEdit = (marca: Marca) => {
    setCurrentMarca(marca);
    setIsEditing(true);
    openModal();
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Está seguro que desea eliminar esta marca?')) {
      setMarcas(marcas.filter(marca => marca.id !== id));
    }
  };

  return (
    <ProtectedRoute>
      <AdminLayout title="Catálogo - Marcas de Celulares">
        <div className="space-y-6">
          {/* Encabezado */}
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">Marcas de Celulares</h1>
            <button
              onClick={openModal}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
            >
              <HiPlus className="mr-2" /> Nueva Marca
            </button>
          </div>

          {/* Tabla de marcas */}
          <div className="bg-white overflow-hidden shadow-sm rounded-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
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
                  {marcas.map((marca) => (
                    <tr key={marca.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{marca.nombre}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500">
                          {marca.descripcion || <span className="text-gray-400 italic">Sin descripción</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(marca)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          <HiPencilAlt className="inline w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(marca.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <HiTrash className="inline w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {marcas.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                        No hay marcas registradas
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal para agregar/editar marca */}
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
                        {isEditing ? 'Editar Marca' : 'Nueva Marca'}
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
                        value={currentMarca.nombre}
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
                        value={currentMarca.descripcion || ''}
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