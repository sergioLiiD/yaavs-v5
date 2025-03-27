"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
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

  const toggleProducto = (producto: Producto) => {
    const isSelected = selectedProductos.some((p) => p.id === producto.id)
    if (isSelected) {
      onProductosChange(selectedProductos.filter((p) => p.id !== producto.id))
    } else {
      onProductosChange([...selectedProductos, producto])
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedProductos.length > 0
            ? `${selectedProductos.length} producto(s) seleccionado(s)`
            : "Seleccionar productos..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Buscar producto..." />
          <CommandEmpty>No se encontraron productos.</CommandEmpty>
          <CommandGroup>
            {productos.map((producto) => (
              <CommandItem
                key={producto.id}
                value={producto.nombre}
                onSelect={() => toggleProducto(producto)}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selectedProductos.some((p) => p.id === producto.id)
                      ? "opacity-100"
                      : "opacity-0"
                  )}
                />
                {producto.nombre} - ${producto.precio}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
} 