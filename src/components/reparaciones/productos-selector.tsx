'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PlusIcon, TrashIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Producto {
  id: number;
  nombre: string;
  precio_promedio: number;
  tipo: string;
  sku: string;
  stock: number;
  marcas?: { nombre: string };
  modelos?: { nombre: string };
}

interface PrecioVenta {
  id: string;
  tipo: string;
  nombre: string;
  marca: string;
  modelo: string;
  precio_venta: number;
  productoId?: number;
  servicioId?: number;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
}

interface ProductoSeleccionado {
  id: string;
  productoId: number;
  cantidad: number;
  precioVenta: number;
  conceptoExtra?: string;
  precioConceptoExtra?: number;
}

interface ProductosSelectorProps {
  productos: ProductoSeleccionado[];
  onProductosChange: (productos: ProductoSeleccionado[]) => void;
}

export function ProductosSelector({ productos = [], onProductosChange }: ProductosSelectorProps) {
  const [busqueda, setBusqueda] = useState('');

  const { data: catalogoProductos } = useQuery({
    queryKey: ['catalogoProductos'],
    queryFn: async () => {
      const response = await fetch('/api/inventario/productos');
      if (!response.ok) {
        throw new Error('Error al cargar productos');
      }
      const data = await response.json();
      console.log('Productos cargados:', data);
      return data;
    },
  });

  const { data: preciosVenta } = useQuery({
    queryKey: ['preciosVenta'],
    queryFn: async () => {
      const response = await fetch('/api/precios-venta');
      if (!response.ok) {
        throw new Error('Error al cargar precios de venta');
      }
      const data = await response.json();
      console.log('Precios de venta cargados:', data);
      return data;
    },
  });

  // Filtrar productos por búsqueda
  const productosFiltrados = catalogoProductos?.filter((p: Producto) => {
    if (!busqueda) return true;
    const busquedaLower = busqueda.toLowerCase();
    return (
      p.nombre.toLowerCase().includes(busquedaLower) ||
      p.sku.toLowerCase().includes(busquedaLower) ||
      (p.marcas?.nombre?.toLowerCase() || '').includes(busquedaLower) ||
      (p.modelos?.nombre?.toLowerCase() || '').includes(busquedaLower)
    );
  }) || [];

  console.log('Productos filtrados:', productosFiltrados);

  const handleAddProducto = () => {
    onProductosChange([
      ...productos,
      {
        id: Math.random().toString(36).substr(2, 9),
        productoId: 0,
        cantidad: 1,
        precioVenta: 0,
        conceptoExtra: '',
        precioConceptoExtra: 0
      },
    ]);
  };

  const handleRemoveProducto = (id: string) => {
    onProductosChange(productos.filter((p) => p.id !== id));
  };

  const handleProductoChange = async (id: string, field: keyof ProductoSeleccionado, value: any) => {
    const productoActualizado = productos.map((p) =>
      p.id === id ? { ...p, [field]: value || (field === 'cantidad' ? 1 : field === 'precioVenta' ? 0 : '') } : p
    );

    // Si se cambia el producto, obtener el precio automáticamente
    if (field === 'productoId' && value) {
      try {
        const productoSeleccionado = catalogoProductos?.find((p: Producto) => p.id === value);
        if (!productoSeleccionado) {
          console.error('Producto no encontrado:', value);
          return;
        }

        const producto = productoActualizado.find(p => p.id === id);
        if (producto) {
          // Determinar si es un producto o servicio basado en el tipo
          const esServicio = productoSeleccionado.tipo === 'SERVICIO';
          
          // Intentar obtener el precio de venta específico
          try {
            let endpoint;
            if (esServicio) {
              // Para servicios, usar el tipo_servicio_id del producto
              const tipoServicioId = productoSeleccionado.tipo_servicio_id;
              if (tipoServicioId) {
                endpoint = `/api/precios-venta/servicio/${tipoServicioId}`;
              } else {
                // Si no hay tipo_servicio_id, usar el precio promedio
                producto.precioVenta = Number(productoSeleccionado.precio_promedio) || 0;
                console.log('Servicio sin tipo_servicio_id, usando precio promedio:', productoSeleccionado.precio_promedio);
                onProductosChange(productoActualizado);
                return;
              }
            } else {
              endpoint = `/api/precios-venta/producto/${value}`;
            }
            
            const response = await fetch(endpoint);
            if (response.ok) {
              const precioData = await response.json();
              producto.precioVenta = Number(precioData.precioVenta) || 0;
              console.log('Precio de venta encontrado:', precioData.precioVenta);
            } else {
              // Si no hay precio específico, usar el precio promedio del producto
              producto.precioVenta = Number(productoSeleccionado.precio_promedio) || 0;
              console.log('Usando precio promedio:', productoSeleccionado.precio_promedio);
            }
          } catch (error) {
            // En caso de error, usar el precio promedio sin mostrar error en consola
            producto.precioVenta = Number(productoSeleccionado.precio_promedio) || 0;
            console.log('Usando precio promedio por error:', productoSeleccionado.precio_promedio);
          }
        }
      } catch (error) {
        console.error('Error al obtener precio de venta:', error);
        // En caso de error, usar el precio promedio
        const productoSeleccionado = catalogoProductos?.find((p: Producto) => p.id === value);
        if (productoSeleccionado) {
          const producto = productoActualizado.find(p => p.id === id);
          if (producto) {
            producto.precioVenta = Number(productoSeleccionado.precio_promedio) || 0;
          }
        }
      }
    }

    // Si se cambia el precio de venta manualmente, asegurarse de que sea un número
    if (field === 'precioVenta') {
      const producto = productoActualizado.find(p => p.id === id);
      if (producto) {
        producto.precioVenta = Number(value) || 0;
      }
    }

    // Si se cambia la cantidad, asegurarse de que sea un número
    if (field === 'cantidad') {
      const producto = productoActualizado.find(p => p.id === id);
      if (producto) {
        producto.cantidad = Number(value) || 1;
      }
    }

    onProductosChange(productoActualizado);
  };

  const calcularTotal = () => {
    return productos.reduce((total, p) => {
      const cantidad = Number(p.cantidad) || 0;
      const precioVenta = Number(p.precioVenta) || 0;
      const precioConceptoExtra = Number(p.precioConceptoExtra) || 0;
      const subtotal = cantidad * precioVenta;
      return total + subtotal + precioConceptoExtra;
    }, 0);
  };

  return (
    <div className="space-y-4 bg-white text-black">
      <div className="flex justify-end mb-4">
        <Button
          type="button"
          variant="outline"
          onClick={handleAddProducto}
          className="bg-white text-black border-gray-200 hover:bg-gray-100"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Agregar Producto
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[60%]">Producto</TableHead>
            <TableHead className="w-[20%]">Subtotal</TableHead>
            <TableHead className="w-[20%] text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {productos?.map((producto) => (
            <TableRow key={producto.id}>
              <TableCell>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                      Selecciona un producto o servicio
                    </Label>
                    <Select
                      value={producto.productoId?.toString() || ''}
                      onValueChange={(value) =>
                        handleProductoChange(producto.id, 'productoId', parseInt(value))
                      }
                    >
                      <SelectTrigger className="bg-white text-black border-gray-200">
                        <SelectValue placeholder="Buscar y seleccionar producto..." />
                      </SelectTrigger>
                    <SelectContent 
                      className="bg-white text-black border-gray-200 max-h-[300px] overflow-y-auto z-50"
                      position="popper"
                      sideOffset={5}
                      align="start"
                    >
                      <div className="p-2 border-b border-gray-200">
                        <div className="relative">
                          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                          <Input
                            type="text"
                            placeholder="Buscar por nombre, SKU, marca o modelo..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            className="pl-10 bg-white text-black border-gray-200"
                          />
                        </div>
                      </div>
                      {productosFiltrados.length === 0 ? (
                        <div className="p-2 text-sm text-gray-500">
                          No se encontraron productos
                        </div>
                      ) : (
                        productosFiltrados.map((p: Producto) => (
                          <SelectItem 
                            key={p.id} 
                            value={p.id.toString()}
                            className="bg-white text-black hover:bg-gray-100 cursor-pointer data-[highlighted:bg-gray-100]"
                          >
                            {p.nombre} {p.marcas?.nombre ? `- ${p.marcas.nombre}` : ''} {p.modelos?.nombre ? ` ${p.modelos.nombre}` : ''}
                          </SelectItem>
                        ))
                      )}
                                          </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Cantidad</Label>
                      <Input
                        type="number"
                        min="1"
                        value={producto.cantidad || 1}
                        onChange={(e) => handleProductoChange(producto.id, 'cantidad', parseInt(e.target.value))}
                        className="bg-white text-black border-gray-200"
                      />
                    </div>
                    <div>
                      <Label>Precio Unitario</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={producto.precioVenta || 0}
                        onChange={(e) => handleProductoChange(producto.id, 'precioVenta', parseFloat(e.target.value))}
                        className="bg-white text-black border-gray-200"
                      />
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                ${((producto.cantidad || 1) * (producto.precioVenta || 0)).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveProducto(producto.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex justify-end mt-4">
        <div className="text-lg font-semibold">
          Total: ${calcularTotal().toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      </div>
    </div>
  );
} 