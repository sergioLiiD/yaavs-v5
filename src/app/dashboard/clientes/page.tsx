'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { HiPlus, HiPencilAlt, HiTrash, HiSearch } from 'react-icons/hi';
import axios from 'axios';
import React from 'react';
import { Button } from '@/components/ui/button';

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
  tipoRegistro: string;
  createdAt: string;
  updatedAt: string;
  pais?: string;
  puntoRecoleccion?: {
    id: number;
    nombre: string;
  };
}

interface ClientesResponse {
  clientes: Cliente[];
  total: number;
  page: number;
  totalPages: number;
}

export default function ClientesPage() {
  const { data: session, status } = useSession();
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
    rfc: '',
    calle: '',
    numeroExterior: '',
    numeroInterior: '',
    colonia: '',
    ciudad: '',
    estado: '',
    codigoPostal: '',
    latitud: undefined,
    longitud: undefined,
    fuenteReferencia: '',
    tipoRegistro: 'REGISTRO_TIENDA'
  });
  const [isEditing, setIsEditing] = useState(false);
  const [expandedClientes, setExpandedClientes] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const itemsPerPage = 10;
  const router = useRouter();

  const fetchClientes = async (page: number = 1, search: string = '') => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString()
      });
      
      if (search) {
        params.append('search', search);
      }
      
      const response = await axios.get(`/api/clientes?${params}`);
      const data: ClientesResponse = response.data;
      
      console.log('Respuesta de la API:', JSON.stringify(data, null, 2));
      
      // Mapear los datos de snake_case a camelCase
      const clientesMapeados = data.clientes.map((cliente: any) => ({
        id: cliente.id,
        nombre: cliente.nombre,
        apellidoPaterno: cliente.apellido_paterno,
        apellidoMaterno: cliente.apellido_materno,
        telefonoCelular: cliente.telefono_celular,
        telefonoContacto: cliente.telefono_contacto,
        email: cliente.email,
        calle: cliente.calle,
        numeroExterior: cliente.numero_exterior,
        numeroInterior: cliente.numero_interior,
        colonia: cliente.colonia,
        ciudad: cliente.ciudad,
        estado: cliente.estado,
        codigoPostal: cliente.codigo_postal,
        latitud: cliente.latitud,
        longitud: cliente.longitud,
        fuenteReferencia: cliente.fuente_referencia,
        rfc: cliente.rfc,
        tipoRegistro: cliente.tipo_registro,
        createdAt: cliente.created_at,
        updatedAt: cliente.updated_at,
        puntoRecoleccion: cliente.punto_recoleccion
      }));
      
      setClientes(clientesMapeados);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      setCurrentPage(data.page);
      setError('');
    } catch (err) {
      console.error('Error al cargar clientes:', err);
      setError('Error al cargar los datos. Por favor, intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'loading') return;
    const user = session?.user;
    if (user?.role === 'ADMINISTRADOR_PUNTO' || user?.role === 'USUARIO_PUNTO') {
      router.replace('/repair-point/clientes');
      return;
    }
    fetchClientes();
  }, [session, status]);

  const openModal = () => {
    setError(''); // Limpiar errores anteriores al abrir el modal
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setError(''); // Limpiar errores al cerrar el modal
    setCurrentCliente({
      nombre: '',
      apellidoPaterno: '',
      apellidoMaterno: '',
      telefonoCelular: '',
      telefonoContacto: '',
      email: '',
      rfc: '',
      calle: '',
      numeroExterior: '',
      numeroInterior: '',
      colonia: '',
      ciudad: '',
      estado: '',
      codigoPostal: '',
      latitud: undefined,
      longitud: undefined,
      fuenteReferencia: '',
      tipoRegistro: 'REGISTRO_TIENDA'
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
        await axios.put(`/api/clientes/${currentCliente.id}`, currentCliente);
      } else {
        await axios.post('/api/clientes', currentCliente);
      }
      
      closeModal();
      // Recargar la página actual después de crear/editar
      fetchClientes(currentPage, searchTerm);
    } catch (err: any) {
      console.error('Error al guardar cliente:', err);
      
      // Extraer el mensaje de error específico de la respuesta de la API
      let errorMessage = 'Error al guardar los datos. Por favor, intente nuevamente.';
      
      if (err?.response?.data) {
        const errorData = err.response.data;
        
        // Priorizar el mensaje específico si está disponible
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
      }
      
      setError(errorMessage);
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
      // Recargar la página actual después de eliminar
      fetchClientes(currentPage, searchTerm);
    } catch (err) {
      console.error('Error al eliminar cliente:', err);
      setError('Error al eliminar el cliente. Por favor, intente nuevamente.');
    }
  };

  const toggleCliente = (id: number) => {
    console.log('Toggle cliente:', id);
    const cliente = clientes.find(c => c.id === id);
    console.log('Cliente actual:', JSON.stringify(cliente, null, 2));
    console.log('Estado actual de expandedClientes:', expandedClientes);
    
    setExpandedClientes(prev => {
      const newState = prev.includes(id) 
        ? prev.filter(clienteId => clienteId !== id)
        : [...prev, id];
      console.log('Nuevo estado de expandedClientes:', newState);
      return newState;
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchClientes(page, searchTerm);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setCurrentPage(1);
    fetchClientes(1, value);
  };

  // Ya no necesitamos filtrar en el frontend porque la búsqueda se hace en el servidor
  const filteredClientes = clientes;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
        <button
          onClick={openModal}
          className="bg-[#FEBF19] text-gray-900 px-4 py-2 rounded-md hover:bg-[#FEBF19]/90 focus:outline-none focus:ring-2 focus:ring-[#FEBF19] focus:ring-offset-2"
        >
          Nuevo Cliente
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar cliente..."
          value={searchTerm}
          onChange={handleSearch}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FEBF19] focus:border-transparent"
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
                        cliente.tipoRegistro === 'PUNTO_RECOLECCION' 
                          ? 'bg-green-100 text-green-800' 
                          : cliente.tipoRegistro === 'WEB'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {cliente.tipoRegistro === 'PUNTO_RECOLECCION' && cliente.puntoRecoleccion
                          ? `Punto de Recolección - ${cliente.puntoRecoleccion.nombre}`
                          : cliente.tipoRegistro === 'WEB'
                          ? 'Registro Web'
                          : cliente.tipoRegistro === 'SISTEMA_CENTRAL'
                          ? 'Sistema Central'
                          : cliente.tipoRegistro || 'Sin especificar'
                        }
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(cliente.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleCliente(cliente.id)}
                          className="bg-[#FEBF19] text-gray-900 px-4 py-2 rounded-md hover:bg-[#FEBF19]/90 focus:outline-none focus:ring-2 focus:ring-[#FEBF19] focus:ring-offset-2"
                        >
                          {expandedClientes.includes(cliente.id) ? '▼' : '▶'}
                        </button>
                        <button
                          onClick={() => handleEdit(cliente)}
                          className="bg-[#FEBF19] text-gray-900 px-4 py-2 rounded-md hover:bg-[#FEBF19]/90 focus:outline-none focus:ring-2 focus:ring-[#FEBF19] focus:ring-offset-2"
                        >
                          <HiPencilAlt className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(cliente.id)}
                          className="bg-[#FEBF19] text-gray-900 px-4 py-2 rounded-md hover:bg-[#FEBF19]/90 focus:outline-none focus:ring-2 focus:ring-[#FEBF19] focus:ring-offset-2"
                        >
                          <HiTrash className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedClientes.includes(cliente.id) && (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 bg-gray-50">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">Información de Contacto</h4>
                            <div className="mt-2 space-y-1">
                              <p className="text-sm font-medium text-gray-500">Teléfono de Contacto</p>
                              <p className="mt-1 text-sm text-gray-900">
                                {cliente.telefonoContacto || 'Cliente no ha proporcionado esta información'}
                              </p>
                              <p className="text-sm font-medium text-gray-500">RFC</p>
                              <p className="mt-1 text-sm text-gray-900">
                                {cliente.rfc || 'Cliente no ha proporcionado esta información'}
                              </p>
                              <p className="text-sm font-medium text-gray-500">Fecha de Registro</p>
                              <p className="mt-1 text-sm text-gray-900">
                                {new Date(cliente.createdAt).toLocaleString()}
                              </p>
                              <p className="text-sm font-medium text-gray-500">Última Actualización</p>
                              <p className="mt-1 text-sm text-gray-900">
                                {new Date(cliente.updatedAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">Dirección</h4>
                            <div className="mt-2 space-y-1">
                              <p className="text-sm font-medium text-gray-500">Calle</p>
                              <p className="mt-1 text-sm text-gray-900">
                                {cliente.calle || 'Cliente no ha proporcionado esta información'}
                              </p>
                              <p className="text-sm font-medium text-gray-500">Número Exterior</p>
                              <p className="mt-1 text-sm text-gray-900">
                                {cliente.numeroExterior || 'Cliente no ha proporcionado esta información'}
                              </p>
                              <p className="text-sm font-medium text-gray-500">Número Interior</p>
                              <p className="mt-1 text-sm text-gray-900">
                                {cliente.numeroInterior || 'Cliente no ha proporcionado esta información'}
                              </p>
                              <p className="text-sm font-medium text-gray-500">Colonia</p>
                              <p className="mt-1 text-sm text-gray-900">
                                {cliente.colonia || 'Cliente no ha proporcionado esta información'}
                              </p>
                              <p className="text-sm font-medium text-gray-500">Ciudad</p>
                              <p className="mt-1 text-sm text-gray-900">
                                {cliente.ciudad || 'Cliente no ha proporcionado esta información'}
                              </p>
                              <p className="text-sm font-medium text-gray-500">Estado</p>
                              <p className="mt-1 text-sm text-gray-900">
                                {cliente.estado || 'Cliente no ha proporcionado esta información'}
                              </p>
                              <p className="text-sm font-medium text-gray-500">Código Postal</p>
                              <p className="mt-1 text-sm text-gray-900">
                                {cliente.codigoPostal || 'Cliente no ha proporcionado esta información'}
                              </p>
                              <p className="text-sm font-medium text-gray-500">País</p>
                              <p className="mt-1 text-sm text-gray-900">
                                {cliente.pais || 'Cliente no ha proporcionado esta información'}
                              </p>
                              <p className="text-sm font-medium text-gray-500">Coordenadas</p>
                              <p className="mt-1 text-sm text-gray-900">
                                {cliente.latitud && cliente.longitud ? `${cliente.latitud}, ${cliente.longitud}` : 'No especificadas'}
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

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-4 mt-6">
          <div className="text-sm text-gray-700">
            Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, total)} de {total} clientes
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>
            <div className="flex items-center space-x-2">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}

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
                  
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4" role="alert">
                      <span className="block sm:inline">{error}</span>
                    </div>
                  )}
                  
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
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FEBF19] focus:ring-[#FEBF19] sm:text-sm h-10 px-4 text-gray-900"
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
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FEBF19] focus:ring-[#FEBF19] sm:text-sm h-10 px-4 text-gray-900"
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
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FEBF19] focus:ring-[#FEBF19] sm:text-sm h-10 px-4 text-gray-900"
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
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FEBF19] focus:ring-[#FEBF19] sm:text-sm h-10 px-4 text-gray-900"
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
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FEBF19] focus:ring-[#FEBF19] sm:text-sm h-10 px-4 text-gray-900"
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
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FEBF19] focus:ring-[#FEBF19] sm:text-sm h-10 px-4 text-gray-900"
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
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FEBF19] focus:ring-[#FEBF19] sm:text-sm h-10 px-4 text-gray-900"
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
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FEBF19] focus:ring-[#FEBF19] sm:text-sm h-10 px-4 text-gray-900"
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
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FEBF19] focus:ring-[#FEBF19] sm:text-sm h-10 px-4 text-gray-900"
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
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FEBF19] focus:ring-[#FEBF19] sm:text-sm h-10 px-4 text-gray-900"
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
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FEBF19] focus:ring-[#FEBF19] sm:text-sm h-10 px-4 text-gray-900"
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
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FEBF19] focus:ring-[#FEBF19] sm:text-sm h-10 px-4 text-gray-900"
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
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FEBF19] focus:ring-[#FEBF19] sm:text-sm h-10 px-4 text-gray-900"
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
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FEBF19] focus:ring-[#FEBF19] sm:text-sm h-10 px-4 text-gray-900"
                          placeholder="Código postal"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-6 py-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#FEBF19] text-base font-medium text-gray-900 hover:bg-[#FEBF19]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FEBF19] sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    {isEditing ? 'Actualizar' : 'Guardar'}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FEBF19] sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
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