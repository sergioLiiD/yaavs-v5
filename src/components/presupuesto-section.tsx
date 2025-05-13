'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { toast } from 'sonner';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Producto {
  id: number;
  nombre: string;
  precioPromedio: number;
  tipo: string;
  sku: string;
  stock: number;
  marca?: { nombre: string };
  modelo?: { nombre: string };
}

interface PrecioVenta {
  id: string;
  tipo: string;
  nombre: string;
  marca: string;
  modelo: string;
  precio_venta: number;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
}

interface ReparacionFrecuente {
  id: string;
  nombre: string;
  descripcion?: string;
  activo?: boolean;
  productos: Array<{
    id: string;
    productoId: number;
    cantidad: number;
    precioVenta: number;
    conceptoExtra?: string;
    precioConceptoExtra?: number;
  }>;
  pasos: Array<{
    id: string;
    descripcion: string;
    orden: number;
  }>;
}

interface ProductoSeleccionado {
  id: string;
  productoId: number;
  cantidad: number;
  precioVenta: number;
  nombre?: string;
  conceptoExtra?: string;
  precioConceptoExtra?: number;
}

interface PresupuestoSectionProps {
  ticketId: number;
  onUpdate?: () => void;
}

export function PresupuestoSection({ ticketId, onUpdate }: PresupuestoSectionProps) {
  const [productos, setProductos] = useState<ProductoSeleccionado[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const { data: catalogoProductos } = useQuery({
    queryKey: ['catalogoProductos'],
    queryFn: async () => {
      console.log('Iniciando fetch de piezas...');
      const response = await fetch('/api/piezas', {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Error al cargar piezas');
      }
      const data = await response.json();
      console.log('Piezas cargadas:', data);
      return data;
    },
  });

  const { data: preciosVenta } = useQuery({
    queryKey: ['preciosVenta'],
    queryFn: async () => {
      const response = await fetch('/api/precios-venta', {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Error al cargar precios de venta');
      }
      const data = await response.json();
      return data;
    },
  });

  const { data: reparacionesFrecuentes } = useQuery({
    queryKey: ['reparacionesFrecuentes'],
    queryFn: async () => {
      const response = await fetch('/api/reparaciones-frecuentes', {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Error al cargar reparaciones frecuentes');
      }
      const data = await response.json();
      return data;
    },
  });

  const { data: presupuesto } = useQuery({
    queryKey: ['presupuesto', ticketId],
    queryFn: async () => {
      const response = await fetch(`/api/tickets/${ticketId}/presupuesto`, {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Error al cargar presupuesto');
      }
      const data = await response.json();
      return data;
    },
  });

  const { data: piezasReparacion } = useQuery({
    queryKey: ['piezasReparacion', ticketId],
    queryFn: async () => {
      const response = await fetch(`/api/tickets/${ticketId}/piezas-reparacion`, {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Error al cargar piezas de reparación');
      }
      const data = await response.json();
      return data;
    },
  });

  // Cargar productos del presupuesto existente
  useEffect(() => {
    if (piezasReparacion && catalogoProductos) {
      const productosPresupuesto = piezasReparacion.map((pieza: any) => {
        const producto = catalogoProductos.find((p: Producto) => p.id === pieza.piezaId);
        return {
          id: Math.random().toString(36).substr(2, 9),
          productoId: pieza.piezaId,
          cantidad: pieza.cantidad,
          precioVenta: pieza.precioUnitario,
          nombre: producto?.nombre || '',
        };
      });
      setProductos(productosPresupuesto);
    }
  }, [piezasReparacion, catalogoProductos]);

  // Filtrar productos de precios de venta
  const preciosVentaFiltrados = preciosVenta?.filter((precio: PrecioVenta) => {
    if (!searchValue) return true;
    const searchLower = searchValue.toLowerCase();
    const nombreCompleto = `${precio.nombre} ${precio.marca || ''} ${precio.modelo || ''}`.toLowerCase();
    return nombreCompleto.includes(searchLower);
  }) || [];

  const handleAddProducto = () => {
    setProductos([
      ...productos,
      {
        id: Math.random().toString(36).substr(2, 9),
        productoId: 0,
        cantidad: 1,
        precioVenta: 0,
        nombre: 'Seleccionar producto...'
      },
    ]);
  };

  const handleRemoveProducto = (id: string) => {
    setProductos(productos.filter((p) => p.id !== id));
  };

  const handleProductoChange = (id: string, field: keyof ProductoSeleccionado, value: any) => {
    setProductos(productos.map((p) => {
      if (p.id === id) {
        const productoActualizado = { ...p, [field]: value };
        
        // Si se cambia el producto, actualizar el precio de venta y el nombre
        if (field === 'productoId' && preciosVenta && catalogoProductos) {
          const productoSeleccionado = catalogoProductos.find((prod: Producto) => prod.id === value);
          if (productoSeleccionado) {
            // Buscar el precio de venta según el tipo de producto
            const precioVenta = preciosVenta.find((pv: PrecioVenta) => {
              if (productoSeleccionado.tipo === 'SERVICIO') {
                return pv.nombre.toLowerCase() === productoSeleccionado.nombre.toLowerCase();
              } else {
                return pv.nombre.toLowerCase() === productoSeleccionado.nombre.toLowerCase() &&
                       pv.marca.toLowerCase() === (productoSeleccionado.marca?.nombre.toLowerCase() || '') &&
                       pv.modelo.toLowerCase() === (productoSeleccionado.modelo?.nombre.toLowerCase() || '');
              }
            });

            if (precioVenta) {
              productoActualizado.precioVenta = precioVenta.precio_venta;
            }
            productoActualizado.nombre = productoSeleccionado.nombre;
          }
        }
        return productoActualizado;
      }
      return p;
    }));
  };

  const handleReparacionFrecuenteSelect = async (reparacionId: string) => {
    try {
      const reparacion = reparacionesFrecuentes?.find((r: ReparacionFrecuente) => r.id === reparacionId);
      if (!reparacion) {
        toast.error('Reparación frecuente no encontrada');
        return;
      }

      // Convertir los productos de la reparación frecuente al formato de productos seleccionados
      const nuevosProductos = reparacion.productos.map((p: {
        id: string;
        productoId: number;
        cantidad: number;
        precioVenta: number;
        conceptoExtra?: string;
        precioConceptoExtra?: number;
        producto: {
          id: number;
          nombre: string;
          marca?: { nombre: string };
          modelo?: { nombre: string };
        };
      }) => {
        const nombreCompleto = p.producto ? 
          `${p.producto.nombre}${p.producto.marca ? ` - ${p.producto.marca.nombre}` : ''}${p.producto.modelo ? ` ${p.producto.modelo.nombre}` : ''}` : 
          'Producto no encontrado';
        
        return {
          id: Math.random().toString(36).substr(2, 9),
          productoId: p.productoId,
          cantidad: p.cantidad,
          precioVenta: p.precioVenta,
          conceptoExtra: p.conceptoExtra,
          precioConceptoExtra: p.precioConceptoExtra,
          nombre: nombreCompleto,
        };
      });

      setProductos(nuevosProductos);
      toast.success('Reparación frecuente aplicada correctamente');
    } catch (error) {
      console.error('Error al aplicar reparación frecuente:', error);
      toast.error('Error al aplicar la reparación frecuente');
    }
  };

  const calcularTotal = () => {
    return productos.reduce((total, p) => {
      const subtotal = p.cantidad * p.precioVenta;
      const extra = p.precioConceptoExtra || 0;
      return total + subtotal + extra;
    }, 0);
  };

  const handleGuardarPresupuesto = async () => {
    try {
      setIsLoading(true);
      const total = calcularTotal();
      const dataToSend = {
        productos: productos.map((p) => {
          // Lista de conceptos especiales que no son productos físicos
          const conceptosEspeciales = ['Mano de Obra', 'Diagnostico', 'Diagnóstico'];
          
          // Si es un concepto especial, lo manejamos diferente
          if (conceptosEspeciales.some(concepto => 
            p.nombre?.includes(concepto) || 
            p.conceptoExtra?.includes(concepto)
          )) {
            return {
              piezaId: null,
              cantidad: p.cantidad,
              precioUnitario: p.precioVenta,
              conceptoExtra: p.nombre || p.conceptoExtra,
              precioConceptoExtra: p.precioVenta,
            };
          }

          // Para productos normales, buscamos en el catálogo
          const productoCatalogo = catalogoProductos?.find((prod: Producto) => 
            prod.nombre === p.nombre || 
            (p.nombre && p.nombre.includes(prod.nombre))
          );

          if (!productoCatalogo) {
            console.error('Producto no encontrado en catálogo:', p);
            throw new Error(`Producto no encontrado en catálogo: ${p.nombre}`);
          }

          return {
            piezaId: productoCatalogo.id,
            cantidad: p.cantidad,
            precioUnitario: p.precioVenta,
            conceptoExtra: p.conceptoExtra,
            precioConceptoExtra: p.precioConceptoExtra,
          };
        }),
        total,
      };
      console.log('Enviando datos al servidor:', dataToSend);
      
      const response = await fetch(`/api/tickets/${ticketId}/presupuesto`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Error del servidor:', errorData);
        throw new Error(`Error al guardar el presupuesto: ${errorData}`);
      }

      toast.success('Presupuesto guardado correctamente');
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error al guardar presupuesto:', error);
      toast.error(error instanceof Error ? error.message : 'Error al guardar el presupuesto');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Presupuesto</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Selector de reparación frecuente */}
            <div className="space-y-2">
              <Label>Reparación Frecuente</Label>
              <Select onValueChange={handleReparacionFrecuenteSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar reparación frecuente..." />
                </SelectTrigger>
                <SelectContent>
                  {reparacionesFrecuentes?.map((reparacion: ReparacionFrecuente) => (
                    <SelectItem key={reparacion.id} value={reparacion.id}>
                      {reparacion.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sección para agregar productos desde precios de venta */}
            <div className="space-y-2">
              <Label>Agregar Producto desde Precios de Venta</Label>
              <div className="flex space-x-2">
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className="w-full justify-between"
                    >
                      {searchValue || "Buscar producto..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput 
                        placeholder="Buscar producto..." 
                        value={searchValue}
                        onValueChange={setSearchValue}
                      />
                      <CommandEmpty>No se encontraron productos.</CommandEmpty>
                      <CommandGroup className="max-h-[300px] overflow-auto">
                        {preciosVentaFiltrados.map((precio: PrecioVenta) => {
                          const nombreCompleto = `${precio.nombre} ${precio.marca ? `- ${precio.marca}` : ''} ${precio.modelo ? `- ${precio.modelo}` : ''}`;
                          const yaSeleccionado = productos.some(p => p.nombre === nombreCompleto);
                          
                          return (
                            <div
                              key={precio.id}
                              className={`px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center justify-between ${yaSeleccionado ? 'bg-gray-50' : ''}`}
                              onClick={() => {
                                if (!yaSeleccionado) {
                                  setProductos([
                                    ...productos,
                                    {
                                      id: Math.random().toString(36).substr(2, 9),
                                      productoId: 0,
                                      cantidad: 1,
                                      precioVenta: precio.precio_venta,
                                      nombre: nombreCompleto,
                                    },
                                  ]);
                                  setSearchValue('');
                                  setOpen(false);
                                  toast.success('Producto agregado correctamente');
                                } else {
                                  toast.info('Este producto ya está en la lista');
                                }
                              }}
                            >
                              <div className="flex items-center space-x-2">
                                {yaSeleccionado && (
                                  <Check className="h-4 w-4 text-green-500" />
                                )}
                                <span>{nombreCompleto}</span>
                              </div>
                              <span className="text-sm text-gray-500">
                                ${precio.precio_venta}
                              </span>
                            </div>
                          );
                        })}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Tabla de productos */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>Cantidad</TableHead>
                  <TableHead>Precio Unitario</TableHead>
                  <TableHead>Subtotal</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productos.map((producto) => (
                  <TableRow key={producto.id}>
                    <TableCell>
                      {producto.nombre || 'Seleccionar producto...'}
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="1"
                        value={producto.cantidad}
                        onChange={(e) =>
                          handleProductoChange(producto.id, 'cantidad', parseInt(e.target.value))
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={producto.precioVenta}
                        onChange={(e) =>
                          handleProductoChange(producto.id, 'precioVenta', parseFloat(e.target.value))
                        }
                      />
                    </TableCell>
                    <TableCell>
                      ${(producto.cantidad * producto.precioVenta).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => handleRemoveProducto(producto.id)}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Total */}
            <div className="flex justify-end space-x-4">
              <div className="text-lg font-semibold">
                Total: ${calcularTotal().toFixed(2)}
              </div>
            </div>

            {/* Botón de guardar */}
            <div className="flex justify-end">
              <Button
                onClick={handleGuardarPresupuesto}
                disabled={isLoading}
              >
                {isLoading ? 'Guardando...' : 'Guardar Presupuesto'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 