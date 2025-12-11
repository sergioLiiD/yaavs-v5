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
import { HiSave } from "react-icons/hi";

interface Producto {
  id: number;
  nombre: string;
  precioPromedio: number;
  tipo: string;
  sku: string;
  stock: number;
  marca?: { nombre: string };
  modelo?: { nombre: string };
  tipo_servicio_id?: number; // Nuevo campo para servicios
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
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({});
  const [searchValue, setSearchValue] = useState('');
  const [searchResults, setSearchResults] = useState<Producto[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Función para normalizar productos del API (convertir snake_case a camelCase)
  const normalizarProducto = (producto: any): Producto => {
    return {
      id: producto.id,
      nombre: producto.nombre || '',
      precioPromedio: producto.precioPromedio || producto.precio_promedio || 0,
      tipo: producto.tipo || 'PRODUCTO',
      sku: producto.sku || '',
      stock: producto.stock || 0,
      marca: producto.marca || producto.marcas,
      modelo: producto.modelo || producto.modelos,
      tipo_servicio_id: producto.tipo_servicio_id || producto.tipoServicioId
    };
  };

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
        const productosRaw = data.productos || data;
        // Normalizar los productos para asegurar formato consistente
        const productosNormalizados = Array.isArray(productosRaw) 
          ? productosRaw.map(normalizarProducto)
          : [];
        console.log('🔍 Productos encontrados (normalizados):', productosNormalizados);
        setSearchResults(productosNormalizados);
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
      searchProductos(searchValue);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchValue]);

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
      console.log('Piezas cargadas (raw):', data);
      // Normalizar los productos del catálogo
      const productosNormalizados = Array.isArray(data) 
        ? data.map(normalizarProducto)
        : [];
      console.log('Piezas cargadas (normalizadas):', productosNormalizados);
      return productosNormalizados;
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

  const { data: presupuesto, refetch: refetchPresupuesto } = useQuery({
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
    if (presupuesto?.conceptos_presupuesto) {
      const productosPresupuesto = presupuesto.conceptos_presupuesto.map((concepto: any) => {
        // Buscar el producto en el catálogo por nombre
        const productoCatalogo = catalogoProductos?.find((p: Producto) => 
          p.nombre.toLowerCase() === concepto.descripcion.toLowerCase()
        );

        return {
          id: Math.random().toString(36).substr(2, 9),
          productoId: productoCatalogo?.id || 0,
          cantidad: concepto.cantidad,
          precioVenta: concepto.precio_unitario,
          nombre: concepto.descripcion,
        };
      });
      setProductos(productosPresupuesto);
    }
  }, [presupuesto, catalogoProductos]);

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

  const handleProductoChange = async (id: string, field: keyof ProductoSeleccionado, value: any) => {
    // Si se cambia el producto, obtener el precio de venta primero
    if (field === 'productoId') {
      // Validar que el valor sea un número válido
      const productoIdNum = typeof value === 'number' ? value : parseInt(value);
      if (isNaN(productoIdNum) || productoIdNum <= 0) {
        console.warn('⚠️ ID de producto inválido:', value);
        return;
      }

      // Buscar el producto en el catálogo o en los resultados de búsqueda
      let productoSeleccionado = catalogoProductos?.find((prod: Producto) => prod.id === productoIdNum);
      
      // Si no está en el catálogo, buscar en los resultados de búsqueda
      if (!productoSeleccionado) {
        productoSeleccionado = searchResults.find((prod: Producto) => prod.id === productoIdNum);
      }

      if (productoSeleccionado) {
        console.log('✅ Producto seleccionado encontrado:', {
          id: productoSeleccionado.id,
          nombre: productoSeleccionado.nombre,
          tipo: productoSeleccionado.tipo,
          precioPromedio: productoSeleccionado.precioPromedio
        });
        // Actualizar primero el producto seleccionado con el precio promedio como fallback
        const precioPromedio = Number(productoSeleccionado.precioPromedio) || 0;
        setProductos(productos.map((p) => {
          if (p.id === id) {
            return {
              ...p,
              productoId: productoIdNum,
              nombre: productoSeleccionado.nombre,
              precioVenta: precioPromedio
            };
          }
          return p;
        }));

        try {
          let endpoint;
          if (productoSeleccionado.tipo === 'SERVICIO') {
            // Para servicios, usar el tipo_servicio_id del producto
            const tipoServicioId = productoSeleccionado.tipo_servicio_id;
            if (tipoServicioId) {
              endpoint = `/api/precios-venta/servicio/${tipoServicioId}`;
            } else {
              // Si no hay tipo_servicio_id, ya usamos el precio promedio arriba
              console.log('Servicio sin tipo_servicio_id, usando precio promedio:', precioPromedio);
              return;
            }
          } else {
            endpoint = `/api/precios-venta/producto/${productoIdNum}`;
          }
          
          console.log('🔍 Consultando precio de venta en:', endpoint);
          // Crear un AbortController para manejar timeouts
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);
          
          let response;
          try {
            response = await fetch(endpoint, {
              signal: controller.signal
            });
          } finally {
            clearTimeout(timeoutId);
          }
          
          if (response.ok) {
            const precioData = await response.json();
            const precioVenta = Number(precioData.precioVenta) || precioPromedio;
            console.log('✅ Precio de venta encontrado:', precioVenta);
            
            // Actualizar el estado con el precio encontrado
            setProductos(productos.map((p) => {
              if (p.id === id) {
                return {
                  ...p,
                  productoId: productoIdNum,
                  nombre: productoSeleccionado.nombre,
                  precioVenta: precioVenta
                };
              }
              return p;
            }));
          } else if (response.status === 404) {
            // Si no hay precio específico (404), ya usamos el precio promedio arriba
            console.log('⚠️ Precio específico no encontrado, usando precio promedio:', precioPromedio);
          } else {
            // Otro error HTTP
            console.warn('⚠️ Error al obtener precio de venta:', response.status, 'usando precio promedio:', precioPromedio);
          }
        } catch (error: any) {
          // En caso de error (incluyendo timeout o abort), ya tenemos el precio promedio
          if (error.name !== 'AbortError') {
            console.log('❌ Error al obtener precio, usando promedio:', precioPromedio, error.message);
          }
        }
        return; // Salir de la función ya que manejamos el estado aquí
      } else {
        console.warn('⚠️ Producto no encontrado en catálogo con ID:', productoIdNum);
      }
    }
    
    // Para otros campos, actualizar normalmente
    setProductos(productos.map((p) => {
      if (p.id === id) {
        return { ...p, [field]: value };
      }
      return p;
    }));
  };

  const toggleDropdown = (productoId: string) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [productoId]: !prev[productoId]
    }));
  };

  const handleProductoSelect = async (productoId: string, selectedProducto: Producto) => {
    console.log('🎯 Producto seleccionado:', {
      id: selectedProducto.id,
      idType: typeof selectedProducto.id,
      nombre: selectedProducto.nombre,
      tipo: selectedProducto.tipo,
      precioPromedio: selectedProducto.precioPromedio,
      tipo_servicio_id: selectedProducto.tipo_servicio_id,
      productoCompleto: selectedProducto
    });
    
    // Validar que el ID sea válido
    const productoIdNum = typeof selectedProducto.id === 'number' 
      ? selectedProducto.id 
      : parseInt(String(selectedProducto.id));
    
    if (isNaN(productoIdNum) || productoIdNum <= 0) {
      console.error('❌ ID de producto inválido:', selectedProducto.id);
      toast.error(`ID de producto inválido: ${selectedProducto.id}`);
      return;
    }
    
    // Actualizar primero con el precio promedio como fallback
    const precioPromedio = Number(selectedProducto.precioPromedio) || 0;
    setProductos(productos.map((p) => {
      if (p.id === productoId) {
        return {
          ...p,
          productoId: productoIdNum,
          nombre: selectedProducto.nombre,
          precioVenta: precioPromedio
        };
      }
      return p;
    }));

    // Luego intentar obtener el precio de venta específico
    try {
      let endpoint;
      if (selectedProducto.tipo === 'SERVICIO') {
        const tipoServicioId = selectedProducto.tipo_servicio_id;
        if (tipoServicioId) {
          endpoint = `/api/precios-venta/servicio/${tipoServicioId}`;
        } else {
          console.log('⚠️ Servicio sin tipo_servicio_id, usando precio promedio:', precioPromedio);
          setOpenDropdowns(prev => ({ ...prev, [productoId]: false }));
          return;
        }
      } else {
        endpoint = `/api/precios-venta/producto/${productoIdNum}`;
      }
      
      console.log('🔍 Consultando precio de venta en:', endpoint, 'para producto ID:', productoIdNum);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      let response;
      try {
        response = await fetch(endpoint, {
          signal: controller.signal
        });
      } finally {
        clearTimeout(timeoutId);
      }
      
      console.log('📡 Respuesta del servidor:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        url: response.url
      });
      
      if (response.ok) {
        const precioData = await response.json();
        console.log('📦 Datos de precio recibidos:', precioData);
        const precioVenta = Number(precioData.precioVenta) || precioPromedio;
        console.log('✅ Precio de venta encontrado:', precioVenta, '(promedio fallback:', precioPromedio, ')');
        
        setProductos(productos.map((p) => {
          if (p.id === productoId) {
            return {
              ...p,
              productoId: productoIdNum,
              nombre: selectedProducto.nombre,
              precioVenta: precioVenta
            };
          }
          return p;
        }));
      } else {
        const errorText = await response.text();
        console.error('❌ Error al obtener precio:', {
          status: response.status,
          statusText: response.statusText,
          errorText: errorText,
          endpoint: endpoint,
          productoId: productoIdNum
        });
        
        if (response.status === 404) {
          console.log('⚠️ Precio específico no encontrado (404), usando precio promedio:', precioPromedio);
          // El precio promedio ya está establecido arriba, solo cerramos el dropdown
        } else {
          toast.error(`Error al obtener precio: ${response.status} ${response.statusText}`);
        }
      }
    } catch (error: any) {
      console.error('❌ Excepción al obtener precio:', {
        error: error,
        message: error.message,
        name: error.name,
        stack: error.stack,
        productoId: productoIdNum
      });
      
      if (error.name !== 'AbortError') {
        toast.error(`Error al obtener precio: ${error.message}`);
      }
    }
    
    setOpenDropdowns(prev => ({
      ...prev,
      [productoId]: false
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
      const nuevosProductos = reparacion.productos_reparacion_frecuente.map((p: {
        id: number;
        productoId: number;
        cantidad: number;
        precioVenta: number;
        conceptoExtra?: string;
        precioConceptoExtra?: number;
        productos: {
          id: number;
          nombre: string;
          precioPromedio: number;
        };
      }) => {
        // Buscar el producto en el catálogo
        const productoCatalogo = catalogoProductos?.find((prod: Producto) => prod.id === p.productoId);
        
        if (!productoCatalogo) {
          console.error('Producto no encontrado en catálogo:', p);
          toast.error(`Producto no encontrado en catálogo: ${p.productos?.nombre || 'Desconocido'}`);
          return null;
        }

        return {
          id: Math.random().toString(36).substr(2, 9),
          productoId: p.productoId,
          cantidad: p.cantidad,
          precioVenta: p.precioVenta,
          conceptoExtra: p.conceptoExtra || undefined,
          precioConceptoExtra: p.precioConceptoExtra || undefined,
          nombre: productoCatalogo.nombre,
        };
      }).filter(Boolean); // Filtrar productos nulos

      if (nuevosProductos.length === 0) {
        toast.error('No se pudieron cargar los productos de la reparación frecuente');
        return;
      }

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
        conceptos: productos.map((p) => {
          // Si es un concepto extra de una reparación frecuente
          if (p.conceptoExtra) {
            return {
              descripcion: p.conceptoExtra,
              cantidad: p.cantidad,
              precioUnitario: p.precioConceptoExtra || p.precioVenta,
              total: p.cantidad * (p.precioConceptoExtra || p.precioVenta)
            };
          }

          // Lista de conceptos especiales que no son productos físicos
          const conceptosEspeciales = ['Mano de Obra', 'Diagnostico', 'Diagnóstico'];
          
          // Si es un concepto especial, lo manejamos diferente
          if (conceptosEspeciales.some(concepto => 
            p.nombre?.includes(concepto)
          )) {
            return {
              descripcion: p.nombre || 'Concepto sin nombre',
              cantidad: p.cantidad,
              precioUnitario: p.precioVenta,
              total: p.cantidad * p.precioVenta
            };
          }

          // Para productos normales, buscamos en el catálogo
          const productoCatalogo = catalogoProductos?.find((prod: Producto) => 
            prod.id === p.productoId
          );

          if (!productoCatalogo) {
            console.error('Producto no encontrado en catálogo:', p);
            throw new Error(`Producto no encontrado en catálogo: ${p.nombre}`);
          }

          return {
            descripcion: productoCatalogo.nombre,
            cantidad: p.cantidad,
            precioUnitario: p.precioVenta,
            total: p.cantidad * p.precioVenta
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

      // Recargar el presupuesto
      await refetchPresupuesto();

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

            {/* Tabla de productos */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Productos</h3>
                <Button onClick={handleAddProducto} size="sm">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Agregar Producto
                </Button>
              </div>

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
                        <Popover open={openDropdowns[producto.id]} onOpenChange={() => toggleDropdown(producto.id)}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={openDropdowns[producto.id]}
                              className="w-full justify-between"
                            >
                              {producto.nombre || "Seleccionar producto..."}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0">
                            <Command>
                              <CommandInput
                                placeholder="Buscar producto..."
                                value={searchValue}
                                onValueChange={setSearchValue}
                              />
                              <CommandEmpty>
                                {isSearching ? "Buscando..." : "No se encontraron productos."}
                              </CommandEmpty>
                              <CommandGroup className="max-h-64 overflow-y-auto">
                                {searchResults.map((prod: Producto) => (
                                  <CommandItem
                                    key={prod.id}
                                    value={`${prod.nombre} ${prod.sku}`}
                                    onSelect={() => handleProductoSelect(producto.id, prod)}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        prod.id === producto.productoId ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    <div className="flex flex-col">
                                      <span className="font-medium">{prod.nombre}</span>
                                      <span className="text-sm text-gray-500">SKU: {prod.sku}</span>
                                      {prod.marca && <span className="text-sm text-gray-500">Marca: {prod.marca.nombre}</span>}
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="1"
                          value={producto.cantidad}
                          onChange={(e) => handleProductoChange(producto.id, 'cantidad', parseInt(e.target.value))}
                          className="w-20"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={producto.precioVenta}
                          onChange={(e) => handleProductoChange(producto.id, 'precioVenta', parseFloat(e.target.value))}
                          className="w-32"
                        />
                      </TableCell>
                      <TableCell>
                        ${(producto.cantidad * producto.precioVenta).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
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
                <div className="text-right">
                  <div className="text-sm text-gray-500">Total</div>
                  <div className="text-2xl font-bold">${calcularTotal().toFixed(2)}</div>
                </div>
              </div>

              {/* Botón de guardar */}
              <div className="flex justify-end">
                <Button
                  onClick={handleGuardarPresupuesto}
                  disabled={isLoading}
                  className="bg-[#FEBF19] hover:bg-[#FEBF19]/90"
                >
                  <HiSave className="mr-2 h-5 w-5" />
                  {isLoading ? 'Guardando...' : 'Guardar Presupuesto'}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 