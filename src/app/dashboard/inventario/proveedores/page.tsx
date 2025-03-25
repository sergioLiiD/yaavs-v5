'use client';

import React, { useState, useEffect } from 'react';
import { HiPlus, HiX } from 'react-icons/hi';

interface Proveedor {
  id: number;
  nombre: string;
  tipo: 'DISTRIBUIDOR' | 'FABRICANTE';
  contacto: string;
  telefono: string;
  email: string | null;
  direccion: string | null;
  rfc: string | null;
  notas: string | null;
}

interface FormData {
  nombre: string;
  tipo: 'DISTRIBUIDOR' | 'FABRICANTE';
  contacto: string;
  telefono: string;
  email: string;
  direccion: string;
  rfc: string;
  notas: string;
}

export default function ProveedoresPage() {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState<Proveedor | null>(null);
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    tipo: 'DISTRIBUIDOR',
    contacto: '',
    telefono: '',
    email: '',
    direccion: '',
    rfc: '',
    notas: '',
  });
  const [detallesVisibles, setDetallesVisibles] = useState<Record<number, boolean>>({});

  useEffect(() => {
    cargarProveedores();
  }, []);

  const cargarProveedores = async () => {
    try {
      const response = await fetch('/api/catalogo/proveedores');
      if (!response.ok) {
        throw new Error('Error al cargar los proveedores');
      }
      const data = await response.json();
      setProveedores(data);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al cargar los proveedores');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      const url = proveedorSeleccionado 
        ? `/api/catalogo/proveedores/${proveedorSeleccionado.id}`
        : '/api/catalogo/proveedores';

      const response = await fetch(url, {
        method: proveedorSeleccionado ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al guardar el proveedor');
      }

      await cargarProveedores();
      setShowModal(false);
      setProveedorSeleccionado(null);
      setFormData({
        nombre: '',
        tipo: 'DISTRIBUIDOR',
        contacto: '',
        telefono: '',
        email: '',
        direccion: '',
        rfc: '',
        notas: '',
      });
    } catch (error) {
      console.error('Error:', error);
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert('Error al guardar el proveedor');
      }
    }
  };

  const handleEdit = (proveedor: Proveedor) => {
    setProveedorSeleccionado(proveedor);
    setFormData({
      nombre: proveedor.nombre,
      tipo: proveedor.tipo,
      contacto: proveedor.contacto,
      telefono: proveedor.telefono,
      email: proveedor.email || '',
      direccion: proveedor.direccion || '',
      rfc: proveedor.rfc || '',
      notas: proveedor.notas || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Está seguro de que desea eliminar este proveedor?')) {
      return;
    }

    try {
      const response = await fetch(`/api/catalogo/proveedores/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al eliminar el proveedor');
      }

      await cargarProveedores();
    } catch (error) {
      console.error('Error:', error);
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert('Error al eliminar el proveedor');
      }
    }
  };

  const toggleDetalles = (id: number) => {
    setDetallesVisibles(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Proveedores</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <HiPlus className="mr-2" />
          Nuevo Proveedor
        </button>
      </div>

      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                  Tipo
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Nombre
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Contacto
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Teléfono
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Detalles
                </th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {proveedores.map((proveedor) => (
                <React.Fragment key={proveedor.id}>
                  <tr>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        proveedor.tipo === 'DISTRIBUIDOR' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {proveedor.tipo === 'DISTRIBUIDOR' ? 'Distribuidor' : 'Fabricante'}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                      {proveedor.nombre}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                      {proveedor.contacto}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                      {proveedor.telefono}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                      <button
                        onClick={() => toggleDetalles(proveedor.id)}
                        className="text-blue-600 hover:text-blue-900 font-medium"
                      >
                        {detallesVisibles[proveedor.id] ? 'Ocultar' : 'Mostrar'}
                      </button>
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <button
                        onClick={() => handleEdit(proveedor)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(proveedor.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                  {detallesVisibles[proveedor.id] && (
                    <tr>
                      <td colSpan={6} className="px-3 py-4 bg-gray-50">
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
                                <dt className="text-sm text-gray-900">Notas:</dt>
                                <dd className="text-sm text-gray-900">{proveedor.notas || '-'}</dd>
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
      </div>

      {/* Modal de Proveedor */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-[800px] shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">
                {proveedorSeleccionado ? 'Editar Proveedor' : 'Nuevo Proveedor'}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setProveedorSeleccionado(null);
                  setFormData({
                    nombre: '',
                    tipo: 'DISTRIBUIDOR',
                    contacto: '',
                    telefono: '',
                    email: '',
                    direccion: '',
                    rfc: '',
                    notas: '',
                  });
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <HiX className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="tipo" className="block text-sm font-medium text-gray-900">
                  Tipo
                </label>
                <select
                  name="tipo"
                  id="tipo"
                  value={formData.tipo}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2.5 text-gray-900"
                  required
                >
                  <option value="DISTRIBUIDOR">Distribuidor</option>
                  <option value="FABRICANTE">Fabricante</option>
                </select>
              </div>

              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-900">
                  Nombre
                </label>
                <input
                  type="text"
                  name="nombre"
                  id="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2.5 text-gray-900"
                  required
                />
              </div>

              <div>
                <label htmlFor="contacto" className="block text-sm font-medium text-gray-900">
                  Contacto
                </label>
                <input
                  type="text"
                  name="contacto"
                  id="contacto"
                  value={formData.contacto}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2.5 text-gray-900"
                  required
                />
              </div>

              <div>
                <label htmlFor="telefono" className="block text-sm font-medium text-gray-900">
                  Teléfono
                </label>
                <input
                  type="tel"
                  name="telefono"
                  id="telefono"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2.5 text-gray-900"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-900">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2.5 text-gray-900"
                />
              </div>

              <div>
                <label htmlFor="direccion" className="block text-sm font-medium text-gray-900">
                  Dirección
                </label>
                <textarea
                  name="direccion"
                  id="direccion"
                  value={formData.direccion}
                  onChange={handleInputChange}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2.5 text-gray-900"
                />
              </div>

              <div>
                <label htmlFor="rfc" className="block text-sm font-medium text-gray-900">
                  RFC
                </label>
                <input
                  type="text"
                  name="rfc"
                  id="rfc"
                  value={formData.rfc}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2.5 text-gray-900"
                />
              </div>

              <div>
                <label htmlFor="notas" className="block text-sm font-medium text-gray-900">
                  Notas
                </label>
                <textarea
                  name="notas"
                  id="notas"
                  value={formData.notas}
                  onChange={handleInputChange}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2.5 text-gray-900"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setProveedorSeleccionado(null);
                    setFormData({
                      nombre: '',
                      tipo: 'DISTRIBUIDOR',
                      contacto: '',
                      telefono: '',
                      email: '',
                      direccion: '',
                      rfc: '',
                      notas: '',
                    });
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                >
                  {proveedorSeleccionado ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 