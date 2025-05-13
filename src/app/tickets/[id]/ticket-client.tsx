import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DiagnosticoModal } from '@/components/diagnostico-modal';
import { PresupuestoModal } from '@/components/presupuesto-modal';
import { ReparacionModal } from '@/components/reparacion-modal';
import { EntregaModal } from '@/components/entrega-modal';
import { Ticket } from '@/types/ticket';

interface TicketClientProps {
  ticket: Ticket;
}

export const TicketClient: React.FC<TicketClientProps> = ({ ticket }) => {
  const [showDiagnosticoModal, setShowDiagnosticoModal] = useState(false);
  const [showPresupuestoModal, setShowPresupuestoModal] = useState(false);
  const [showReparacionModal, setShowReparacionModal] = useState(false);
  const [showEntregaModal, setShowEntregaModal] = useState(false);

  const renderAcciones = () => {
    switch (ticket.estatusReparacion?.nombre) {
      case 'En Recepción':
        return (
          <Button onClick={() => setShowDiagnosticoModal(true)}>
            Iniciar Diagnóstico
          </Button>
        );
      case 'En Diagnóstico':
        return (
          <Button onClick={() => setShowDiagnosticoModal(true)}>
            Completar Diagnóstico
          </Button>
        );
      case 'Diagnóstico Completado':
        return (
          <Button onClick={() => setShowPresupuestoModal(true)}>
            Generar Presupuesto
          </Button>
        );
      case 'Esperando Aprobación de Presupuesto':
        return (
          <Button onClick={() => setShowPresupuestoModal(true)}>
            Ver Presupuesto
          </Button>
        );
      case 'Presupuesto Aprobado':
        return (
          <Button onClick={() => setShowReparacionModal(true)}>
            Iniciar Reparación
          </Button>
        );
      case 'En Reparación':
        return (
          <Button onClick={() => setShowReparacionModal(true)}>
            Completar Reparación
          </Button>
        );
      case 'En Pruebas':
        return (
          <Button onClick={() => setShowEntregaModal(true)}>
            Registrar Entrega
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className="flex justify-end mb-4">
        {renderAcciones()}
      </div>

      <DiagnosticoModal
        open={showDiagnosticoModal}
        onClose={() => setShowDiagnosticoModal(false)}
        ticket={ticket}
      />

      <PresupuestoModal
        open={showPresupuestoModal}
        onClose={() => setShowPresupuestoModal(false)}
        ticket={ticket}
      />

      <ReparacionModal
        open={showReparacionModal}
        onClose={() => setShowReparacionModal(false)}
        ticket={ticket}
      />

      <EntregaModal
        open={showEntregaModal}
        onClose={() => setShowEntregaModal(false)}
        ticket={ticket}
      />
    </>
  );
}; 