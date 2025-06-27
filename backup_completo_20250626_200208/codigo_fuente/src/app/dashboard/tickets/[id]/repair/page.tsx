'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { HiSave, HiX, HiClock, HiCamera, HiArrowLeft } from 'react-icons/hi';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DiagnosticoSection } from '@/components/diagnostico-section';
import { PresupuestoSection } from '@/components/presupuesto-section';
import { PagoSection } from '@/components/pago-section';
import { ReparacionSection } from '@/components/reparacion-section';
import { Ticket } from '@/types/ticket';

export default function RepairPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const response = await fetch(`/api/tickets/${params.id}`);
        if (!response.ok) {
          throw new Error('Error al cargar el ticket');
        }
        const data = await response.json();
        setTicket(data);
      } catch (error) {
        console.error('Error:', error);
        setError('Error al cargar el ticket');
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [params.id]);

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">Cargando...</div>
      </div>
    );
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
          Ticket #{ticket.numeroTicket}
        </h1>
      </div>

      <div className="space-y-6">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Información del Cliente</h3>
                <div className="mt-2 space-y-2">
                  <p className="text-sm text-gray-500">
                    <span className="font-medium">Nombre:</span> {ticket.cliente.nombre} {ticket.cliente.apellidoPaterno} {ticket.cliente.apellidoMaterno || ''}
                  </p>
                  <p className="text-sm text-gray-500">
                    <span className="font-medium">Teléfono:</span> {ticket.cliente.telefonoCelular}
                  </p>
                  <p className="text-sm text-gray-500">
                    <span className="font-medium">Email:</span> {ticket.cliente.email}
                  </p>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Información del Dispositivo</h3>
                <div className="mt-2 space-y-2">
                  <p className="text-sm text-gray-500">
                    <span className="font-medium">Dispositivo:</span> {ticket.modelo.marcas.nombre} {ticket.modelo.nombre}
                  </p>
                  {ticket.dispositivos && (
                    <>
                      <p className="text-sm text-gray-500">
                        <span className="font-medium">Color:</span> {ticket.dispositivos.color || 'No especificado'}
                      </p>
                      <p className="text-sm text-gray-500">
                        <span className="font-medium">Capacidad:</span> {ticket.dispositivos.capacidad || 'No especificada'}
                      </p>
                      <p className="text-sm text-gray-500">
                        <span className="font-medium">Red Celular:</span> {ticket.dispositivos.redCelular || 'No especificada'}
                      </p>
                      <p className="text-sm text-gray-500">
                        <span className="font-medium">Código Desbloqueo:</span> {ticket.dispositivos.codigoDesbloqueo || 'No especificado'}
                      </p>
                    </>
                  )}
                  <p className="text-sm text-gray-500">
                    <span className="font-medium">IMEI:</span> {ticket.imei || 'No especificado'}
                  </p>
                  <p className="text-sm text-gray-500">
                    <span className="font-medium">Tipo de Servicio:</span> {ticket.tipoServicio.nombre}
                  </p>
                  <p className="text-sm text-gray-500">
                    <span className="font-medium">Descripción del Problema:</span>
                  </p>
                  <p className="text-sm text-gray-500 pl-4 border-l-2 border-gray-200">
                    {ticket.descripcionProblema || 'No se proporcionó descripción'}
                  </p>
                  <p className="text-sm text-gray-500">
                    <span className="font-medium">Estado Actual:</span>{' '}
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      ticket.estatusReparacion.color ? `bg-${ticket.estatusReparacion.color}-100 text-${ticket.estatusReparacion.color}-800` : 'bg-gray-100 text-gray-800'
                    }`}>
                      {ticket.estatusReparacion.nombre}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="diagnostico" className="space-y-4">
          <TabsList>
            <TabsTrigger value="diagnostico">Diagnóstico</TabsTrigger>
            <TabsTrigger value="presupuesto">Presupuesto</TabsTrigger>
            <TabsTrigger value="pago">Pago</TabsTrigger>
            <TabsTrigger value="reparacion">Reparación</TabsTrigger>
          </TabsList>

          <TabsContent value="diagnostico">
            <DiagnosticoSection 
              ticket={ticket} 
              onUpdate={() => {
                router.refresh();
              }} 
            />
          </TabsContent>

          <TabsContent value="presupuesto">
            <PresupuestoSection 
              ticketId={ticket.id} 
              onUpdate={() => {
                router.refresh();
              }} 
            />
          </TabsContent>

          <TabsContent value="pago">
            <PagoSection 
              ticketId={ticket.id} 
              onUpdate={() => {
                router.refresh();
              }} 
            />
          </TabsContent>

          <TabsContent value="reparacion">
            <ReparacionSection 
              ticket={ticket} 
              onUpdate={() => {
                router.refresh();
              }} 
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 