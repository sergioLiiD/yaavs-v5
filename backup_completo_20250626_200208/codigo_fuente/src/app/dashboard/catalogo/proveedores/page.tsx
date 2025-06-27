'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { HiPlus, HiPencil, HiTrash, HiChevronDown, HiChevronUp, HiSearch } from 'react-icons/hi';

type TipoProveedor = 'FISICA' | 'MORAL';

interface Proveedor {
  id: string;
  nombre: string;
  contacto: string;
  telefono: string;
  email: string | null;
  direccion: string | null;
  tipo: TipoProveedor;
  rfc: string;
  banco: string;
  cuentaBancaria: string;
  clabeInterbancaria: string;
  createdAt: string;
  updatedAt: string;
  notas: string | null;
}

interface FormData {
  nombre: string;
  contacto: string;
  telefono: string;
  email: string;
  direccion: string;
  tipo: 'FISICA' | 'MORAL';
  rfc: string;
  banco: string;
  cuentaBancaria: string;
  clabeInterbancaria: string;
  notas: string;
}

export default function ProveedoresPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [proveedorExpandido, setProveedorExpandido] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    contacto: '',
    telefono: '',
    email: '',
    direccion: '',
    tipo: 'FISICA',
    rfc: '',
    banco: '',
    cuentaBancaria: '',
    clabeInterbancaria: '',
    notas: ''
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadProveedores = async () => {
      if (session?.user && mounted) {
        console.log('Cargando proveedores iniciales...');
        await fetchProveedores();
      }
    };

    loadProveedores();

    return () => {
      mounted = false;
    };
  }, [session]);

  const fetchProveedores = async () => {
    try {
      console.log('Fetching proveedores...');
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

  // Filtrar proveedores basado en la búsqueda
  const proveedoresFiltrados = useMemo(() => {
    console.log('Filtrando proveedores...');
    return proveedores.filter(proveedor => 
      proveedor.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      proveedor.contacto.toLowerCase().includes(busqueda.toLowerCase()) ||
      (proveedor.email?.toLowerCase() || '').includes(busqueda.toLowerCase())
    );
  }, [busqueda, proveedores]);

  const validateForm = (): boolean => {
    console.log('Validando formulario con datos:', formData);
    const newErrors: Partial<FormData> = {};
    
    // Validar campos obligatorios
    const camposObligatorios: (keyof FormData)[] = [
      'nombre', 'contacto', 'telefono', 'rfc', 'banco', 
      'cuentaBancaria', 'clabeInterbancaria'
    ];
    
    camposObligatorios.forEach(campo => {
      console.log(`Validando campo ${campo}:`, formData[campo]);
      if (!formData[campo]) {
        console.log(`Campo ${campo} está vacío`);
        newErrors[campo] = 'Este campo es obligatorio';
      }
    });

    // Validar email si se proporciona
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      console.log('Email inválido:', formData.email);
      newErrors.email = 'El email no es válido';
    }

    // Validar CLABE
    if (formData.clabeInterbancaria && !/^\d{18}$/.test(formData.clabeInterbancaria)) {
      console.log('CLABE inválida:', formData.clabeInterbancaria);
      newErrors.clabeInterbancaria = 'La CLABE debe tener 18 dígitos';
    }

    console.log('Errores encontrados:', newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('handleSubmit called');
    e.preventDefault();
    
    console.log('Validating form...');
    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }
    console.log('Form validation passed');

    try {
      const url = editingId 
        ? `/api/catalogo/proveedores/${editingId}`
        : '/api/catalogo/proveedores';
      
      const method = editingId ? 'PUT' : 'POST';
      
      console.log('Sending request to:', url);
      console.log('Request method:', method);
      console.log('Request data:', formData);

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      console.log('Response status:', response.status);
      const responseData = await response.json();
      console.log('Response data:', responseData);

      if (response.ok) {
        // Primero limpiamos el formulario y cerramos el modal
        setIsModalOpen(false);
        setFormData({
          nombre: '',
          contacto: '',
          telefono: '',
          email: '',
          direccion: '',
          tipo: 'FISICA',
          rfc: '',
          banco: '',
          cuentaBancaria: '',
          clabeInterbancaria: '',
          notas: ''
        });
        setEditingId(null);

        // Luego actualizamos la lista de proveedores
        console.log('Actualizando lista de proveedores...');
        await fetchProveedores();
        console.log('Lista de proveedores actualizada');
      } else {
        console.error('Error al guardar proveedor:', responseData);
        alert(responseData.error || 'Error al guardar el proveedor');
      }
    } catch (error) {
      console.error('Error al guardar proveedor:', error);
      alert('Error al guardar el proveedor');
    }
  };

  const handleEdit = (proveedor: Proveedor) => {
    setFormData({
      nombre: proveedor.nombre,
      contacto: proveedor.contacto,
      telefono: proveedor.telefono,
      email: proveedor.email || '',
      direccion: proveedor.direccion || '',
      tipo: proveedor.tipo,
      rfc: proveedor.rfc,
      banco: proveedor.banco,
      cuentaBancaria: proveedor.cuentaBancaria,
      clabeInterbancaria: proveedor.clabeInterbancaria,
      notas: proveedor.notas || ''
    });
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
          alert(errorData.error || 'Error al eliminar el proveedor');
        }
      } catch (error) {
        console.error('Error al eliminar proveedor:', error);
        alert('Error al eliminar el proveedor');
      }
    }
  };

  const toggleDetalles = (id: string) => {
    setProveedorExpandido(proveedorExpandido === id ? null : id);
  };

  return (
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
              tipo: 'FISICA',
              rfc: '',
              banco: '',
              cuentaBancaria: '',
              clabeInterbancaria: '',
              notas: ''
            });
            setEditingId(null);
            setIsModalOpen(true);
          }}
          className="bg-[#FEBF19] text-gray-900 px-4 py-2 rounded-md hover:bg-[#FEBF19]/90 flex items-center"
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
                Detalles
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {proveedoresFiltrados.map((proveedor) => (
              <React.Fragment key={proveedor.id}>
                <tr className="hover:bg-gray-50">
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
                    <button
                      onClick={() => toggleDetalles(proveedor.id)}
                      className="text-[#FEBF19] hover:text-[#FEBF19]/90 font-medium"
                    >
                      {proveedorExpandido === proveedor.id ? 'Ocultar' : 'Mostrar'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(proveedor)}
                      className="bg-[#FEBF19] text-gray-900 px-4 py-2 rounded-md hover:bg-[#FEBF19]/90 focus:outline-none focus:ring-2 focus:ring-[#FEBF19] focus:ring-offset-2 mr-4"
                    >
                      <HiPencil className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(proveedor.id)}
                      className="bg-[#FEBF19] text-gray-900 px-4 py-2 rounded-md hover:bg-[#FEBF19]/90 focus:outline-none focus:ring-2 focus:ring-[#FEBF19] focus:ring-offset-2"
                    >
                      <HiTrash className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
                {proveedorExpandido === proveedor.id && (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 bg-gray-50">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">Información de Contacto</h4>
                          <dl className="mt-2 space-y-1">
                            <div className="flex justify-between">
                              <dt className="text-sm text-gray-900">Email:</dt>
                              <dd className="text-sm text-gray-900">{proveedor.email || '-'}</dd>
                            </div>
                            <div className="flex justify-between">
                              <dt className="text-sm text-gray-900">Dirección:</dt>
                              <dd className="text-sm text-gray-900">{proveedor.direccion || '-'}</dd>
                            </div>
                          </dl>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">Información Fiscal</h4>
                          <dl className="mt-2 space-y-1">
                            <div className="flex justify-between">
                              <dt className="text-sm text-gray-900">RFC:</dt>
                              <dd className="text-sm text-gray-900">{proveedor.rfc || '-'}</dd>
                            </div>
                            <div className="flex justify-between">
                              <dt className="text-sm text-gray-900">Banco:</dt>
                              <dd className="text-sm text-gray-900">{proveedor.banco || '-'}</dd>
                            </div>
                            <div className="flex justify-between">
                              <dt className="text-sm text-gray-900">Cuenta Bancaria:</dt>
                              <dd className="text-sm text-gray-900">{proveedor.cuentaBancaria || '-'}</dd>
                            </div>
                            <div className="flex justify-between">
                              <dt className="text-sm text-gray-900">CLABE Interbancaria:</dt>
                              <dd className="text-sm text-gray-900">{proveedor.clabeInterbancaria || '-'}</dd>
                            </div>
                          </dl>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 overflow-y-auto pt-20">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl my-4">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">
              {editingId ? 'Editar Proveedor' : 'Nuevo Proveedor'}
            </h2>
            <form onSubmit={(e) => {
              console.log('Form submitted');
              e.preventDefault();
              handleSubmit(e);
            }}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900">Tipo</label>
                  <select
                    name="tipo"
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value as TipoProveedor })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2 text-gray-900"
                  >
                    <option value="FISICA" className="text-gray-900">Persona Física</option>
                    <option value="MORAL" className="text-gray-900">Persona Moral</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900">Nombre *</label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2 text-gray-900 ${errors.nombre ? 'border-red-500' : ''}`}
                    required
                    placeholder="Nombre del proveedor"
                  />
                  {errors.nombre && <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900">Contacto</label>
                  <input
                    type="text"
                    name="contacto"
                    value={formData.contacto}
                    onChange={(e) => setFormData({ ...formData, contacto: e.target.value })}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2 text-gray-900 ${errors.contacto ? 'border-red-500' : ''}`}
                    placeholder="Nombre del contacto"
                  />
                  {errors.contacto && <p className="mt-1 text-sm text-red-600">{errors.contacto}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900">Teléfono *</label>
                  <input
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2 text-gray-900 ${errors.telefono ? 'border-red-500' : ''}`}
                    required
                    placeholder="Teléfono del proveedor"
                  />
                  {errors.telefono && <p className="mt-1 text-sm text-red-600">{errors.telefono}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2 text-gray-900"
                    placeholder="correo@ejemplo.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900">RFC</label>
                  <input
                    type="text"
                    name="rfc"
                    value={formData.rfc}
                    onChange={(e) => setFormData({ ...formData, rfc: e.target.value })}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2 text-gray-900 ${errors.rfc ? 'border-red-500' : ''}`}
                    placeholder="RFC del proveedor"
                  />
                  {errors.rfc && <p className="mt-1 text-sm text-red-600">{errors.rfc}</p>}
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-900">Dirección</label>
                  <input
                    type="text"
                    name="direccion"
                    value={formData.direccion || ''}
                    onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2 text-gray-900"
                    placeholder="Dirección del proveedor"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900">Banco</label>
                  <input
                    type="text"
                    name="banco"
                    value={formData.banco}
                    onChange={(e) => setFormData({ ...formData, banco: e.target.value })}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2 text-gray-900 ${errors.banco ? 'border-red-500' : ''}`}
                    placeholder="Nombre del banco"
                  />
                  {errors.banco && <p className="mt-1 text-sm text-red-600">{errors.banco}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900">Cuenta Bancaria</label>
                  <input
                    type="text"
                    name="cuentaBancaria"
                    value={formData.cuentaBancaria}
                    onChange={(e) => setFormData({ ...formData, cuentaBancaria: e.target.value })}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2 text-gray-900 ${errors.cuentaBancaria ? 'border-red-500' : ''}`}
                    placeholder="Número de cuenta bancaria"
                  />
                  {errors.cuentaBancaria && <p className="mt-1 text-sm text-red-600">{errors.cuentaBancaria}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900">CLABE Interbancaria</label>
                  <input
                    type="text"
                    name="clabeInterbancaria"
                    value={formData.clabeInterbancaria}
                    onChange={(e) => setFormData({ ...formData, clabeInterbancaria: e.target.value })}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2 text-gray-900 ${errors.clabeInterbancaria ? 'border-red-500' : ''}`}
                    placeholder="CLABE interbancaria"
                  />
                  {errors.clabeInterbancaria && <p className="mt-1 text-sm text-red-600">{errors.clabeInterbancaria}</p>}
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
                  onClick={() => {
                    console.log('Save button clicked');
                    const form = document.querySelector('form');
                    if (form) {
                      form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                    }
                  }}
                  className="px-4 py-2 bg-[#FEBF19] text-white rounded-md hover:bg-[#FEBF19]/90"
                >
                  {editingId ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 