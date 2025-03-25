'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { HiPlus, HiPencil, HiTrash, HiChevronDown, HiChevronUp, HiSearch } from 'react-icons/hi';
import AdminLayout from '@/components/layout/AdminLayout';

interface Proveedor {
  id: string;
  tipo: 'FISICA' | 'MORAL';
  nombre: string;
  personaResponsable: string;
  telefono: string;
  email: string;
  direccion: string;
  rfc: string;
  banco: string;
  cuentaBancaria: string;
  clabeInterbancaria: string;
}

export default function ProveedoresPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [proveedoresFiltrados, setProveedoresFiltrados] = useState<Proveedor[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [proveedorExpandido, setProveedorExpandido] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Proveedor>>({
    tipo: 'FISICA',
    nombre: '',
    personaResponsable: '',
    telefono: '',
    email: '',
    direccion: '',
    rfc: '',
    banco: '',
    cuentaBancaria: '',
    clabeInterbancaria: ''
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user) {
      fetchProveedores();
    }
  }, [session]);

  useEffect(() => {
    const filtrados = proveedores.filter(proveedor => 
      proveedor.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      proveedor.personaResponsable.toLowerCase().includes(busqueda.toLowerCase()) ||
      proveedor.rfc.toLowerCase().includes(busqueda.toLowerCase()) ||
      proveedor.email.toLowerCase().includes(busqueda.toLowerCase())
    );
    setProveedoresFiltrados(filtrados);
  }, [busqueda, proveedores]);

  const fetchProveedores = async () => {
    try {
      const response = await fetch('/api/catalogo/proveedores');
      if (response.ok) {
        const data = await response.json();
        setProveedores(data);
      }
    } catch (error) {
      console.error('Error al cargar proveedores:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingId 
        ? `/api/catalogo/proveedores/${editingId}`
        : '/api/catalogo/proveedores';
      
      const method = editingId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setIsModalOpen(false);
        setFormData({
          tipo: 'FISICA',
          nombre: '',
          personaResponsable: '',
          telefono: '',
          email: '',
          direccion: '',
          rfc: '',
          banco: '',
          cuentaBancaria: '',
          clabeInterbancaria: ''
        });
        setEditingId(null);
        fetchProveedores();
      }
    } catch (error) {
      console.error('Error al guardar proveedor:', error);
    }
  };

  const handleEdit = (proveedor: Proveedor) => {
    setFormData(proveedor);
    setEditingId(proveedor.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Está seguro de eliminar este proveedor?')) {
      try {
        const response = await fetch(`/api/catalogo/proveedores/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          fetchProveedores();
        }
      } catch (error) {
        console.error('Error al eliminar proveedor:', error);
      }
    }
  };

  const toggleDetalles = (id: string) => {
    setProveedorExpandido(proveedorExpandido === id ? null : id);
  };

  return (
    <AdminLayout title="Catálogo - Proveedores">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Proveedores</h1>
          <button
            onClick={() => {
              setFormData({
                tipo: 'FISICA',
                nombre: '',
                personaResponsable: '',
                telefono: '',
                email: '',
                direccion: '',
                rfc: '',
                banco: '',
                cuentaBancaria: '',
                clabeInterbancaria: ''
              });
              setEditingId(null);
              setIsModalOpen(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
          >
            <HiPlus className="mr-2" />
            Nuevo Proveedor
          </button>
        </div>

        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar proveedor..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <HiSearch className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Persona Responsable
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Teléfono
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  RFC
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {proveedoresFiltrados.map((proveedor) => (
                <>
                  <tr key={proveedor.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {proveedor.tipo === 'FISICA' ? 'Persona Física' : 'Persona Moral'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {proveedor.nombre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {proveedor.personaResponsable}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {proveedor.telefono}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {proveedor.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {proveedor.rfc}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => toggleDetalles(proveedor.id)}
                        className="text-gray-600 hover:text-gray-900 mr-4"
                      >
                        {proveedorExpandido === proveedor.id ? (
                          <HiChevronUp className="h-5 w-5" />
                        ) : (
                          <HiChevronDown className="h-5 w-5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleEdit(proveedor)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        <HiPencil className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(proveedor.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <HiTrash className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                  {proveedorExpandido === proveedor.id && (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 bg-gray-50">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-sm font-medium text-gray-700">Dirección</h4>
                            <p className="mt-1 text-sm text-gray-900">{proveedor.direccion}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-700">Banco</h4>
                            <p className="mt-1 text-sm text-gray-900">{proveedor.banco}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-700">Cuenta Bancaria</h4>
                            <p className="mt-1 text-sm text-gray-900">{proveedor.cuentaBancaria}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-700">CLABE Interbancaria</h4>
                            <p className="mt-1 text-sm text-gray-900">{proveedor.clabeInterbancaria}</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
            <div className="relative top-20 mx-auto p-5 border w-[800px] shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {editingId ? 'Editar Proveedor' : 'Nuevo Proveedor'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Tipo
                      </label>
                      <select
                        value={formData.tipo}
                        onChange={(e) => setFormData({ ...formData, tipo: e.target.value as 'FISICA' | 'MORAL' })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3"
                      >
                        <option value="FISICA">Persona Física</option>
                        <option value="MORAL">Persona Moral</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Nombre
                      </label>
                      <input
                        type="text"
                        value={formData.nombre}
                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Persona Responsable
                      </label>
                      <input
                        type="text"
                        value={formData.personaResponsable}
                        onChange={(e) => setFormData({ ...formData, personaResponsable: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Teléfono
                      </label>
                      <input
                        type="tel"
                        value={formData.telefono}
                        onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        RFC
                      </label>
                      <input
                        type="text"
                        value={formData.rfc}
                        onChange={(e) => setFormData({ ...formData, rfc: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3"
                        required
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Dirección
                      </label>
                      <textarea
                        value={formData.direccion}
                        onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3"
                        rows={3}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Banco
                      </label>
                      <input
                        type="text"
                        value={formData.banco}
                        onChange={(e) => setFormData({ ...formData, banco: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Cuenta Bancaria
                      </label>
                      <input
                        type="text"
                        value={formData.cuentaBancaria}
                        onChange={(e) => setFormData({ ...formData, cuentaBancaria: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        CLABE Interbancaria
                      </label>
                      <input
                        type="text"
                        value={formData.clabeInterbancaria}
                        onChange={(e) => setFormData({ ...formData, clabeInterbancaria: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                    >
                      {editingId ? 'Actualizar' : 'Guardar'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
} 