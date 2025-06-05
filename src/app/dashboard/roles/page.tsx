'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { HiPlus, HiPencilAlt, HiTrash } from 'react-icons/hi';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Table, TableHeader, TableBody, TableCell, TableHead, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';

interface Rol {
  id: number;
  nombre: string;
  descripcion: string;
  activo: boolean;
  permisos: {
    id: number;
    codigo: string;
    nombre: string;
  }[];
}

interface CreateRolDTO {
  nombre: string;
  descripcion: string;
  permisos: number[];
}

export default function RolesPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [roles, setRoles] = useState<Rol[]>([]);
  const [permisos, setPermisos] = useState<{ id: number; codigo: string; nombre: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Estado para controlar el formulario de rol
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRol, setCurrentRol] = useState<Partial<CreateRolDTO>>({
    nombre: '',
    descripcion: '',
    permisos: []
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

      fetchRoles();
      fetchPermisos();
    }
  }, [status, session, router]);

  const fetchRoles = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/roles');
      setRoles(response.data);
      setError('');
    } catch (err) {
      console.error('Error al cargar roles:', err);
      setError('Error al cargar los datos. Por favor, intente nuevamente.');
      toast.error('Error al cargar roles');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPermisos = async () => {
    try {
      const response = await axios.get('/api/permisos');
      setPermisos(response.data);
    } catch (err) {
      console.error('Error al cargar permisos:', err);
      toast.error('Error al cargar permisos');
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
    setIsEditing(false);
    setEditingId(null);
    setCurrentRol({
      nombre: '',
      descripcion: '',
      permisos: []
    });
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentRol({
      nombre: '',
      descripcion: '',
      permisos: []
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentRol(prev => ({ ...prev, [name]: value }));
  };

  const handlePermisoChange = (permisoId: number) => {
    setCurrentRol(prev => {
      const permisos = prev.permisos || [];
      if (permisos.includes(permisoId)) {
        return { ...prev, permisos: permisos.filter(id => id !== permisoId) };
      } else {
        return { ...prev, permisos: [...permisos, permisoId] };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && editingId) {
        await axios.put(`/api/roles/${editingId}`, currentRol);
        toast.success('Rol actualizado exitosamente');
      } else {
        await axios.post('/api/roles', currentRol);
        toast.success('Rol creado exitosamente');
      }
      closeModal();
      fetchRoles();
    } catch (err) {
      console.error('Error al guardar rol:', err);
      toast.error('Error al guardar el rol');
    }
  };

  const handleEdit = (rol: Rol) => {
    setCurrentRol({
      nombre: rol.nombre,
      descripcion: rol.descripcion,
      permisos: rol.permisos.map(p => p.id)
    });
    setIsEditing(true);
    setEditingId(rol.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Está seguro de eliminar este rol?')) return;
    
    try {
      await axios.delete(`/api/roles/${id}`);
      toast.success('Rol eliminado exitosamente');
      fetchRoles();
    } catch (err) {
      console.error('Error al eliminar rol:', err);
      toast.error('Error al eliminar el rol');
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
        <h1 className="text-2xl font-bold text-gray-900">Roles</h1>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={openModal}>
              <HiPlus className="h-5 w-5 mr-2" />
              Nuevo Rol
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isEditing ? 'Editar Rol' : 'Nuevo Rol'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre</Label>
                <Input
                  id="nombre"
                  name="nombre"
                  value={currentRol.nombre}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  name="descripcion"
                  value={currentRol.descripcion}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Permisos</Label>
                <div className="grid grid-cols-2 gap-2">
                  {permisos.map((permiso) => (
                    <div key={permiso.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`permiso-${permiso.id}`}
                        checked={currentRol.permisos?.includes(permiso.id)}
                        onChange={() => handlePermisoChange(permiso.id)}
                        className="rounded border-gray-300 text-[#FEBF19] focus:ring-[#FEBF19]"
                      />
                      <label htmlFor={`permiso-${permiso.id}`} className="text-sm">
                        {permiso.nombre}
                      </label>
                    </div>
                  ))}
                </div>
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
              <TableHead>Permisos</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.map((rol) => (
              <TableRow key={rol.id}>
                <TableCell>{rol.nombre}</TableCell>
                <TableCell>{rol.descripcion}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {rol.permisos.map((permiso) => (
                      <span
                        key={permiso.id}
                        className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800"
                      >
                        {permiso.nombre}
                      </span>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    rol.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {rol.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(rol)}
                      className="bg-[#FEBF19] text-gray-900 px-4 py-2 rounded-md hover:bg-[#FEBF19]/90 focus:outline-none focus:ring-2 focus:ring-[#FEBF19] focus:ring-offset-2"
                    >
                      <HiPencilAlt className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(rol.id)}
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