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

async function getTicket(id: string): Promise<Ticket | null> {
  const ticket = await prisma.ticket.findUnique({
    where: { id: parseInt(id) },
    include: {
      cliente: true,
      tipoServicio: true,
      modelo: {
        include: {
          marca: true
        }
      },
      estatusReparacion: true,
      tecnicoAsignado: true,
      dispositivo: true,
      creador: true,
      reparacion: {
        include: {
          tecnico: true,
          checklistItems: true,
          piezas: {
            include: {
              pieza: true
            }
          }
        }
      },
      presupuesto: true
    }
  });

  return ticket;
}

export default async function TicketPage({ params }: PageProps) {
  const ticket = await getTicket(params.id);

  if (!ticket) {
    notFound();
  }

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