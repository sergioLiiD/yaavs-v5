'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
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
  const [saludBateria, setSaludBateria] = useState('');
  const [versionSO, setVersionSO] = useState('');
  const [capacidad, setCapacidad] = useState(ticket.capacidad || '');
  const [codigoDesbloqueo, setCodigoDesbloqueo] = useState(ticket.codigoDesbloqueo || '');
  const [redCelular, setRedCelular] = useState(ticket.redCelular || '');
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
          saludBateria: parseInt(saludBateria),
          versionSO,
          capacidad,
          codigoDesbloqueo,
          redCelular
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="saludBateria" className="block text-sm font-medium mb-1">
                Salud de la Batería (%)
              </label>
              <Input
                id="saludBateria"
                type="number"
                min="0"
                max="100"
                value={saludBateria}
                onChange={(e) => setSaludBateria(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="versionSO" className="block text-sm font-medium mb-1">
                Versión del Sistema Operativo
              </label>
              <Input
                id="versionSO"
                value={versionSO}
                onChange={(e) => setVersionSO(e.target.value)}
                placeholder="Ej: iOS 15.4.1"
                required
              />
            </div>

            <div>
              <label htmlFor="capacidad" className="block text-sm font-medium mb-1">
                Capacidad
              </label>
              <Input
                id="capacidad"
                value={capacidad}
                onChange={(e) => setCapacidad(e.target.value)}
                placeholder="Ej: 128GB"
                required
              />
            </div>

            <div>
              <label htmlFor="codigoDesbloqueo" className="block text-sm font-medium mb-1">
                Código de Desbloqueo
              </label>
              <Input
                id="codigoDesbloqueo"
                value={codigoDesbloqueo}
                onChange={(e) => setCodigoDesbloqueo(e.target.value)}
                placeholder="PIN, Patrón o Contraseña"
                required
              />
            </div>

            <div>
              <label htmlFor="redCelular" className="block text-sm font-medium mb-1">
                Red Celular
              </label>
              <Input
                id="redCelular"
                value={redCelular}
                onChange={(e) => setRedCelular(e.target.value)}
                placeholder="Ej: Telcel, Movistar, AT&T"
                required
              />
            </div>
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