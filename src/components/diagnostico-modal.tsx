import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Ticket } from '@/types/ticket';
import { useRouter } from 'next/navigation';

interface DiagnosticoModalProps {
  open: boolean;
  onClose: () => void;
  ticket: Ticket;
}

export const DiagnosticoModal: React.FC<DiagnosticoModalProps> = ({ open, onClose, ticket }) => {
  const router = useRouter();
  const [diagnostico, setDiagnostico] = useState('');
  const [piezasNecesarias, setPiezasNecesarias] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`/api/tickets/${ticket.id}/diagnostico`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          diagnostico,
          piezasNecesarias,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al guardar el diagnóstico');
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
          <DialogTitle>Registrar Diagnóstico</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="diagnostico" className="block text-sm font-medium mb-1">
              Diagnóstico Técnico
            </label>
            <Textarea
              id="diagnostico"
              value={diagnostico}
              onChange={(e) => setDiagnostico(e.target.value)}
              placeholder="Describe el diagnóstico técnico..."
              required
            />
          </div>

          <div>
            <label htmlFor="piezas" className="block text-sm font-medium mb-1">
              Piezas Necesarias
            </label>
            <Textarea
              id="piezas"
              value={piezasNecesarias}
              onChange={(e) => setPiezasNecesarias(e.target.value)}
              placeholder="Lista las piezas necesarias para la reparación..."
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Guardando...' : 'Guardar Diagnóstico'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}; 