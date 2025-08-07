'use client';

import React, { useState, useEffect } from 'react';
import { ProductoVenta, ProductoService } from '@/services/productoService';
import { HiSearch, HiPackage, HiPlus, HiX } from 'react-icons/hi';

interface ProductoSelectorProps {
  onProductoSeleccionado: (producto: ProductoVenta, cantidad: number) => void;
}

export function ProductoSelector({ onProductoSeleccionado }: ProductoSelectorProps) {
  const [productos, setProductos] = useState<ProductoVenta[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredProductos, setFilteredProductos] = useState<ProductoVenta[]>([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState<ProductoVenta | null>(null);
  const [cantidad, setCantidad] = useState(1);

  // Cargar productos al montar el componente
  useEffect(() => {
    cargarProductos();
  }, []);

  // Filtrar productos cuando cambia el término de búsqueda
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredProductos(productos);
    } else {
      const filtered = productos.filter(producto =>
        producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        producto.sku.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProductos(filtered);
    }
  }, [searchTerm, productos]);

  const cargarProductos = async () => {
    setIsLoading(true);
    try {
      const productosData = await ProductoService.getProductosVenta();
      setProductos(productosData);
      setFilteredProductos(productosData);
    } catch (error) {
      console.error('Error al cargar productos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProductoSelect = (producto: ProductoVenta) => {
    setProductoSeleccionado(producto);
    setCantidad(1);
    setShowDropdown(false);
  };

  const handleAgregarProducto = () => {
    if (!productoSeleccionado) return;
    
    if (cantidad > productoSeleccionado.stock) {
      alert(`Stock insuficiente. Solo hay ${productoSeleccionado.stock} unidades disponibles.`);
      return;
    }

    onProductoSeleccionado(productoSeleccionado, cantidad);
    
    // Limpiar selección
    setProductoSeleccionado(null);
    setCantidad(1);
    setSearchTerm('');
  };

  const handleClearSelection = () => {
    setProductoSeleccionado(null);
    setCantidad(1);
    setSearchTerm('');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(price);
  };

  return (
    <div className="space-y-4">
      {/* Búsqueda de productos */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <HiSearch className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Buscar producto por nombre o SKU..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-[#FEBF19] focus:border-[#FEBF19] sm:text-sm"
        />
      </div>

      {/* Dropdown de productos */}
      {showDropdown && (
        <div className="absolute z-10 w-full mt-1 bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
          {isLoading ? (
            <div className="px-4 py-2 text-gray-500">Cargando productos...</div>
          ) : filteredProductos.length === 0 ? (
            <div className="px-4 py-2 text-gray-500">No se encontraron productos</div>
          ) : (
            filteredProductos.map((producto) => (
              <button
                key={producto.id}
                onClick={() => handleProductoSelect(producto)}
                className="w-full text-left px-4 py-2 text-sm text-gray-900 hover:bg-gray-100 flex items-center space-x-3"
              >
                <HiPackage className="h-4 w-4 text-gray-400" />
                <div className="flex-1">
                  <div className="font-medium">{producto.nombre}</div>
                  <div className="text-gray-500 text-xs">
                    SKU: {producto.sku} • Stock: {producto.stock} • {formatPrice(producto.precio)}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      )}

      {/* Producto seleccionado y cantidad */}
      {productoSeleccionado && (
        <div className="p-4 bg-[#FEBF19]/10 border border-[#FEBF19]/20 rounded-md">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <HiPackage className="h-5 w-5 text-[#FEBF19]" />
              <div>
                <div className="font-medium text-gray-900">{productoSeleccionado.nombre}</div>
                <div className="text-sm text-gray-500">
                  SKU: {productoSeleccionado.sku} • Stock: {productoSeleccionado.stock}
                </div>
                <div className="text-sm font-medium text-[#FEBF19]">
                  {formatPrice(productoSeleccionado.precio)}
                </div>
              </div>
            </div>
            <button
              onClick={handleClearSelection}
              className="text-gray-400 hover:text-gray-600"
            >
              <HiX className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Cantidad:</label>
              <input
                type="number"
                min="1"
                max={productoSeleccionado.stock}
                value={cantidad}
                onChange={(e) => setCantidad(parseInt(e.target.value) || 1)}
                className="w-20 px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#FEBF19] focus:border-[#FEBF19]"
              />
            </div>
            <div className="text-sm text-gray-600">
              Subtotal: {formatPrice(productoSeleccionado.precio * cantidad)}
            </div>
            <button
              onClick={handleAgregarProducto}
              className="flex items-center space-x-1 px-3 py-1 bg-[#FEBF19] text-white rounded-md hover:bg-[#FEBF19]/90 text-sm font-medium"
            >
              <HiPlus className="h-4 w-4" />
              <span>Agregar</span>
            </button>
          </div>
        </div>
      )}

      {/* Overlay para cerrar dropdown */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
} 