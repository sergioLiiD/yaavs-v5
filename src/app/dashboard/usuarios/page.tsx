'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { HiPlus, HiPencilAlt, HiTrash } from 'react-icons/hi';
import axios from 'axios';
import { Usuario, NivelUsuario, CreateUsuarioDTO, UpdateUsuarioDTO } from '@/types/usuario';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Table, TableHeader, TableBody, TableCell, TableHead, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';

const NIVELES_USUARIO = ['ADMINISTRADOR', 'GERENTE', 'TECNICO', 'RECEPCIONISTA'] as const;

export default function UsuariosPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Estado para controlar el formulario de usuario
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUsuario, setCurrentUsuario] = useState<Partial<CreateUsuarioDTO>>({
    nombre: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    email: '',
    password: '',
    confirmPassword: '',
    nivel: 'ATENCION_CLIENTE',
    activo: true
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

      fetchUsuarios();
    }
  }, [status, session, router]);

  const fetchUsuarios = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/usuarios');
      setUsuarios(response.data);
      setError('');
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
      setError('Error al cargar los datos. Por favor, intente nuevamente.');
      toast.error('Error al cargar usuarios');
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
    setIsEditing(false);
    setEditingId(null);
    setCurrentUsuario({
      nombre: '',
      apellidoPaterno: '',
      apellidoMaterno: '',
      email: '',
      password: '',
      confirmPassword: '',
      nivel: 'ATENCION_CLIENTE',
      activo: true
    });
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentUsuario({
      nombre: '',
      apellidoPaterno: '',
      apellidoMaterno: '',
      email: '',
      password: '',
      confirmPassword: '',
      nivel: 'ATENCION_CLIENTE',
      activo: true
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentUsuario(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && editingId) {
        const updateData: UpdateUsuarioDTO = {
          ...currentUsuario,
          password: currentUsuario.password || undefined,
          confirmPassword: currentUsuario.confirmPassword || undefined
        };
        
        if (!updateData.password) {
          delete updateData.password;
          delete updateData.confirmPassword;
        }

        await axios.put(`/api/usuarios/${editingId}`, updateData);
        toast.success('Usuario actualizado correctamente');
      } else {
        await axios.post('/api/usuarios', currentUsuario as CreateUsuarioDTO);
        toast.success('Usuario creado correctamente');
      }
      closeModal();
      fetchUsuarios();
    } catch (err) {
      console.error('Error al guardar usuario:', err);
      toast.error('Error al guardar usuario');
    }
  };

  const handleEdit = (usuario: Usuario) => {
    setCurrentUsuario({
      nombre: usuario.nombre,
      apellidoPaterno: usuario.apellidoPaterno,
      apellidoMaterno: usuario.apellidoMaterno || '',
      email: usuario.email,
      nivel: usuario.nivel,
      activo: usuario.activo,
      password: '',
      confirmPassword: ''
    });
    setEditingId(usuario.id);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Está seguro de eliminar este usuario?')) return;
    
    try {
      await axios.delete(`/api/usuarios/${id}`);
      toast.success('Usuario eliminado correctamente');
      fetchUsuarios();
    } catch (err) {
      console.error('Error al eliminar usuario:', err);
      toast.error('Error al eliminar usuario');
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Usuarios</h1>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={openModal}>
              <HiPlus className="mr-2 h-4 w-4" />
              Nuevo Usuario
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre</Label>
                <Input
                  id="nombre"
                  name="nombre"
                  value={currentUsuario.nombre}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apellidoPaterno">Apellido Paterno</Label>
                <Input
                  id="apellidoPaterno"
                  name="apellidoPaterno"
                  value={currentUsuario.apellidoPaterno}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apellidoMaterno">Apellido Materno</Label>
                <Input
                  id="apellidoMaterno"
                  name="apellidoMaterno"
                  value={currentUsuario.apellidoMaterno}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={currentUsuario.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">
                  {isEditing ? 'Nueva Contraseña (opcional)' : 'Contraseña'}
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={currentUsuario.password}
                  onChange={handleInputChange}
                  required={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  {isEditing ? 'Confirmar Nueva Contraseña (opcional)' : 'Confirmar Contraseña'}
                </Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={currentUsuario.confirmPassword}
                  onChange={handleInputChange}
                  required={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nivel">Nivel</Label>
                <Select
                  value={currentUsuario.nivel}
                  onValueChange={(value) => setCurrentUsuario(prev => ({ ...prev, nivel: value as NivelUsuario }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un nivel" />
                  </SelectTrigger>
                  <SelectContent>
                    {NIVELES_USUARIO.map((nivel) => (
                      <SelectItem key={nivel} value={nivel}>
                        {nivel}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
              <TableHead>Email</TableHead>
              <TableHead>Nivel</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usuarios.map((usuario) => (
              <TableRow key={usuario.id}>
                <TableCell>
                  {usuario.nombre} {usuario.apellidoPaterno} {usuario.apellidoMaterno || ''}
                </TableCell>
                <TableCell>{usuario.email}</TableCell>
                <TableCell>
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {usuario.nivel}
                  </span>
                </TableCell>
                <TableCell>
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    usuario.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {usuario.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(usuario)}
                    >
                      <HiPencilAlt className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(usuario.id)}
                    >
                      <HiTrash className="h-4 w-4" />
                    </Button>
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