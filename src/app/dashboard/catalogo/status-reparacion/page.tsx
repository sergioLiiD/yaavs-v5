'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AdminLayout from '@/components/layout/AdminLayout';
import { HiPlus, HiPencilAlt, HiTrash, HiArrowUp, HiArrowDown } from 'react-icons/hi';
import axios from 'axios';

// Tipo para representar un estado de reparación
interface EstadoReparacion {
  id: string;
  nombre: string;
  descripcion?: string;
  orden: number;
  color?: string;
  activo?: boolean;
}

export default function EstadoReparacionPage() {
  const { data: session } = useSession();
  
  // Estado para la lista de estados de reparación
  const [estados, setEstados] = useState<EstadoReparacion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Estado para el modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEstado, setCurrentEstado] = useState<Partial<EstadoReparacion>>({ 
    nombre: '', 
    descripcion: '',
    orden: 0,
    color: '#3498db'
  });
  const [isEditing, setIsEditing] = useState(false);

  // Cargar los estados de reparación al montar el componente
  useEffect(() => {
    const fetchEstados = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('/api/catalogo/estados-reparacion');
        setEstados(response.data.map((estado: any) => ({
          ...estado,
          id: estado.id.toString()
        })));
        setError('');
      } catch (err) {
        console.error('Error al cargar estados de reparación:', err);
        setError('Error al cargar los datos. Por favor, intente nuevamente.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEstados();
  }, []);

  // Funciones para gestionar el formulario
  const openModal = () => {
    // Si es un nuevo estado, asignar el siguiente orden
    if (!isEditing) {
      const maxOrden = estados.length > 0 
        ? Math.max(...estados.map(e => parseInt(e.orden.toString()))) 
        : 0;
      setCurrentEstado({ ...currentEstado, orden: maxOrden + 1 });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentEstado({ nombre: '', descripcion: '', orden: 0, color: '#3498db' });
    setIsEditing(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentEstado({ ...currentEstado, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentEstado.nombre) return;
    
    try {
      if (isEditing && currentEstado.id) {
        // Actualizar un estado existente
        const response = await axios.put(`/api/catalogo/estados-reparacion/${currentEstado.id}`, currentEstado);
        setEstados(estados.map(estado => 
          estado.id === currentEstado.id 
            ? { ...response.data, id: response.data.id.toString() }
            : estado
        ));
      } else {
        // Agregar un nuevo estado
        const response = await axios.post('/api/catalogo/estados-reparacion', currentEstado);
        const newEstado = { ...response.data, id: response.data.id.toString() };
        setEstados([...estados, newEstado]);
      }
      
      closeModal();
    } catch (err) {
      console.error('Error al guardar estado:', err);
      setError('Error al guardar los datos. Por favor, intente nuevamente.');
    }
  };

  const handleEdit = (estado: EstadoReparacion) => {
    setCurrentEstado(estado);
    setIsEditing(true);
    openModal();
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Está seguro que desea eliminar este estado?')) {
      try {
        await axios.delete(`/api/catalogo/estados-reparacion/${id}`);
        setEstados(estados.filter(estado => estado.id !== id));
      } catch (err) {
        console.error('Error al eliminar estado:', err);
        setError('Error al eliminar el estado. Por favor, intente nuevamente.');
      }
    }
  };

  // Funciones para reordenar los estados
  const handleMoveUp = async (id: string) => {
    const index = estados.findIndex(e => e.id === id);
    if (index <= 0) return;
    
    try {
      const currentEstado = estados[index];
      const prevEstado = estados[index - 1];
      
      // Intercambiar órdenes
      await axios.put(`/api/catalogo/estados-reparacion/${currentEstado.id}`, {
        ...currentEstado,
        orden: prevEstado.orden
      });
      
      await axios.put(`/api/catalogo/estados-reparacion/${prevEstado.id}`, {
        ...prevEstado,
        orden: currentEstado.orden
      });
      
      // Actualizar estado local
      const newEstados = [...estados];
      const temp = newEstados[index].orden;
      newEstados[index].orden = newEstados[index - 1].orden;
      newEstados[index - 1].orden = temp;
      
      // Reordenar array
      setEstados([...newEstados].sort((a, b) => a.orden - b.orden));
    } catch (err) {
      console.error('Error al reordenar:', err);
      setError('Error al reordenar los estados. Por favor, intente nuevamente.');
    }
  };

  const handleMoveDown = async (id: string) => {
    const index = estados.findIndex(e => e.id === id);
    if (index >= estados.length - 1) return;
    
    try {
      const currentEstado = estados[index];
      const nextEstado = estados[index + 1];
      
      // Intercambiar órdenes
      await axios.put(`/api/catalogo/estados-reparacion/${currentEstado.id}`, {
        ...currentEstado,
        orden: nextEstado.orden
      });
      
      await axios.put(`/api/catalogo/estados-reparacion/${nextEstado.id}`, {
        ...nextEstado,
        orden: currentEstado.orden
      });
      
      // Actualizar estado local
      const newEstados = [...estados];
      const temp = newEstados[index].orden;
      newEstados[index].orden = newEstados[index + 1].orden;
      newEstados[index + 1].orden = temp;
      
      // Reordenar array
      setEstados([...newEstados].sort((a, b) => a.orden - b.orden));
    } catch (err) {
      console.error('Error al reordenar:', err);
      setError('Error al reordenar los estados. Por favor, intente nuevamente.');
    }
  };

  // Ordenar estados por el campo orden
  const estadosOrdenados = [...estados].sort((a, b) => a.orden - b.orden);

  return (
    <ProtectedRoute>
      <AdminLayout title="Catálogo - Estados de Reparación">
        <div className="space-y-6">
          {/* Encabezado */}
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">Estados de Reparación</h1>
            <button
              onClick={openModal}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
            >
              <HiPlus className="mr-2" /> Nuevo Estado
            </button>
          </div>

          {/* Descripción */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-gray-600">
              Gestione los diferentes estados por los que pasa una reparación. Puede reordenar los estados 
              usando las flechas para adaptarlos a su flujo de trabajo específico.
            </p>
          </div>

          {/* Tabla de estados */}
          <div className="bg-white overflow-hidden shadow-sm rounded-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Orden
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Descripción
                    </th>
                    <th scope="col" className="relative px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reordenar
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Acciones</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {estadosOrdenados.map((estado, index) => (
                    <tr key={estado.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{estado.orden}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{estado.nombre}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500">
                          {estado.descripcion || <span className="text-gray-400 italic">Sin descripción</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => handleMoveUp(estado.id)}
                            disabled={index === 0}
                            className={`p-1 rounded-md ${index === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-100'}`}
                            title="Mover arriba"
                          >
                            <HiArrowUp className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleMoveDown(estado.id)}
                            disabled={index === estadosOrdenados.length - 1}
                            className={`p-1 rounded-md ${index === estadosOrdenados.length - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-100'}`}
                            title="Mover abajo"
                          >
                            <HiArrowDown className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(estado)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                          title="Editar"
                        >
                          <HiPencilAlt className="inline w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(estado.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Eliminar"
                        >
                          <HiTrash className="inline w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {estados.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                        No hay estados de reparación registrados
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal para agregar/editar estado */}
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
                        {isEditing ? 'Editar Estado' : 'Nuevo Estado'}
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
                        value={currentEstado.nombre}
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
                        value={currentEstado.descripcion || ''}
                        onChange={handleInputChange}
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm text-sm text-gray-900 border-gray-300 rounded-md p-2 border"
                      />
                      <p className="mt-1 text-xs text-gray-600">Esta descripción es opcional</p>
                    </div>
                    {isEditing && (
                      <div className="mb-4">
                        <label htmlFor="orden" className="block text-sm font-medium text-gray-800">
                          Orden <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          name="orden"
                          id="orden"
                          min="1"
                          value={currentEstado.orden}
                          onChange={handleInputChange}
                          className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm text-sm text-gray-900 border-gray-300 rounded-md p-2 border"
                        />
                      </div>
                    )}
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