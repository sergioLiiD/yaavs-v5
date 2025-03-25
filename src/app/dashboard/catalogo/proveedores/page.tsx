'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { HiPlus, HiPencil, HiTrash, HiChevronDown, HiChevronUp, HiSearch } from 'react-icons/hi';
import AdminLayout from '@/components/layout/AdminLayout';

type TipoProveedor = 'FISICA' | 'MORAL';

interface Proveedor {
  id: string;
  nombre: string;
  contacto: string;
  telefono: string;
  email: string | null;
  direccion: string | null;
  notas: string | null;
  tipo: TipoProveedor;
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
    nombre: '',
    contacto: '',
    telefono: '',
    email: '',
    direccion: '',
    notas: '',
    tipo: 'FISICA',
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
      proveedor.contacto.toLowerCase().includes(busqueda.toLowerCase()) ||
      (proveedor.email?.toLowerCase() || '').includes(busqueda.toLowerCase())
    );
    setProveedoresFiltrados(filtrados);
  }, [busqueda, proveedores]);

  const fetchProveedores = async () => {
    try {
      const response = await fetch('/api/catalogo/proveedores');
      if (response.ok) {
        const data = await response.json();
        console.log('Proveedores cargados:', data);
        setProveedores(data);
      } else {
        console.error('Error al cargar proveedores:', await response.text());
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
          nombre: '',
          contacto: '',
          telefono: '',
          email: '',
          direccion: '',
          notas: '',
          tipo: 'FISICA',
          rfc: '',
          banco: '',
          cuentaBancaria: '',
          clabeInterbancaria: ''
        });
        setEditingId(null);
        fetchProveedores();
      } else {
        const errorData = await response.json();
        console.error('Error al guardar proveedor:', errorData);
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
        } else {
          const errorData = await response.json();
          console.error('Error al eliminar proveedor:', errorData);
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
                nombre: '',
                contacto: '',
                telefono: '',
                email: '',
                direccion: '',
                notas: '',
                tipo: 'FISICA',
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
                  Contacto
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
                      {proveedor.contacto}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {proveedor.telefono}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {proveedor.email || '-'}
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
                            <p className="text-sm font-medium text-gray-500">Dirección:</p>
                            <p className="text-sm text-gray-900">{proveedor.direccion || '-'}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Banco:</p>
                            <p className="text-sm text-gray-900">{proveedor.banco}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Cuenta Bancaria:</p>
                            <p className="text-sm text-gray-900">{proveedor.cuentaBancaria}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">CLABE Interbancaria:</p>
                            <p className="text-sm text-gray-900">{proveedor.clabeInterbancaria}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-sm font-medium text-gray-500">Notas:</p>
                            <p className="text-sm text-gray-900">{proveedor.notas || '-'}</p>
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 overflow-y-auto pt-20">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl my-4">
              <h2 className="text-xl font-semibold mb-4">
                {editingId ? 'Editar Proveedor' : 'Nuevo Proveedor'}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tipo</label>
                    <select
                      name="tipo"
                      value={formData.tipo}
                      onChange={(e) => setFormData({ ...formData, tipo: e.target.value as TipoProveedor })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2"
                    >
                      <option value="FISICA">Persona Física</option>
                      <option value="MORAL">Persona Moral</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nombre *</label>
                    <input
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Contacto</label>
                    <input
                      type="text"
                      name="contacto"
                      value={formData.contacto}
                      onChange={(e) => setFormData({ ...formData, contacto: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Teléfono *</label>
                    <input
                      type="tel"
                      name="telefono"
                      value={formData.telefono}
                      onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email || ''}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">RFC</label>
                    <input
                      type="text"
                      name="rfc"
                      value={formData.rfc}
                      onChange={(e) => setFormData({ ...formData, rfc: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Dirección</label>
                    <textarea
                      name="direccion"
                      value={formData.direccion || ''}
                      onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2"
                      rows={2}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Banco</label>
                    <input
                      type="text"
                      name="banco"
                      value={formData.banco}
                      onChange={(e) => setFormData({ ...formData, banco: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Cuenta Bancaria</label>
                    <input
                      type="text"
                      name="cuentaBancaria"
                      value={formData.cuentaBancaria}
                      onChange={(e) => setFormData({ ...formData, cuentaBancaria: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">CLABE Interbancaria</label>
                    <input
                      type="text"
                      name="clabeInterbancaria"
                      value={formData.clabeInterbancaria}
                      onChange={(e) => setFormData({ ...formData, clabeInterbancaria: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Notas</label>
                    <textarea
                      name="notas"
                      value={formData.notas || ''}
                      onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2"
                      rows={3}
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {editingId ? 'Actualizar' : 'Guardar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
} 