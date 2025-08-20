'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ModalEntrega } from './ModalEntrega';
import { formatCurrency } from '@/lib/utils';

interface EntregaTabProps {
  ticket: any;
  presupuesto: any;
  pagos: any[];
  saldo: number;
}

export function EntregaTab({ ticket, presupuesto, pagos, saldo }: EntregaTabProps) {
  const [showModal, setShowModal] = useState(false);
  const { data: session } = useSession();

  const canDeliver = ticket.estatus_reparacion?.nombre === 'Reparado' && saldo === 0;

  const handleEntregar = () => {
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Información del ticket */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Información de Entrega</span>
            <Badge variant={ticket.entregado ? "default" : "secondary"}>
              {ticket.entregado ? "Entregado" : "Pendiente de entrega"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-sm text-gray-600">Cliente</h4>
              <p className="text-lg">
                {ticket.clientes?.nombre} {ticket.clientes?.apellido_paterno} {ticket.clientes?.apellido_materno}
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-gray-600">Equipo</h4>
              <p className="text-lg">
                {ticket.modelos?.marcas?.nombre} {ticket.modelos?.nombre}
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-gray-600">Estado</h4>
              <Badge variant="outline">
                {ticket.estatus_reparacion?.nombre}
              </Badge>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-gray-600">Número de Ticket</h4>
              <p className="text-lg font-mono">{ticket.numero_ticket}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Información financiera */}
      <Card>
        <CardHeader>
          <CardTitle>Estado de Pago</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-sm text-gray-600">Presupuesto</h4>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(presupuesto?.total || 0)}
              </p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-sm text-gray-600">Pagos Realizados</h4>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(pagos.reduce((sum, pago) => sum + pago.monto, 0))}
              </p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <h4 className="font-semibold text-sm text-gray-600">Saldo</h4>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(saldo)}
              </p>
            </div>
          </div>

          <Separator />

          <div className="text-center">
            {canDeliver ? (
              <div className="space-y-4">
                <p className="text-green-600 font-semibold">
                  ✅ El equipo está listo para ser entregado
                </p>
                <Button 
                  onClick={handleEntregar}
                  className="bg-green-600 hover:bg-green-700"
                  size="lg"
                >
                  ENTREGAR EQUIPO
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-red-600 font-semibold">
                  ❌ El equipo no puede ser entregado
                </p>
                <div className="text-sm text-gray-600 space-y-1">
                  {ticket.estatus_reparacion?.nombre !== 'Reparado' && (
                    <p>• El equipo debe estar reparado</p>
                  )}
                  {saldo > 0 && (
                    <p>• El saldo debe estar pagado completamente (saldo actual: {formatCurrency(saldo)})</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Información de entrega si ya fue entregado */}
      {ticket.entregado && ticket.fecha_entrega && (
        <Card>
          <CardHeader>
            <CardTitle>Información de Entrega</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-sm text-gray-600">Fecha de Entrega</h4>
                <p className="text-lg">
                  {new Date(ticket.fecha_entrega).toLocaleDateString('es-MX', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-gray-600">Entregado por</h4>
                <p className="text-lg">
                  {session?.user?.name || 'Usuario del sistema'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal de entrega */}
      {showModal && (
        <ModalEntrega
          ticket={ticket}
          presupuesto={presupuesto}
          pagos={pagos}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
