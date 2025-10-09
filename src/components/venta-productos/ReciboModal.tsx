'use client';

import React from 'react';
import { X } from 'lucide-react';

interface Venta {
  id: number;
  cliente_id: number;
  usuario_id: number;
  fecha: string;
  total: number;
  estado: string;
  created_at: string;
  updated_at: string;
  detalle_ventas: DetalleVenta[];
}

interface DetalleVenta {
  id: number;
  venta_id: number;
  producto_id: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  created_at: string;
  updated_at: string;
  productos?: {
    id: number;
    nombre: string;
    sku: string;
  };
}

interface ReciboModalProps {
  venta: Venta;
  isOpen: boolean;
  onClose: () => void;
  onNuevaVenta: () => void;
}

export default function ReciboModal({ venta, isOpen, onClose, onNuevaVenta }: ReciboModalProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Recibo de Venta #${venta.id}</title>
        <meta charset="UTF-8">
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
            font-weight: bold;
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
            margin-bottom: 3mm;
            page-break-inside: avoid;
          }
          
          .section-title {
            font-size: 10px;
            font-weight: bold;
            color: #000;
            border-bottom: 1px solid #000;
            padding-bottom: 1mm;
            margin-bottom: 2mm;
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
          }
          
          .info-value {
            font-size: 9px;
            font-weight: bold;
            color: #000;
            flex: 1;
            text-align: right;
            word-break: break-word;
          }
          
          .productos-table {
            width: 100%;
            border-collapse: collapse;
            margin: 2mm 0;
            font-size: 8px;
          }
          
          .productos-table th {
            border: 1px solid #000;
            padding: 1mm;
            text-align: left;
            font-weight: bold;
            background: white;
            color: #000;
          }
          
          .productos-table td {
            border: 1px solid #000;
            padding: 1mm;
            font-weight: bold;
            color: #000;
          }
          
          .productos-table .text-right {
            text-align: right;
          }
          
          .productos-table .text-center {
            text-align: center;
          }
          
          .total-section {
            border: 2px solid #000;
            padding: 2mm;
            margin-top: 3mm;
            text-align: center;
          }
          
          .total-label {
            font-size: 10px;
            font-weight: bold;
            text-transform: uppercase;
            color: #000;
            margin-bottom: 1mm;
          }
          
          .total-value {
            font-size: 14px;
            font-weight: bold;
            color: #000;
          }
          
          .garantia-section {
            border: 1px solid #000;
            padding: 2mm;
            margin: 2mm 0;
          }
          
          .garantia-title {
            font-size: 9px;
            font-weight: bold;
            color: #000;
            text-transform: uppercase;
            margin-bottom: 1mm;
          }
          
          .garantia-text {
            font-size: 8px;
            font-weight: bold;
            color: #000;
            line-height: 1.3;
          }
          
          .footer {
            margin-top: 3mm;
            text-align: center;
            font-size: 8px;
            font-weight: bold;
            color: #000;
            border-top: 1px solid #000;
            padding-top: 2mm;
          }
          
          .separator {
            border-top: 1px solid #000;
            margin: 2mm 0;
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
          <!-- Header -->
          <div class="header">
            <img src="/logo.png" alt="Arregla.mx" class="logo" onerror="this.style.display='none'">
            <div class="ticket-title">RECIBO DE VENTA</div>
            <div class="ticket-subtitle">Arregla.mx - Plaza Ecatepec local D1 y D2</div>
            <div class="ticket-number">Venta #${venta.id}</div>
          </div>
          
          <!-- Información de la venta -->
          <div class="section">
            <div class="section-title">INFORMACIÓN</div>
            <div class="info-item">
              <div class="info-label">Número de Venta:</div>
              <div class="info-value">#${venta.id}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Fecha:</div>
              <div class="info-value">${formatDate(venta.created_at)}</div>
            </div>
          </div>
          
          <!-- Productos -->
          <div class="section">
            <div class="section-title">PRODUCTOS</div>
            <table class="productos-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th class="text-center">Cant.</th>
                  <th class="text-right">P.U.</th>
                  <th class="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                ${venta.detalle_ventas.map(detalle => `
                  <tr>
                    <td>${detalle.productos?.nombre || `Producto #${detalle.producto_id}`}</td>
                    <td class="text-center">${detalle.cantidad}</td>
                    <td class="text-right">${formatPrice(detalle.precio_unitario)}</td>
                    <td class="text-right">${formatPrice(detalle.subtotal)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          
          <!-- Total -->
          <div class="total-section">
            <div class="total-label">TOTAL</div>
            <div class="total-value">${formatPrice(venta.total)} MXN</div>
          </div>
          
          <!-- Garantía -->
          <div class="garantia-section">
            <div class="garantia-title">GARANTÍA</div>
            <div class="garantia-text">
              Los productos cuentan con garantía de 30 días a partir de la fecha de compra.
              Conserve este ticket para hacer válida su garantía.
            </div>
          </div>
          
          <!-- Footer -->
          <div class="footer">
            <div>Arregla.mx</div>
            <div>Plaza Ecatepec local D1 y D2</div>
            <div>Tel: 56-3814-3944</div>
            <div style="margin-top: 2mm; font-size: 7px;">
              ¡Gracias por su compra!
            </div>
          </div>
        </div>
      </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    
    // Imprimir después de que se cargue el contenido
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Recibo de Venta #{venta.id}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6">
          <div className="bg-white rounded-lg">
            {/* Encabezado del recibo */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                              <img 
                src="/logo.png" 
                alt="Arregla.mx" 
                className="h-16 w-auto"
              />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">RECIBO DE VENTA</h1>
              <div className="text-sm text-gray-600">
                Arregla.mx, Plaza Ecatepec local D1 y D2, tel. 56-3814-3944
              </div>
            </div>

            {/* Información de la venta */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">Número de Venta:</div>
                <div className="text-lg font-semibold text-gray-900">#{venta.id}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">Fecha y Hora:</div>
                <div className="text-lg font-semibold text-gray-900">{formatDate(venta.created_at)}</div>
              </div>
            </div>

            {/* Tabla de productos */}
            <div className="mb-6">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="text-left py-2 px-4 font-semibold text-gray-900">Producto</th>
                    <th className="text-center py-2 px-4 font-semibold text-gray-900">Cantidad</th>
                    <th className="text-right py-2 px-4 font-semibold text-gray-900">Precio Unit.</th>
                    <th className="text-right py-2 px-4 font-semibold text-gray-900">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {venta.detalle_ventas.map((detalle, index) => (
                    <tr key={detalle.id} className="border-b border-gray-200">
                      <td className="py-3 px-4 text-gray-900">
                        {detalle.productos?.nombre || `Producto #${detalle.producto_id}`}
                      </td>
                      <td className="py-3 px-4 text-center text-gray-900">
                        {detalle.cantidad}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-900">
                        {formatPrice(detalle.precio_unitario)}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-gray-900">
                        {formatPrice(detalle.subtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total */}
            <div className="border-t-2 border-gray-300 pt-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-gray-900">TOTAL:</span>
                <span className="text-2xl font-bold text-blue-600">{formatPrice(venta.total)}</span>
              </div>
            </div>

            {/* Garantía */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium text-gray-900 mb-1">Garantía:</div>
              <div className="text-sm text-gray-700">Garantía válida por 30 días</div>
            </div>

            {/* Botones de acción */}
            <div className="flex space-x-4">
              <button
                onClick={handlePrint}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-md font-medium hover:bg-blue-700 transition-colors"
              >
                Imprimir Recibo
              </button>
              <button
                onClick={onNuevaVenta}
                className="flex-1 bg-[#FEBF19] text-white py-3 px-6 rounded-md font-medium hover:bg-[#E6AC17] transition-colors"
              >
                Nueva Venta
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-md font-medium hover:bg-gray-700 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 