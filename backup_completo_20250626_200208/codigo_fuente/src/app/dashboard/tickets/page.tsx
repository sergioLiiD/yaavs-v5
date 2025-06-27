'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import RouteGuard from '@/components/route-guard';
import { TicketsTable } from './components/TicketsTable';
import { AssignTechnicianModal } from '@/components/tickets/AssignTechnicianModal';

interface Ticket {
  id: number;
  numeroTicket: string;
  fechaRecepcion: string;
  descripcionProblema: string | null;
  estatusReparacion?: {
    id: number;
    nombre: string;
  };
  cancelado: boolean;
}

export default function TicketsPage() {
  const { data: session, status } = useSession();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    const user = session?.user;
    // Solo redirigir si es usuario de punto de recolección (no administrador general)
    if (user?.role === 'ADMINISTRADOR_PUNTO' || user?.role === 'USUARIO_PUNTO') {
      router.replace('/repair-point/tickets');
      return;
    }
    fetchTickets();
  }, [session, status]);

  const fetchTickets = async () => {
    try {
      console.log('=== INICIO DE FETCH TICKETS ===');
      console.log('Iniciando fetch de tickets...');
      const response = await fetch('/api/tickets');
      console.log('Respuesta recibida:', response.status);
      
      if (!response.ok) {
        console.error('Error en la respuesta:', response.status);
        throw new Error(`Error al obtener tickets: ${response.status}`);
      }

      const data = await response.json();
      console.log('Datos recibidos:', data);
      console.log('Número de tickets:', data.tickets.length);
      console.log('Estados de los tickets:', data.tickets.map((t: Ticket) => ({
        id: t.id,
        numeroTicket: t.numeroTicket,
        estado: t.estatusReparacion?.nombre,
        cancelado: t.cancelado
      })));
      console.log('=== FIN DE FETCH TICKETS ===');
      setTickets(data.tickets);
    } catch (error) {
      console.error('Error en fetchTickets:', error);
      setError(error instanceof Error ? error.message : 'Error al cargar los tickets');
      toast.error('No se pudieron cargar los tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignTechnician = (ticketId: number) => {
    setSelectedTicketId(ticketId);
  };

  const handleAssignComplete = () => {
    setSelectedTicketId(null);
    fetchTickets(); // Recargar tickets para actualizar la lista
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <RouteGuard requiredPermissions={['TICKETS_VIEW']} section="Tickets">
      <div className="container mx-auto py-6">
        <TicketsTable 
          tickets={tickets} 
          onAssignTechnician={handleAssignTechnician}
        />
        {selectedTicketId && (
          <AssignTechnicianModal
            isOpen={true}
            onClose={() => setSelectedTicketId(null)}
            ticketId={selectedTicketId}
            onAssign={handleAssignComplete}
          />
        )}
      </div>
    </RouteGuard>
  );
} 