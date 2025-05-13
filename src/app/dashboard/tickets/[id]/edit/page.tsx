'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { TicketForm } from '@/app/dashboard/tickets/components/TicketForm';

export default function EditTicketPage({ params }: { params: { id: string } }) {
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const response = await fetch(`/api/tickets/${params.id}`);
        if (!response.ok) {
          throw new Error('Error al cargar el ticket');
        }
        const data = await response.json();
        setTicket(data);
      } catch (err) {
        setError('Error al cargar el ticket');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [params.id]);

  const handleSubmit = async (formData: any) => {
    try {
      const response = await fetch(`/api/tickets/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el ticket');
      }

      router.push(`/dashboard/tickets/${params.id}`);
      router.refresh();
    } catch (err) {
      setError('Error al actualizar el ticket');
      console.error('Error:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">Cargando...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-red-600">{error}</div>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">Ticket no encontrado</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Editar Ticket #{ticket.numeroTicket}</h1>
          <TicketForm
            initialData={ticket}
            onSubmit={handleSubmit}
            isEditing={true}
          />
        </div>
      </div>
    </div>
  );
} 