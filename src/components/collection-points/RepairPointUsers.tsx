'use client';

import { useState, useEffect } from 'react';
import { UserPlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'react-hot-toast';
import { Usuario } from '@/types/usuario';

interface RepairPointUsersProps {
  collectionPointId: string;
  isRepairPoint: boolean;
  showModal: boolean;
  onCloseModal: () => void;
  isEditing: boolean;
  onEditStart: () => void;
}

interface UserPoint {
  id: string;
  puntoRecoleccionId: string;
  usuarioId: number;
  rolId: number;
  activo: boolean;
  Usuario: {
    id: number;
    nombre: string;
    email: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
  };
}

interface Rol {
  id: number;
  nombre: string;
  descripcion: string;
}

export default function RepairPointUsers({
  collectionPointId,
  isRepairPoint,
  showModal,
  onCloseModal,
  isEditing,
  onEditStart
}: RepairPointUsersProps) {
  const [users, setUsers] = useState<UserPoint[]>([]);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nombre: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    rolId: 0
  });
  const [editingUser, setEditingUser] = useState<UserPoint | null>(null);
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, [collectionPointId]);

  const fetchRoles = async () => {
    try {
      const response = await fetch('/api/roles');
      if (!response.ok) throw new Error('Error al cargar roles');
      const data = await response.json();
      setRoles(data);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar roles');
    }
  };

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/puntos-recoleccion/${collectionPointId}/usuarios`);
      if (!response.ok) throw new Error('Error al cargar usuarios');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error:', error);
      setError('Error al cargar usuarios');
      toast.error('Error al cargar usuarios');
    } finally {
      setIsLoading(false);
    }
  };

  const validatePasswords = () => {
    if (isEditing) {
      if (formData.password || formData.confirmPassword) {
        if (formData.password !== formData.confirmPassword) {
          setPasswordError('Las contraseñas no coinciden');
          return false;
        }
        if (formData.password && formData.password.length < 6) {
          setPasswordError('La contraseña debe tener al menos 6 caracteres');
          return false;
        }
      }
    } else {
      if (!formData.password || !formData.confirmPassword) {
        setPasswordError('La contraseña es requerida');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setPasswordError('Las contraseñas no coinciden');
        return false;
      }
      if (formData.password.length < 6) {
        setPasswordError('La contraseña debe tener al menos 6 caracteres');
        return false;
      }
    }
    setPasswordError('');
    return true;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'password' || name === 'confirmPassword') {
      setPasswordError('');
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este usuario?')) return;

    try {
      const response = await fetch(`/api/puntos-recoleccion/${collectionPointId}/usuarios/${userId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Error al eliminar usuario');
      toast.success('Usuario eliminado exitosamente');
      fetchUsers();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al eliminar usuario');
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      nombre: '',
      apellidoPaterno: '',
      apellidoMaterno: '',
      rolId: 0
    });
    setEditingUser(null);
    setPasswordError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePasswords()) {
      return;
    }

    try {
      setIsSubmitting(true);
      const userData = { ...formData };
      
      if (isEditing && !userData.password && editingUser) {
        const { password, confirmPassword, ...userDataWithoutPassword } = userData;
        const response = await fetch(`/api/puntos-recoleccion/${collectionPointId}/usuarios/${editingUser.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userDataWithoutPassword)
        });

        if (!response.ok) throw new Error('Error al actualizar usuario');
        toast.success('Usuario actualizado exitosamente');
      } else {
        const response = await fetch(`/api/puntos-recoleccion/${collectionPointId}/usuarios`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData)
        });

        if (!response.ok) throw new Error('Error al crear usuario');
        toast.success('Usuario creado exitosamente');
      }

      onCloseModal();
      fetchUsers();
      resetForm();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al guardar usuario');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (user: UserPoint) => {
    setEditingUser(user);
    setFormData({
      email: user.Usuario.email,
      password: '',
      confirmPassword: '',
      nombre: user.Usuario.nombre.split(' ')[0],
      apellidoPaterno: user.Usuario.apellidoPaterno,
      apellidoMaterno: user.Usuario.apellidoMaterno || '',
      rolId: user.rolId
    });
    onEditStart();
  };

  if (isLoading) return <div>Cargando usuarios...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Usuarios del Punto</h3>
        <Button onClick={() => {
          if (!isEditing) {
            resetForm();
          }
          onEditStart();
        }}>
          <UserPlusIcon className="h-5 w-5 mr-2" />
          Agregar Usuario
        </Button>
        <Dialog open={showModal} onOpenChange={onCloseModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre</Label>
                  <Input
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apellidoPaterno">Apellido Paterno</Label>
                  <Input
                    id="apellidoPaterno"
                    name="apellidoPaterno"
                    value={formData.apellidoPaterno}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apellidoMaterno">Apellido Materno</Label>
                  <Input
                    id="apellidoMaterno"
                    name="apellidoMaterno"
                    value={formData.apellidoMaterno}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rolId">Rol</Label>
                  <Select
                    value={formData.rolId.toString()}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, rolId: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar rol" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((rol) => (
                        <SelectItem key={rol.id} value={rol.id.toString()}>
                          {rol.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {passwordError && (
                <p className="text-red-500 text-sm">{passwordError}</p>
              )}
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCloseModal}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {users.map((user) => (
            <li key={user.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <p className="text-sm font-medium text-gray-900">
                      {user.Usuario.nombre} {user.Usuario.apellidoPaterno} {user.Usuario.apellidoMaterno}
                    </p>
                    <span className="ml-2 px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                      {roles.find(r => r.id === user.rolId)?.nombre || 'Sin rol'}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(user)}
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(user.id)}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">{user.Usuario.email}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
} 