'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface AdminExceptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: (razon: string) => void | Promise<void>;
  isLoading?: boolean;
}

export function AdminExceptionDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  isLoading = false,
}: AdminExceptionDialogProps) {
  const [razon, setRazon] = useState('');

  const handleConfirm = async () => {
    if (!razon.trim()) return;
    await onConfirm(razon.trim());
    setRazon('');
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) setRazon('');
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="razon-excepcion">Razón de la excepción *</Label>
          <Textarea
            id="razon-excepcion"
            value={razon}
            onChange={(e) => setRazon(e.target.value)}
            placeholder="Explique por qué se omite este requisito del flujo..."
            rows={4}
            required
          />
          <p className="text-xs text-muted-foreground">
            Esta razón quedará registrada en el historial del ticket y no podrá omitirse.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading || !razon.trim()}
            className="bg-amber-600 hover:bg-amber-700"
          >
            {isLoading ? 'Registrando...' : 'Registrar excepción y continuar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
