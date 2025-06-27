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
  DialogDescription,
} from '@/components/ui/dialog';
import { Table, TableHeader, TableBody, TableCell, TableHead, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';

interface Rol {
  id: number;
  nombre: string;
  descripcion: string;
  activo: boolean;
  permisos: {
    permiso: {
      id: number;
      codigo: string;
      nombre: string;
      descripcion: string;
    }
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
  const [currentRol, setCurrentRol] = useState<{
    nombre: string;
    descripcion: string;
    permisos: number[];
  }>({
    nombre: '',
    descripcion: '',
    permisos: []
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [rolAEditar, setRolAEditar] = useState<Rol | null>(null);
  const [selectedPermisos, setSelectedPermisos] = useState<number[]>([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

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
      // Filtrar los permisos nulos y asegurarnos de que sean números
      const permisosFiltrados = currentRol.permisos
        ?.filter(permiso => permiso !== null && !isNaN(Number(permiso)))
        .map(permiso => Number(permiso)) || [];

      console.log('Permisos filtrados antes de enviar:', permisosFiltrados);

      const rolData = {
        ...currentRol,
        permisos: permisosFiltrados
      };

      if (isEditing && editingId) {
        console.log('Enviando datos para actualizar:', rolData);
        const response = await axios.put(`/api/roles/${editingId}`, rolData);
        console.log('Respuesta del servidor:', response.data);
        toast.success('Rol actualizado exitosamente');
      } else {
        console.log('Enviando datos para crear:', rolData);
        const response = await axios.post('/api/roles', rolData);
        console.log('Respuesta del servidor:', response.data);
        toast.success('Rol creado exitosamente');
      }
      closeModal();
      fetchRoles();
    } catch (err: any) {
      console.error('Error al guardar rol:', err);
      console.error('Detalles del error:', err.response?.data);
      const errorMessage = err.response?.data?.error || err.response?.data || 'Error al guardar el rol';
      if (err.response?.data?.permisosNoExistentes) {
        toast.error(`${errorMessage}: ${err.response.data.permisosNoExistentes.join(', ')}`);
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const handleEdit = (rol: any) => {
    console.log('Rol a editar:', rol);
    console.log('Estructura completa de permisos:', JSON.stringify(rol.permisos, null, 2));
    
    // Extraer los IDs de los permisos correctamente
    const permisoIds = rol.permisos.map((p: any) => {
      console.log('Permiso individual completo:', p);
      // Intentar diferentes formas de acceder al ID
      const id = p.permiso?.id || p.id;
      console.log('ID encontrado:', id);
      return id;
    }).filter((id: any) => id !== undefined);
    
    console.log('IDs de permisos extraídos:', permisoIds);
    
    setRolAEditar(rol);
    setSelectedPermisos(permisoIds);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!rolAEditar) return;

    try {
      const dataToUpdate = {
        nombre: rolAEditar.nombre,
        descripcion: rolAEditar.descripcion,
        permisos: selectedPermisos
      };

      console.log('Enviando datos para actualizar:', dataToUpdate);

      const response = await fetch(`/api/roles/${rolAEditar.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToUpdate),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar el rol');
      }

      const updatedRol = await response.json();
      console.log('Rol actualizado:', updatedRol);

      await fetchRoles();
      setIsEditDialogOpen(false);
      setRolAEditar(null);
      setSelectedPermisos([]);
      toast.success('Rol actualizado exitosamente');
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'Error al actualizar el rol');
    }
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
          <DialogContent className="sm:max-w-[425px]" aria-describedby="dialog-description">
            <DialogHeader>
              <DialogTitle>{isEditing ? 'Editar Rol' : 'Nuevo Rol'}</DialogTitle>
              <DialogDescription id="dialog-description">
                {isEditing ? 'Modifica los permisos asignados a este rol.' : 'Completa los datos del rol y selecciona los permisos correspondientes.'}
              </DialogDescription>
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
                        key={permiso.permiso.id}
                        className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800 font-medium"
                      >
                        {permiso.permiso.nombre}
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