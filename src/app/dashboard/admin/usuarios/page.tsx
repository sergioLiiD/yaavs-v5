'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { HiPlus, HiPencilAlt, HiTrash } from 'react-icons/hi';
import axios from 'axios';
import { Usuario, NivelUsuario, CreateUsuarioDTO, UpdateUsuarioDTO, Rol } from '@/types/usuario';
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
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import RouteGuard from '@/components/route-guard';

const NIVELES_USUARIO = ['ADMINISTRADOR', 'TECNICO', 'ATENCION_CLIENTE'] as const;

export default function UsuariosPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFilter, setEstadoFilter] = useState<boolean | ''>('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Estado para controlar el formulario de usuario
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUsuario, setCurrentUsuario] = useState<Partial<CreateUsuarioDTO>>({
    nombre: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    email: '',
    password: '',
    confirmPassword: '',
    activo: true,
    roles: []
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [passwordError, setPasswordError] = useState('');

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<Usuario | null>(null);

  const filteredUsuarios = usuarios.filter(usuario => {
    const matchesSearch = 
      usuario.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.apellidoPaterno.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.apellidoMaterno?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesEstado = estadoFilter === '' || usuario.activo === estadoFilter;

    return matchesSearch && matchesEstado;
  });

  const totalPages = Math.ceil(filteredUsuarios.length / itemsPerPage);
  const paginatedUsuarios = filteredUsuarios.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (type: 'estado', value: string) => {
    if (type === 'estado') {
      setEstadoFilter(value === 'all' ? '' : value === 'true');
    }
    setCurrentPage(1);
  };

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

      const loadData = async () => {
        try {
          setIsLoading(true);
          const [usuariosResponse, rolesResponse] = await Promise.all([
            axios.get('/api/usuarios'),
            axios.get('/api/roles')
          ]);
          console.log('Usuarios cargados:', usuariosResponse.data);
          console.log('Roles cargados:', rolesResponse.data);
          setUsuarios(usuariosResponse.data || []);
          setRoles(rolesResponse.data || []);
          setError('');
        } catch (err) {
          console.error('Error al cargar datos:', err);
          setError('Error al cargar los datos. Por favor, intente nuevamente.');
          toast.error('Error al cargar datos');
        } finally {
          setIsLoading(false);
        }
      };

      loadData();
    }
  }, [status, session, router]);

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
      activo: true,
      roles: []
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
      activo: true,
      roles: []
    });
  };

  const validatePasswords = () => {
    if (isEditing) {
      // Si estamos editando y se ingresó una contraseña
      if (currentUsuario.password || currentUsuario.confirmPassword) {
        if (currentUsuario.password !== currentUsuario.confirmPassword) {
          setPasswordError('Las contraseñas no coinciden');
          return false;
        }
        if (currentUsuario.password && currentUsuario.password.length < 6) {
          setPasswordError('La contraseña debe tener al menos 6 caracteres');
          return false;
        }
      }
    } else {
      // Si estamos creando un nuevo usuario
      if (!currentUsuario.password || !currentUsuario.confirmPassword) {
        setPasswordError('La contraseña es requerida');
        return false;
      }
      if (currentUsuario.password !== currentUsuario.confirmPassword) {
        setPasswordError('Las contraseñas no coinciden');
        return false;
      }
      if (currentUsuario.password.length < 6) {
        setPasswordError('La contraseña debe tener al menos 6 caracteres');
        return false;
      }
    }
    setPasswordError('');
    return true;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentUsuario(prev => ({ ...prev, [name]: value }));
    // Limpiar el error de contraseña cuando se modifica
    if (name === 'password' || name === 'confirmPassword') {
      setPasswordError('');
    }
  };

  const handleRoleChange = (roleId: number, checked: boolean) => {
    setCurrentUsuario(prev => ({
      ...prev,
      roles: checked 
        ? [...(prev.roles || []), roleId]
        : (prev.roles || []).filter(id => id !== roleId)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePasswords()) {
      return;
    }

    try {
      setIsSubmitting(true);
      const usuarioData = { ...currentUsuario };
      
      // Si estamos editando y no se proporcionó una nueva contraseña, eliminar los campos de contraseña
      if (isEditing && !usuarioData.password) {
        delete usuarioData.password;
        delete usuarioData.confirmPassword;
      }

      if (isEditing && editingId) {
        await axios.put(`/api/usuarios/${editingId}`, usuarioData);
        toast.success('Usuario actualizado exitosamente');
      } else {
        await axios.post('/api/usuarios', usuarioData);
        toast.success('Usuario creado exitosamente');
      }
      closeModal();
      const response = await axios.get('/api/usuarios');
      setUsuarios(response.data || []);
    } catch (err) {
      console.error('Error al guardar usuario:', err);
      toast.error('Error al guardar el usuario');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (usuario: Usuario) => {
    console.log('Usuario a editar:', usuario);
    const rolesIds = usuario.roles?.map(ur => ur.rol.id) || [];
    
    setCurrentUsuario({
      nombre: usuario.nombre || '',
      apellidoPaterno: usuario.apellidoPaterno || '',
      apellidoMaterno: usuario.apellidoMaterno || '',
      email: usuario.email || '',
      activo: usuario.activo,
      roles: rolesIds
    });
    setIsEditing(true);
    setEditingId(usuario.id);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (usuario: Usuario) => {
    setUserToDelete(usuario);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    
    try {
      setIsDeleting(userToDelete.id);
      await axios.delete(`/api/usuarios/${userToDelete.id}`);
      toast.success(`Usuario ${userToDelete.nombre} ${userToDelete.apellidoPaterno} eliminado exitosamente`);
      const response = await axios.get('/api/usuarios');
      setUsuarios(response.data || []);
    } catch (err) {
      console.error('Error al eliminar usuario:', err);
      toast.error(`Error al eliminar el usuario ${userToDelete.nombre} ${userToDelete.apellidoPaterno}`);
    } finally {
      setIsDeleting(null);
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FEBF19]"></div>
      </div>
    );
  }

  return (
    <RouteGuard requiredPermissions={['USERS_VIEW']} section="Usuarios">
      <div className="container mx-auto py-6">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Usuarios</h1>
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button onClick={openModal}>
                  <HiPlus className="h-5 w-5 mr-2" />
                  Nuevo Usuario
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl" aria-describedby="dialog-description">
                <DialogHeader>
                  <DialogTitle>{isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}</DialogTitle>
                  <p id="dialog-description" className="sr-only">
                    {isEditing ? 'Formulario para editar los datos del usuario' : 'Formulario para crear un nuevo usuario'}
                  </p>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nombre">Nombre</Label>
                      <Input
                        id="nombre"
                        name="nombre"
                        value={currentUsuario.nombre || ''}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="apellidoPaterno">Apellido Paterno</Label>
                      <Input
                        id="apellidoPaterno"
                        name="apellidoPaterno"
                        value={currentUsuario.apellidoPaterno || ''}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="apellidoMaterno">Apellido Materno</Label>
                      <Input
                        id="apellidoMaterno"
                        name="apellidoMaterno"
                        value={currentUsuario.apellidoMaterno || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={currentUsuario.email || ''}
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
                        value={currentUsuario.password || ''}
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
                        value={currentUsuario.confirmPassword || ''}
                        onChange={handleInputChange}
                        required={!isEditing}
                      />
                    </div>
                    {passwordError && (
                      <div className="col-span-2 text-sm text-red-500">
                        {passwordError}
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label>Estado</Label>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="activo"
                          checked={currentUsuario.activo}
                          onCheckedChange={(checked) => 
                            setCurrentUsuario(prev => ({ ...prev, activo: checked as boolean }))
                          }
                        />
                        <Label htmlFor="activo">Activo</Label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mt-4 border-t pt-4">
                    <Label className="text-lg font-semibold">Roles</Label>
                    <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                      {roles.length > 0 ? (
                        roles.map((rol) => (
                          <div key={rol.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`rol-${rol.id}`}
                              checked={currentUsuario.roles?.includes(rol.id)}
                              onCheckedChange={(checked) => handleRoleChange(rol.id, checked as boolean)}
                            />
                            <Label htmlFor={`rol-${rol.id}`} className="font-medium">
                              {rol.nombre}
                            </Label>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-2 text-center text-gray-500">
                          No hay roles disponibles
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={closeModal} disabled={isSubmitting}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                          {isEditing ? 'Actualizando...' : 'Creando...'}
                        </>
                      ) : (
                        isEditing ? 'Actualizar' : 'Crear'
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
            <div className="flex-1">
              <Input
                type="search"
                placeholder="Buscar usuarios..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full"
              />
            </div>
            <Select
              value={estadoFilter === '' ? 'all' : estadoFilter.toString()}
              onValueChange={(value) => handleFilterChange('estado', value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="true">Activos</SelectItem>
                <SelectItem value="false">Inactivos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="bg-white shadow-sm rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Roles</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedUsuarios.map((usuario) => (
                  <TableRow key={usuario.id}>
                    <TableCell>
                      {usuario.nombre} {usuario.apellidoPaterno} {usuario.apellidoMaterno}
                    </TableCell>
                    <TableCell>{usuario.email}</TableCell>
                    <TableCell>
                      <Badge variant={usuario.activo ? "default" : "destructive"}>
                        {usuario.activo ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {usuario.roles && usuario.roles.length > 0 ? (
                          usuario.roles.map((ur) => (
                            <Badge key={ur.rol.id} variant="secondary">
                              {ur.rol.nombre}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-gray-500">Sin roles asignados</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(usuario)}
                        >
                          <HiPencilAlt className="h-5 w-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(usuario)}
                          disabled={isDeleting === usuario.id}
                        >
                          {isDeleting === usuario.id ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-gray-900"></div>
                          ) : (
                            <HiTrash className="h-5 w-5" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirmar eliminación</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <p className="text-gray-600">
                  ¿Está seguro que desea eliminar al usuario{' '}
                  <span className="font-semibold">
                    {userToDelete?.nombre} {userToDelete?.apellidoPaterno} {userToDelete?.apellidoMaterno}
                  </span>?
                </p>
                <p className="text-sm text-red-500 mt-2">
                  Esta acción no se puede deshacer y eliminará permanentemente todos los datos asociados al usuario.
                </p>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={handleDeleteCancel}
                  disabled={isDeleting === userToDelete?.id}
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting === userToDelete?.id}
                >
                  {isDeleting === userToDelete?.id ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Eliminando...
                    </>
                  ) : (
                    'Eliminar'
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {totalPages > 1 && (
            <div className="flex justify-center space-x-2">
              <Button
                variant="outline"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>
              <div className="flex items-center space-x-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Siguiente
              </Button>
            </div>
          )}
        </div>
      </div>
    </RouteGuard>
  );
} 