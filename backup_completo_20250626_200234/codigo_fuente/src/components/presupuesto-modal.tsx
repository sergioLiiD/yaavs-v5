'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Ticket } from '@/types/ticket';
import { useRouter } from 'next/navigation';

interface PresupuestoModalProps {
  open: boolean;
  onClose: () => void;
  ticket: Ticket;
}

export const PresupuestoModal: React.FC<PresupuestoModalProps> = ({ open, onClose, ticket }) => {
  const router = useRouter();
  const [presupuesto, setPresupuesto] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`/api/tickets/${ticket.id}/presupuesto`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          presupuesto: parseFloat(presupuesto),
        }),
      });

      if (!response.ok) {
        throw new Error('Error al guardar el presupuesto');
      }

      router.refresh();
      onClose();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generar Presupuesto</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="presupuesto" className="block text-sm font-medium mb-1">
              Monto del Presupuesto
            </label>
            <Input
              id="presupuesto"
              type="number"
              step="0.01"
              min="0"
              value={presupuesto}
              onChange={(e) => setPresupuesto(e.target.value)}
              placeholder="Ingrese el monto del presupuesto..."
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Guardando...' : 'Guardar Presupuesto'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}; 