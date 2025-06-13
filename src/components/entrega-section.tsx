import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Ticket } from '@/types/ticket';
import { TicketStatusBadge } from '@/components/tickets/TicketStatusBadge';

interface EntregaSectionProps {
  ticket: Ticket;
  onUpdate: () => void;
}

export const EntregaSection: React.FC<EntregaSectionProps> = ({ ticket, onUpdate }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Entrega</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium">Estado de la Entrega</h3>
            <TicketStatusBadge status={ticket.estatusReparacion?.nombre || ""} />
          </div>

          {ticket.reparacion && (
            <>
              <div>
                <h3 className="font-medium">Fecha de Entrega</h3>
                <p className="text-gray-500">
                  {ticket.reparacion.fechaFin
                    ? new Date(ticket.reparacion.fechaFin).toLocaleDateString()
                    : 'No se ha entregado'}
                </p>
              </div>

              <div>
                <h3 className="font-medium">Observaciones</h3>
                <p className="text-gray-500">
                  {ticket.reparacion.observaciones || 'Sin observaciones'}
                </p>
              </div>
            </>
          )}

          <Button onClick={onUpdate} disabled={ticket.estatusReparacion?.nombre === 'Entregado'}>
            {ticket.estatusReparacion?.nombre === 'Entregado'
              ? 'Entregado'
              : 'Registrar Entrega'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}; 