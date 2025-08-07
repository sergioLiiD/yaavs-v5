'use client';

import React from 'react';
import { ProductoVenta } from '@/services/productoService';
import { HiPackage, HiTrash, HiMinus, HiPlus } from 'react-icons/hi';

interface ProductoSeleccionado {
  producto: ProductoVenta;
  cantidad: number;
  subtotal: number;
}

interface ProductoItemProps {
  item: ProductoSeleccionado;
  onCantidadChange: (cantidad: number) => void;
  onEliminar: () => void;
}

export function ProductoItem({ item, onCantidadChange, onEliminar }: ProductoItemProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(price);
  };

  const handleCantidadChange = (newCantidad: number) => {
    if (newCantidad < 1) return;
    if (newCantidad > item.producto.stock) {
      alert(`Stock insuficiente. Solo hay ${item.producto.stock} unidades disponibles.`);
      return;
    }
    onCantidadChange(newCantidad);
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="flex items-center space-x-4 flex-1">
        <HiPackage className="h-8 w-8 text-[#FEBF19]" />
        
        <div className="flex-1">
          <div className="font-medium text-gray-900">{item.producto.nombre}</div>
          <div className="text-sm text-gray-500">
            SKU: {item.producto.sku} • Stock disponible: {item.producto.stock}
          </div>
          {item.producto.descripcion && (
            <div className="text-sm text-gray-600 mt-1">{item.producto.descripcion}</div>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Controles de cantidad */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleCantidadChange(item.cantidad - 1)}
            disabled={item.cantidad <= 1}
            className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <HiMinus className="h-4 w-4" />
          </button>
          
          <span className="w-12 text-center font-medium">{item.cantidad}</span>
          
          <button
            onClick={() => handleCantidadChange(item.cantidad + 1)}
            disabled={item.cantidad >= item.producto.stock}
            className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <HiPlus className="h-4 w-4" />
          </button>
        </div>

        {/* Precio unitario */}
        <div className="text-right">
          <div className="text-sm text-gray-500">
            {formatPrice(item.producto.precio)} c/u
          </div>
        </div>

        {/* Subtotal */}
        <div className="text-right min-w-[100px]">
          <div className="font-medium text-gray-900">
            {formatPrice(item.subtotal)}
          </div>
        </div>

        {/* Botón eliminar */}
        <button
          onClick={onEliminar}
          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md"
          title="Eliminar producto"
        >
          <HiTrash className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
} 