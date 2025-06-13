'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import { TicketDetailsModal } from "./TicketDetailsModal";
import { TicketStatusBadge } from "./TicketStatusBadge";

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
  };
  pagos?: {
    id: number;
    monto: number;
    fecha: string;
    metodoPago: string;
  }[];
}

interface TicketsListProps {
  tickets: Ticket[];
  onTicketClick?: (ticket: Ticket) => void;
}

export function TicketsList({ tickets, onTicketClick }: TicketsListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

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

  const handleTicketClick = (ticket: Ticket) => {
    if (onTicketClick) {
      onTicketClick(ticket);
    } else {
      setSelectedTicket(ticket);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input
          placeholder="Buscar tickets..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTickets.map((ticket) => (
              <TableRow
                key={ticket.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleTicketClick(ticket)}
              >
                <TableCell className="font-medium">
                  #{ticket.numeroTicket}
                </TableCell>
                <TableCell>
                  {ticket.cliente
                    ? `${ticket.cliente.nombre} ${ticket.cliente.apellidoPaterno}`
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
                        ${ticket.presupuesto.totalFinal.toFixed(2)}
                      </span>
                      {ticket.presupuesto.aprobado && (
                        <span className="text-xs text-green-600">✓</span>
                      )}
                    </div>
                  ) : (
                    "Sin presupuesto"
                  )}
                </TableCell>
              </TableRow>
            ))}
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