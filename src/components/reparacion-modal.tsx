'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Ticket } from '@/types/ticket';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface ReparacionModalProps {
  open: boolean;
  onClose: () => void;
  ticket: Ticket;
}

export const ReparacionModal: React.FC<ReparacionModalProps> = ({ open, onClose, ticket }) => {
  const router = useRouter();
  const [observaciones, setObservaciones] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`/api/tickets/${ticket.id}/reparacion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          observaciones,
          completar: !ticket.reparacion?.fechaInicio || !!ticket.reparacion?.fechaInicio,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Manejar errores de stock insuficiente
        if (response.status === 400 && errorData.stockFaltante && errorData.stockFaltante.length > 0) {
          const productos = errorData.stockFaltante.map((item: any) => 
            `• ${item.piezaNombre}: necesitas ${item.cantidadNecesaria}, disponibles ${item.stockDisponible}`
          ).join('\n');
          
          toast.error(
            <div className="space-y-2">
              <p className="font-bold">⚠️ Stock insuficiente</p>
              <p className="text-sm">No se puede completar la reparación por falta de stock:</p>
              <pre className="text-xs whitespace-pre-wrap">{productos}</pre>
              <p className="text-xs mt-2">Por favor, verifica el inventario antes de continuar.</p>
            </div>,
            { duration: 8000 }
          );
          return;
        }
        
        throw new Error(errorData.error || 'Error al actualizar la reparación');
      }

      toast.success('Reparación actualizada correctamente');
      router.refresh();
      onClose();
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'Error al actualizar la reparación');
    } finally {
      setIsLoading(false);
    }
  };

  const getTitle = () => {
    if (!ticket.reparacion?.fechaInicio) {
      return 'Iniciar Reparación';
    }
    if (!ticket.reparacion?.fechaFin) {
      return 'Completar Reparación';
    }
    return 'Actualizar Reparación';
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="observaciones" className="block text-sm font-medium mb-1">
              Observaciones
            </label>
            <Textarea
              id="observaciones"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Ingrese las observaciones de la reparación..."
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Guardando...' : getTitle()}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}; 