'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import ClienteSelector from './ClienteSelector';
import ProductoSelector from './ProductoSelector';
import ProductoItem from './ProductoItem';
import ResumenVenta from './ResumenVenta';
import ReciboModal from './ReciboModal';
import { VentaService } from '@/services/ventaService';

interface ProductoSeleccionado {
  id: number;
  nombre: string;
  sku: string;
  precio: number;
  stock: number;
  cantidad: number;
  subtotal: number;
}

interface Cliente {
  id: number;
  nombre: string;
  apellido_paterno: string;
  apellido_materno?: string;
  telefono_celular: string;
  email: string;
}

export default function VentaProductosForm() {
  const { data: session } = useSession();
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const [productosSeleccionados, setProductosSeleccionados] = useState<ProductoSeleccionado[]>([]);
  const [ventaCompletada, setVentaCompletada] = useState(false);
  const [ventaData, setVentaData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showReciboModal, setShowReciboModal] = useState(false);

  const agregarProducto = (producto: any) => {
    const productoExistente = productosSeleccionados.find(p => p.id === producto.id);
    
    if (productoExistente) {
      // Si ya existe, aumentar cantidad
      setProductosSeleccionados(prev => 
        prev.map(p => 
          p.id === producto.id 
            ? { ...p, cantidad: p.cantidad + 1, subtotal: (p.cantidad + 1) * p.precio }
            : p
        )
      );
    } else {
      // Agregar nuevo producto
      const nuevoProducto: ProductoSeleccionado = {
        id: producto.id,
        nombre: producto.nombre,
        sku: producto.sku,
        precio: producto.precio_promedio || 0,
        stock: producto.stock,
        cantidad: 1,
        subtotal: producto.precio_promedio || 0
      };
      setProductosSeleccionados(prev => [...prev, nuevoProducto]);
    }
  };

  const actualizarCantidad = (productoId: number, nuevaCantidad: number) => {
    setProductosSeleccionados(prev => 
      prev.map(p => 
        p.id === productoId 
          ? { ...p, cantidad: nuevaCantidad, subtotal: nuevaCantidad * p.precio }
          : p
      )
    );
  };

  const eliminarProducto = (productoId: number) => {
    setProductosSeleccionados(prev => prev.filter(p => p.id !== productoId));
  };

  const calcularTotal = () => {
    return productosSeleccionados.reduce((total, producto) => total + producto.subtotal, 0);
  };

  const finalizarVenta = async () => {
    if (!clienteSeleccionado || productosSeleccionados.length === 0) {
      alert('Por favor selecciona un cliente y al menos un producto');
      return;
    }

    // Validar stock
    const productosSinStock = productosSeleccionados.filter(p => p.cantidad > p.stock);
    if (productosSinStock.length > 0) {
      alert(`Los siguientes productos no tienen suficiente stock: ${productosSinStock.map(p => p.nombre).join(', ')}`);
      return;
    }

    setLoading(true);
    try {
      const ventaData = {
        cliente_id: clienteSeleccionado.id,
        usuario_id: session?.user?.id,
        total: calcularTotal(),
        productos: productosSeleccionados.map(p => ({
          producto_id: p.id,
          cantidad: p.cantidad,
          precio_unitario: p.precio,
          subtotal: p.subtotal
        }))
      };

      const resultado = await VentaService.crearVenta(ventaData);
      setVentaData(resultado);
      setVentaCompletada(true);
      setShowReciboModal(true);
      
      // Limpiar formulario
      setClienteSeleccionado(null);
      setProductosSeleccionados([]);
    } catch (error) {
      console.error('Error al finalizar la venta:', error);
      alert('Error al finalizar la venta');
    } finally {
      setLoading(false);
    }
  };

  const reiniciarVenta = () => {
    setVentaCompletada(false);
    setVentaData(null);
    setShowReciboModal(false);
  };

  const cerrarModal = () => {
    setShowReciboModal(false);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Venta de Productos
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Panel izquierdo - Selección de cliente y productos */}
          <div className="space-y-6">
            {/* Selector de cliente */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Cliente</h2>
              <ClienteSelector 
                clienteSeleccionado={clienteSeleccionado}
                onClienteSeleccionado={setClienteSeleccionado}
              />
            </div>

            {/* Selector de productos */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Productos</h2>
              <ProductoSelector onProductoSeleccionado={agregarProducto} />
            </div>
          </div>

          {/* Panel derecho - Lista de productos seleccionados */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Productos Seleccionados ({productosSeleccionados.length})
            </h2>
            
            {productosSeleccionados.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No hay productos seleccionados
              </p>
            ) : (
              <div className="space-y-3">
                {productosSeleccionados.map((producto) => (
                  <ProductoItem
                    key={producto.id}
                    producto={producto}
                    onCantidadChange={actualizarCantidad}
                    onEliminar={eliminarProducto}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Resumen y botón de finalizar */}
        <ResumenVenta
          cliente={clienteSeleccionado}
          productos={productosSeleccionados}
          total={calcularTotal()}
          onFinalizarVenta={finalizarVenta}
          loading={loading}
        />
      </div>

      {/* Modal del recibo */}
      {ventaData && (
        <ReciboModal
          venta={ventaData}
          isOpen={showReciboModal}
          onClose={cerrarModal}
          onNuevaVenta={reiniciarVenta}
        />
      )}
    </div>
  );
} 