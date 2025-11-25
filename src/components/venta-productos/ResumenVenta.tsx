'use client';

import React from 'react';
import { Cliente } from '@/services/clienteServiceFrontend';

interface ProductoSeleccionado {
  id: number;
  nombre: string;
  sku: string;
  precio: number;
  stock: number;
  cantidad: number;
  subtotal: number;
}

interface ResumenVentaProps {
  cliente: Cliente | null;
  productos: ProductoSeleccionado[];
  total: number;
  metodoPago: 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA';
  referencia: string;
  onMetodoPagoChange: (metodo: 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA') => void;
  onReferenciaChange: (referencia: string) => void;
  onFinalizarVenta: () => void;
  loading: boolean;
}

export default function ResumenVenta({ 
  cliente, 
  productos, 
  total, 
  metodoPago,
  referencia,
  onMetodoPagoChange,
  onReferenciaChange,
  onFinalizarVenta, 
  loading 
}: ResumenVentaProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(price);
  };

  const canFinalizar = cliente && productos.length > 0 && metodoPago && !loading;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen de Venta</h3>
      
      {/* Información del cliente */}
      {cliente && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div className="font-medium text-blue-900">
            Cliente: {cliente.nombre} {cliente.apellido_paterno}
          </div>
          <div className="text-sm text-blue-700">
            {cliente.email} • {cliente.telefono_celular}
          </div>
        </div>
      )}

      {/* Resumen de productos */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Productos:</span>
          <span className="text-sm text-gray-600">{productos.length} items</span>
        </div>
        
        {productos.length > 0 && (
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {productos.map((producto) => (
              <div key={producto.id} className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {producto.nombre} × {producto.cantidad}
                </span>
                <span className="font-medium">{formatPrice(producto.subtotal)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Total */}
      <div className="border-t border-gray-200 pt-4 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold text-gray-900">Total:</span>
          <span className="text-xl font-bold text-blue-600">{formatPrice(total)}</span>
        </div>
      </div>

      {/* Método de pago */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Método de Pago *
        </label>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => onMetodoPagoChange('EFECTIVO')}
            className={`py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              metodoPago === 'EFECTIVO'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            💵 Efectivo
          </button>
          <button
            type="button"
            onClick={() => onMetodoPagoChange('TARJETA')}
            className={`py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              metodoPago === 'TARJETA'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            💳 Tarjeta
          </button>
          <button
            type="button"
            onClick={() => onMetodoPagoChange('TRANSFERENCIA')}
            className={`py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              metodoPago === 'TRANSFERENCIA'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🏦 Transferencia
          </button>
        </div>
      </div>

      {/* Referencia (solo para transferencia) */}
      {metodoPago === 'TRANSFERENCIA' && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Referencia de Transferencia (Opcional)
          </label>
          <input
            type="text"
            value={referencia}
            onChange={(e) => onReferenciaChange(e.target.value)}
            placeholder="Ej: 1234567890"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      {/* Botón de finalizar */}
      <div className="mt-6">
        <button
          onClick={onFinalizarVenta}
          disabled={!canFinalizar}
          className={`w-full py-3 px-4 rounded-md font-medium text-white transition-colors ${
            canFinalizar
              ? 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500'
              : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Procesando venta...
            </div>
          ) : (
            'Finalizar Venta'
          )}
        </button>
      </div>

      {/* Mensajes de validación */}
      {!cliente && (
        <div className="mt-3 text-sm text-orange-600">
          ⚠️ Debes seleccionar un cliente
        </div>
      )}
      
      {productos.length === 0 && (
        <div className="mt-3 text-sm text-orange-600">
          ⚠️ Debes agregar al menos un producto
        </div>
      )}

      {!metodoPago && (
        <div className="mt-3 text-sm text-orange-600">
          ⚠️ Debes seleccionar un método de pago
        </div>
      )}

      {/* Advertencias de stock */}
      {productos.some(p => p.cantidad > p.stock) && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="text-sm font-medium text-red-800">
            ⚠️ Algunos productos no tienen suficiente stock
          </div>
          <div className="text-xs text-red-600 mt-1">
            Revisa las cantidades antes de finalizar la venta
          </div>
        </div>
      )}
    </div>
  );
} 