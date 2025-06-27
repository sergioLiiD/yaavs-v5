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
import { Pencil, UserPlus, Wrench, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Ticket {
  id: number;
  numeroTicket: string;
  fechaRecepcion: string;
  descripcionProblema: string | null;
  cliente?: {
    id: number;
    nombre: string;
    apellidoPaterno: string;
    apellidoMaterno?: string;
    telefonoCelular: string;
    email: string;
  };
  modelo?: {
    id: number;
    nombre: string;
    marca: {
      id: number;
      nombre: string;
    };
  };
  tipoServicio?: {
    id: number;
    nombre: string;
  };
  estatusReparacion?: {
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

interface TicketsTableProps {
  tickets: Ticket[];
  onAssignTechnician?: (ticketId: number) => void;
}

export function TicketsTable({ tickets, onAssignTechnician }: TicketsTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const router = useRouter();

  const filteredTickets = tickets.filter((ticket) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      ticket.numeroTicket.toLowerCase().includes(searchLower) ||
      ticket.cliente?.nombre.toLowerCase().includes(searchLower) ||
      ticket.cliente?.apellidoPaterno.toLowerCase().includes(searchLower) ||
      ticket.modelo?.marca.nombre.toLowerCase().includes(searchLower) ||
      ticket.modelo?.nombre.toLowerCase().includes(searchLower) ||
      ticket.estatusReparacion?.nombre.toLowerCase().includes(searchLower)
    );
  });

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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Buscar tickets..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Button onClick={() => router.push("/dashboard/tickets/nuevo")}>
          Nuevo Ticket
        </Button>
      </div>

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
              <TableHead>Saldo</TableHead>
              <TableHead>Origen</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTickets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                  {searchTerm ? 'No se encontraron tickets que coincidan con la búsqueda' : 'No hay tickets disponibles'}
                </TableCell>
              </TableRow>
            ) : (
              filteredTickets.map((ticket) => {
                return (
                  <TableRow 
                    key={ticket.id}
                    className={ticket.cancelado ? 'bg-gray-100 opacity-75' : ''}
                  >
                    <TableCell className="font-medium">
                      <button
                        onClick={() => handleViewDetails(ticket)}
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        #{ticket.numeroTicket}
                      </button>
                    </TableCell>
                    <TableCell>
                      {ticket.cliente
                        ? `${ticket.cliente.nombre} ${ticket.cliente.apellidoPaterno} ${
                          ticket.cliente.apellidoMaterno || ''
                        }`
                        : "No disponible"}
                    </TableCell>
                    <TableCell>
                      {ticket.modelo
                        ? `${ticket.modelo.marca.nombre} ${ticket.modelo.nombre}`
                        : "No disponible"}
                    </TableCell>
                    <TableCell>
                      <TicketStatusBadge status={ticket.estatusReparacion?.nombre || ""} />
                    </TableCell>
                    <TableCell>{formatDate(ticket.fechaRecepcion)}</TableCell>
                    <TableCell>
                      {ticket.tecnicoAsignado
                        ? `${ticket.tecnicoAsignado.nombre} ${ticket.tecnicoAsignado.apellidoPaterno}`
                        : "No asignado"}
                    </TableCell>
                    <TableCell>
                      {ticket.presupuesto ? (
                        <div className="flex items-center gap-2">
                          <span className={ticket.presupuesto.aprobado ? "text-green-600" : "text-yellow-600"}>
                            ${ticket.presupuesto.total.toFixed(2)}
                          </span>
                          {ticket.presupuesto.aprobado && (
                            <span className="text-xs text-green-600">✓</span>
                          )}
                        </div>
                      ) : (
                        "Sin presupuesto"
                      )}
                    </TableCell>
                    <TableCell>
                      {ticket.presupuesto ? (
                        <span className="font-bold text-red-600">
                          ${ticket.presupuesto.saldo.toFixed(2)}
                        </span>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      {ticket.creador && (
                        <TicketOriginBadge
                          creador={ticket.creador}
                          puntoRecoleccion={ticket.puntoRecoleccion}
                          origenCliente={ticket.origenCliente}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEdit(ticket.id)}
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        {onAssignTechnician && !ticket.tecnicoAsignado && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => onAssignTechnician(ticket.id)}
                            title="Asignar Técnico"
                          >
                            <UserPlus className="h-4 w-4" />
                          </Button>
                        )}
                        {ticket.estatusReparacion?.nombre !== 'Concluido' && (
                          ticket.puntoRecoleccion?.isRepairPoint || !ticket.puntoRecoleccion
                        ) && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => router.push(`/dashboard/tickets/${ticket.id}?tab=diagnostico`)}
                            title="Iniciar Reparación"
                          >
                            <Wrench className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDelete(ticket.id)}
                          title="Eliminar"
                          className="text-red-600 hover:text-red-800 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {selectedTicket && (
        <TicketDetailsModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
        />
      )}
    </div>
  );
} 