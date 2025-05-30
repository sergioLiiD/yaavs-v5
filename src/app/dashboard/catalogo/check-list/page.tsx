'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { HiPlus, HiPencilAlt, HiTrash } from 'react-icons/hi';
import axios from 'axios';
import { Table, TableHeader, TableBody, TableCell, TableHead, TableRow } from '@/components/ui/table';

// Tipo para representar un item del checklist
interface ChecklistItem {
  id: string;
  nombre: string;
  descripcion?: string;
  activo?: boolean;
  paraDiagnostico: boolean;
  paraReparacion: boolean;
}

export default function ChecklistPage() {
  const { data: session } = useSession();
  
  // Estado para la lista de items del checklist
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Estado para controlar el formulario
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<Partial<ChecklistItem>>({
    nombre: '',
    descripcion: '',
    paraDiagnostico: false,
    paraReparacion: false
  });
  const [isEditing, setIsEditing] = useState(false);

  // Cargar los items del checklist al montar el componente
  useEffect(() => {
    const fetchChecklistItems = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('/api/catalogo/checklist');
        setChecklistItems(response.data.map((item: any) => ({
          ...item,
          id: item.id.toString()
        })));
        setError('');
      } catch (err) {
        console.error('Error al cargar items del checklist:', err);
        setError('Error al cargar los datos. Por favor, intente nuevamente.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchChecklistItems();
  }, []);

  // Funciones para gestionar el formulario
  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentItem({
      nombre: '',
      descripcion: '',
      paraDiagnostico: false,
      paraReparacion: false
    });
    setIsEditing(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setCurrentItem({ ...currentItem, [name]: checkbox.checked });
    } else {
      setCurrentItem({ ...currentItem, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentItem.nombre) return;
    
    try {
      if (isEditing && currentItem.id) {
        // Actualizar un item existente
        const response = await axios.put(`/api/catalogo/checklist/${currentItem.id}`, currentItem);
        setChecklistItems(checklistItems.map(item => 
          item.id === currentItem.id 
            ? { ...response.data, id: response.data.id.toString() }
            : item
        ));
      } else {
        // Agregar un nuevo item
        const response = await axios.post('/api/catalogo/checklist', currentItem);
        const newItem = { ...response.data, id: response.data.id.toString() };
        setChecklistItems([...checklistItems, newItem]);
      }
      
      closeModal();
    } catch (err) {
      console.error('Error al guardar item del checklist:', err);
      setError('Error al guardar los datos. Por favor, intente nuevamente.');
    }
  };

  const handleEdit = (item: ChecklistItem) => {
    setCurrentItem(item);
    setIsEditing(true);
    openModal();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Está seguro de que desea eliminar este item del checklist?')) {
      return;
    }

    try {
      await axios.delete(`/api/catalogo/checklist/${id}`);
      setChecklistItems(checklistItems.filter(item => item.id !== id));
    } catch (err) {
      console.error('Error al eliminar item del checklist:', err);
      setError('Error al eliminar el item. Por favor, intente nuevamente.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Checklist de Verificación</h1>
        <button
          onClick={openModal}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <HiPlus className="-ml-1 mr-2 h-5 w-5" />
          Nuevo Item
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

      {/* Tabla de items del checklist */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Diagnóstico</TableHead>
              <TableHead>Reparación</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {checklistItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.nombre}</TableCell>
                <TableCell>{item.descripcion || '-'}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    item.paraDiagnostico ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {item.paraDiagnostico ? 'Sí' : 'No'}
                  </span>
                </TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    item.paraReparacion ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {item.paraReparacion ? 'Sí' : 'No'}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <HiPencilAlt className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
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
                      value={currentItem.nombre}
                      onChange={handleInputChange}
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-400 rounded-md h-12 px-4 text-gray-900"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">
                      Descripción
                    </label>
                    <textarea
                      name="descripcion"
                      id="descripcion"
                      rows={3}
                      value={currentItem.descripcion}
                      onChange={handleInputChange}
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-400 rounded-md px-4 py-3 text-gray-900"
                    />
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="paraDiagnostico"
                        id="paraDiagnostico"
                        checked={currentItem.paraDiagnostico}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="paraDiagnostico" className="ml-2 block text-sm text-gray-900">
                        Incluir en checklist de diagnóstico
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="paraReparacion"
                        id="paraReparacion"
                        checked={currentItem.paraReparacion}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="paraReparacion" className="ml-2 block text-sm text-gray-900">
                        Incluir en checklist de reparación
                      </label>
                    </div>
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