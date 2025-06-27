'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { HiPencilAlt, HiTrash } from 'react-icons/hi';
import { TableCell } from '@/components/ui/table';

export type ReparacionFrecuente = {
  id: number;
  nombre: string;
  descripcion: string;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
  productos_reparacion_frecuente: {
    id: number;
    cantidad: number;
    precio_venta: number;
    productos: {
      id: number;
      nombre: string;
      precioPromedio: number;
    };
  }[];
  pasos_reparacion_frecuente: {
    id: number;
    descripcion: string;
    orden: number;
  }[];
};

export const columns: ColumnDef<ReparacionFrecuente>[] = [
  {
    accessorKey: 'nombre',
    header: 'Nombre',
  },
  {
    accessorKey: 'descripcion',
    header: 'Descripción',
  },
  {
    accessorKey: 'precio',
    header: 'Precio',
    cell: ({ row }) => {
      const reparacion = row.original;
      const precioTotal = reparacion.productos_reparacion_frecuente.reduce((total, producto) => {
        return total + (producto.precio_venta * producto.cantidad);
      }, 0);
      return `$${precioTotal.toFixed(2)}`;
    },
  },
  {
    accessorKey: 'activo',
    header: 'Estado',
    cell: ({ row }) => {
      const activo = row.getValue('activo') as boolean;
      return (
        <span className={`px-2 py-1 rounded-full text-xs ${
          activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {activo ? 'Activo' : 'Inactivo'}
        </span>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const reparacion = row.original;

      return (
        <TableCell className="text-right">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              // TODO: Implementar edición
            }}
            className="bg-[#FEBF19] text-gray-900 hover:bg-[#FEBF19]/90 focus:outline-none focus:ring-2 focus:ring-[#FEBF19] focus:ring-offset-2"
          >
            <HiPencilAlt className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              // TODO: Implementar eliminación
            }}
            className="bg-[#FEBF19] text-gray-900 hover:bg-[#FEBF19]/90 focus:outline-none focus:ring-2 focus:ring-[#FEBF19] focus:ring-offset-2 ml-2"
          >
            <HiTrash className="h-4 w-4" />
          </Button>
        </TableCell>
      );
    },
  },
]; 