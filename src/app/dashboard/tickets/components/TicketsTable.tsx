'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { TicketDetailsModal } from "@/components/tickets/TicketDetailsModal";
import { TicketStatusBadge } from "@/components/tickets/TicketStatusBadge";
import { TicketOriginBadge } from "@/components/tickets/TicketOriginBadge";
import { Pencil, UserPlus, Wrench, Trash2, Search, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { toast } from "sonner";

interface Ticket {
  id: number;
  numero_ticket: string;
  numeroTicket?: string; // Para compatibilidad
  fecha_recepcion: string;
  fechaRecepcion?: string; // Para compatibilidad
  descripcion_problema: string | null;
  descripcionProblema?: string | null; // Para compatibilidad
  imei?: string;
  clientes?: {
    id: number;
    nombre: string;
    apellido_paterno: string;
    apellido_materno?: string;
    telefono_celular: string;
    email: string;
  };
  cliente?: { // Para compatibilidad
    id: number;
    nombre: string;
    apellidoPaterno: string;
    apellidoMaterno?: string;
    telefonoCelular: string;
    email: string;
  };
  modelos?: {
    id: number;
    nombre: string;
    marcas: {
      id: number;
      nombre: string;
    };
  };
  modelo?: { // Para compatibilidad
    id: number;
    nombre: string;
    marca: {
      id: number;
      nombre: string;
    };
  };
  tipos_servicio?: {
    id: number;
    nombre: string;
  };
  estatus_reparacion?: {
    id: number;
    nombre: string;
  };
  estatusReparacion?: { // Para compatibilidad
    id: number;
    nombre: string;
  };
  tecnicoAsignado?: {
    id: number;
    nombre: string;
    apellidoPaterno: string;
    apellidoMaterno?: string;
  } | null;
  dispositivo?: {
    id: number;
    tipo: string;
    marca: string;
    modelo: string;
    serie?: string;
  };
  presupuesto?: {
    id: number;
    total: number;
    descuento: number;
    totalFinal: number;
    aprobado: boolean;
    fechaAprobacion?: string;
    conceptos: {
      id: number;
      descripcion: string;
      cantidad: number;
      precioUnitario: number;
      total: number;
    }[];
    saldo: number;
  };
  pagos?: {
    id: number;
    monto: number;
    fecha: string;
    metodoPago: string;
  }[];
  cancelado?: boolean;
  creador?: {
    id: number;
    nombre: string;
    apellidoPaterno: string;
    apellidoMaterno?: string;
    usuarioRoles?: {
      rol: {
        nombre: string;
      };
    }[];
  };
  puntoRecoleccion?: {
    id: number;
    nombre: string;
    isRepairPoint: boolean;
  } | null;
  origenCliente?: boolean;
}

interface PaginationInfo {
  page: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface TicketsTableProps {
  tickets: Ticket[];
  onAssignTechnician?: (ticketId: number) => void;
  pagination?: PaginationInfo;
  onPageChange?: (page: number) => void;
  onSearch?: (searchTerm: string) => void;
  currentSearch?: string;
}

export function TicketsTable({ 
  tickets, 
  onAssignTechnician, 
  pagination, 
  onPageChange, 
  onSearch, 
  currentSearch = '' 
}: TicketsTableProps) {
  const [searchTerm, setSearchTerm] = useState(currentSearch);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const router = useRouter();

  const handleViewDetails = (ticket: Ticket) => {
    setSelectedTicket(ticket);
  };

  const handleEdit = (ticketId: number) => {
    router.push(`/dashboard/tickets/${ticketId}/edit`);
  };

  const handleDelete = async (ticketId: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este ticket?')) {
      return;
    }

    try {
      const response = await fetch(`/api/tickets/${ticketId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          motivoCancelacion: 'Eliminado por el usuario'
        }),
      });

      if (!response.ok) {
        throw new Error('Error al eliminar el ticket');
      }

      toast.success('Ticket eliminado exitosamente');
      router.refresh();
    } catch (error) {
      console.error('Error al eliminar el ticket:', error);
      toast.error('Error al eliminar el ticket');
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchTerm);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handlePageChange = (newPage: number) => {
    if (onPageChange) {
      onPageChange(newPage);
    }
  };

  return (
    <div className="space-y-4">
      {/* Barra de búsqueda */}
      <div className="flex items-center gap-4">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por número de ticket, cliente, marca, modelo, IMEI..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-10"
            />
          </div>
          <Button type="submit" size="sm">
            Buscar
          </Button>
        </form>
        {currentSearch && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              setSearchTerm('');
              if (onSearch) {
                onSearch('');
              }
            }}
          >
            Limpiar
          </Button>
        )}
      </div>

      {/* Información de resultados */}
      {pagination && (
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div>
            Mostrando {tickets.length} de {pagination.total} tickets
            {currentSearch && ` para "${currentSearch}"`}
          </div>
          <div>
            Página {pagination.page} de {pagination.totalPages}
          </div>
        </div>
      )}

      {/* Tabla de tickets */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ticket</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Dispositivo</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Técnico</TableHead>
              <TableHead>Presupuesto</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.map((ticket) => (
              <TableRow key={ticket.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleViewDetails(ticket)}
                      className="font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                      title="Ver detalles del ticket"
                    >
                      {ticket.numero_ticket || ticket.numeroTicket}
                    </button>
                    {ticket.creador && ticket.creador.nombre && (
                      <TicketOriginBadge 
                        creador={ticket.creador}
                        puntoRecoleccion={ticket.puntoRecoleccion}
                        origenCliente={ticket.origenCliente}
                      />
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">
                      {(() => {
                        const cliente = ticket.clientes || ticket.cliente;
                        if (cliente && cliente.nombre) {
                          const apellido = 'apellido_paterno' in cliente ? cliente.apellido_paterno : cliente.apellidoPaterno;
                          return `${cliente.nombre} ${apellido || ''}`;
                        }
                        return 'Cliente no disponible';
                      })()}
                    </div>
                    <div className="text-sm text-gray-500">
                      {(() => {
                        const cliente = ticket.clientes || ticket.cliente;
                        if (cliente) {
                          return 'telefono_celular' in cliente ? cliente.telefono_celular : cliente.telefonoCelular;
                        }
                        return '';
                      })()}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">
                      {(() => {
                        const marcaNombre = ticket.modelos?.marcas?.nombre || ticket.modelo?.marca?.nombre;
                        const modeloNombre = ticket.modelos?.nombre || ticket.modelo?.nombre;
                        if (marcaNombre && modeloNombre) {
                          return `${marcaNombre} ${modeloNombre}`;
                        } else if (modeloNombre) {
                          return modeloNombre;
                        } else if (marcaNombre) {
                          return marcaNombre;
                        }
                        return 'Modelo no disponible';
                      })()}
                    </div>
                    {ticket.imei && (
                      <div className="text-sm text-gray-500">
                        IMEI: {ticket.imei}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <TicketStatusBadge 
                    status={ticket.estatus_reparacion?.nombre || ticket.estatusReparacion?.nombre || ''} 
                  />
                </TableCell>
                <TableCell>
                  {formatDate(ticket.fecha_recepcion || ticket.fechaRecepcion || '')}
                </TableCell>
                <TableCell>
                  {ticket.tecnicoAsignado && ticket.tecnicoAsignado.nombre ? (
                    <div>
                      <div className="font-medium">
                        {ticket.tecnicoAsignado.nombre} {ticket.tecnicoAsignado.apellidoPaterno || ''}
                      </div>
                    </div>
                  ) : (
                    <span className="text-gray-400">Sin asignar</span>
                  )}
                </TableCell>
                <TableCell>
                  {ticket.presupuesto ? (
                    <div>
                      <div className="font-medium">
                        ${ticket.presupuesto.totalFinal.toLocaleString()}
                      </div>
                      {ticket.presupuesto.saldo > 0 && (
                        <div className="text-sm text-orange-600">
                          Saldo: ${ticket.presupuesto.saldo.toLocaleString()}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-400">Sin presupuesto</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewDetails(ticket)}
                      title="Ver detalles del ticket"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(ticket.id)}
                      title="Editar ticket"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    {!ticket.tecnicoAsignado && onAssignTechnician && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onAssignTechnician(ticket.id)}
                        title="Asignar técnico"
                      >
                        <UserPlus className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/dashboard/tickets/${ticket.id}/repair`)}
                      title="Iniciar reparación"
                    >
                      <Wrench className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(ticket.id)}
                      className="text-red-600 hover:text-red-700"
                      title="Eliminar ticket"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Paginación */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Mostrando {tickets.length} de {pagination.total} tickets
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={!pagination.hasPrevPage}
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                let pageNum;
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (pagination.page <= 3) {
                  pageNum = i + 1;
                } else if (pagination.page >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i;
                } else {
                  pageNum = pagination.page - 2 + i;
                }
                
                return (
                  <Button
                    key={pageNum}
                    variant={pageNum === pagination.page ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(pageNum)}
                    className="w-8 h-8 p-0"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={!pagination.hasNextPage}
            >
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Modal de detalles */}
      {selectedTicket && (
        <TicketDetailsModal
          ticket={selectedTicket as any}
          onClose={() => setSelectedTicket(null)}
        />
      )}
    </div>
  );
} 