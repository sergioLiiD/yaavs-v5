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

interface ToggleUsuarioStatusDialogProps {
  usuario: Usuario | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUsuarioUpdated: () => void;
}

export function ToggleUsuarioStatusDialog({
  usuario,
  open,
  onOpenChange,
  onUsuarioUpdated,
}: ToggleUsuarioStatusDialogProps) {
  const handleToggle = async () => {
    if (!usuario) return;

    try {
      const response = await fetch(`/api/usuarios/${usuario.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...usuario,
          activo: !usuario.activo
        }),
      });

      if (response.status === 401) {
        window.location.href = '/auth/login';
        return;
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al actualizar el estado del usuario');
      }

      toast.success(`Usuario ${usuario.activo ? 'desactivado' : 'activado'} correctamente`);
      onUsuarioUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error('Error:', error);
      toast.error(error instanceof Error ? error.message : 'Error al actualizar el estado del usuario');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {usuario?.activo ? 'Desactivar Usuario' : 'Activar Usuario'}
          </DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que deseas{' '}
            {usuario?.activo ? 'desactivar' : 'activar'} al usuario{' '}
            {usuario?.nombre} {usuario?.apellidoPaterno}?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            variant={usuario?.activo ? 'destructive' : 'default'}
            onClick={handleToggle}
          >
            {usuario?.activo ? 'Desactivar' : 'Activar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 