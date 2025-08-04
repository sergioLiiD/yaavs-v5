'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Loader2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
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

interface TicketsResponse {
  tickets: Ticket[];
  total: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface PaginationInfo {
  page: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function TicketsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false
  });

  // Obtener parámetros de URL
  const currentPage = parseInt(searchParams.get('page') || '1');
  const currentSearch = searchParams.get('search') || '';

  useEffect(() => {
    if (status === 'loading') return;
    const user = session?.user;
    // Solo redirigir si es usuario de punto de recolección (no administrador general)
    if (user?.role === 'ADMINISTRADOR_PUNTO' || user?.role === 'USUARIO_PUNTO') {
      router.replace('/repair-point/tickets');
      return;
    }
    fetchTickets();
  }, [session, status, currentPage, currentSearch]);

  const fetchTickets = async () => {
    try {
      console.log('=== INICIO DE FETCH TICKETS ===');
      console.log('Página actual:', currentPage);
      console.log('Búsqueda actual:', currentSearch);
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20'
      });
      
      if (currentSearch.trim()) {
        params.append('search', currentSearch);
      }

      const response = await fetch(`/api/tickets?${params.toString()}`);
      console.log('Respuesta recibida:', response.status);
      
      if (!response.ok) {
        console.error('Error en la respuesta:', response.status);
        throw new Error(`Error al obtener tickets: ${response.status}`);
      }

      const data: TicketsResponse = await response.json();
      console.log('Datos recibidos:', data);
      console.log('Número de tickets:', data.tickets.length);
      console.log('Total de tickets:', data.total);
      console.log('Páginas totales:', data.totalPages);
      console.log('=== FIN DE FETCH TICKETS ===');
      
      setTickets(data.tickets);
      setPagination({
        page: data.page,
        total: data.total,
        totalPages: data.totalPages,
        hasNextPage: data.hasNextPage,
        hasPrevPage: data.hasPrevPage
      });
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

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`/dashboard/tickets?${params.toString()}`);
  };

  const handleSearch = (searchTerm: string) => {
    const params = new URLSearchParams();
    if (searchTerm.trim()) {
      params.set('search', searchTerm);
    }
    params.set('page', '1'); // Resetear a la primera página al buscar
    router.push(`/dashboard/tickets?${params.toString()}`);
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
        {/* Encabezado con botón de nuevo ticket */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Tickets</h1>
          <Button onClick={() => router.push('/dashboard/tickets/nuevo')}>
            <Plus className="mr-2 h-5 w-5" />
            Nuevo Ticket
          </Button>
        </div>
        
        <TicketsTable 
          tickets={tickets as any} 
          onAssignTechnician={handleAssignTechnician}
          pagination={pagination}
          onPageChange={handlePageChange}
          onSearch={handleSearch}
          currentSearch={currentSearch}
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