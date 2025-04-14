'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { HiPencilAlt, HiClock, HiCamera, HiDocumentText } from 'react-icons/hi';

interface Ticket {
  id: string;
  cliente: {
    id: string;
    nombre: string;
    apellidos: string;
  };
  tipoReparacion: string;
  marca: string;
  modelo: string;
  imei: string;
  capacidad: string;
  color: string;
  fechaCompra: string;
  codigoDesbloqueo: string;
  redCelular: string;
  tecnico: {
    id: string;
    nombre: string;
  };
  fechaEntrega: string;
  prioridad: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  estado: 'DRAFT' | 'PENDING' | 'IN_DIAGNOSIS' | 'IN_REPAIR' | 'COMPLETED' | 'CANCELLED';
  diagnosis?: {
    checklistRecepcion: {
      id: string;
      label: string;
      checked: boolean;
    }[];
    saludBateria: number;
    versionSO: string;
    notasDiagnostico: string;
    fotos: string[];
    videos: string[];
    presupuesto: {
      items: {
        id: string;
        nombre: string;
        precio: number;
        cantidad: number;
      }[];
      total: number;
    };
    tiempoInicio: string;
  };
  repair?: {
    descripcionProblema: string;
    descripcionReparacion: string;
    checklistPostReparacion: {
      id: string;
      label: string;
      checked: boolean;
    }[];
    fotos: string[];
    videos: string[];
    tiempoFin: string;
  };
}

export default function TicketDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [ticket, setTicket] = useState<Ticket | null>(null);

  // Cargar ticket
  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const response = await axios.get(`/api/tickets/${params.id}`);
        setTicket(response.data);
        setError('');
      } catch (err) {
        console.error('Error al cargar ticket:', err);
        setError('Error al cargar los datos del ticket');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTicket();
  }, [params.id]);

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
      {/* Encabezado */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ticket #{ticket.id}</h1>
          <p className="text-sm text-gray-500">
            Estado: <span className={`font-semibold ${
              ticket.estado === 'COMPLETED' ? 'text-green-600' :
              ticket.estado === 'CANCELLED' ? 'text-red-600' :
              ticket.estado === 'IN_REPAIR' ? 'text-blue-600' :
              'text-yellow-600'
            }`}>{ticket.estado}</span>
          </p>
        </div>
        <div className="flex gap-2">
          {ticket.estado === 'DRAFT' && (
            <Button
              onClick={() => router.push(`/dashboard/tickets/${ticket.id}/edit`)}
            >
              <HiPencilAlt className="mr-2 h-5 w-5" />
              Editar
            </Button>
          )}
          {ticket.estado === 'PENDING' && (
            <Button
              onClick={() => router.push(`/dashboard/tickets/${ticket.id}/diagnosis`)}
            >
              <HiDocumentText className="mr-2 h-5 w-5" />
              Iniciar Diagnóstico
            </Button>
          )}
          {ticket.estado === 'IN_DIAGNOSIS' && (
            <Button
              onClick={() => router.push(`/dashboard/tickets/${ticket.id}/repair`)}
            >
              <HiPencilAlt className="mr-2 h-5 w-5" />
              Iniciar Reparación
            </Button>
          )}
        </div>
      </div>

      {/* Información del teléfono */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Información del Teléfono
          </h3>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Cliente</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {ticket.cliente.nombre}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Tipo de Reparación</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {ticket.tipoReparacion}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Marca/Modelo</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {ticket.marca} {ticket.modelo}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">IMEI</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {ticket.imei}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Capacidad</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {ticket.capacidad}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Color</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {ticket.color}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Fecha de Compra</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {new Date(ticket.fechaCompra).toLocaleDateString()}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Técnico Asignado</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {ticket.tecnico.nombre}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Fecha de Entrega</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {new Date(ticket.fechaEntrega).toLocaleString()}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Diagnóstico */}
      {ticket.diagnosis && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Diagnóstico
            </h3>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Salud de la Batería</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {ticket.diagnosis.saludBateria}%
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Versión del Sistema Operativo</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {ticket.diagnosis.versionSO}
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Notas de Diagnóstico</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {ticket.diagnosis.notasDiagnostico}
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Presupuesto</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  ${ticket.diagnosis.presupuesto.total.toFixed(2)}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      )}

      {/* Reparación */}
      {ticket.repair && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Reparación
            </h3>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Descripción del Problema</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {ticket.repair.descripcionProblema}
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Descripción de la Reparación</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {ticket.repair.descripcionReparacion}
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Tiempo Total</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {new Date(ticket.repair.tiempoFin).getTime() - new Date(ticket.diagnosis?.tiempoInicio || '').getTime()} ms
                </dd>
              </div>
            </dl>
          </div>
        </div>
      )}
    </div>
  );
} 