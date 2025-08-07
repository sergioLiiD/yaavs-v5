'use client';

import React from 'react';

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

interface ReciboVentaProps {
  venta: Venta;
  onNuevaVenta: () => void;
}

export default function ReciboVenta({ venta, onNuevaVenta }: ReciboVentaProps) {
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
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow-lg rounded-lg p-8 print:p-4">
        {/* Encabezado del recibo */}
        <div className="text-center mb-8 print:mb-4">
          <div className="flex items-center justify-center mb-4">
            <img 
              src="/images/logo.png" 
              alt="Arregla.mx" 
              className="h-16 w-auto print:h-12"
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">RECIBO DE VENTA</h1>
          <div className="text-sm text-gray-600">
            Arregla.mx, Plaza Ecatepec local D1 y D2, tel. 56-3814-3944
          </div>
        </div>

        {/* Información de la venta */}
        <div className="grid grid-cols-2 gap-6 mb-6 print:mb-4">
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
        <div className="mb-6 print:mb-4">
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
        <div className="border-t-2 border-gray-300 pt-4 mb-6 print:mb-4">
          <div className="flex justify-between items-center">
            <span className="text-xl font-bold text-gray-900">TOTAL:</span>
            <span className="text-2xl font-bold text-blue-600">{formatPrice(venta.total)}</span>
          </div>
        </div>

        {/* Garantía */}
        <div className="mb-6 print:mb-4 p-4 bg-gray-50 rounded-lg print:bg-transparent">
          <div className="text-sm font-medium text-gray-900 mb-1">Garantía:</div>
          <div className="text-sm text-gray-700">Garantía válida por 30 días</div>
        </div>

        {/* Botones de acción */}
        <div className="flex space-x-4 print:hidden">
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
        </div>

        {/* Estilos para impresión */}
        <style jsx>{`
          @media print {
            .print\\:hidden { display: none !important; }
            .print\\:mb-4 { margin-bottom: 1rem !important; }
            .print\\:p-4 { padding: 1rem !important; }
            .print\\:h-12 { height: 3rem !important; }
            .print\\:bg-transparent { background-color: transparent !important; }
          }
        `}</style>
      </div>
    </div>
  );
} 