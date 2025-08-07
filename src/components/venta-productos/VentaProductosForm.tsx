'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { ClienteSelector } from './ClienteSelector';
import { ProductoSelector } from './ProductoSelector';
import { ProductoItem } from './ProductoItem';
import { ResumenVenta } from './ResumenVenta';
import { ReciboVenta } from './ReciboVenta';
import { ProductoVenta, ProductoService } from '@/services/productoService';
import { VentaService, VentaData, ItemVenta } from '@/services/ventaService';
import { Cliente } from '@/types/cliente';
import { toast } from 'react-hot-toast';

interface ProductoSeleccionado {
  producto: ProductoVenta;
  cantidad: number;
  subtotal: number;
}

export function VentaProductosForm() {
  const { data: session } = useSession();
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const [productosSeleccionados, setProductosSeleccionados] = useState<ProductoSeleccionado[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showRecibo, setShowRecibo] = useState(false);
  const [ventaCreada, setVentaCreada] = useState<any>(null);

  // Calcular total cuando cambian los productos
  useEffect(() => {
    const nuevoTotal = productosSeleccionados.reduce((sum, item) => sum + item.subtotal, 0);
    setTotal(nuevoTotal);
  }, [productosSeleccionados]);

  const agregarProducto = (producto: ProductoVenta, cantidad: number) => {
    // Verificar si el producto ya está en la lista
    const productoExistente = productosSeleccionados.find(
      item => item.producto.id === producto.id
    );

    if (productoExistente) {
      // Actualizar cantidad del producto existente
      const nuevaCantidad = productoExistente.cantidad + cantidad;
      if (nuevaCantidad > producto.stock) {
        toast.error(`Stock insuficiente. Solo hay ${producto.stock} unidades disponibles.`);
        return;
      }

      setProductosSeleccionados(prev =>
        prev.map(item =>
          item.producto.id === producto.id
            ? {
                ...item,
                cantidad: nuevaCantidad,
                subtotal: nuevaCantidad * item.producto.precio
              }
            : item
        )
      );
    } else {
      // Agregar nuevo producto
      if (cantidad > producto.stock) {
        toast.error(`Stock insuficiente. Solo hay ${producto.stock} unidades disponibles.`);
        return;
      }

      setProductosSeleccionados(prev => [
        ...prev,
        {
          producto,
          cantidad,
          subtotal: cantidad * producto.precio
        }
      ]);
    }

    toast.success(`${cantidad} ${cantidad === 1 ? 'unidad' : 'unidades'} de ${producto.nombre} agregada`);
  };

  const actualizarCantidad = (productoId: number, nuevaCantidad: number) => {
    const producto = productosSeleccionados.find(item => item.producto.id === productoId);
    if (!producto) return;

    if (nuevaCantidad > producto.producto.stock) {
      toast.error(`Stock insuficiente. Solo hay ${producto.producto.stock} unidades disponibles.`);
      return;
    }

    setProductosSeleccionados(prev =>
      prev.map(item =>
        item.producto.id === productoId
          ? {
              ...item,
              cantidad: nuevaCantidad,
              subtotal: nuevaCantidad * item.producto.precio
            }
          : item
      )
    );
  };

  const eliminarProducto = (productoId: number) => {
    setProductosSeleccionados(prev =>
      prev.filter(item => item.producto.id !== productoId)
    );
  };

  const crearVenta = async () => {
    if (!clienteSeleccionado) {
      toast.error('Debe seleccionar un cliente');
      return;
    }

    if (productosSeleccionados.length === 0) {
      toast.error('Debe agregar al menos un producto');
      return;
    }

    if (!session?.user?.id) {
      toast.error('Error de sesión');
      return;
    }

    setIsLoading(true);

    try {
      const items: ItemVenta[] = productosSeleccionados.map(item => ({
        productoId: item.producto.id,
        cantidad: item.cantidad,
        precioUnitario: item.producto.precio,
        subtotal: item.subtotal
      }));

      const ventaData: VentaData = {
        clienteId: clienteSeleccionado.id,
        items,
        total,
        usuarioId: session.user.id
      };

      const venta = await VentaService.crearVenta(ventaData);
      setVentaCreada(venta);
      setShowRecibo(true);
      
      // Limpiar formulario
      setClienteSeleccionado(null);
      setProductosSeleccionados([]);
      setTotal(0);

      toast.success('Venta creada exitosamente');
    } catch (error: any) {
      console.error('Error al crear venta:', error);
      toast.error(error.message || 'Error al crear la venta');
    } finally {
      setIsLoading(false);
    }
  };

  const cerrarRecibo = () => {
    setShowRecibo(false);
    setVentaCreada(null);
  };

  return (
    <div className="space-y-6">
      {/* Selección de Cliente */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">1. Seleccionar Cliente</h2>
        <ClienteSelector
          clienteSeleccionado={clienteSeleccionado}
          onClienteChange={setClienteSeleccionado}
        />
      </div>

      {/* Selección de Productos */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">2. Agregar Productos</h2>
        <ProductoSelector onProductoSeleccionado={agregarProducto} />
      </div>

      {/* Lista de Productos Seleccionados */}
      {productosSeleccionados.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">3. Productos Seleccionados</h2>
          <div className="space-y-3">
            {productosSeleccionados.map((item) => (
              <ProductoItem
                key={item.producto.id}
                item={item}
                onCantidadChange={(cantidad) => actualizarCantidad(item.producto.id, cantidad)}
                onEliminar={() => eliminarProducto(item.producto.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Resumen y Botón de Venta */}
      {productosSeleccionados.length > 0 && (
        <ResumenVenta
          total={total}
          productosCount={productosSeleccionados.length}
          clienteSeleccionado={clienteSeleccionado}
          onCreateVenta={crearVenta}
          isLoading={isLoading}
        />
      )}

      {/* Modal de Recibo */}
      {showRecibo && ventaCreada && (
        <ReciboVenta
          venta={ventaCreada}
          onClose={cerrarRecibo}
        />
      )}
    </div>
  );
} 