'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { HiPlus, HiPencilAlt, HiTrash, HiSearch } from 'react-icons/hi';
import axios from 'axios';

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
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
        <button
          onClick={openModal}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <HiPlus className="-ml-1 mr-2 h-5 w-5" />
          Nuevo Cliente
        </button>
      </div>

      {/* Barra de búsqueda */}
      <div className="relative">
        <HiSearch className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por nombre, apellido, email o teléfono..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Lista de clientes */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredClientes.map((cliente) => (
            <li key={cliente.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-blue-600 truncate">
                      {cliente.nombre} {cliente.apellidoPaterno} {cliente.apellidoMaterno}
                    </p>
                    <div className="mt-1 text-sm text-gray-500">
                      <p>{cliente.email}</p>
                      <p>{cliente.telefonoCelular}</p>
                    </div>
                  </div>
                  <div className="ml-4 flex-shrink-0 flex space-x-2">
                    <button
                      onClick={() => handleEdit(cliente)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <HiPencilAlt className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(cliente.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <HiTrash className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
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