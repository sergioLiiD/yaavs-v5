import { Usuario } from '@/types/usuario';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface DeleteUsuarioDialogProps {
  usuario: Usuario | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUsuarioDeleted: () => void;
}

export function DeleteUsuarioDialog({
  usuario,
  open,
  onOpenChange,
  onUsuarioDeleted,
}: DeleteUsuarioDialogProps) {
  const handleDelete = async () => {
    if (!usuario) return;

    try {
      const response = await fetch(`/api/usuarios/${usuario.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.status === 401) {
        window.location.href = '/auth/login';
        return;
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al eliminar el usuario');
      }

      toast.success('Usuario eliminado correctamente');
      onUsuarioDeleted();
      onOpenChange(false);
    } catch (error) {
      console.error('Error:', error);
      toast.error(error instanceof Error ? error.message : 'Error al eliminar el usuario');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Eliminar Usuario</DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que deseas eliminar al usuario{' '}
            {usuario?.nombre} {usuario?.apellidoPaterno}? Esta acción no se puede deshacer.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Eliminar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 