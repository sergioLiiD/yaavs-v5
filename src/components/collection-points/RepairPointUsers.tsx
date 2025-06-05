'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

interface RepairPointUser {
  id: string;
  puntoRecoleccionId: string;
  usuarioId: number;
  rol: 'ADMINISTRADOR' | 'OPERADOR';
  activo: boolean;
  Usuario: {
    id: number;
    nombre: string;
    email: string;
    roles: Array<{
      rol: {
        nombre: string;
      }
    }>;
    apellidoPaterno: string;
    apellidoMaterno: string;
  };
}

interface RepairPointUsersProps {
  collectionPointId: string;
  isRepairPoint: boolean;
  showModal: boolean;
  onCloseModal: () => void;
  isEditing: boolean;
  onEditStart: () => void;
}

const ROLES = [
  { value: 'ADMINISTRADOR', label: 'Administrador' },
  { value: 'OPERADOR', label: 'Operador' },
];

export default function RepairPointUsers({ collectionPointId, isRepairPoint, showModal, onCloseModal, isEditing, onEditStart }: RepairPointUsersProps) {
  const [users, setUsers] = useState<RepairPointUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<RepairPointUser | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nombre: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    rol: 'OPERADOR' as 'OPERADOR' | 'ADMINISTRADOR',
  });

  useEffect(() => {
    if (collectionPointId) {
      fetchUsers();
    }
  }, [collectionPointId]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/puntos-recoleccion/${collectionPointId}/usuarios`);
      if (!response.ok) throw new Error('Error al cargar usuarios');
      const data = await response.json();
      console.log('Datos de usuarios recibidos:', JSON.stringify(data, null, 2));
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      setError('Error al cargar los usuarios');
      console.error('Error:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingUser
        ? `/api/puntos-recoleccion/${collectionPointId}/usuarios/${editingUser.id}`
        : `/api/puntos-recoleccion/${collectionPointId}/usuarios`;
      
      const response = await fetch(url, {
        method: editingUser ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          puntoRecoleccionId: collectionPointId,
        }),
      });

      if (!response.ok) throw new Error('Error al guardar usuario');
      
      await fetchUsers();
      onCloseModal();
      setEditingUser(null);
      setFormData({
        email: '',
        password: '',
        nombre: '',
        apellidoPaterno: '',
        apellidoMaterno: '',
        rol: 'OPERADOR',
      });
    } catch (error) {
      setError('Error al guardar el usuario');
      console.error('Error:', error);
    }
  };

  const handleEdit = (user: RepairPointUser) => {
    setEditingUser(user);
    setFormData({
      email: user.Usuario.email,
      nombre: user.Usuario.nombre.split(' ')[0] || '',
      apellidoPaterno: user.Usuario.apellidoPaterno || '',
      apellidoMaterno: user.Usuario.apellidoMaterno || '',
      rol: user.rol,
      password: '',
    });
    onEditStart();
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este usuario?')) return;

    try {
      const response = await fetch(`/api/puntos-recoleccion/${collectionPointId}/usuarios/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Error al eliminar usuario');
      
      await fetchUsers();
    } catch (error) {
      setError('Error al eliminar el usuario');
      console.error('Error:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Cargando usuarios...</div>;
  }

  if (error) {
    return <div className="text-red-600 text-center py-4">{error}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="mt-4">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre Completo
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rol
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => {
              console.log('Renderizando usuario:', user);
              return (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {user.Usuario ? `${user.Usuario.nombre} ${user.Usuario.apellidoPaterno} ${user.Usuario.apellidoMaterno}`.trim() : 'Sin nombre'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {ROLES.find(r => r.value === user.rol)?.label || 'Sin rol'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(user)}
                      className="text-[#FEBF19] hover:text-[#FEBF19]/90 mr-4"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-[9999] isolate">
          <div className="bg-white rounded-lg p-6 max-w-md w-full relative z-[9999]">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nombre
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FEBF19] focus:ring-[#FEBF19] sm:text-sm px-4 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Apellido Paterno
                </label>
                <input
                  type="text"
                  value={formData.apellidoPaterno}
                  onChange={(e) => setFormData({ ...formData, apellidoPaterno: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FEBF19] focus:ring-[#FEBF19] sm:text-sm px-4 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Apellido Materno
                </label>
                <input
                  type="text"
                  value={formData.apellidoMaterno}
                  onChange={(e) => setFormData({ ...formData, apellidoMaterno: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FEBF19] focus:ring-[#FEBF19] sm:text-sm px-4 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FEBF19] focus:ring-[#FEBF19] sm:text-sm px-4 py-2"
                  required
                />
              </div>
              {!editingUser && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FEBF19] focus:ring-[#FEBF19] sm:text-sm px-4 py-2"
                    required={!editingUser}
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Rol
                </label>
                <select
                  value={formData.rol}
                  onChange={(e) => setFormData({ ...formData, rol: e.target.value as 'OPERADOR' | 'ADMINISTRADOR' })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FEBF19] focus:ring-[#FEBF19] sm:text-sm px-4 py-2"
                >
                  {ROLES.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={onCloseModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FEBF19]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-[#FEBF19] border border-transparent rounded-md hover:bg-[#FEBF19]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FEBF19]"
                >
                  {editingUser ? 'Guardar cambios' : 'Crear usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 