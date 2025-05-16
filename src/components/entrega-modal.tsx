'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Ticket } from '@/types/ticket';
import { useRouter } from 'next/navigation';

interface EntregaModalProps {
  open: boolean;
  onClose: () => void;
  ticket: Ticket;
}

export const EntregaModal: React.FC<EntregaModalProps> = ({ open, onClose, ticket }) => {
  const router = useRouter();
  const [observaciones, setObservaciones] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`/api/tickets/${ticket.id}/entrega`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          observaciones,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al registrar la entrega');
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
          <DialogTitle>Registrar Entrega</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="observaciones" className="block text-sm font-medium mb-1">
              Observaciones de Entrega
            </label>
            <Textarea
              id="observaciones"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Ingrese las observaciones de la entrega..."
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Guardando...' : 'Registrar Entrega'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}; 