'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { FaSpinner, FaArrowLeft, FaEdit } from 'react-icons/fa';

interface Ticket {
  id: string;
  cliente: {
    nombre: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
  };
  modelo: {
    nombre: string;
    marcas: {
      nombre: string;
    };
  };
  descripcion: string;
  observaciones: string;
  estatusReparacion: {
    nombre: string;
  };
  createdAt: string;
}

export default function TicketDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [ticket, setTicket] = useState<Ticket | null>(null);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const response = await fetch(`/api/repair-point/tickets/${params.id}`);
        if (!response.ok) {
          throw new Error('Error al cargar el ticket');
        }
        const data = await response.json();
        setTicket(data);
      } catch (error) {
        setError('Error al cargar el ticket. Por favor, intente nuevamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [params.id]);

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <FaSpinner className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <FaSpinner className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error || 'No se encontró el ticket'}
          </div>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <button
              onClick={() => router.back()}
              className="mr-4 p-2 hover:bg-gray-100 rounded-full"
            >
              <FaArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold">Detalles del Ticket</h1>
          </div>
          <button
            onClick={() => router.push(`/repair-point/tickets/${params.id}/update`)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <FaEdit className="mr-2" />
            Actualizar Estatus
          </button>
        </div>

        <div className="bg-white shadow rounded-lg p-6 space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-2">Información del Cliente</h2>
            <p className="text-gray-700">
              {`${ticket.cliente.nombre} ${ticket.cliente.apellidoPaterno} ${ticket.cliente.apellidoMaterno}`}
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Información del Dispositivo</h2>
            <p className="text-gray-700">
              {`${ticket.modelo.marcas.nombre} ${ticket.modelo.nombre}`}
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Descripción del Problema</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{ticket.descripcion}</p>
          </div>

          {ticket.observaciones && (
            <div>
              <h2 className="text-lg font-semibold mb-2">Observaciones</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{ticket.observaciones}</p>
            </div>
          )}

          <div>
            <h2 className="text-lg font-semibold mb-2">Estatus de Reparación</h2>
            <p className="text-gray-700">{ticket.estatusReparacion.nombre}</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Fecha de Creación</h2>
            <p className="text-gray-700">
              {new Date(ticket.createdAt).toLocaleDateString('es-MX', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 