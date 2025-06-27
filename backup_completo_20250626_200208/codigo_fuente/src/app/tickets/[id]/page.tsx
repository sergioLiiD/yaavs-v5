import React from 'react';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { DiagnosticoSection } from '@/components/diagnostico-section';
import { PresupuestoSection } from '@/components/presupuesto-section';
import { ReparacionSection } from '@/components/reparacion-section';
import { EntregaSection } from '@/components/entrega-section';
import { TicketClient } from './ticket-client';
import { Ticket } from '@/types/ticket';

interface PageProps {
  params: {
    id: string;
  };
}

async function getTicket(id: string): Promise<Ticket> {
  const ticket = await prisma.ticket.findUnique({
    where: { id: Number(id) },
    include: {
      cliente: true,
      tipoServicio: true,
      modelo: {
        include: {
          marcas: true
        }
      },
      estatusReparacion: true,
      tecnicoAsignado: true,
      creador: true,
      dispositivos: true,
      Presupuesto: {
        include: {
          conceptos_presupuesto: true
        }
      },
      Reparacion: {
        include: {
          checklistDiagnostico: true,
          piezas_reparacion: {
            include: {
              piezas: true
            }
          }
        }
      },
      pagos: true
    }
  });

  if (!ticket) {
    notFound();
  }

  const ticketWithCorrectFields: Ticket = {
    ...ticket,
    reparacion: ticket.Reparacion
      ? {
          ...ticket.Reparacion,
          checklistItems: ticket.Reparacion.checklistDiagnostico,
          piezas: ticket.Reparacion.piezas_reparacion.map(pr => ({
            id: pr.id,
            cantidad: pr.cantidad,
            precioUnitario: pr.precioUnitario,
            pieza: pr.piezas
          })),
          tecnico: ticket.tecnicoAsignado
            ? {
                id: ticket.tecnicoAsignado.id,
                nombre: ticket.tecnicoAsignado.nombre,
                apellidoPaterno: ticket.tecnicoAsignado.apellidoPaterno,
                apellidoMaterno: ticket.tecnicoAsignado.apellidoMaterno ?? null
              }
            : {
                id: 0,
                nombre: '',
                apellidoPaterno: '',
                apellidoMaterno: null
              }
        }
      : null,
    presupuesto: ticket.Presupuesto
      ? {
          ...ticket.Presupuesto,
          conceptos: ticket.Presupuesto.conceptos_presupuesto
        }
      : null
  };

  return ticketWithCorrectFields;
}

export default async function TicketPage({ params }: PageProps) {
  const ticket = await getTicket(params.id);

  return (
    <div className="container mx-auto py-6">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Ticket #{ticket.numeroTicket}</h1>
            <p className="text-gray-500">
              Estado: {ticket.estatusReparacion?.nombre}
            </p>
          </div>
        </div>

        <TicketClient ticket={ticket} />

        <Tabs defaultValue="general">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="diagnostico">Diagnóstico</TabsTrigger>
            <TabsTrigger value="presupuesto">Presupuesto</TabsTrigger>
            <TabsTrigger value="reparacion">Reparación</TabsTrigger>
            <TabsTrigger value="entrega">Entrega</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            {/* Contenido general existente */}
          </TabsContent>

          <TabsContent value="diagnostico">
            <DiagnosticoSection 
              ticket={ticket} 
              onUpdate={() => {
                // La actualización se manejará a través de la recarga de la página
                window.location.reload();
              }} 
            />
          </TabsContent>

          <TabsContent value="presupuesto">
            <PresupuestoSection ticketId={ticket.id} onUpdate={() => {}} />
          </TabsContent>

          <TabsContent value="reparacion">
            <ReparacionSection ticket={ticket} onUpdate={() => {}} />
          </TabsContent>

          <TabsContent value="entrega">
            <EntregaSection ticket={ticket} onUpdate={() => {}} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 