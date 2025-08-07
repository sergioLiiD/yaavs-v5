'use client';

import React from 'react';
import { Venta } from '@/services/ventaService';
import { HiX, HiPrinter } from 'react-icons/hi';

interface ReciboVentaProps {
  venta: Venta;
  onClose: () => void;
}

export function ReciboVenta({ venta, onClose }: ReciboVentaProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(price);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Recibo de Venta</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
              title="Imprimir recibo"
            >
              <HiPrinter className="h-5 w-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
            >
              <HiX className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Contenido del recibo */}
        <div className="p-6 print:p-0">
          <div className="print:max-w-none">
            {/* Logo y información de la empresa */}
            <div className="text-center mb-6">
              <img
                src="/images/logo.png"
                alt="arregla.mx"
                className="h-16 mx-auto mb-4"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">arregla.mx</h1>
              <div className="text-sm text-gray-600 space-y-1">
                <p>Plaza Ecatepec local D1 y D2</p>
                <p>Tel. 56-3814-3944</p>
              </div>
            </div>

            {/* Información de la venta */}
            <div className="mb-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Cliente:</h3>
                  <div className="text-sm text-gray-600">
                    <p className="font-medium">
                      {venta.cliente?.nombre} {venta.cliente?.apellido_paterno}
                      {venta.cliente?.apellido_materno && ` ${venta.cliente.apellido_materno}`}
                    </p>
                    <p>{venta.cliente?.email}</p>
                    <p>{venta.cliente?.telefono_celular}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Fecha y Hora:</p>
                  <p className="font-medium">{formatDate(venta.fecha)}</p>
                  <p className="text-sm text-gray-600 mt-2">Venta #:</p>
                  <p className="font-medium">{venta.id}</p>
                </div>
              </div>
            </div>

            {/* Tabla de productos */}
            <div className="mb-6">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-2 font-semibold text-gray-900">Producto</th>
                    <th className="text-center py-2 px-2 font-semibold text-gray-900">Cantidad</th>
                    <th className="text-right py-2 px-2 font-semibold text-gray-900">Precio Unit.</th>
                    <th className="text-right py-2 px-2 font-semibold text-gray-900">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {venta.items?.map((item, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-3 px-2">
                        <div>
                          <div className="font-medium text-gray-900">{item.producto?.nombre}</div>
                          <div className="text-sm text-gray-500">SKU: {item.producto?.sku}</div>
                          {item.producto?.descripcion && (
                            <div className="text-sm text-gray-500">{item.producto.descripcion}</div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-2 text-center text-gray-900">{item.cantidad}</td>
                      <td className="py-3 px-2 text-right text-gray-900">{formatPrice(item.precio_unitario)}</td>
                      <td className="py-3 px-2 text-right font-medium text-gray-900">{formatPrice(item.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total */}
            <div className="border-t border-gray-200 pt-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Total:</span>
                <span className="text-2xl font-bold text-[#FEBF19]">{formatPrice(venta.total)}</span>
              </div>
            </div>

            {/* Leyenda de garantía */}
            <div className="text-center text-sm text-gray-600 border-t border-gray-200 pt-4">
              <p className="font-medium">Garantía válida por 30 días</p>
              <p className="mt-1">Gracias por su compra</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 