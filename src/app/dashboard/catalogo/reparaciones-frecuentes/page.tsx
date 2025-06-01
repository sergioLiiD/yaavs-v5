"use client"

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { HiPlus, HiPencilAlt, HiTrash } from 'react-icons/hi';
import axios from 'axios';
import { Table, TableHeader, TableBody, TableCell, TableHead, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ReparacionFrecuenteDialog } from '@/components/reparacion-frecuente-dialog';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';

const formSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  descripcion: z.string().optional(),
  activo: z.boolean().default(true),
  productos: z.array(
    z.object({
      id: z.string(),
      productoId: z.number(),
      cantidad: z.number().min(1),
      precioVenta: z.number().min(0),
      conceptoExtra: z.string().optional(),
      precioConceptoExtra: z.number().optional(),
    })
  ),
  pasos: z.array(
    z.object({
      id: z.string(),
      descripcion: z.string(),
      orden: z.number(),
    })
  ),
});

interface ReparacionFrecuente {
  id: string;
  nombre: string;
  descripcion: string;
  activo: boolean;
  productos_reparacion_frecuente: Array<{
    id: string;
    productoId: number;
    cantidad: number;
    precioVenta: number;
    conceptoExtra?: string;
    precioConceptoExtra?: number;
    productos: {
      id: number;
      nombre: string;
      precioPromedio: number;
      tipo: string;
      sku: string;
      stock: number;
      marca?: { nombre: string };
      modelo?: { nombre: string };
    };
  }>;
  pasos_reparacion_frecuente: Array<{
    id: string;
    descripcion: string;
    orden: number;
  }>;
}

interface EstadoReparacion {
  id: number;
  nombre: string;
  descripcion: string | null;
  orden: number;
  color: string | null;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function ReparacionesFrecuentesPage() {
  const { data: session } = useSession();
  
  // Estado para la lista de reparaciones frecuentes
  const [reparacionesFrecuentes, setReparacionesFrecuentes] = useState<ReparacionFrecuente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Estado para controlar el modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentReparacion, setCurrentReparacion] = useState<{
    id?: string;
    nombre: string;
    descripcion?: string;
    activo: boolean;
    productos: Array<{
      id: string;
      productoId: number;
      cantidad: number;
      precioVenta: number;
      conceptoExtra?: string;
      precioConceptoExtra?: number;
    }>;
    pasos: Array<{
      id: string;
      descripcion: string;
      orden: number;
    }>;
  } | undefined>(undefined);
  const [isEditing, setIsEditing] = useState(false);

  const [estados, setEstados] = useState<EstadoReparacion[]>([]);

  const queryClient = useQueryClient();

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

  useEffect(() => {
    const fetchEstados = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('/api/catalogo/estados-reparacion');
        setEstados(response.data);
        setError('');
      } catch (err) {
        console.error('Error al cargar estados:', err);
        setError('Error al cargar los estados. Por favor, intente nuevamente.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEstados();
  }, []);

  // Funciones para gestionar el modal
  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentReparacion(undefined);
    setIsEditing(false);
  };

