"use client"

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { HiPlus, HiPencilAlt, HiTrash } from 'react-icons/hi';
import axios from 'axios';
import { Table, TableHeader, TableBody, TableCell, TableHead, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ReparacionFrecuenteDialog } from '@/components/reparacion-frecuente-dialog';

interface ReparacionFrecuente {
  id: string;
  nombre: string;
  descripcion?: string;
  activo?: boolean;
  productos: Array<{
    id: string;
    productoId: number;
    cantidad: number;
    precioVenta: number;
  }>;
  pasos: Array<{
    id: string;
    descripcion: string;
    orden: number;
  }>;
}

export default function ReparacionesFrecuentesPage() {
  const { data: session } = useSession();
  
  // Estado para la lista de reparaciones frecuentes
  const [reparacionesFrecuentes, setReparacionesFrecuentes] = useState<ReparacionFrecuente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Estado para controlar el modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentReparacion, setCurrentReparacion] = useState<Partial<ReparacionFrecuente>>({});
  const [isEditing, setIsEditing] = useState(false);

  // Cargar las reparaciones frecuentes al montar el componente
  useEffect(() => {
    const fetchReparacionesFrecuentes = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('/api/reparaciones-frecuentes');
        setReparacionesFrecuentes(response.data.map((rep: any) => ({
          ...rep,
          id: rep.id.toString()
        })));
        setError('');
      } catch (err) {
        console.error('Error al cargar reparaciones frecuentes:', err);
        setError('Error al cargar los datos. Por favor, intente nuevamente.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReparacionesFrecuentes();
  }, []);

  // Funciones para gestionar el modal
  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentReparacion({});
    setIsEditing(false);
  };

  const handleEdit = (reparacion: ReparacionFrecuente) => {
    setCurrentReparacion(reparacion);
    setIsEditing(true);
    openModal();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de que desea eliminar esta reparación frecuente?')) return;

    try {
      await axios.delete(`/api/reparaciones-frecuentes/${id}`);
      setReparacionesFrecuentes(reparacionesFrecuentes.filter(rep => rep.id !== id));
    } catch (err) {
      console.error('Error al eliminar reparación frecuente:', err);
      setError('Error al eliminar el registro. Por favor, intente nuevamente.');
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      if (isEditing && currentReparacion.id) {
        // Actualizar una reparación frecuente existente
        const response = await axios.put(`/api/reparaciones-frecuentes/${currentReparacion.id}`, data);
        setReparacionesFrecuentes(reparacionesFrecuentes.map(rep => 
          rep.id === currentReparacion.id 
            ? { ...response.data, id: response.data.id.toString() }
            : rep
        ));
      } else {
        // Agregar una nueva reparación frecuente
        const response = await axios.post('/api/reparaciones-frecuentes', data);
        const newReparacion = { ...response.data, id: response.data.id.toString() };
        setReparacionesFrecuentes([...reparacionesFrecuentes, newReparacion]);
      }
      
      closeModal();
    } catch (err) {
      console.error('Error al guardar reparación frecuente:', err);
      setError('Error al guardar los datos. Por favor, intente nuevamente.');
    }
  };

  if (isLoading) {
    return <div className="container mx-auto py-10">Cargando...</div>;
  }

  if (error) {
    return <div className="container mx-auto py-10 text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Reparaciones Frecuentes</h1>
        <Button onClick={openModal} className="bg-blue-600 hover:bg-blue-700">
          <HiPlus className="mr-2 h-5 w-5" />
          Nueva Reparación
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reparacionesFrecuentes.map((reparacion) => (
              <TableRow key={reparacion.id}>
                <TableCell className="font-medium">{reparacion.nombre}</TableCell>
                <TableCell>{reparacion.descripcion || '-'}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    reparacion.activo 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {reparacion.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(reparacion)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <HiPencilAlt className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(reparacion.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <HiTrash className="h-5 w-5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ReparacionFrecuenteDialog
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSubmit={handleSubmit}
        initialData={currentReparacion}
      />
    </div>
  );
} 