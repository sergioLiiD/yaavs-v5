import { useState } from 'react';
import { Usuario, UpdateUsuarioDTO, NivelUsuario } from '@/types/usuario';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
import { PasswordGenerator } from '@/components/ui/PasswordGenerator';
import { toast } from 'sonner';

interface EditUsuarioDialogProps {
  usuario: Usuario | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUsuarioUpdated: () => void;
}

const NIVELES_USUARIO = ['ADMINISTRADOR', 'GERENTE', 'TECNICO', 'RECEPCIONISTA'] as const;

export function EditUsuarioDialog({
  usuario,
  open,
  onOpenChange,
  onUsuarioUpdated,
}: EditUsuarioDialogProps) {
  const [formData, setFormData] = useState<UpdateUsuarioDTO>({
    nombre: usuario?.nombre || '',
    apellidoPaterno: usuario?.apellidoPaterno || '',
    apellidoMaterno: usuario?.apellidoMaterno || '',
    email: usuario?.email || '',
    nivel: usuario?.nivel || 'TECNICO',
    password: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password && formData.password !== formData.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    try {
      const response = await fetch(`/api/usuarios/${usuario?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (response.status === 401) {
        window.location.href = '/auth/login';
        return;
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al actualizar el usuario');
      }

      toast.success('Usuario actualizado correctamente');
      onUsuarioUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error('Error:', error);
      toast.error(error instanceof Error ? error.message : 'Error al actualizar el usuario');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Usuario</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nombre" className="text-right">
                Nombre
              </Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="apellidoPaterno" className="text-right">
                Apellido Paterno
              </Label>
              <Input
                id="apellidoPaterno"
                value={formData.apellidoPaterno}
                onChange={(e) => setFormData({ ...formData, apellidoPaterno: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="apellidoMaterno" className="text-right">
                Apellido Materno
              </Label>
              <Input
                id="apellidoMaterno"
                value={formData.apellidoMaterno || ''}
                onChange={(e) => setFormData({ ...formData, apellidoMaterno: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nivel" className="text-right">
                Nivel
              </Label>
              <Select
                value={formData.nivel}
                onValueChange={(value) => setFormData({ ...formData, nivel: value as NivelUsuario })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMINISTRADOR">Administrador</SelectItem>
                  <SelectItem value="GERENTE">Gerente</SelectItem>
                  <SelectItem value="TECNICO">Técnico</SelectItem>
                  <SelectItem value="RECEPCIONISTA">Recepcionista</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Contraseña</Label>
              <div className="col-span-3">
                <PasswordGenerator
                  onPasswordGenerated={(password) => setFormData({ ...formData, password })}
                />
              </div>
            </div>
            {formData.password && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="confirmPassword" className="text-right">
                  Confirmar Contraseña
                </Label>
                <Input
                  id="confirmPassword"
                  type="text"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="col-span-3"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="submit">Guardar Cambios</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 