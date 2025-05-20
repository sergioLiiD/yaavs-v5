'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { HiPlus, HiPencilAlt, HiTrash, HiSearch } from 'react-icons/hi';
import axios from 'axios';
import React from 'react';

interface Cliente {
  id: number;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  telefonoCelular: string;
  telefonoContacto?: string;
  email: string;
  calle?: string;
  numeroExterior?: string;
  numeroInterior?: string;
  colonia?: string;
  ciudad?: string;
  estado?: string;
  codigoPostal?: string;
  latitud?: number;
  longitud?: number;
  fuenteReferencia?: string;
  rfc?: string;
  activo: boolean;
  tipoRegistro: string;
  createdAt: string;
  updatedAt: string;
}

export default function ClientesPage() {
  const { data: session } = useSession();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCliente, setCurrentCliente] = useState<Partial<Cliente>>({
    nombre: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    telefonoCelular: '',
    telefonoContacto: '',
    email: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [expandedClientes, setExpandedClientes] = useState<number[]>([]);

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('/api/clientes');
        setClientes(response.data);
        setError('');
      } catch (err) {
        console.error('Error al cargar clientes:', err);
        setError('Error al cargar los datos. Por favor, intente nuevamente.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchClientes();
  }, []);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentCliente({
      nombre: '',
      apellidoPaterno: '',
      apellidoMaterno: '',
      telefonoCelular: '',
      telefonoContacto: '',
      email: '',
    });
    setIsEditing(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentCliente({ ...currentCliente, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentCliente.nombre || !currentCliente.apellidoPaterno || !currentCliente.telefonoCelular || !currentCliente.email) {
      setError('Por favor complete todos los campos requeridos');
      return;
    }
    
    try {
      if (isEditing && currentCliente.id) {
        const response = await axios.put(`/api/clientes/${currentCliente.id}`, currentCliente);
        setClientes(clientes.map(cliente => 
          cliente.id === currentCliente.id 
            ? response.data
            : cliente
        ));
      } else {
        const response = await axios.post('/api/clientes', currentCliente);
        setClientes([...clientes, response.data]);
      }
      
      closeModal();
    } catch (err) {
      console.error('Error al guardar cliente:', err);
      setError('Error al guardar los datos. Por favor, intente nuevamente.');
    }
  };

  const handleEdit = (cliente: Cliente) => {
    setCurrentCliente(cliente);
    setIsEditing(true);
    openModal();
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Está seguro de que desea eliminar este cliente?')) {
      return;
    }

    try {
      await axios.delete(`/api/clientes/${id}`);
      setClientes(clientes.filter(cliente => cliente.id !== id));
    } catch (err) {
      console.error('Error al eliminar cliente:', err);
      setError('Error al eliminar el cliente. Por favor, intente nuevamente.');
    }
  };

  const toggleCliente = (id: number) => {
    setExpandedClientes(prev => 
      prev.includes(id) 
        ? prev.filter(clienteId => clienteId !== id)
        : [...prev, id]
    );
  };

  const filteredClientes = clientes.filter((cliente) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      cliente.nombre.toLowerCase().includes(searchLower) ||
      cliente.apellidoPaterno.toLowerCase().includes(searchLower) ||
      cliente.apellidoMaterno?.toLowerCase().includes(searchLower) ||
      cliente.email.toLowerCase().includes(searchLower) ||
      cliente.telefonoCelular.includes(searchTerm)
    );
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
        <button
          onClick={openModal}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Nuevo Cliente
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar cliente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Teléfono
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo de Registro
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha Registro
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredClientes.map((cliente) => (
                <React.Fragment key={cliente.id}>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {cliente.nombre} {cliente.apellidoPaterno} {cliente.apellidoMaterno}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{cliente.telefonoCelular}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{cliente.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        cliente.tipoRegistro === 'Registro propio' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {cliente.tipoRegistro}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        cliente.activo 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {cliente.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(cliente.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => toggleCliente(cliente.id)}
                        className="text-gray-500 hover:text-gray-700 mr-4 text-xs"
                      >
                        {expandedClientes.includes(cliente.id) ? '▼' : '▶'}
                      </button>
                      <button
                        onClick={() => handleEdit(cliente)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(cliente.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                  {expandedClientes.includes(cliente.id) && (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 bg-gray-50">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">Información de Contacto</h4>
                            <div className="mt-2 space-y-1">
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Teléfono de Contacto:</span> {cliente.telefonoContacto || 'No especificado'}
                              </p>
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">RFC:</span> {cliente.rfc || 'No especificado'}
                              </p>
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Fecha de Registro:</span> {new Date(cliente.createdAt).toLocaleString()}
                              </p>
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Última Actualización:</span> {new Date(cliente.updatedAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">Dirección</h4>
                            <div className="mt-2 space-y-1">
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Calle:</span> {cliente.calle || 'No especificada'}
                              </p>
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Número Exterior:</span> {cliente.numeroExterior || 'No especificado'}
                              </p>
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Número Interior:</span> {cliente.numeroInterior || 'No especificado'}
                              </p>
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Colonia:</span> {cliente.colonia || 'No especificada'}
                              </p>
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Ciudad:</span> {cliente.ciudad || 'No especificada'}
                              </p>
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Estado:</span> {cliente.estado || 'No especificado'}
                              </p>
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Código Postal:</span> {cliente.codigoPostal || 'No especificado'}
                              </p>
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Coordenadas:</span> {cliente.latitud && cliente.longitud ? `${cliente.latitud}, ${cliente.longitud}` : 'No especificadas'}
                              </p>
                            </div>
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

      {/* Modal de formulario */}
      {isModalOpen && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-6 py-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {isEditing ? 'Editar Cliente' : 'Nuevo Cliente'}
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
                        Nombre *
                      </label>
                      <input
                        type="text"
                        name="nombre"
                        value={currentCliente.nombre}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm h-10 px-4 text-gray-900"
                        placeholder="Ingrese el nombre"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="apellidoPaterno" className="block text-sm font-medium text-gray-700">
                        Apellido Paterno *
                      </label>
                      <input
                        type="text"
                        name="apellidoPaterno"
                        value={currentCliente.apellidoPaterno}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm h-10 px-4 text-gray-900"
                        placeholder="Ingrese el apellido paterno"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="apellidoMaterno" className="block text-sm font-medium text-gray-700">
                        Apellido Materno
                      </label>
                      <input
                        type="text"
                        name="apellidoMaterno"
                        value={currentCliente.apellidoMaterno}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm h-10 px-4 text-gray-900"
                        placeholder="Ingrese el apellido materno"
                      />
                    </div>
                    <div>
                      <label htmlFor="telefonoCelular" className="block text-sm font-medium text-gray-700">
                        Teléfono Celular *
                      </label>
                      <input
                        type="tel"
                        name="telefonoCelular"
                        value={currentCliente.telefonoCelular}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm h-10 px-4 text-gray-900"
                        placeholder="Ingrese el teléfono celular"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="telefonoContacto" className="block text-sm font-medium text-gray-700">
                        Teléfono de Contacto
                      </label>
                      <input
                        type="tel"
                        name="telefonoContacto"
                        value={currentCliente.telefonoContacto}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm h-10 px-4 text-gray-900"
                        placeholder="Ingrese el teléfono de contacto"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Correo Electrónico *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={currentCliente.email}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm h-10 px-4 text-gray-900"
                        placeholder="Ingrese el correo electrónico"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="rfc" className="block text-sm font-medium text-gray-700">
                        RFC
                      </label>
                      <input
                        type="text"
                        name="rfc"
                        value={currentCliente.rfc}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm h-10 px-4 text-gray-900"
                        placeholder="Ingrese el RFC"
                      />
                    </div>
                    <div>
                      <label htmlFor="calle" className="block text-sm font-medium text-gray-700">
                        Calle
                      </label>
                      <input
                        type="text"
                        name="calle"
                        value={currentCliente.calle}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm h-10 px-4 text-gray-900"
                        placeholder="Ingrese la calle"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="numeroExterior" className="block text-sm font-medium text-gray-700">
                          Número Exterior
                        </label>
                        <input
                          type="text"
                          name="numeroExterior"
                          value={currentCliente.numeroExterior}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm h-10 px-4 text-gray-900"
                          placeholder="Número exterior"
                        />
                      </div>
                      <div>
                        <label htmlFor="numeroInterior" className="block text-sm font-medium text-gray-700">
                          Número Interior
                        </label>
                        <input
                          type="text"
                          name="numeroInterior"
                          value={currentCliente.numeroInterior}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm h-10 px-4 text-gray-900"
                          placeholder="Número interior"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="colonia" className="block text-sm font-medium text-gray-700">
                        Colonia
                      </label>
                      <input
                        type="text"
                        name="colonia"
                        value={currentCliente.colonia}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm h-10 px-4 text-gray-900"
                        placeholder="Ingrese la colonia"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label htmlFor="ciudad" className="block text-sm font-medium text-gray-700">
                          Ciudad
                        </label>
                        <input
                          type="text"
                          name="ciudad"
                          value={currentCliente.ciudad}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm h-10 px-4 text-gray-900"
                          placeholder="Ciudad"
                        />
                      </div>
                      <div>
                        <label htmlFor="estado" className="block text-sm font-medium text-gray-700">
                          Estado
                        </label>
                        <input
                          type="text"
                          name="estado"
                          value={currentCliente.estado}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm h-10 px-4 text-gray-900"
                          placeholder="Estado"
                        />
                      </div>
                      <div>
                        <label htmlFor="codigoPostal" className="block text-sm font-medium text-gray-700">
                          Código Postal
                        </label>
                        <input
                          type="text"
                          name="codigoPostal"
                          value={currentCliente.codigoPostal}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm h-10 px-4 text-gray-900"
                          placeholder="Código postal"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-6 py-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    {isEditing ? 'Actualizar' : 'Guardar'}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 