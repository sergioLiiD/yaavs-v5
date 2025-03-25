'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AdminLayout from '@/components/layout/AdminLayout';
import { HiPlus, HiPencilAlt, HiTrash } from 'react-icons/hi';

// Interfaces para representar los datos
interface Marca {
  id: string;
  nombre: string;
}

interface Modelo {
  id: string;
  marcaId: string;
  nombre: string;
  descripcion?: string;
}

export default function ModelosPage() {
  const { data: session } = useSession();
  
  // Estado para marcas y modelos
  const [marcas, setMarcas] = useState<Marca[]>([
    // Datos de ejemplo
    { id: '1', nombre: 'Apple' },
    { id: '2', nombre: 'Samsung' },
    { id: '3', nombre: 'Xiaomi' },
    { id: '4', nombre: 'Huawei' },
    { id: '5', nombre: 'Motorola' },
  ]);
  
  const [modelos, setModelos] = useState<Modelo[]>([
    // Datos de ejemplo
    { id: '1', marcaId: '1', nombre: 'iPhone 15', descripcion: 'Última generación de iPhone' },
    { id: '2', marcaId: '1', nombre: 'iPhone 14', descripcion: 'Generación anterior de iPhone' },
    { id: '3', marcaId: '2', nombre: 'Galaxy S23', descripcion: 'Gama alta de Samsung' },
    { id: '4', marcaId: '2', nombre: 'Galaxy A54', descripcion: 'Gama media de Samsung' },
    { id: '5', marcaId: '3', nombre: 'Redmi Note 12', descripcion: 'Gama media de Xiaomi' },
  ]);
  
  // Estado para el filtro de marca
  const [marcaSeleccionada, setMarcaSeleccionada] = useState<string>('');
  const [modelosFiltrados, setModelosFiltrados] = useState<Modelo[]>([]);
  
  // Estado para el modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentModelo, setCurrentModelo] = useState<Partial<Modelo>>({ 
    nombre: '', 
    descripcion: '',
    marcaId: ''
  });
  const [isEditing, setIsEditing] = useState(false);

  // Filtrar modelos cuando cambia la marca seleccionada
  useEffect(() => {
    if (marcaSeleccionada) {
      setModelosFiltrados(modelos.filter(modelo => modelo.marcaId === marcaSeleccionada));
    } else {
      setModelosFiltrados([]);
    }
  }, [marcaSeleccionada, modelos]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentModelo.nombre || !currentModelo.marcaId) return;

    if (isEditing && currentModelo.id) {
      // Actualizar un modelo existente
      setModelos(modelos.map(modelo => 
        modelo.id === currentModelo.id 
          ? { ...modelo, ...currentModelo } as Modelo
          : modelo
      ));
    } else {
      // Agregar un nuevo modelo
      const newModelo: Modelo = {
        id: Date.now().toString(),
        marcaId: currentModelo.marcaId!,
        nombre: currentModelo.nombre!,
        descripcion: currentModelo.descripcion
      };
      setModelos([...modelos, newModelo]);
    }
    
    closeModal();
  };

  const handleEdit = (modelo: Modelo) => {
    setCurrentModelo(modelo);
    setIsEditing(true);
    openModal();
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Está seguro que desea eliminar este modelo?')) {
      setModelos(modelos.filter(modelo => modelo.id !== id));
    }
  };

  const getNombreMarca = (marcaId: string): string => {
    const marca = marcas.find(m => m.id === marcaId);
    return marca ? marca.nombre : 'Desconocida';
  };

  return (
    <ProtectedRoute>
      <AdminLayout title="Catálogo - Modelos de Celulares">
        <div className="space-y-6">
          {/* Encabezado */}
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">Modelos de Celulares</h1>
          </div>

          {/* Selector de marca */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="max-w-lg">
              <label htmlFor="marca" className="block text-sm font-semibold text-gray-900 mb-2">
                Seleccione una marca
              </label>
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

              {/* Tabla de modelos */}
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
                      {modelosFiltrados.map((modelo) => (
                        <tr key={modelo.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{getNombreMarca(modelo.marcaId)}</div>
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
                      {modelosFiltrados.length === 0 && (
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
            </>
          )}

          {!marcaSeleccionada && (
            <div className="bg-white p-8 rounded-lg shadow-sm text-center">
              <p className="text-gray-600">Seleccione una marca para ver sus modelos</p>
            </div>
          )}
        </div>

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
                        value={currentModelo.marcaId}
                        onChange={handleInputChange}
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm text-sm text-gray-900 border-gray-300 rounded-md p-2 border"
                        required
                        disabled={isEditing}
                      >
                        <option value="">-- Seleccione una marca --</option>
                        {marcas.map((marca) => (
                          <option key={marca.id} value={marca.id} className="text-gray-900 font-medium">
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
                        value={currentModelo.nombre}
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
      </AdminLayout>
    </ProtectedRoute>
  );
} 