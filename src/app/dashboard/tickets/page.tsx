'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { HiPlus, HiPencilAlt, HiTrash, HiSearch, HiFilter } from 'react-icons/hi';
import axios from 'axios';
import { Table, TableHeader, TableBody, TableCell, TableHead, TableRow } from '@/components/ui/table';

// Tipos para el ticket
interface Ticket {
  id: string;
  cliente: {
    id: string;
    nombre: string;
  };
  tipoReparacion: string;
  marca: string;
  modelo: string;
  imei: string;
  estado: 'DRAFT' | 'PENDING' | 'IN_DIAGNOSIS' | 'IN_REPAIR' | 'COMPLETED' | 'CANCELLED';
  prioridad: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  tecnico: {
    id: string;
    nombre: string;
  };
  fechaCreacion: string;
  fechaEntrega: string;
}

export default function TicketsPage() {
  const { data: session } = useSession();
  
  // Estados
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    estado: '',
    prioridad: '',
    tecnico: ''
  });

  // Cargar tickets al montar el componente
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('/api/tickets');
        setTickets(response.data);
        setError('');
      } catch (err) {
        console.error('Error al cargar tickets:', err);
        setError('Error al cargar los datos. Por favor, intente nuevamente.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTickets();
  }, []);

  // Funciones de filtrado
  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.imei.includes(searchTerm) ||
      ticket.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.modelo.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilters = 
      (!filters.estado || ticket.estado === filters.estado) &&
      (!filters.prioridad || ticket.prioridad === filters.prioridad) &&
      (!filters.tecnico || ticket.tecnico.id === filters.tecnico);

    return matchesSearch && matchesFilters;
  });

  // Funciones de manejo
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Tickets de Reparación</h1>
        <button
          onClick={() => window.location.href = '/dashboard/tickets/new'}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <HiPlus className="-ml-1 mr-2 h-5 w-5" />
          Nuevo Ticket
        </button>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <HiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar por cliente, IMEI, marca o modelo..."
              value={searchTerm}
              onChange={handleSearch}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          
          <select
            name="estado"
            value={filters.estado}
            onChange={handleFilterChange}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="">Todos los estados</option>
            <option value="DRAFT">Borrador</option>
            <option value="PENDING">Pendiente</option>
            <option value="IN_DIAGNOSIS">En Diagnóstico</option>
            <option value="IN_REPAIR">En Reparación</option>
            <option value="COMPLETED">Completado</option>
            <option value="CANCELLED">Cancelado</option>
          </select>

          <select
            name="prioridad"
            value={filters.prioridad}
            onChange={handleFilterChange}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="">Todas las prioridades</option>
            <option value="LOW">Baja</option>
            <option value="MEDIUM">Media</option>
            <option value="HIGH">Alta</option>
            <option value="URGENT">Urgente</option>
          </select>

          <select
            name="tecnico"
            value={filters.tecnico}
            onChange={handleFilterChange}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="">Todos los técnicos</option>
            {/* Aquí se cargarán los técnicos dinámicamente */}
          </select>
        </div>
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

      {/* Tabla de tickets */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>IMEI</TableHead>
              <TableHead>Marca/Modelo</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Prioridad</TableHead>
              <TableHead>Técnico</TableHead>
              <TableHead>Fecha Creación</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTickets.map((ticket) => (
              <TableRow key={ticket.id}>
                <TableCell>{ticket.cliente.nombre}</TableCell>
                <TableCell>{ticket.imei}</TableCell>
                <TableCell>{`${ticket.marca} ${ticket.modelo}`}</TableCell>
                <TableCell>
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${ticket.estado === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                      ticket.estado === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                      ticket.estado === 'IN_REPAIR' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'}`}>
                    {ticket.estado}
                  </span>
                </TableCell>
                <TableCell>
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${ticket.prioridad === 'URGENT' ? 'bg-red-100 text-red-800' :
                      ticket.prioridad === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                      ticket.prioridad === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'}`}>
                    {ticket.prioridad}
                  </span>
                </TableCell>
                <TableCell>{ticket.tecnico.nombre}</TableCell>
                <TableCell>{new Date(ticket.fechaCreacion).toLocaleDateString()}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <button
                      onClick={() => window.location.href = `/dashboard/tickets/${ticket.id}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <HiPencilAlt className="h-5 w-5" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 