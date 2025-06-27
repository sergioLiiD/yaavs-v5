import { Usuario } from '@/types/usuario';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HiPencil, HiTrash, HiBan } from 'react-icons/hi';
import { useState } from 'react';
import { EditUsuarioDialog } from './EditUsuarioDialog';
import { DeleteUsuarioDialog } from './DeleteUsuarioDialog';
import { ToggleUsuarioStatusDialog } from './ToggleUsuarioStatusDialog';

interface UsuariosTableProps {
  usuarios: Usuario[];
  onUsuarioUpdated: () => void;
}

export function UsuariosTable({ usuarios, onUsuarioUpdated }: UsuariosTableProps) {
  const [usuarioToEdit, setUsuarioToEdit] = useState<Usuario | null>(null);
  const [usuarioToDelete, setUsuarioToDelete] = useState<Usuario | null>(null);
  const [usuarioToToggle, setUsuarioToToggle] = useState<Usuario | null>(null);

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Nivel</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usuarios.map((usuario) => (
              <TableRow key={usuario.id}>
                <TableCell>
                  {usuario.nombre} {usuario.apellidoPaterno} {usuario.apellidoMaterno || ''}
                </TableCell>
                <TableCell>{usuario.email}</TableCell>
                <TableCell>
                  <Badge variant="outline">{usuario.nivel}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={usuario.activo ? "default" : "destructive"}>
                    {usuario.activo ? 'Activo' : 'Inactivo'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setUsuarioToEdit(usuario)}
                      title="Editar"
                    >
                      <HiPencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setUsuarioToToggle(usuario)}
                      title={usuario.activo ? "Desactivar" : "Activar"}
                    >
                      <HiBan className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setUsuarioToDelete(usuario)}
                      title="Eliminar"
                    >
                      <HiTrash className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <EditUsuarioDialog
        usuario={usuarioToEdit}
        open={!!usuarioToEdit}
        onOpenChange={(open) => !open && setUsuarioToEdit(null)}
        onUsuarioUpdated={onUsuarioUpdated}
      />

      <DeleteUsuarioDialog
        usuario={usuarioToDelete}
        open={!!usuarioToDelete}
        onOpenChange={(open) => !open && setUsuarioToDelete(null)}
        onUsuarioDeleted={onUsuarioUpdated}
      />

      <ToggleUsuarioStatusDialog
        usuario={usuarioToToggle}
        open={!!usuarioToToggle}
        onOpenChange={(open) => !open && setUsuarioToToggle(null)}
        onUsuarioUpdated={onUsuarioUpdated}
      />
    </>
  );
} 