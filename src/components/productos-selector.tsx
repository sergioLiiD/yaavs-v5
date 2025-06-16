"use client"

import * as React from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface Producto {
  id: string
  nombre: string
  precio: number
  tipo: string
}

interface ProductosSelectorProps {
  productos: Producto[]
  selectedProductos: Producto[]
  onProductosChange: (productos: Producto[]) => void
}

export function ProductosSelector({
  productos,
  selectedProductos,
  onProductosChange,
}: ProductosSelectorProps) {
  const [open, setOpen] = React.useState(false)
  const [precioVenta, setPrecioVenta] = React.useState(0)

  const toggleProducto = (producto: Producto) => {
    const isSelected = selectedProductos.some((p) => p.id === producto.id)
    if (isSelected) {
      onProductosChange(selectedProductos.filter((p) => p.id !== producto.id))
    } else {
      onProductosChange([...selectedProductos, producto])
    }
  }

  const fetchPrecioVenta = async (productoId: string, tipo: string) => {
    try {
      console.log('Buscando precio para:', { productoId, tipo });
      
      // Construir la URL con el endpoint correcto según el tipo
      const endpoint = tipo === 'SERVICIO' ? 'servicio' : 'producto';
      const url = new URL(`/api/precios-venta/${endpoint}/${productoId}`, window.location.origin);
      
      console.log('Consultando URL:', url.toString());
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        if (response.status === 404) {
          console.log('No se encontró precio para:', { productoId, tipo });
          return null;
        }
        throw new Error('Error al obtener los precios');
      }
      
      const precio = await response.json();
      console.log('Precio encontrado:', precio);
      return precio;
    } catch (error) {
      console.error('Error al obtener el precio:', error);
      return null;
    }
  };

  const handleProductoChange = async (productoId: string) => {
    try {
      const producto = productos.find(p => p.id === productoId);
      if (!producto) {
        console.log('Producto no encontrado:', productoId);
        return;
      }

      console.log('Producto seleccionado:', producto);
      
      // Asegurarnos de que el tipo sea correcto
      let tipo = producto.tipo;
      if (producto.nombre === 'Mano de Obra') {
        tipo = 'SERVICIO';
        console.log('Forzando tipo SERVICIO para Mano de Obra');
      }
      
      const precio = await fetchPrecioVenta(productoId, tipo);
      
      if (precio) {
        console.log('Precio encontrado:', precio);
        setPrecioVenta(precio.precioVenta);
      } else {
        console.log('No se encontró precio para el producto:', producto);
        setPrecioVenta(0);
      }
    } catch (error) {
      console.error('Error al cambiar producto:', error);
      setPrecioVenta(0);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Command className="flex-1">
          <CommandInput placeholder="Buscar producto..." />
          <CommandList>
            <CommandEmpty>No se encontraron productos.</CommandEmpty>
            <CommandGroup>
              {productos.map((producto) => (
                <CommandItem
                  key={producto.id}
                  value={producto.nombre}
                  onSelect={() => {
                    toggleProducto(producto);
                    handleProductoChange(producto.id);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedProductos.some(p => p.id === producto.id) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {producto.nombre}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </div>

      {selectedProductos.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Productos seleccionados:</h3>
          <div className="space-y-2">
            {selectedProductos.map((producto) => (
              <div
                key={producto.id}
                className="flex items-center justify-between p-2 border rounded-md"
              >
                <div>
                  <p className="font-medium">{producto.nombre}</p>
                  <p className="text-sm text-gray-500">
                    Precio: ${producto.precio?.toFixed(2) || '0.00'}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    toggleProducto(producto);
                    handleProductoChange(producto.id);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 