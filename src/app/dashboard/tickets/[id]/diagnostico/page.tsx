'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { HiArrowLeft, HiCheck, HiX } from 'react-icons/hi';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'react-hot-toast';

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
  descripcion: string;
  estatusReparacion: {
    id: number;
    nombre: string;
  };
  reparacion?: {
    diagnostico: string;
    saludBateria: number;
    versionSO: string;
    checklist: string[];
  };
}

export default function DiagnosticoPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [diagnostico, setDiagnostico] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session?.user) {
      fetchTicket();
    }
  }, [session]);

  const fetchTicket = async () => {
    try {
      const response = await axios.get(`/api/tickets/${params.id}`);
      setTicket(response.data);
      if (response.data.reparacion?.diagnostico) {
        setDiagnostico(response.data.reparacion.diagnostico);
      }
    } catch (error) {
      console.error('Error al cargar el ticket:', error);
      toast.error('Error al cargar el ticket');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Enviando diagnóstico...');
      const response = await axios.post(`/api/tickets/${params.id}/diagnostico`, {
        checklist: ticket?.reparacion?.checklist || [], 
        saludBateria: ticket?.reparacion?.saludBateria || 100,
        versionSO: ticket?.reparacion?.versionSO || '',
        diagnostico: diagnostico
      });

      console.log('Respuesta del servidor:', response.data);
      toast.success('Diagnóstico guardado correctamente');
      router.push(`/dashboard/tickets/${params.id}`);
      router.refresh();
    } catch (error) {
      console.error('Error al guardar el diagnóstico:', error);
      if (axios.isAxiosError(error)) {
        console.error('Error de Axios:', error.response?.data);
        toast.error(error.response?.data?.error || 'Error al guardar el diagnóstico');
      } else {
        toast.error('Error al guardar el diagnóstico');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!ticket) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mr-4"
        >
          <HiArrowLeft className="h-5 w-5 mr-2" />
          Volver
        </Button>
        <h1 className="text-2xl font-bold">
          Diagnóstico - Ticket #{ticket.numeroTicket}
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Información del Cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg">
              {ticket.cliente.nombre} {ticket.cliente.apellidoPaterno} {ticket.cliente.apellidoMaterno}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Información del Equipo</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg">
              {ticket.modelo.marca.nombre} {ticket.modelo.nombre}
            </p>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Descripción del Problema</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg">{ticket.descripcion}</p>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Diagnóstico</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <Textarea
                value={diagnostico}
                onChange={(e) => setDiagnostico(e.target.value)}
                placeholder="Describe el diagnóstico del problema..."
                className="min-h-[200px] mb-4"
                required
              />
              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={loading}
                >
                  <HiX className="h-5 w-5 mr-2" />
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  <HiCheck className="h-5 w-5 mr-2" />
                  {loading ? 'Guardando...' : 'Guardar Diagnóstico'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 