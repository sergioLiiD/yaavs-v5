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
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Recibo de Venta #${venta.id}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            .recibo { max-width: 800px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { height: 60px; margin-bottom: 10px; }
            .title { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
            .subtitle { font-size: 14px; color: #666; }
            .info { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
            .info-item { margin-bottom: 10px; }
            .info-label { font-size: 12px; color: #666; margin-bottom: 5px; }
            .info-value { font-size: 16px; font-weight: bold; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th { text-align: left; padding: 10px; border-bottom: 2px solid #333; font-weight: bold; }
            td { padding: 10px; border-bottom: 1px solid #ddd; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .total { border-top: 2px solid #333; padding-top: 20px; display: flex; justify-content: space-between; align-items: center; }
            .total-label { font-size: 20px; font-weight: bold; }
            .total-value { font-size: 24px; font-weight: bold; color: #2563eb; }
            .garantia { background: #f9fafb; padding: 15px; border-radius: 8px; margin-top: 30px; }
            .garantia-title { font-size: 14px; font-weight: bold; margin-bottom: 5px; }
            .garantia-text { font-size: 14px; color: #666; }
            @media print {
              body { margin: 0; }
              .recibo { max-width: none; }
            }
          </style>
        </head>
        <body>
          <div class="recibo">
            <div class="header">
              <img src="/images/logo.png" alt="Arregla.mx" class="logo" />
              <div class="title">RECIBO DE VENTA</div>
              <div class="subtitle">Arregla.mx, Plaza Ecatepec local D1 y D2, tel. 56-3814-3944</div>
            </div>
            
            <div class="info">
              <div class="info-item">
                <div class="info-label">Número de Venta:</div>
                <div class="info-value">#${venta.id}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Fecha y Hora:</div>
                <div class="info-value">${formatDate(venta.created_at)}</div>
              </div>
            </div>
            
            <table>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th class="text-center">Cantidad</th>
                  <th class="text-right">Precio Unit.</th>
                  <th class="text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${venta.detalle_ventas.map(detalle => `
                  <tr>
                    <td>Producto #${detalle.producto_id}</td>
                    <td class="text-center">${detalle.cantidad}</td>
                    <td class="text-right">${formatPrice(detalle.precio_unitario)}</td>
                    <td class="text-right">${formatPrice(detalle.subtotal)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <div class="total">
              <span class="total-label">TOTAL:</span>
              <span class="total-value">${formatPrice(venta.total)}</span>
            </div>
            
            <div class="garantia">
              <div class="garantia-title">Garantía:</div>
              <div class="garantia-text">Garantía válida por 30 días</div>
            </div>
          </div>
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
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
                  src="/images/logo.png" 
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
                        Producto #{detalle.producto_id}
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
                className="flex-1 bg-green-600 text-white py-3 px-6 rounded-md font-medium hover:bg-green-700 transition-colors"
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