'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';
import { TicketDetailsModal } from './TicketDetailsModal';
import { Badge } from '@/components/ui/badge';

export interface Ticket {
  id: number;
  numeroTicket: string;
  fechaRecepcion: string;
  descripcionProblema: string;
  cliente?: {
    id: number;
    nombre: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    telefonoCelular: string;
    email: string;
  };
  modelo?: {
    id: number;
    nombre: string;
    marcas?: {
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
    color: string;
  };
  creador?: {
    id: number;
    nombre: string;
  };
  dispositivos?: {
    id: number;
    capacidad: string;
    color: string;
    fechaCompra: string | null;
    codigoDesbloqueo: string;
    redCelular: string;
  };
}

function getStatusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status.toLowerCase()) {
    case 'recibido':
      return 'default';
    case 'en diagnóstico':
      return 'secondary';
    case 'en reparación':
      return 'outline';
    case 'reparado':
      return 'default';
    case 'entregado':
      return 'secondary';
    case 'cancelado':
      return 'destructive';
    default:
      return 'default';
  }
}

export default function TicketsList() {
  const { data: session } = useSession();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  useEffect(() => {
    const loadTickets = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/tickets');
        const data = await response.json();
        console.log('Datos recibidos de la API:', data);
        setTickets(data);
      } catch (err) {
        console.error('Error al cargar tickets:', err);
        setError('Error al cargar los tickets');
      } finally {
        setLoading(false);
      }
    };

    loadTickets();
  }, []);

  if (loading) {
    return <div>Cargando tickets...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Tickets</CardTitle>
          <Link href="/dashboard/tickets/nuevo">
            <Button>Nuevo Ticket</Button>
          </Link>
        </CardHeader>
        <CardContent>
          {tickets.length === 0 ? (
            <div className="text-center py-4">
              No hay tickets disponibles. Crea uno nuevo para comenzar.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Marca</TableHead>
                  <TableHead>Modelo</TableHead>
                  <TableHead>Problema</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Creado por</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell className="font-medium">
                      <button
                        onClick={() => setSelectedTicket(ticket)}
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {ticket.numeroTicket}
                      </button>
                    </TableCell>
                    <TableCell>
                      {format(new Date(ticket.fechaRecepcion), 'dd/MM/yyyy HH:mm', { locale: es })}
                    </TableCell>
                    <TableCell>
                      {ticket.cliente ? 
                        ticket.cliente.nombre :
                        'Cliente no disponible'
                      }
                    </TableCell>
                    <TableCell>
                      {ticket.modelo?.marcas?.nombre || 'Marca no disponible'}
                    </TableCell>
                    <TableCell>
                      {ticket.modelo?.nombre || 'Modelo no disponible'}
                    </TableCell>
                    <TableCell>
                      {ticket.descripcionProblema || 'Sin descripción'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(ticket.estatusReparacion?.nombre || '')}>
                        {ticket.estatusReparacion?.nombre || 'Sin estado'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {ticket.creador ? 
                        ticket.creador.nombre :
                        'No disponible'
                      }
                    </TableCell>
                    <TableCell>
                      <Link href={`/dashboard/tickets/${ticket.id}`}>
                        <Button variant="outline" size="sm">
                          Ver detalles
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <TicketDetailsModal 
        ticket={selectedTicket} 
        onClose={() => setSelectedTicket(null)} 
      />
    </>
  );
} 