'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { HiPlus, HiTrash, HiX } from 'react-icons/hi';
import { toast } from 'react-hot-toast';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Producto {
  id: number;
  nombre: string;
  precio_promedio: number;
  tipo: string;
  sku: string;
  stock: number;
  marca?: { nombre: string };
  modelo?: { nombre: string };
}

interface ProductoSeleccionado {
  id: string;
  productoId: number;
  cantidad: number;
  precioVenta: number;
  conceptoExtra?: string;
  precioConceptoExtra?: number;
  nombre: string;
}

interface ProductosSelectorProps {
  productos: Producto[];
  selectedProductos: ProductoSeleccionado[];
  onProductosChange: (productos: ProductoSeleccionado[]) => void;
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

export function ProductosSelector({ productos, selectedProductos, onProductosChange }: ProductosSelectorProps) {
  const [open, setOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Producto[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchOpen, setSearchOpen] = useState<Record<string, boolean>>({});

  // Función para buscar productos en el servidor
  const searchProductos = async (query: string) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`/api/inventario/productos?search=${encodeURIComponent(query)}&limit=20`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.productos || data);
      }
    } catch (error) {
      console.error('Error al buscar productos:', error);
      toast.error('Error al buscar productos');
    } finally {
      setIsSearching(false);
    }
  };

  // Debounce para la búsqueda
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchProductos(searchTerm);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const toggleProducto = (producto: Producto) => {
    const isSelected = selectedProductos.some((p) => p.productoId === producto.id);
    if (isSelected) {
      onProductosChange(selectedProductos.filter((p) => p.productoId !== producto.id));
    } else {
      // Agregar nuevo producto
      const nuevoProducto: ProductoSeleccionado = {
        id: Math.random().toString(36).substr(2, 9),
        productoId: producto.id,
        cantidad: 1,
        precioVenta: producto.precio_promedio,
        nombre: producto.nombre
      };
      onProductosChange([...selectedProductos, nuevoProducto]);
    }
  };

  const handleProductoChange = async (id: string, field: keyof ProductoSeleccionado, value: any) => {
    const productoActualizado = selectedProductos.map((p) => {
      if (p.id === id) {
        const producto = { ...p, [field]: value };
        
        // Si se cambió la cantidad o el precio, recalcular
        if (field === 'cantidad' || field === 'precioVenta' || field === 'precioConceptoExtra') {
          const cantidad = field === 'cantidad' ? value : p.cantidad;
          const precioVenta = field === 'precioVenta' ? value : p.precioVenta;
          const precioConceptoExtra = field === 'precioConceptoExtra' ? value : p.precioConceptoExtra || 0;
        }
        
        return producto;
      }
      return p;
    });

    // Si se cambió el producto, obtener el precio de venta
    if (field === 'productoId' && productos) {
      const productoSeleccionado = productos.find((prod: Producto) => prod.id === value);
      if (productoSeleccionado) {
        try {
          let endpoint;
          const esServicio = productoSeleccionado.tipo === 'SERVICIO';
          
          if (esServicio) {
            // Para servicios, usar el tipo_servicio_id del producto
            const tipoServicioId = (productoSeleccionado as any).tipo_servicio_id;
            if (tipoServicioId) {
              endpoint = `/api/precios-venta/servicio/${tipoServicioId}`;
            } else {
              // Si no hay tipo_servicio_id, usar el precio promedio
              const producto = productoActualizado.find(p => p.id === id);
              if (producto) {
                producto.precioVenta = Number(productoSeleccionado.precio_promedio) || 0;
                producto.nombre = productoSeleccionado.nombre;
              }
              onProductosChange(productoActualizado);
              return;
            }
          } else {
            endpoint = `/api/precios-venta/producto/${value}`;
          }
          
          const response = await fetch(endpoint);
          if (response.ok) {
            const precioData = await response.json();
            const producto = productoActualizado.find(p => p.id === id);
            if (producto) {
              producto.precioVenta = Number(precioData.precioVenta) || 0;
              producto.nombre = productoSeleccionado.nombre;
            }
          } else {
            // Si no hay precio específico, usar el precio promedio del producto
            const producto = productoActualizado.find(p => p.id === id);
            if (producto) {
              producto.precioVenta = Number(productoSeleccionado.precio_promedio) || 0;
              producto.nombre = productoSeleccionado.nombre;
            }
          }
        } catch (error) {
          // En caso de error, usar el precio promedio
          const producto = productoActualizado.find(p => p.id === id);
          if (producto) {
            producto.precioVenta = Number(productoSeleccionado.precio_promedio) || 0;
            producto.nombre = productoSeleccionado.nombre;
          }
        }
      }
    }

    onProductosChange(productoActualizado);
  };

  const handleRemoveProducto = (id: string) => {
    onProductosChange(selectedProductos.filter((p) => p.id !== id));
  };

  const handleAddProducto = () => {
    const nuevoProducto: ProductoSeleccionado = {
      id: Math.random().toString(36).substr(2, 9),
      productoId: 0,
      cantidad: 1,
      precioVenta: 0,
      nombre: 'Seleccionar producto...'
    };
    onProductosChange([...selectedProductos, nuevoProducto]);
  };

  const filteredProductos = productos.filter((producto) =>
    producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    producto.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calcularSubtotal = (producto: ProductoSeleccionado) => {
    const subtotal = producto.precioVenta * producto.cantidad;
    const extra = producto.precioConceptoExtra || 0;
    return subtotal + extra;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label className="text-lg font-semibold">Productos y Servicios</Label>
        <Button
          type="button"
          onClick={handleAddProducto}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <HiPlus className="h-4 w-4" />
          Agregar Producto
        </Button>
      </div>

      {/* Lista de productos seleccionados */}
      <div className="space-y-3">
        {selectedProductos.map((producto) => (
          <Card key={producto.id} className="p-4">
            <CardContent className="p-0">
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                {/* Selector de producto con búsqueda */}
                <div className="md:col-span-2">
                  <Label className="text-sm font-medium">Producto</Label>
                  <Popover open={searchOpen[producto.id]} onOpenChange={(open) => setSearchOpen(prev => ({ ...prev, [producto.id]: open }))}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={searchOpen[producto.id]}
                        className="w-full justify-between"
                      >
                        {producto.productoId > 0 
                          ? productos.find((p) => p.id === producto.productoId)?.nombre || "Seleccionar producto..."
                          : "Seleccionar producto..."
                        }
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput 
                          placeholder="Buscar producto..." 
                          value={searchTerm}
                          onValueChange={setSearchTerm}
                        />
                        <CommandEmpty>
                          {isSearching ? "Buscando..." : "No se encontraron productos."}
                        </CommandEmpty>
                        <CommandGroup className="max-h-64 overflow-y-auto">
                          {searchResults.map((p) => (
                            <CommandItem
                              key={p.id}
                              value={`${p.nombre} ${p.sku}`}
                              onSelect={() => {
                                handleProductoChange(producto.id, 'productoId', p.id);
                                setSearchOpen(prev => ({ ...prev, [producto.id]: false }));
                                setSearchTerm('');
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  producto.productoId === p.id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <div className="flex flex-col">
                                <span className="font-medium">{p.nombre}</span>
                                <span className="text-sm text-gray-500">SKU: {p.sku}</span>
                                {p.marca && <span className="text-sm text-gray-500">Marca: {p.marca.nombre}</span>}
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Cantidad */}
                <div>
                  <Label className="text-sm font-medium">Cantidad</Label>
                  <Input
                    type="number"
                    min="1"
                    value={producto.cantidad}
                    onChange={(e) => handleProductoChange(producto.id, 'cantidad', parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                {/* Precio de venta */}
                <div>
                  <Label className="text-sm font-medium">Precio</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={producto.precioVenta}
                    onChange={(e) => handleProductoChange(producto.id, 'precioVenta', parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>

                {/* Concepto extra */}
                <div>
                  <Label className="text-sm font-medium">Concepto Extra</Label>
                  <Input
                    type="text"
                    value={producto.conceptoExtra || ''}
                    onChange={(e) => handleProductoChange(producto.id, 'conceptoExtra', e.target.value)}
                    placeholder="Opcional"
                    className="w-full"
                  />
                </div>

                {/* Precio concepto extra */}
                <div>
                  <Label className="text-sm font-medium">Precio Extra</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={producto.precioConceptoExtra || ''}
                    onChange={(e) => handleProductoChange(producto.id, 'precioConceptoExtra', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="w-full"
                  />
                </div>

                {/* Subtotal y botón eliminar */}
                <div className="flex items-center justify-between">
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      ${calcularSubtotal(producto).toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500">
                      Subtotal
                    </div>
                  </div>
                  <Button
                    type="button"
                    onClick={() => handleRemoveProducto(producto.id)}
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700"
                  >
                    <HiTrash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Total */}
      {selectedProductos.length > 0 && (
        <div className="flex justify-end">
          <div className="text-right">
            <div className="text-lg font-bold">
              Total: ${selectedProductos.reduce((total, producto) => total + calcularSubtotal(producto), 0).toFixed(2)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
