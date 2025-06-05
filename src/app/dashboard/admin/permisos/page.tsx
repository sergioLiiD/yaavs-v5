'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { HiPlus, HiPencilAlt, HiTrash } from 'react-icons/hi';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Table, TableHeader, TableBody, TableCell, TableHead, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';

interface Permiso {
  id: number;
  nombre: string;
  descripcion: string;
  codigo: string;
  createdAt: string;
  updatedAt: string;
}

interface CreatePermisoDTO {
  nombre: string;
  descripcion: string;
  codigo: string;
}

export default function PermisosPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [permisos, setPermisos] = useState<Permiso[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Estado para controlar el formulario de permiso
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPermiso, setCurrentPermiso] = useState<Partial<CreatePermisoDTO>>({
    nombre: '',
    descripcion: '',
    codigo: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    if (status === 'authenticated' && session?.user) {
      if (session.user.role !== 'ADMINISTRADOR') {
        router.push('/dashboard');
        return;
      }

      fetchPermisos();
    }
  }, [status, session, router]);

  const fetchPermisos = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/permisos');
      setPermisos(response.data);
      setError('');
    } catch (err) {
      console.error('Error al cargar permisos:', err);
      setError('Error al cargar los datos. Por favor, intente nuevamente.');
      toast.error('Error al cargar permisos');
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
    setIsEditing(false);
    setEditingId(null);
    setCurrentPermiso({
      nombre: '',
      descripcion: '',
      codigo: ''
    });
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentPermiso({
      nombre: '',
      descripcion: '',
      codigo: ''
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentPermiso(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && editingId) {
        await axios.put(`/api/permisos/${editingId}`, currentPermiso);
        toast.success('Permiso actualizado exitosamente');
      } else {
        await axios.post('/api/permisos', currentPermiso);
        toast.success('Permiso creado exitosamente');
      }
      closeModal();
      fetchPermisos();
    } catch (err) {
      console.error('Error al guardar permiso:', err);
      toast.error('Error al guardar el permiso');
    }
  };

  const handleEdit = (permiso: Permiso) => {
    setCurrentPermiso({
      nombre: permiso.nombre,
      descripcion: permiso.descripcion,
      codigo: permiso.codigo
    });
    setIsEditing(true);
    setEditingId(permiso.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Está seguro de eliminar este permiso?')) return;
    
    try {
      await axios.delete(`/api/permisos/${id}`);
      toast.success('Permiso eliminado exitosamente');
      fetchPermisos();
    } catch (err) {
      console.error('Error al eliminar permiso:', err);
      toast.error('Error al eliminar el permiso');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FEBF19]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Permisos</h1>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={openModal}>
              <HiPlus className="h-5 w-5 mr-2" />
              Nuevo Permiso
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isEditing ? 'Editar Permiso' : 'Nuevo Permiso'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre</Label>
                <Input
                  id="nombre"
                  name="nombre"
                  value={currentPermiso.nombre}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Input
                  id="descripcion"
                  name="descripcion"
                  value={currentPermiso.descripcion}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="codigo">Código</Label>
                <Input
                  id="codigo"
                  name="codigo"
                  value={currentPermiso.codigo}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={closeModal}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {isEditing ? 'Actualizar' : 'Crear'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Código</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {permisos.map((permiso) => (
              <TableRow key={permiso.id}>
                <TableCell>{permiso.nombre}</TableCell>
                <TableCell>{permiso.descripcion}</TableCell>
                <TableCell>
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {permiso.codigo}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(permiso)}
                      className="bg-[#FEBF19] text-gray-900 px-4 py-2 rounded-md hover:bg-[#FEBF19]/90 focus:outline-none focus:ring-2 focus:ring-[#FEBF19] focus:ring-offset-2"
                    >
                      <HiPencilAlt className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(permiso.id)}
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
    </div>
  );
} 