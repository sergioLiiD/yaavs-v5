'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { HiArrowLeft } from 'react-icons/hi';
import { toast } from 'sonner';
import { DiagnosticoSection } from '@/components/diagnostico-section';
import { TicketDetailsSection } from '@/components/ticket-details-section';
import { Ticket } from '@/types/ticket';
import { PresupuestoSection } from '@/components/presupuesto-section';
import { PagoSection } from '@/components/pago-section';
import { ReparacionSection } from '@/components/reparacion-section';
import { EntregaTab } from '@/components/tickets/EntregaTab';
import { WorkflowExceptionsHistory } from '@/components/tickets/WorkflowBlockedAlert';
import { useTicketWorkflow } from '@/hooks/useWorkflowException';
import type { WorkflowStatusResponse } from '@/types/workflow';
import { AlertTriangle } from 'lucide-react';

export default function TicketDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'diagnostico';
  const [activeTab, setActiveTab] = useState(defaultTab);
  const { workflow, loading: workflowLoading, refreshWorkflow } = useTicketWorkflow(parseInt(params.id));
  const isAdmin = session?.user?.role === 'ADMINISTRADOR';

  const fetchTicket = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/tickets/${params.id}`);
      if (!response.ok) {
        throw new Error('Error al cargar el ticket');
      }
      const data = await response.json();
      setTicket(data);
    } catch (error) {
      console.error('Error al cargar ticket:', error);
      toast.error('Error al cargar el ticket');
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  const handleRefresh = useCallback(async () => {
    await Promise.all([fetchTicket(), refreshWorkflow()]);
  }, [fetchTicket, refreshWorkflow]);

  useEffect(() => {
    fetchTicket();
    refreshWorkflow();
  }, [fetchTicket, refreshWorkflow]);

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tab);
    router.replace(url.toString(), { scroll: false });
  };

  if (loading || workflowLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">Cargando...</div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center text-red-600">Ticket no encontrado</div>
      </div>
    );
  }

  const workflowData = workflow as WorkflowStatusResponse | null;
  const sinTecnico = !workflowData?.tecnicoAsignado;

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
        {sinTecnico && (
          <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-amber-900">Técnico no asignado</p>
              <p className="text-sm text-amber-800 mt-1">
                Asigne un técnico responsable en los detalles del ticket antes de iniciar el diagnóstico o generar el presupuesto.
              </p>
            </div>
          </div>
        )}

        {workflowData && workflowData.excepciones.length > 0 && (
          <WorkflowExceptionsHistory excepciones={workflowData.excepciones} />
        )}

        <TicketDetailsSection 
          ticket={ticket} 
          onUpdate={handleRefresh}
        />

        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
          <TabsList className="bg-gray-100">
            <TabsTrigger value="diagnostico" className={activeTab === 'diagnostico' ? 'bg-[#FEBF19] text-white shadow' : ''}>Diagnóstico</TabsTrigger>
            <TabsTrigger value="presupuesto" className={activeTab === 'presupuesto' ? 'bg-[#FEBF19] text-white shadow' : ''}>Presupuesto</TabsTrigger>
            <TabsTrigger value="pago" className={activeTab === 'pago' ? 'bg-[#FEBF19] text-white shadow' : ''}>Pago</TabsTrigger>
            <TabsTrigger value="reparacion" className={activeTab === 'reparacion' ? 'bg-[#FEBF19] text-white shadow' : ''}>Reparación</TabsTrigger>
            <TabsTrigger value="entrega" className={activeTab === 'entrega' ? 'bg-[#FEBF19] text-white shadow' : ''}>Entrega</TabsTrigger>
          </TabsList>

          <TabsContent value="diagnostico">
            <DiagnosticoSection 
              ticket={ticket}
              workflow={workflowData}
              isAdmin={isAdmin}
              onUpdate={handleRefresh}
              onWorkflowRefresh={refreshWorkflow}
            />
          </TabsContent>

          <TabsContent value="presupuesto">
            <PresupuestoSection
              ticketId={ticket.id}
              workflow={workflowData}
              isAdmin={isAdmin}
              onUpdate={handleRefresh}
              onWorkflowRefresh={refreshWorkflow}
            />
          </TabsContent>

          <TabsContent value="pago">
            <PagoSection ticketId={ticket.id} onUpdate={handleRefresh} />
          </TabsContent>

          <TabsContent value="reparacion">
            <ReparacionSection 
              ticket={ticket}
              workflow={workflowData}
              isAdmin={isAdmin}
              onUpdate={handleRefresh}
              onWorkflowRefresh={refreshWorkflow}
            />
          </TabsContent>

          <TabsContent value="entrega">
            <EntregaTab 
              ticket={ticket}
              presupuesto={ticket.presupuestos}
              pagos={ticket.pagos || []}
              saldo={workflowData?.saldoPendiente ?? ticket.saldo || 0}
              workflow={workflowData}
              isAdmin={isAdmin}
              onUpdate={handleRefresh}
              onWorkflowRefresh={refreshWorkflow}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 