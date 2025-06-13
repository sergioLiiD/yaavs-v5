'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import RouteGuard from '@/components/route-guard';
import { TicketsTable } from './components/TicketsTable';

export default function TicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      console.log('Iniciando fetch de tickets...');
      const response = await fetch('/api/tickets');
      console.log('Respuesta recibida:', response.status);
      
      if (!response.ok) {
        throw new Error(`Error al obtener tickets: ${response.status}`);
      }

      const data = await response.json();
      console.log('Datos recibidos:', data);
      setTickets(data);
    } catch (error) {
      console.error('Error en fetchTickets:', error);
      setError(error instanceof Error ? error.message : 'Error al cargar los tickets');
      toast.error('No se pudieron cargar los tickets');
    } finally {
      setLoading(false);
    }
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
        <TicketsTable tickets={tickets} />
      </div>
    </RouteGuard>
  );
} 