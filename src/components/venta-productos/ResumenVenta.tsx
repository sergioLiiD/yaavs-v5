'use client';

import React from 'react';
import { Cliente } from '@/types/cliente';
import { HiShoppingCart, HiCheck } from 'react-icons/hi';

interface ResumenVentaProps {
  total: number;
  productosCount: number;
  clienteSeleccionado: Cliente | null;
  onCreateVenta: () => void;
  isLoading: boolean;
}

export function ResumenVenta({ 
  total, 
  productosCount, 
  clienteSeleccionado, 
  onCreateVenta, 
  isLoading 
}: ResumenVentaProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(price);
  };

  const canCreateVenta = clienteSeleccionado && productosCount > 0 && !isLoading;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Resumen de Venta</h3>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <HiShoppingCart className="h-4 w-4" />
          <span>{productosCount} {productosCount === 1 ? 'producto' : 'productos'}</span>
        </div>
      </div>

      {/* Información del cliente */}
      {clienteSeleccionado && (
        <div className="mb-4 p-3 bg-gray-50 rounded-md">
          <div className="text-sm text-gray-600 mb-1">Cliente:</div>
          <div className="font-medium text-gray-900">
            {clienteSeleccionado.nombre} {clienteSeleccionado.apellido_paterno}
            {clienteSeleccionado.apellido_materno && ` ${clienteSeleccionado.apellido_materno}`}
          </div>
          <div className="text-sm text-gray-500">
            {clienteSeleccionado.email} • {clienteSeleccionado.telefono_celular}
          </div>
        </div>
      )}

      {/* Total */}
      <div className="border-t border-gray-200 pt-4">
        <div className="flex items-center justify-between">
          <span className="text-lg font-medium text-gray-900">Total:</span>
          <span className="text-2xl font-bold text-[#FEBF19]">
            {formatPrice(total)}
          </span>
        </div>
      </div>

      {/* Validaciones */}
      <div className="mt-4 space-y-2">
        {!clienteSeleccionado && (
          <div className="flex items-center space-x-2 text-red-600 text-sm">
            <HiCheck className="h-4 w-4" />
            <span>Debe seleccionar un cliente</span>
          </div>
        )}
        {productosCount === 0 && (
          <div className="flex items-center space-x-2 text-red-600 text-sm">
            <HiCheck className="h-4 w-4" />
            <span>Debe agregar al menos un producto</span>
          </div>
        )}
        {clienteSeleccionado && productosCount > 0 && (
          <div className="flex items-center space-x-2 text-green-600 text-sm">
            <HiCheck className="h-4 w-4" />
            <span>Listo para crear la venta</span>
          </div>
        )}
      </div>

      {/* Botón crear venta */}
      <div className="mt-6">
        <button
          onClick={onCreateVenta}
          disabled={!canCreateVenta}
          className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-md font-medium text-white transition-colors ${
            canCreateVenta
              ? 'bg-[#FEBF19] hover:bg-[#FEBF19]/90'
              : 'bg-gray-300 cursor-not-allowed'
          }`}
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Creando venta...</span>
            </>
          ) : (
            <>
              <HiShoppingCart className="h-5 w-5" />
              <span>Crear Venta</span>
            </>
          )}
        </button>
      </div>

      {/* Información adicional */}
      <div className="mt-4 text-xs text-gray-500 text-center">
        <p>• Al crear la venta se descontará automáticamente el stock</p>
        <p>• Se generará un recibo con todos los detalles</p>
        <p>• La venta quedará registrada en el sistema</p>
      </div>
    </div>
  );
} 