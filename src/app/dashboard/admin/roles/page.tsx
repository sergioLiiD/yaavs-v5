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
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Checkbox } from '@/components/ui/checkbox';
import RestrictedAccess from '@/components/restricted-access';
import RouteGuard from '@/components/route-guard';

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

interface Permiso {
  id: number;
  nombre: string;
  descripcion: string;
  codigo: string;
  categoria: string;
}

export default function RolesPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [roles, setRoles] = useState<Rol[]>([]);
  const [permisos, setPermisos] = useState<Permiso[]>([]);
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
        console.log('Enviando datos para actualizar:', currentRol);
        const response = await axios.put(`/api/roles/${editingId}`, currentRol);
        toast.success('Rol actualizado exitosamente');
      } else {
        console.log('Enviando datos para crear:', currentRol);
        const response = await axios.post('/api/roles', currentRol);
        toast.success('Rol creado exitosamente');
      }
      closeModal();
      fetchRoles();
    } catch (err: any) {
      console.error('Error al guardar rol:', err);
      const errorMessage = err.response?.data?.error || err.response?.data || 'Error al guardar el rol';
      if (err.response?.data?.permisosNoExistentes) {
        toast.error(`${errorMessage}: ${err.response.data.permisosNoExistentes.join(', ')}`);
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const handleEdit = (rol: Rol) => {
    console.log('Rol a editar:', rol);
    const permisosIds = rol.permisos.map(p => p.id);
    console.log('IDs de permisos:', permisosIds);
    
    setCurrentRol({
      nombre: rol.nombre,
      descripcion: rol.descripcion,
      permisos: permisosIds
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
    <RouteGuard requiredPermissions={['ROLES_VIEW']} section="Roles">
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Gestión de Roles</h1>
          <Button
            onClick={() => {
              setIsEditing(false);
              setEditingId(null);
              setCurrentRol({
                nombre: '',
                descripcion: '',
                permisos: []
              });
              setIsModalOpen(true);
            }}
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Nuevo Rol
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Permisos</TableHead>
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
                      {rol.permisos.map((permiso, idx) => (
                        <span key={`${permiso.id}-${idx}`}>
                          {permiso.nombre}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(rol)}
                    >
                      <PencilIcon className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(rol.id)}
                    >
                      <TrashIcon className="h-5 w-5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{isEditing ? 'Editar Rol' : 'Nuevo Rol'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre</Label>
                <Input
                  id="nombre"
                  name="nombre"
                  value={currentRol.nombre || ''}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  name="descripcion"
                  value={currentRol.descripcion || ''}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Permisos</Label>
                <div className="max-h-[400px] overflow-y-auto p-4 bg-gray-50 rounded-lg">
                  {Object.entries(
                    permisos.reduce((acc, permiso) => {
                      const categoria = permiso.categoria || 'Otros';
                      if (!acc[categoria]) {
                        acc[categoria] = [];
                      }
                      acc[categoria].push(permiso);
                      return acc;
                    }, {} as Record<string, typeof permisos>)
                  ).map(([categoria, permisosCategoria]) => (
                    <div key={categoria} className="mb-6 last:mb-0">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">{categoria}</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {permisosCategoria.map((permiso) => (
                          <div key={permiso.id} className="flex items-start space-x-2">
                            <Checkbox
                              id={`permiso-${permiso.id}`}
                              checked={currentRol.permisos?.includes(permiso.id)}
                              onCheckedChange={() => handlePermisoChange(permiso.id)}
                              className="mt-1"
                            />
                            <div>
                              <Label 
                                htmlFor={`permiso-${permiso.id}`} 
                                className="font-medium text-sm"
                              >
                                {permiso.nombre}
                              </Label>
                              <p className="text-xs text-gray-500 mt-0.5">
                                {permiso.descripcion}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
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
    </RouteGuard>
  );
} 