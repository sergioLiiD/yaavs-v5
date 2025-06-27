import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Ticket } from '@/types/ticket';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import axios from 'axios';
import { TicketStatusBadge } from '@/components/tickets/TicketStatusBadge';

interface ChecklistItem {
  id: number;
  nombre: string;
  descripcion?: string;
  paraDiagnostico: boolean;
  paraReparacion: boolean;
}

interface EntregaSectionProps {
  ticket: Ticket;
  onUpdate: () => void;
}

export const EntregaSection: React.FC<EntregaSectionProps> = ({ ticket, onUpdate }) => {
  const router = useRouter();
  const [observaciones, setObservaciones] = useState(ticket.reparacion?.observaciones || '');
  const [isLoading, setIsLoading] = useState(false);
  const [checklist, setChecklist] = useState<Array<{
    id: number;
    item: string;
    respuesta: boolean;
    observacion: string;
  }>>([]);

  // Obtener items del checklist para entrega
  useEffect(() => {
    const fetchChecklistItems = async () => {
      try {
        const response = await axios.get('/api/catalogo/checklist');
        const items = response.data.filter((item: ChecklistItem) => item.paraReparacion);
        setChecklist(items.map((item: ChecklistItem) => ({
          id: item.id,
          item: item.nombre,
          respuesta: false,
          observacion: ''
        })));
      } catch (error) {
        console.error('Error al cargar items del checklist:', error);
        toast.error('Error al cargar el checklist de entrega');
      }
    };

    fetchChecklistItems();
  }, []);

  const handleChecklistChange = (index: number, field: 'respuesta' | 'observacion', value: boolean | string) => {
    const newChecklist = [...checklist];
    newChecklist[index] = {
      ...newChecklist[index],
      [field]: value
    };
    setChecklist(newChecklist);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(`/api/tickets/${ticket.id}/entrega`, {
        observaciones,
        checklist
      });

      if (response.data) {
        toast.success('Entrega registrada exitosamente');
        if (onUpdate) {
          onUpdate();
        }
      }
    } catch (error) {
      console.error('Error al registrar la entrega:', error);
      toast.error('Error al registrar la entrega');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Entrega</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="font-medium">Estado de la Entrega</h3>
            <TicketStatusBadge status={ticket.estatusReparacion?.nombre || ""} />
          </div>

          {ticket.reparacion && (
            <>
              <div>
                <h3 className="font-medium">Fecha de Entrega</h3>
                <p className="text-gray-500">
                  {ticket.reparacion.fechaFin
                    ? new Date(ticket.reparacion.fechaFin).toLocaleDateString()
                    : 'No se ha entregado'}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="observaciones">Observaciones de Entrega</Label>
                <Textarea
                  id="observaciones"
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  placeholder="Ingrese las observaciones de la entrega..."
                  rows={4}
                />
              </div>

              {/* Checklist de Entrega */}
              {checklist.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Checklist de Verificación Final</h3>
                  <div className="space-y-4">
                    {checklist.map((item, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{item.item}</span>
                          <div className="flex items-center space-x-4">
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                checked={item.respuesta === true}
                                onChange={() => handleChecklistChange(index, 'respuesta', true)}
                                className="form-radio"
                              />
                              <span>Sí</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                checked={item.respuesta === false}
                                onChange={() => handleChecklistChange(index, 'respuesta', false)}
                                className="form-radio"
                              />
                              <span>No</span>
                            </label>
                          </div>
                        </div>
                        <Textarea
                          value={item.observacion || ''}
                          onChange={(e) => handleChecklistChange(index, 'observacion', e.target.value)}
                          placeholder="Observaciones (opcional)"
                          className="mt-2"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button 
                onClick={handleSubmit} 
                disabled={isLoading || ticket.estatusReparacion?.nombre === 'Entregado'}
                className="bg-[#FEBF19] hover:bg-[#FEBF19]/90 text-white"
              >
                {isLoading ? 'Guardando...' : 'Registrar Entrega'}
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}; 