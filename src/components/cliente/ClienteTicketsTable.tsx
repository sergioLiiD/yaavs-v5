'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { toast } from "sonner";

interface Ticket {
  id: number;
  numeroTicket: string;
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
  } | null;
  fechaRecepcion: string;
  descripcionProblema: string | null;
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
  cancelado: boolean;
}

export function ClienteTicketsTable() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await fetch('/api/cliente/tickets');
        if (!response.ok) {
          throw new Error('Error al cargar los tickets');
        }
        const data = await response.json();
        setTickets(data);
      } catch (error) {
        console.error('Error:', error);
        toast.error('Error al cargar los tickets');
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="mt-8 flow-root">
      <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Modelo</TableHead>
                  <TableHead>Tipo de Servicio</TableHead>
                  <TableHead>Técnico</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.map((ticket) => (
                  <TableRow 
                    key={ticket.id}
                    className={ticket.cancelado ? 'bg-gray-50' : ''}
                  >
                    <TableCell>
                      <Button
                        variant="link"
                        className="p-0 h-auto font-normal text-blue-600 hover:text-blue-800 hover:underline"
                        onClick={() => router.push(`/cliente/tickets/${ticket.id}`)}
                      >
                        {ticket.numeroTicket}
                      </Button>
                    </TableCell>
                    <TableCell>
                      {ticket.modelo?.marca?.nombre 
                        ? `${ticket.modelo.marca.nombre} ${ticket.modelo.nombre}`
                        : 'Modelo no disponible'}
                    </TableCell>
                    <TableCell>{ticket.tipoServicio?.nombre || 'Servicio no disponible'}</TableCell>
                    <TableCell>{ticket.tecnicoAsignado ? ticket.tecnicoAsignado.nombre : 'Sin asignar'}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                        ticket.cancelado 
                          ? 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20'
                          : 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20'
                      }`}>
                        {ticket.estatusReparacion?.nombre || 'Estado no disponible'}
                      </span>
                    </TableCell>
                    <TableCell>{new Date(ticket.fechaRecepcion).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push(`/cliente/tickets/${ticket.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
} 