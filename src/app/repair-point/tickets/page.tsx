'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { HiPlus } from 'react-icons/hi';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface Ticket {
  id: number;
  numeroTicket: string;
  cliente: {
    nombre: string;
    apellidoPaterno: string;
    apellidoMaterno?: string;
  };
  modelo: {
    nombre: string;
    marcas: {
      nombre: string;
    };
  };
  estatusReparacion: {
    nombre: string;
  };
  fechaRecepcion: string;
}

export default function RepairPointTicketsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await fetch('/api/repair-point/tickets');
        if (!response.ok) {
          throw new Error('Error al cargar los tickets');
        }
        const data = await response.json();
        setTickets(data);
      } catch (error) {
        console.error('Error:', error);
        setError('Error al cargar los tickets');
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FEBF19]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Tickets</h1>
        <Button onClick={() => router.push('/repair-point/tickets/new')}>
          <HiPlus className="mr-2 h-5 w-5" />
          Nuevo Ticket
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Modelo</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.map((ticket) => (
              <TableRow key={ticket.id}>
                <TableCell>
                  <button
                    onClick={() => router.push(`/repair-point/tickets/${ticket.id}`)}
                    className="text-[#FEBF19] hover:text-[#FEBF19]/80"
                  >
                    {ticket.numeroTicket}
                  </button>
                </TableCell>
                <TableCell>
                  {`${ticket.cliente.nombre} ${ticket.cliente.apellidoPaterno} ${ticket.cliente.apellidoMaterno || ''}`}
                </TableCell>
                <TableCell>
                  {`${ticket.modelo.marcas.nombre} ${ticket.modelo.nombre}`}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      ticket.estatusReparacion.nombre === 'Completado'
                        ? 'default'
                        : ticket.estatusReparacion.nombre === 'Cancelado'
                        ? 'destructive'
                        : 'secondary'
                    }
                  >
                    {ticket.estatusReparacion.nombre}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(ticket.fechaRecepcion).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 