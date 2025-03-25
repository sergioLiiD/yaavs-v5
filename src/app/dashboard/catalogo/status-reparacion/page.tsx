'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AdminLayout from '@/components/layout/AdminLayout';
import { HiPlus, HiPencilAlt, HiTrash, HiArrowUp, HiArrowDown } from 'react-icons/hi';

// Tipo para representar un estado de reparación
interface EstadoReparacion {
  id: string;
  nombre: string;
  descripcion?: string;
  orden: number;
}

export default function EstadoReparacionPage() {
  const { data: session } = useSession();
  
  // Estado para la lista de estados de reparación
  const [estados, setEstados] = useState<EstadoReparacion[]>([
    // Datos de ejemplo
    { id: '1', nombre: 'Recepción del equipo', descripcion: 'Fase inicial cuando se recibe el dispositivo', orden: 1 },
    { id: '2', nombre: 'En espera de inspección', descripcion: 'El dispositivo está en cola para ser revisado', orden: 2 },
    { id: '3', nombre: 'Diagnóstico', descripcion: 'Determinando el problema del dispositivo', orden: 3 },
    { id: '4', nombre: 'Presupuesto', descripcion: 'Enviando presupuesto al cliente', orden: 4 },
    { id: '5', nombre: 'En reparación', descripcion: 'Trabajando en la solución del problema', orden: 5 },
    { id: '6', nombre: 'Pruebas', descripcion: 'Verificando el correcto funcionamiento', orden: 6 },
    { id: '7', nombre: 'Listo para entrega', descripcion: 'Reparación completada', orden: 7 },
  ]);
  
  // Estado para el modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEstado, setCurrentEstado] = useState<Partial<EstadoReparacion>>({ 
    nombre: '', 
    descripcion: '',
    orden: 0
  });
  const [isEditing, setIsEditing] = useState(false);

  // Funciones para gestionar el formulario
  const openModal = () => {
    // Si es un nuevo estado, asignar el siguiente orden
    if (!isEditing) {
      const maxOrden = estados.length > 0 
        ? Math.max(...estados.map(e => e.orden)) 
        : 0;
      setCurrentEstado({ ...currentEstado, orden: maxOrden + 1 });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentEstado({ nombre: '', descripcion: '', orden: 0 });
    setIsEditing(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentEstado({ ...currentEstado, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentEstado.nombre) return;

    if (isEditing && currentEstado.id) {
      // Actualizar un estado existente
      setEstados(estados.map(estado => 
        estado.id === currentEstado.id 
          ? { ...estado, ...currentEstado } as EstadoReparacion
          : estado
      ));
    } else {
      // Agregar un nuevo estado
      const newEstado: EstadoReparacion = {
        id: Date.now().toString(),
        nombre: currentEstado.nombre!,
        descripcion: currentEstado.descripcion,
        orden: currentEstado.orden || (estados.length + 1)
      };
      setEstados([...estados, newEstado]);
    }
    
    closeModal();
  };

  const handleEdit = (estado: EstadoReparacion) => {
    setCurrentEstado(estado);
    setIsEditing(true);
    openModal();
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Está seguro que desea eliminar este estado?')) {
      setEstados(estados.filter(estado => estado.id !== id));
    }
  };

  // Funciones para reordenar los estados
  const moveUp = (id: string) => {
    const index = estados.findIndex(estado => estado.id === id);
    if (index <= 0) return; // No se puede mover más arriba

    const newEstados = [...estados];
    // Intercambiar orden
    const currentOrden = newEstados[index].orden;
    const prevOrden = newEstados[index - 1].orden;
    
    newEstados[index].orden = prevOrden;
    newEstados[index - 1].orden = currentOrden;
    
    // Reordenar el array
    setEstados([...newEstados].sort((a, b) => a.orden - b.orden));
  };

  const moveDown = (id: string) => {
    const index = estados.findIndex(estado => estado.id === id);
    if (index >= estados.length - 1) return; // No se puede mover más abajo

    const newEstados = [...estados];
    // Intercambiar orden
    const currentOrden = newEstados[index].orden;
    const nextOrden = newEstados[index + 1].orden;
    
    newEstados[index].orden = nextOrden;
    newEstados[index + 1].orden = currentOrden;
    
    // Reordenar el array
    setEstados([...newEstados].sort((a, b) => a.orden - b.orden));
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
                            onClick={() => moveUp(estado.id)}
                            disabled={index === 0}
                            className={`p-1 rounded-md ${index === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-100'}`}
                            title="Mover arriba"
                          >
                            <HiArrowUp className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => moveDown(estado.id)}
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