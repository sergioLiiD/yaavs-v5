'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

interface RepairPointUser {
  id: string;
  puntoRecoleccionId: string;
  usuarioId: number;
  nivel: 'ADMINISTRADOR' | 'OPERADOR';
  activo: boolean;
  usuario: {
    id: number;
    nombre: string;
    email: string;
    nivel: string;
  };
}

interface RepairPointUsersProps {
  collectionPointId: string;
  isRepairPoint: boolean;
  showModal: boolean;
  onCloseModal: () => void;
}

const ROLES = [
  { value: 'ADMINISTRADOR', label: 'Administrador' },
  { value: 'OPERADOR', label: 'Operador' },
];

export default function RepairPointUsers({ collectionPointId, isRepairPoint, showModal, onCloseModal }: RepairPointUsersProps) {
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
    nivel: 'OPERADOR' as 'OPERADOR' | 'ADMINISTRADOR',
  });

  useEffect(() => {
    fetchUsers();
  }, [collectionPointId]);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`/api/puntos-recoleccion/${collectionPointId}/usuarios`);
      if (!response.ok) throw new Error('Error al cargar usuarios');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      setError('Error al cargar los usuarios');
      console.error('Error:', error);
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
        nivel: 'OPERADOR',
      });
    } catch (error) {
      setError('Error al guardar el usuario');
      console.error('Error:', error);
    }
  };

  const handleEdit = (user: RepairPointUser) => {
    setEditingUser(user);
    setFormData({
      email: user.usuario.email,
      nombre: user.usuario.nombre,
      apellidoPaterno: user.usuario.nombre.split(' ')[0] || '',
      apellidoMaterno: user.usuario.nombre.split(' ')[1] || '',
      nivel: user.nivel,
      password: '',
    });
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
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{user.usuario.nombre}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {ROLES.find(r => r.value === user.nivel)?.label}
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
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
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
                  className="mt-1 block w-full px-4 py-3 rounded-md border border-gray-300 shadow-sm focus:border-[#FEBF19] focus:ring-[#FEBF19] focus:ring-2 text-black outline-none"
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
                  className="mt-1 block w-full px-4 py-3 rounded-md border border-gray-300 shadow-sm focus:border-[#FEBF19] focus:ring-[#FEBF19] focus:ring-2 text-black outline-none"
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
                  className="mt-1 block w-full px-4 py-3 rounded-md border border-gray-300 shadow-sm focus:border-[#FEBF19] focus:ring-[#FEBF19] focus:ring-2 text-black outline-none"
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
                  className="mt-1 block w-full px-4 py-3 rounded-md border border-gray-300 shadow-sm focus:border-[#FEBF19] focus:ring-[#FEBF19] focus:ring-2 text-black outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Rol
                </label>
                <select
                  value={formData.nivel}
                  onChange={(e) => setFormData({ ...formData, nivel: e.target.value as 'OPERADOR' | 'ADMINISTRADOR' })}
                  className="mt-1 block w-full px-4 py-3 rounded-md border border-gray-300 shadow-sm focus:border-[#FEBF19] focus:ring-[#FEBF19] focus:ring-2 text-black outline-none"
                  required
                >
                  {ROLES.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
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
                    className="mt-1 block w-full px-4 py-3 rounded-md border border-gray-300 shadow-sm focus:border-[#FEBF19] focus:ring-[#FEBF19] focus:ring-2 text-black outline-none"
                    required
                  />
                </div>
              )}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    onCloseModal();
                    setEditingUser(null);
                    setFormData({
                      email: '',
                      password: '',
                      nombre: '',
                      apellidoPaterno: '',
                      apellidoMaterno: '',
                      nivel: 'OPERADOR',
                    });
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FEBF19]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-black bg-[#FEBF19] rounded-md hover:bg-[#FEBF19]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FEBF19]"
                >
                  {editingUser ? 'Guardar Cambios' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 