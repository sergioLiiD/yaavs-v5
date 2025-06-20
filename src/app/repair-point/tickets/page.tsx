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
import { Wrench } from "lucide-react";

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
    marca: {
      nombre: string;
    };
  };
  estatusReparacion: {
    nombre: string;
  };
  fechaRecepcion: string;
  puntoRecoleccion?: {
    isRepairPoint: boolean;
  };
}

export default function RepairPointTicketsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    console.log('Iniciando useEffect...');
    const fetchTickets = async () => {
      console.log('=== INICIO DE FETCH TICKETS ===');
      console.log('Iniciando fetch de tickets...');
      try {
        const response = await fetch('/api/repair-point/tickets');
        console.log('Respuesta recibida:', response.status);
        if (!response.ok) {
          console.log('Error en la respuesta:', response.status);
          throw new Error(`Error al obtener tickets: ${response.status}`);
        }
        const data = await response.json();
        setTickets(data);
      } catch (error) {
        console.error('Error en fetchTickets:', error);
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
              <TableHead>Acciones</TableHead>
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
                  {`${ticket.modelo.marca.nombre} ${ticket.modelo.nombre}`}
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
                <TableCell>
                  <div className="flex items-center gap-2">
                    {ticket.estatusReparacion.nombre !== 'Completado' && ticket.puntoRecoleccion?.isRepairPoint && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-blue-600 hover:text-blue-800"
                        onClick={() => router.push(`/repair-point/tickets/${ticket.id}/repair`)}
                      >
                        <Wrench className="h-4 w-4" />
                      </Button>
                    )}
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