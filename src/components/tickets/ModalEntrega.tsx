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
  onUpdate?: () => void;
}

export function ModalEntrega({ ticket, presupuesto, pagos, onClose, onUpdate }: ModalEntregaProps) {
  const [firma, setFirma] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  const entregarMutation = useMutation({
    mutationFn: async () => {
      console.log('🚀 [ENTREGA] Iniciando petición de entrega para ticket:', ticket.id);
      const response = await axiosInstance.post(`/api/tickets/${ticket.id}/entregar`, {
        firma
      });
      console.log('✅ [ENTREGA] Respuesta recibida:', response.data);
      return response.data;
    },
    onSuccess: (data) => {
      console.log('✅ [ENTREGA] Entrega exitosa, datos:', data);
      toast.success('Equipo entregado exitosamente');
      queryClient.invalidateQueries({ queryKey: ['ticket', ticket.id] });
      console.log('🔄 [ENTREGA] Cerrando modal...');
      onClose();
      // Llamar al callback onUpdate para refrescar la página padre
      console.log('🔄 [ENTREGA] onUpdate disponible?', !!onUpdate);
      if (onUpdate) {
        console.log('🔄 [ENTREGA] Llamando onUpdate para refrescar página...');
        onUpdate();
      }
    },
    onError: (error: any) => {
      console.error('❌ [ENTREGA] Error al entregar:', error);
      console.error('❌ [ENTREGA] Detalles del error:', error.response?.data);
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
              <style>
                @page {
                  size: 100mm auto;
                  margin: 2mm;
                }
                
                body {
                  font-family: 'Courier New', monospace;
                  margin: 0;
                  padding: 0;
                  font-size: 10px;
                  line-height: 1.2;
                  color: #000000;
                  background: white;
                }
                
                .ticket-container {
                  max-width: 96mm;
                  margin: 0 auto;
                  background: white;
                }
                
                .header {
                  text-align: center;
                  border-bottom: 1px solid #000;
                  padding-bottom: 3mm;
                  margin-bottom: 3mm;
                }
                
                .logo {
                  height: 15mm;
                  width: auto;
                  margin-bottom: 2mm;
                }
                
                .ticket-title {
                  font-size: 12px;
                  font-weight: bold;
                  color: #000;
                  margin-bottom: 1mm;
                  text-transform: uppercase;
                }
                
                .ticket-subtitle {
                  font-size: 9px;
                  color: #000;
                  margin-bottom: 2mm;
                }
                
                .ticket-number {
                  font-size: 11px;
                  font-weight: bold;
                  color: #000;
                  border: 1px solid #000;
                  padding: 2mm 4mm;
                  display: inline-block;
                }
                
                .section {
                  margin-bottom: 2mm;
                  page-break-inside: avoid;
                }
                
                .section-title {
                  font-size: 10px;
                  font-weight: bold;
                  color: #000;
                  border-bottom: 1px solid #000;
                  padding-bottom: 1mm;
                  margin-bottom: 1mm;
                  text-transform: uppercase;
                }
                
                .info-item {
                  margin-bottom: 1mm;
                  display: flex;
                  justify-content: space-between;
                  align-items: flex-start;
                }
                
                .info-label {
                  font-size: 8px;
                  color: #000;
                  text-transform: uppercase;
                  font-weight: bold;
                  margin-right: 2mm;
                  flex-shrink: 0;
                  width: 25mm;
                }
                
                .info-value {
                  font-size: 9px;
                  font-weight: bold;
                  color: #000;
                  flex: 1;
                  word-break: break-word;
                }
                
                .financial-grid {
                  display: grid;
                  grid-template-columns: 1fr 1fr 1fr;
                  gap: 1mm;
                  margin: 2mm 0;
                }
                
                .financial-item {
                  border: 1px solid #000;
                  padding: 1mm;
                  text-align: center;
                }
                
                .financial-label {
                  font-size: 8px;
                  font-weight: bold;
                  color: #000;
                  text-transform: uppercase;
                }
                
                .financial-value {
                  font-size: 10px;
                  font-weight: bold;
                  color: #000;
                  margin-top: 1mm;
                }
                
                .pagos-list {
                  border: 1px solid #000;
                  padding: 1mm;
                  margin: 1mm 0;
                }
                
                .pago-item {
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  padding: 0.5mm 0;
                  border-bottom: 1px solid #000;
                  font-size: 8px;
                  font-weight: bold;
                }
                
                .pago-item:last-child {
                  border-bottom: none;
                }
                
                .receipt-section {
                  border: 1px solid #000;
                  padding: 2mm;
                  margin: 2mm 0;
                }
                
                .signature-space {
                  border: 1px solid #000;
                  padding: 2mm;
                  margin: 1mm 0;
                  min-height: 15mm;
                  text-align: center;
                }
                
                .signature-text {
                  font-size: 8px;
                  font-weight: bold;
                  color: #000;
                }
                
                .warranty-section {
                  border: 1px solid #000;
                  padding: 1mm;
                  margin: 1mm 0;
                }
                
                .warranty-title {
                  font-size: 9px;
                  font-weight: bold;
                  color: #000;
                  text-transform: uppercase;
                  margin-bottom: 1mm;
                }
                
                .warranty-text {
                  font-size: 7px;
                  font-weight: bold;
                  color: #000;
                  line-height: 1.3;
                }
                
                .footer {
                  margin-top: 2mm;
                  text-align: center;
                  font-size: 8px;
                  font-weight: bold;
                  color: #000;
                  border-top: 1px solid #000;
                  padding-top: 1mm;
                }
                
                .separator {
                  border-top: 1px solid #000;
                  margin: 1mm 0;
                }
                
                @media print {
                  body {
                    -webkit-print-color-adjust: exact;
                    color-adjust: exact;
                  }
                  
                  .ticket-container {
                    max-width: none;
                  }
                }
              </style>
            </head>
            <body>
              <div class="ticket-container">
                <div class="header">
                  <img src="/logo.png" alt="Arregla.mx" class="logo" onerror="this.style.display='none'">
                  <div class="ticket-title">ACTA DE ENTREGA</div>
                  <div class="ticket-subtitle">Arregla.mx - Plaza Ecatepec local D1 y D2</div>
                  <div class="ticket-number">Ticket #${ticket.numero_ticket}</div>
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
        <div id="print-content" className="p-6">
          {/* Información del equipo */}
          <div className="section mb-6">
            <div className="section-title font-bold text-lg mb-3 pb-2 border-b-2 border-gray-800">EQUIPO</div>
            <div className="space-y-2">
              <div className="info-item flex justify-between">
                <div className="info-label font-semibold text-sm text-gray-700">Cliente:</div>
                <div className="info-value text-sm text-right">{ticket.clientes?.nombre} {ticket.clientes?.apellido_paterno} {ticket.clientes?.apellido_materno}</div>
              </div>
              <div className="info-item flex justify-between">
                <div className="info-label font-semibold text-sm text-gray-700">Equipo:</div>
                <div className="info-value text-sm text-right">{ticket.modelos?.marcas?.nombre} {ticket.modelos?.nombre}</div>
              </div>
              <div className="info-item flex justify-between">
                <div className="info-label font-semibold text-sm text-gray-700">IMEI:</div>
                <div className="info-value text-sm text-right">{ticket.imei || 'N/A'}</div>
              </div>
              <div className="info-item flex justify-between">
                <div className="info-label font-semibold text-sm text-gray-700">Color:</div>
                <div className="info-value text-sm text-right">{ticket.color || 'N/A'}</div>
              </div>
              <div className="info-item flex justify-between">
                <div className="info-label font-semibold text-sm text-gray-700">Fecha:</div>
                <div className="info-value text-sm text-right">{new Date(ticket.fecha_recepcion).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
              </div>
              {ticket.descripcion_problema && (
                <div className="info-item flex justify-between">
                  <div className="info-label font-semibold text-sm text-gray-700">Problema:</div>
                  <div className="info-value text-sm text-right">{ticket.descripcion_problema.length > 30 ? ticket.descripcion_problema.substring(0, 30) + '...' : ticket.descripcion_problema}</div>
                </div>
              )}
            </div>
          </div>

          {/* Información financiera compacta */}
          <div className="section mb-6">
            <div className="section-title font-bold text-lg mb-3 pb-2 border-b-2 border-gray-800">FINANCIERO</div>
            <div className="financial-grid grid grid-cols-3 gap-4 mb-4">
              <div className="financial-item border-2 border-gray-800 p-3 text-center">
                <div className="financial-label text-xs font-bold text-gray-700 uppercase">Presupuesto</div>
                <div className="financial-value text-xl font-bold mt-2">${(presupuesto?.total || 0).toFixed(0)}</div>
              </div>
              <div className="financial-item border-2 border-gray-800 p-3 text-center">
                <div className="financial-label text-xs font-bold text-gray-700 uppercase">Pagado</div>
                <div className="financial-value text-xl font-bold mt-2">${pagos.reduce((sum, pago) => sum + pago.monto, 0).toFixed(0)}</div>
              </div>
              <div className="financial-item border-2 border-gray-800 p-3 text-center">
                <div className="financial-label text-xs font-bold text-gray-700 uppercase">Saldo</div>
                <div className="financial-value text-xl font-bold mt-2">$0</div>
              </div>
            </div>
            
            {pagos.length > 0 && (
              <div className="pagos-list border-2 border-gray-800 p-2">
                {pagos.map((pago, index) => (
                  <div key={index} className="pago-item flex justify-between py-1 border-b border-gray-800 last:border-b-0">
                    <span className="text-sm font-semibold">{pago.metodo} - {pago.referencia}</span>
                    <span className="text-sm font-bold">${pago.monto.toFixed(0)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recibo de entrega */}
          <div className="section mb-6">
            <div className="section-title font-bold text-lg mb-3 pb-2 border-b-2 border-gray-800">RECIBO</div>
            <div className="receipt-section border-2 border-gray-800 p-4 mb-3">
              <div className="space-y-2">
                <div className="info-item flex justify-between">
                  <div className="info-label font-semibold text-sm text-gray-700">Recibe:</div>
                  <div className="info-value text-sm text-right">{ticket.clientes?.nombre} {ticket.clientes?.apellido_paterno}</div>
                </div>
                <div className="info-item flex justify-between">
                  <div className="info-label font-semibold text-sm text-gray-700">Equipo:</div>
                  <div className="info-value text-sm text-right">{ticket.modelos?.marcas?.nombre} {ticket.modelos?.nombre}</div>
                </div>
                <div className="info-item flex justify-between">
                  <div className="info-label font-semibold text-sm text-gray-700">Fecha:</div>
                  <div className="info-value text-sm text-right">{fechaActual}</div>
                </div>
                <div className="info-item flex justify-between">
                  <div className="info-label font-semibold text-sm text-gray-700">Entregado por:</div>
                  <div className="info-value text-sm text-right">{session?.user?.name || 'Sistema'}</div>
                </div>
              </div>
            </div>
            
            <div className="signature-space border-2 border-gray-800 p-6 text-center min-h-[80px]">
              <div className="signature-text text-sm font-bold">
                FIRMA DEL CLIENTE<br/>
                <span className="text-xs text-gray-500">(Firmar después de imprimir)</span>
              </div>
            </div>
          </div>

          {/* Garantía compacta */}
          <div className="section mb-6">
            <div className="warranty-section border-2 border-gray-800 p-3">
              <div className="warranty-title text-sm font-bold mb-2 uppercase">GARANTIA</div>
              <div className="warranty-text text-xs font-semibold leading-relaxed">
                NO APLICA: Equipos mojados, intervenidos, display roto, bateria inflada, perifericos rotos. 
                No garantia por humedad en cualquier servicio.
              </div>
            </div>
          </div>

          <div className="footer text-center text-xs font-semibold text-gray-600 border-t-2 border-gray-800 pt-3">
            <p>Generado por Arregla.mx</p>
            <p>{new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
          </div>
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
