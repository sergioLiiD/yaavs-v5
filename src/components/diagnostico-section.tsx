'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Ticket } from '@/types/ticket';
import { useRouter } from 'next/navigation';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import axios from 'axios';

interface ChecklistItem {
  id: number;
  nombre: string;
  descripcion?: string;
  paraDiagnostico: boolean;
  paraReparacion: boolean;
}

interface DiagnosticoSectionProps {
  ticket: Ticket;
  onUpdate?: () => void;
}

export function DiagnosticoSection({ ticket, onUpdate }: DiagnosticoSectionProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [diagnostico, setDiagnostico] = useState(ticket.reparacion?.diagnostico || '');
  const [saludBateria, setSaludBateria] = useState(ticket.reparacion?.saludBateria?.toString() || '');
  const [versionSO, setVersionSO] = useState(ticket.reparacion?.versionSO || '');
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [checklist, setChecklist] = useState(
    ticket.reparacion?.checklistItems?.map(item => ({
      id: item.id,
      item: item.item,
      respuesta: item.respuesta,
      observacion: item.observacion || ''
    })) || []
  );

  useEffect(() => {
    const fetchChecklistItems = async () => {
      try {
        const response = await axios.get('/api/catalogo/checklist');
        const items = response.data.filter((item: ChecklistItem) => item.paraDiagnostico);
        setChecklistItems(items);
        
        // Si no hay items en el checklist actual, inicializar con los items del catálogo
        if (checklist.length === 0) {
          setChecklist(items.map((item: ChecklistItem) => ({
            id: item.id,
            item: item.nombre,
            respuesta: false,
            observacion: ''
          })));
        }
      } catch (error) {
        console.error('Error al cargar items del checklist:', error);
        toast.error('Error al cargar el checklist de diagnóstico');
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
          checklist
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al guardar el diagnóstico');
      }

      toast.success('Diagnóstico guardado correctamente');
      if (onUpdate) {
        onUpdate();
      }
      router.refresh();
    } catch (error) {
      console.error('Error al guardar el diagnóstico:', error);
      toast.error(error instanceof Error ? error.message : 'Error al guardar el diagnóstico');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Diagnóstico</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="diagnostico">Diagnóstico</Label>
            <Textarea
              id="diagnostico"
              value={diagnostico}
              onChange={(e) => setDiagnostico(e.target.value)}
              placeholder="Describe el diagnóstico del dispositivo..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="saludBateria">Salud de la Batería (%)</Label>
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

            <div className="space-y-2">
              <Label htmlFor="versionSO">Versión del Sistema Operativo</Label>
              <Input
                id="versionSO"
                value={versionSO}
                onChange={(e) => setVersionSO(e.target.value)}
                placeholder="Ej: iOS 15.4.1"
                required
              />
            </div>
          </div>

          {checklist.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Checklist de Verificación</h3>
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

          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Guardando...' : 'Guardar Diagnóstico'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 