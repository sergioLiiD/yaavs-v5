'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { formatCurrency } from '@/lib/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axios';
import { toast } from 'sonner';

interface ModalEntregaProps {
  ticket: any;
  presupuesto: any;
  pagos: any[];
  onClose: () => void;
}

export function ModalEntrega({ ticket, presupuesto, pagos, onClose }: ModalEntregaProps) {
  const [firma, setFirma] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  const entregarMutation = useMutation({
    mutationFn: async () => {
      const response = await axiosInstance.post(`/api/tickets/${ticket.id}/entregar`, {
        firma
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Equipo entregado exitosamente');
      queryClient.invalidateQueries({ queryKey: ['ticket', ticket.id] });
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al entregar el equipo');
    }
  });

  const handleImprimir = () => {
    const printContent = document.getElementById('print-content');
    if (printContent) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Acta de Entrega - ${ticket.numero_ticket}</title>
              <script src="https://cdn.tailwindcss.com"></script>
              <style>
                @media print {
                  body { margin: 0; padding: 20px; }
                  .no-print { display: none; }
                  .print-page { page-break-inside: avoid; }
                }
                body { font-family: system-ui, -apple-system, sans-serif; }
                .card { border: 1px solid #e5e7eb; border-radius: 0.5rem; background: white; }
                .card-header { padding: 1.5rem; border-bottom: 1px solid #e5e7eb; }
                .card-title { font-size: 1.25rem; font-weight: 600; color: #111827; }
                .card-content { padding: 1.5rem; }
                .grid { display: grid; }
                .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
                .gap-4 { gap: 1rem; }
                .space-y-4 > * + * { margin-top: 1rem; }
                .space-y-6 > * + * { margin-top: 1.5rem; }
                .font-semibold { font-weight: 600; }
                .text-sm { font-size: 0.875rem; }
                .text-lg { font-size: 1.125rem; }
                .text-gray-600 { color: #4b5563; }
                .text-blue-600 { color: #2563eb; }
                .text-green-600 { color: #16a34a; }
                .text-red-600 { color: #dc2626; }
                .text-2xl { font-size: 1.5rem; }
                .font-bold { font-weight: 700; }
                .text-center { text-align: center; }
                .p-4 { padding: 1rem; }
                .bg-blue-50 { background-color: #eff6ff; }
                .bg-green-50 { background-color: #f0fdf4; }
                .bg-red-50 { background-color: #fef2f2; }
                .bg-gray-50 { background-color: #f9fafb; }
                .rounded-lg { border-radius: 0.5rem; }
                .border-2 { border-width: 2px; }
                .border-dashed { border-style: dashed; }
                .border-gray-300 { border-color: #d1d5db; }
                .flex { display: flex; }
                .items-center { align-items: center; }
                .justify-center { justify-content: center; }
                .min-h-\\[100px\\] { min-height: 6.25rem; }
                .text-gray-500 { color: #6b7280; }
                .text-center { text-align: center; }
                .list-disc { list-style-type: disc; }
                .list-inside { list-style-position: inside; }
                .space-y-2 > * + * { margin-top: 0.5rem; }
                .space-y-3 > * + * { margin-top: 0.75rem; }
                .mt-4 { margin-top: 1rem; }
                .font-semibold { font-weight: 600; }
                .text-red-600 { color: #dc2626; }
                .space-y-2 > * + * { margin-top: 0.5rem; }
                .list-disc { list-style-type: disc; }
                .list-inside { list-style-position: inside; }
                .mt-4 { margin-top: 1rem; }
                .font-semibold { font-weight: 600; }
                .text-red-600 { color: #dc2626; }
                .font-mono { font-family: ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace; }
                .separator { height: 1px; background-color: #e5e7eb; margin: 1.5rem 0; }
                .badge { display: inline-flex; align-items: center; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 500; }
                .badge-outline { border: 1px solid #e5e7eb; background-color: transparent; color: #374151; }
                .logo { height: 3rem; width: auto; }
              </style>
            </head>
            <body class="bg-gray-50">
              <div class="max-w-4xl mx-auto bg-white shadow-sm">
                <!-- Header con logo -->
                <div class="p-6 border-b">
                  <div class="flex items-center space-x-4">
                    <img src="/logo.png" alt="Logo" class="logo" />
                    <div>
                      <h2 class="text-2xl font-bold">Acta de Entrega</h2>
                      <p class="text-gray-600">Ticket: ${ticket.numero_ticket}</p>
                    </div>
                  </div>
                </div>
                ${printContent.innerHTML}
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  const handleEntregar = async () => {
    setIsSubmitting(true);
    try {
      await entregarMutation.mutateAsync();
    } finally {
      setIsSubmitting(false);
    }
  };

  const fechaActual = new Date().toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header con logo */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img src="/logo.png" alt="Logo" className="h-12 w-auto" />
              <div>
                <h2 className="text-2xl font-bold">Acta de Entrega</h2>
                <p className="text-gray-600">Ticket: {ticket.numero_ticket}</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={handleImprimir}>
                🖨️ Imprimir
              </Button>
              <Button variant="outline" onClick={onClose}>
                ✕
              </Button>
            </div>
          </div>
        </div>

        {/* Contenido imprimible */}
        <div id="print-content" className="p-6 space-y-6">
          {/* Información del ticket */}
          <Card>
            <CardHeader>
              <CardTitle>Información del Equipo</CardTitle>
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
                  <h4 className="font-semibold text-sm text-gray-600">IMEI</h4>
                  <p className="text-lg font-mono">{ticket.imei || 'No registrado'}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-gray-600">Color</h4>
                  <p className="text-lg">{ticket.color || 'No especificado'}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-gray-600">Capacidad</h4>
                  <p className="text-lg">{ticket.capacidad || 'No especificada'}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-gray-600">Fecha de Recepción</h4>
                  <p className="text-lg">
                    {new Date(ticket.fecha_recepcion).toLocaleDateString('es-MX')}
                  </p>
                </div>
              </div>

              {ticket.descripcion_problema && (
                <div>
                  <h4 className="font-semibold text-sm text-gray-600">Descripción del Problema</h4>
                  <p className="text-lg">{ticket.descripcion_problema}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Información de reparación */}
          {ticket.reparaciones && (
            <Card>
              <CardHeader>
                <CardTitle>Información de Reparación</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {ticket.reparaciones.diagnostico && (
                  <div>
                    <h4 className="font-semibold text-sm text-gray-600">Diagnóstico</h4>
                    <p className="text-lg">{ticket.reparaciones.diagnostico}</p>
                  </div>
                )}
                {ticket.reparaciones.solucion && (
                  <div>
                    <h4 className="font-semibold text-sm text-gray-600">Solución Aplicada</h4>
                    <p className="text-lg">{ticket.reparaciones.solucion}</p>
                  </div>
                )}
                {ticket.reparaciones.observaciones && (
                  <div>
                    <h4 className="font-semibold text-sm text-gray-600">Observaciones</h4>
                    <p className="text-lg">{ticket.reparaciones.observaciones}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Información financiera */}
          <Card>
            <CardHeader>
              <CardTitle>Información Financiera</CardTitle>
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
                    {formatCurrency(0)}
                  </p>
                </div>
              </div>

              {/* Detalle de pagos */}
              {pagos.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm text-gray-600 mb-2">Detalle de Pagos</h4>
                  <div className="space-y-2">
                    {pagos.map((pago, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span>{pago.metodo} - {pago.referencia}</span>
                        <span className="font-semibold">{formatCurrency(pago.monto)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recibo con firma */}
          <Card>
            <CardHeader>
              <CardTitle>Recibo de Entrega</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-lg">
                  Yo, <strong>{ticket.clientes?.nombre} {ticket.clientes?.apellido_paterno} {ticket.clientes?.apellido_materno}</strong>, 
                  recibo el equipo <strong>{ticket.modelos?.marcas?.nombre} {ticket.modelos?.nombre}</strong> 
                  el día <strong>{fechaActual}</strong>.
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Entregado por: <strong>{session?.user?.name || 'Usuario del sistema'}</strong>
                </p>
              </div>

              <div>
                <Label htmlFor="firma">Espacio para Firma del Cliente</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 min-h-[100px] flex items-center justify-center bg-gray-50">
                  <p className="text-gray-500 text-center">
                    Espacio reservado para firma física del cliente<br/>
                    <span className="text-sm">(Se firmará después de imprimir)</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Políticas de garantía */}
          <Card>
            <CardHeader>
              <CardTitle>Políticas de Garantía</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <p className="font-semibold text-red-600">IMPORTANTE: No se hará válida la garantía en los siguientes casos:</p>
                <ul className="space-y-2 list-disc list-inside">
                  <li><strong>Teléfonos intervenidos:</strong> Sello de seguridad roto</li>
                  <li><strong>Display:</strong> Mojado, roto, manchado, o en rayas de colores</li>
                  <li><strong>Centro de carga:</strong> Roto o mojado</li>
                  <li><strong>Batería:</strong> Baterías infladas</li>
                  <li><strong>Tapas:</strong> Rotas</li>
                  <li><strong>Periféricos:</strong> Cámaras, flexores, bocinas, etc. rotos o mojados</li>
                  <li><strong>Equipos mojados:</strong> Prendidos o apagados, corren el riesgo de no encender debido a electrólisis</li>
                </ul>
                <p className="font-semibold text-red-600 mt-4">
                  No aplica garantía a ningún equipo que presente rastros de humedad, en cualquier servicio que se haya realizado.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer con botones */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex justify-end space-x-4">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button 
              onClick={handleEntregar}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? 'Entregando...' : 'Confirmar Entrega'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
