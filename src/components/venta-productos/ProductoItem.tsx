'use client';

import React from 'react';

interface ProductoSeleccionado {
  id: number;
  nombre: string;
  sku: string;
  precio: number;
  stock: number;
  cantidad: number;
  subtotal: number;
}

interface ProductoItemProps {
  producto: ProductoSeleccionado;
  onCantidadChange: (productoId: number, cantidad: number) => void;
  onEliminar: (productoId: number) => void;
}

export default function ProductoItem({ producto, onCantidadChange, onEliminar }: ProductoItemProps) {
  const handleCantidadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nuevaCantidad = parseInt(e.target.value) || 1;
    if (nuevaCantidad > 0 && nuevaCantidad <= producto.stock) {
      onCantidadChange(producto.id, nuevaCantidad);
    }
  };

  const incrementarCantidad = () => {
    if (producto.cantidad < producto.stock) {
      onCantidadChange(producto.id, producto.cantidad + 1);
    }
  };

  const decrementarCantidad = () => {
    if (producto.cantidad > 1) {
      onCantidadChange(producto.id, producto.cantidad - 1);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(price);
  };

  return (
    <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
      <div className="flex-1">
        <div className="font-medium text-gray-900">{producto.nombre}</div>
        <div className="text-sm text-gray-600">
          SKU: {producto.sku} • Stock: {producto.stock}
        </div>
        <div className="text-sm font-medium text-blue-600">
          {formatPrice(producto.precio)} c/u
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {/* Controles de cantidad */}
        <div className="flex items-center space-x-2">
          <button
            onClick={decrementarCantidad}
            disabled={producto.cantidad <= 1}
            className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            -
          </button>
          <input
            type="number"
            min="1"
            max={producto.stock}
            value={producto.cantidad}
            onChange={handleCantidadChange}
            className="w-16 px-2 py-1 text-center border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={incrementarCantidad}
            disabled={producto.cantidad >= producto.stock}
            className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            +
          </button>
        </div>

        {/* Subtotal */}
        <div className="text-right min-w-[100px]">
          <div className="font-medium text-gray-900">
            {formatPrice(producto.subtotal)}
          </div>
          <div className="text-xs text-gray-500">
            {producto.cantidad} × {formatPrice(producto.precio)}
          </div>
        </div>

        {/* Botón eliminar */}
        <button
          onClick={() => onEliminar(producto.id)}
          className="px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md"
        >
          Eliminar
        </button>
      </div>

      {/* Advertencia de stock bajo */}
      {producto.stock <= 5 && (
        <div className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
          Stock bajo
        </div>
      )}
    </div>
  );
} 