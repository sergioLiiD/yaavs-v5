'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { EyeIcon, PencilIcon, MagnifyingGlassIcon, PlusIcon, WrenchScrewdriverIcon } from '@heroicons/react/24/outline';
import { useSession } from 'next-auth/react';

interface Ticket {
  id: number;
  numeroTicket: string;
  cliente: {
    nombre: string;
    apellidoPaterno: string;
    apellidoMaterno?: string;
  };
  tipoServicio: {
    nombre: string;
  };
  modelo: {
    nombre: string;
    marca: {
      nombre: string;
    };
  };
  estatusReparacion: {
    nombre: string;
    id: number;
  };
  tecnicoAsignado: {
    nombre: string;
  };
  fechaRecepcion: string;
  presupuesto?: {
    total: number;
    anticipo: number;
    saldo: number;
  };
  pagos?: {
    monto: number;
    fecha: string;
    concepto: string;
    metodoPago: string;
  }[];
}

export function TicketsTable() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const url = session?.user?.role === 'TECNICO' 
          ? `/api/tickets?tecnicoId=${session.user.id}`
          : '/api/tickets';
          
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Error al cargar los tickets');
        }
        const data = await response.json();
        setTickets(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [session?.user?.id, session?.user?.role]);

  const filteredTickets = tickets.filter(ticket => {
    const searchLower = searchTerm.toLowerCase();
    return (
      ticket.numeroTicket.toLowerCase().includes(searchLower) ||
      ticket.cliente.nombre.toLowerCase().includes(searchLower) ||
      ticket.cliente.apellidoPaterno.toLowerCase().includes(searchLower) ||
      ticket.cliente.apellidoMaterno?.toLowerCase().includes(searchLower) ||
      ticket.tipoServicio.nombre.toLowerCase().includes(searchLower) ||
      ticket.modelo.marca.nombre.toLowerCase().includes(searchLower) ||
      ticket.modelo.nombre.toLowerCase().includes(searchLower) ||
      ticket.estatusReparacion.nombre.toLowerCase().includes(searchLower) ||
      ticket.tecnicoAsignado.nombre.toLowerCase().includes(searchLower)
    );
  });

  const renderAcciones = (ticket: Ticket) => {
    const acciones = [
      {
        icon: <EyeIcon className="h-5 w-5" />,
        onClick: () => router.push(`/dashboard/tickets/${ticket.id}`),
        title: "Ver detalles",
        color: "text-blue-500 hover:text-blue-700"
      }
    ];

    // Solo mostrar botón de edición si el ticket está en estado inicial
    if (ticket.estatusReparacion.id === 1) { // 1 = Pendiente
      acciones.push({
        icon: <PencilIcon className="h-5 w-5" />,
        onClick: () => router.push(`/dashboard/tickets/${ticket.id}/edit`),
        title: "Editar ticket",
        color: "text-green-500 hover:text-green-700"
      });
    }

    // Mostrar botón de reparación si el ticket está en diagnóstico o en reparación
    if (ticket.estatusReparacion.id === 2 || ticket.estatusReparacion.id === 3 || ticket.estatusReparacion.id === 4) { 
      // 2 = En Diagnóstico, 3 = En Reparación, 4 = Esperando Aprobación de Presupuesto
      acciones.push({
        icon: <WrenchScrewdriverIcon className="h-5 w-5" />,
        onClick: () => router.push(`/dashboard/tickets/${ticket.id}/repair`),
        title: "Trabajar en reparación",
        color: "text-orange-500 hover:text-orange-700"
      });
    }

    return acciones;
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="mt-8 flow-root">
      {/* Buscador y botón de nuevo ticket */}
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="relative flex-1 rounded-md shadow-sm">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
            placeholder="Buscar por número, cliente, servicio, dispositivo, estado o técnico..."
          />
        </div>
        <button
          onClick={() => router.push('/dashboard/tickets/new')}
          className="inline-flex items-center gap-x-1.5 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          <PlusIcon className="-ml-0.5 h-5 w-5" />
          Nuevo Ticket
        </button>
      </div>

      <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                    Número
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Cliente
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Tipo de Servicio
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Dispositivo
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Estado
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Técnico
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Fecha
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Costo
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Anticipo
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Saldo
                  </th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                    <span className="sr-only">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredTickets.map((ticket) => (
                  <tr 
                    key={ticket.id}
                    className={ticket.estatusReparacion.nombre === 'Reparación Completada' ? 'bg-green-100/50' : ''}
                  >
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                      <button
                        onClick={() => router.push(`/dashboard/tickets/${ticket.id}`)}
                        className="text-blue-600 hover:text-blue-900 hover:underline"
                      >
                        {ticket.numeroTicket}
                      </button>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {ticket.cliente.nombre} {ticket.cliente.apellidoPaterno} {ticket.cliente.apellidoMaterno || ''}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {ticket.tipoServicio.nombre}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {ticket.modelo.marca.nombre} {ticket.modelo.nombre}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {ticket.estatusReparacion.nombre}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {ticket.tecnicoAsignado.nombre}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {new Date(ticket.fechaRecepcion).toLocaleDateString()}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      ${ticket.presupuesto?.total?.toLocaleString('es-MX', { minimumFractionDigits: 2 }) || '0.00'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      ${ticket.presupuesto?.anticipo?.toLocaleString('es-MX', { minimumFractionDigits: 2 }) || '0.00'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      ${ticket.presupuesto?.saldo?.toLocaleString('es-MX', { minimumFractionDigits: 2 }) || '0.00'}
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <div className="flex items-center space-x-2">
                        {renderAcciones(ticket).map((accion, index) => (
                          <button
                            key={index}
                            onClick={accion.onClick}
                            className={`${accion.color} transition-colors`}
                            title={accion.title}
                          >
                            {accion.icon}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 