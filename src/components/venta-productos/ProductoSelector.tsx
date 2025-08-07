'use client';

import React, { useState, useEffect } from 'react';
import { ProductoService, Producto } from '@/services/productoService';

interface ProductoSelectorProps {
  onProductoSeleccionado: (producto: Producto) => void;
}

export default function ProductoSelector({ onProductoSeleccionado }: ProductoSelectorProps) {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const buscarProductos = async (termino: string) => {
    if (termino.length < 2) {
      setProductos([]);
      return;
    }

    try {
      setIsLoading(true);
      const data = await ProductoService.buscarProductos(termino);
      // Filtrar solo productos (no servicios) y que tengan stock
      const productosFiltrados = data.filter(p => p.tipo === 'PRODUCTO' && p.stock > 0);
      setProductos(productosFiltrados);
      setShowDropdown(true);
    } catch (error) {
      console.error('Error al buscar productos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    setTerminoBusqueda(valor);
    
    if (valor.trim()) {
      buscarProductos(valor);
    } else {
      setProductos([]);
      setShowDropdown(false);
    }
  };

  const seleccionarProducto = (producto: Producto) => {
    onProductoSeleccionado(producto);
    setTerminoBusqueda('');
    setShowDropdown(false);
  };

  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Buscar productos por nombre o SKU..."
        value={terminoBusqueda}
        onChange={handleInputChange}
        onFocus={() => setShowDropdown(true)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {showDropdown && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {isLoading ? (
            <div className="px-4 py-2 text-gray-500">Cargando...</div>
          ) : productos.length > 0 ? (
            productos.map((producto) => (
              <div
                key={producto.id}
                onClick={() => seleccionarProducto(producto)}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
              >
                <div className="font-medium">{producto.nombre}</div>
                <div className="text-sm text-gray-600">
                  SKU: {producto.sku} • Stock: {producto.stock} • Precio: ${producto.precio_promedio}
                </div>
                {producto.stock <= 5 && (
                  <div className="text-xs text-orange-600 font-medium">
                    ¡Stock bajo! Solo quedan {producto.stock} unidades
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="px-4 py-2 text-gray-500">No se encontraron productos</div>
          )}
        </div>
      )}
    </div>
  );
} 