  const handleEdit = (reparacion: ReparacionFrecuente) => {
    setCurrentReparacion({
      id: reparacion.id,
      nombre: reparacion.nombre,
      descripcion: reparacion.descripcion || '',
      activo: reparacion.activo,
      productos: reparacion.productos_reparacion_frecuente?.map(p => ({
        id: p.id.toString(),
        productoId: p.productoId,
        cantidad: p.cantidad,
        precioVenta: p.precioVenta,
        conceptoExtra: p.conceptoExtra,
        precioConceptoExtra: p.precioConceptoExtra
      })) || [],
      pasos: reparacion.pasos_reparacion_frecuente?.map(p => ({
        id: p.id.toString(),
        descripcion: p.descripcion,
        orden: p.orden
      })) || []
    });
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

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      const formattedData = {
        ...data,
        productos: data.productos.map((p: z.infer<typeof formSchema>['productos'][0]) => ({
          ...p,
          id: String(p.id),
          productoId: Number(p.productoId),
          cantidad: Number(p.cantidad),
          precioVenta: Number(p.precioVenta),
          conceptoExtra: p.conceptoExtra || '',
          precioConceptoExtra: p.precioConceptoExtra ? Number(p.precioConceptoExtra) : 0
        })),
        pasos: data.pasos.map((p: z.infer<typeof formSchema>['pasos'][0]) => ({
          ...p,
          id: String(p.id),
          orden: Number(p.orden)
        }))
      };

      console.log('Datos a enviar:', formattedData);

      if (isEditing && currentReparacion?.id) {
        const response = await axios.put(`/api/reparaciones-frecuentes/${currentReparacion.id}`, formattedData);
        const updatedReparacion: ReparacionFrecuente = {
          ...response.data,
          id: response.data.id.toString(),
          productos_reparacion_frecuente: response.data.productos_reparacion_frecuente.map((p: any) => ({
            ...p,
            id: String(p.id),
            productoId: Number(p.productoId),
            cantidad: Number(p.cantidad),
            precioVenta: Number(p.precioVenta),
            productos: {
              ...p.productos,
              id: Number(p.productos.id),
              precioPromedio: Number(p.productos.precioPromedio)
            }
          })),
          pasos_reparacion_frecuente: response.data.pasos_reparacion_frecuente.map((p: any) => ({
            ...p,
            id: String(p.id),
            orden: Number(p.orden)
          }))
        };
        setReparacionesFrecuentes(reparacionesFrecuentes.map(rep => 
          rep.id === currentReparacion.id ? updatedReparacion : rep
        ));
      } else {
        const response = await axios.post('/api/reparaciones-frecuentes', formattedData);
        const newReparacion: ReparacionFrecuente = {
          ...response.data,
          id: response.data.id.toString(),
          productos_reparacion_frecuente: response.data.productos_reparacion_frecuente.map((p: any) => ({
            ...p,
            id: String(p.id),
            productoId: Number(p.productoId),
            cantidad: Number(p.cantidad),
            precioVenta: Number(p.precioVenta),
            productos: {
              ...p.productos,
              id: Number(p.productos.id),
              precioPromedio: Number(p.productos.precioPromedio)
            }
          })),
          pasos_reparacion_frecuente: response.data.pasos_reparacion_frecuente.map((p: any) => ({
            ...p,
            id: String(p.id),
            orden: Number(p.orden)
          }))
        };
        setReparacionesFrecuentes([...reparacionesFrecuentes, newReparacion]);
      }

      closeModal();
      queryClient.invalidateQueries({ queryKey: ['reparacionesFrecuentes'] });
      toast.success(isEditing ? 'Reparación frecuente actualizada' : 'Reparación frecuente creada');
    } catch (error) {
      console.error('Error al guardar reparación frecuente:', error);
      toast.error('Error al guardar la reparación frecuente');
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
        <Button onClick={openModal} className="bg-[#FEBF19] hover:bg-[#FEBF19]/90">
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
              <TableHead>Precio</TableHead>
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
                  ${reparacion.productos_reparacion_frecuente?.reduce((total: number, producto: { precioVenta: number; cantidad: number; precioConceptoExtra?: number }) => {
                    const subtotal = producto.precioVenta * producto.cantidad;
                    const extra = producto.precioConceptoExtra || 0;
                    return total + subtotal + extra;
                  }, 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                </TableCell>
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
                    <button
                      onClick={() => handleEdit(reparacion)}
                      className="bg-[#FEBF19] text-gray-900 px-4 py-2 rounded-md hover:bg-[#FEBF19]/90 focus:outline-none focus:ring-2 focus:ring-[#FEBF19] focus:ring-offset-2"
                    >
                      <HiPencilAlt className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(reparacion.id)}
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

      <ReparacionFrecuenteDialog
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSubmit={handleSubmit}
        initialData={currentReparacion}
      />
    </div>
  );
} 