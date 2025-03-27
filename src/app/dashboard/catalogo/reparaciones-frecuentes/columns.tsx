'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

export type ReparacionFrecuente = {
  id: number;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
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
    id: 'acciones',
    cell: ({ row }) => {
      const reparacion = row.original;

      return (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              // TODO: Implementar edición
            }}
          >
            <PencilIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              // TODO: Implementar eliminación
            }}
          >
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
]; 