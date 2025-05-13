'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { HiSave, HiX, HiClock, HiCamera } from 'react-icons/hi';

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
    id: number;
    nombre: string;
  };
  reparacion?: {
    diagnostico: string;
    piezasNecesarias: string;
    fechaDiagnostico: string;
    presupuesto: number;
    fechaPresupuesto: string;
    fechaInicio: string;
    fechaFin: string;
    observaciones: string;
  };
}

export default function RepairPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [formData, setFormData] = useState({
    observaciones: '',
    completar: false,
  });

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const response = await fetch(`/api/tickets/${params.id}`);
        if (!response.ok) {
          throw new Error('Error al cargar el ticket');
        }
        const data = await response.json();
        setTicket(data);
        if (data.reparacion) {
          setFormData(prev => ({
            ...prev,
            observaciones: data.reparacion.observaciones || '',
          }));
        }
      } catch (err) {
        console.error('Error:', err);
        setError('Error al cargar el ticket');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTicket();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`/api/tickets/${params.id}/reparacion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Error al guardar la reparación');
      }

      router.push(`/dashboard/tickets/${params.id}`);
    } catch (err) {
      console.error('Error:', err);
      setError('Error al guardar la reparación');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  if (error || !ticket) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error || 'Ticket no encontrado'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reparación - Ticket #{ticket.numeroTicket}</h1>
          <p className="text-sm text-gray-500">
            Cliente: {ticket.cliente.nombre} {ticket.cliente.apellidoPaterno} {ticket.cliente.apellidoMaterno || ''}
          </p>
          <p className="text-sm text-gray-500">
            Dispositivo: {ticket.modelo.marca.nombre} {ticket.modelo.nombre}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="observaciones">Observaciones de la Reparación</Label>
                <Textarea
                  id="observaciones"
                  value={formData.observaciones}
                  onChange={(e) => setFormData(prev => ({ ...prev, observaciones: e.target.value }))}
                  rows={4}
                  placeholder="Describe el proceso de reparación, piezas utilizadas, etc."
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="completar"
                  checked={formData.completar}
                  onChange={(e) => setFormData(prev => ({ ...prev, completar: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <Label htmlFor="completar" className="ml-2">
                  Marcar como completada
                </Label>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/dashboard/tickets/${params.id}`)}
          >
            <HiX className="mr-2 h-5 w-5" />
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            <HiSave className="mr-2 h-5 w-5" />
            {isLoading ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </form>
    </div>
  );
} 