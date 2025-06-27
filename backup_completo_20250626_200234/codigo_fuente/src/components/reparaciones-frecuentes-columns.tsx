"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Pencil, Trash } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export type ReparacionFrecuente = {
  id: string
  nombre: string
  productos: Array<{
    id: string
    nombre: string
    precio: number
  }>
  pasos: Array<{
    id: string
    descripcion: string
  }>
}

export const columns: ColumnDef<ReparacionFrecuente>[] = [
  {
    accessorKey: "nombre",
    header: "Nombre",
  },
  {
    accessorKey: "productos",
    header: "Productos",
    cell: ({ row }) => {
      const productos = row.getValue("productos") as ReparacionFrecuente["productos"]
      return productos.length
    },
  },
  {
    accessorKey: "pasos",
    header: "Pasos",
    cell: ({ row }) => {
      const pasos = row.getValue("pasos") as ReparacionFrecuente["pasos"]
      return pasos.length
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const reparacion = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menú</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => {
                // TODO: Implementar edición
              }}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                // TODO: Implementar eliminación
              }}
            >
              <Trash className="mr-2 h-4 w-4" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
] 