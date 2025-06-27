'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { FaSpinner, FaArrowLeft } from 'react-icons/fa';

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
    id: string;
    nombre: string;
  };
  createdAt: string;
}

interface EstatusReparacion {
  id: string;
  nombre: string;
}

export default function UpdateTicketPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [estatusReparacion, setEstatusReparacion] = useState<EstatusReparacion[]>([]);
  const [selectedEstatus, setSelectedEstatus] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtener el ticket
        const ticketResponse = await fetch(`/api/repair-point/tickets/${params.id}`);
        if (!ticketResponse.ok) {
          throw new Error('Error al cargar el ticket');
        }
        const ticketData = await ticketResponse.json();
        setTicket(ticketData);
        setSelectedEstatus(ticketData.estatusReparacion.id);

        // Obtener los estatus de reparación
        const dataResponse = await fetch('/api/repair-point/data');
        if (!dataResponse.ok) {
          throw new Error('Error al cargar los datos');
        }
        const data = await dataResponse.json();
        setEstatusReparacion(data.estatusReparacion);
      } catch (error) {
        setError('Error al cargar los datos. Por favor, intente nuevamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const response = await fetch(`/api/repair-point/tickets/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          estatusReparacionId: selectedEstatus
        }),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el ticket');
      }

      router.push(`/repair-point/tickets/${params.id}`);
    } catch (error) {
      setError('Error al actualizar el ticket. Por favor, intente nuevamente.');
    } finally {
      setSaving(false);
    }
  };

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
        <div className="flex items-center mb-6">
          <button
            onClick={() => router.back()}
            className="mr-4 p-2 hover:bg-gray-100 rounded-full"
          >
            <FaArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold">Actualizar Estatus del Ticket</h1>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Información del Cliente</h2>
            <p className="text-gray-700">
              {`${ticket.cliente.nombre} ${ticket.cliente.apellidoPaterno} ${ticket.cliente.apellidoMaterno}`}
            </p>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Información del Dispositivo</h2>
            <p className="text-gray-700">
              {`${ticket.modelo.marcas.nombre} ${ticket.modelo.nombre}`}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="estatusReparacionId" className="block text-sm font-medium text-gray-700">
                Estatus de Reparación
              </label>
              <select
                id="estatusReparacionId"
                value={selectedEstatus}
                onChange={(e) => setSelectedEstatus(e.target.value)}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Seleccione un estatus</option>
                {estatusReparacion.map(estatus => (
                  <option key={estatus.id} value={estatus.id}>
                    {estatus.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <span className="flex items-center">
                    <FaSpinner className="animate-spin mr-2" />
                    Actualizando...
                  </span>
                ) : (
                  'Actualizar Estatus'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 