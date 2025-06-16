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
import { HiSave, HiClock, HiCamera, HiX } from 'react-icons/hi';
import { useSession } from 'next-auth/react';

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
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(!ticket.reparacion?.diagnostico);
  const [diagnostico, setDiagnostico] = useState(ticket.reparacion?.diagnostico || '');
  const [saludBateria, setSaludBateria] = useState(ticket.reparacion?.saludBateria?.toString() || '');
  const [versionSistema, setVersionSistema] = useState(ticket.reparacion?.versionSO || '');
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [checklist, setChecklist] = useState<Array<{
    itemId: number;
    item: string;
    respuesta: boolean;
    observacion: string;
  }>>([]);

  // Verificar si el usuario tiene permisos para editar el diagnóstico
  const canEditDiagnostico = React.useMemo(() => {
    if (!session?.user) return false;
    
    // El usuario puede editar si:
    // 1. Es el técnico asignado al ticket
    // 2. Tiene el permiso REPAIRS_EDIT
    return (
      ticket.tecnicoAsignadoId === session.user.id ||
      session.user.permissions?.includes('REPAIRS_EDIT')
    );
  }, [session?.user, ticket.tecnicoAsignadoId]);

  useEffect(() => {
    if (!canEditDiagnostico) {
      setIsEditing(false);
    }
  }, [canEditDiagnostico]);

  useEffect(() => {
    const fetchChecklistItems = async () => {
      try {
        const response = await axios.get('/api/catalogo/checklist');
        const items = response.data.filter((item: ChecklistItem) => item.paraDiagnostico);
        console.log('Items del catálogo cargados:', items);
        setChecklistItems(items);

        if (ticket.reparacion?.checklistDiagnostico?.respuestas?.length > 0) {
          console.log('Respuestas existentes:', ticket.reparacion.checklistDiagnostico.respuestas);
          const respuestasExistentes = ticket.reparacion.checklistDiagnostico.respuestas.map(respuesta => ({
            itemId: respuesta.checklistItemId,
            item: respuesta.checklistItem.nombre,
            respuesta: Boolean(respuesta.respuesta),
            observacion: respuesta.observaciones || ''
          }));
          console.log('Procesando respuestas existentes:', respuestasExistentes);
          setChecklist(respuestasExistentes);
        } else {
          console.log('Inicializando checklist con items del catálogo:', items);
          const checklistInicial = items.map(item => ({
            itemId: item.id,
            item: item.nombre,
            respuesta: false,
            observacion: ''
          }));
          console.log('Checklist inicial creado:', checklistInicial);
          setChecklist(checklistInicial);
        }
      } catch (error) {
        console.error('Error al cargar items del checklist:', error);
      }
    };

    fetchChecklistItems();
  }, [ticket.reparacion?.checklistDiagnostico?.respuestas]);

  const handleChecklistChange = (itemId: number, field: 'respuesta' | 'observacion', value: boolean | string) => {
    console.log('handleChecklistChange:', { itemId, field, value });
    setChecklist(prev => prev.map(item => {
      if (item.itemId === itemId) {
        const updatedItem = {
          ...item,
          [field]: value
        };
        console.log('Item actualizado:', updatedItem);
        return updatedItem;
      }
      return item;
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticket?.id) return;

    try {
      setIsLoading(true);

      // Primero guardamos el checklist
      const checklistResponse = await axios.post(`/api/tickets/${ticket.id}/checklist`, {
        checklist: checklist.map(item => ({
          itemId: item.itemId,
          respuesta: item.respuesta,
          observacion: item.observacion || ''
        }))
      });

      // Luego guardamos el diagnóstico
      const response = await axios.post(`/api/tickets/${ticket.id}/diagnostico`, {
        descripcion: diagnostico,
        saludBateria: Number(saludBateria),
        versionSistema: versionSistema
      });

      // Actualizamos el estado local con las respuestas del checklist
      if (checklistResponse.data.success) {
        setChecklist(checklistResponse.data.checklist.map((respuesta: any) => ({
          itemId: respuesta.checklistItem.id,
          item: respuesta.checklistItem.nombre,
          respuesta: Boolean(respuesta.respuesta),
          observacion: respuesta.observaciones || ''
        })));
      }

      // Actualizamos el estado local con los datos del diagnóstico
      if (response.data.success) {
        setDiagnostico(response.data.reparacion.diagnostico || '');
        setSaludBateria(response.data.reparacion.saludBateria || 0);
        setVersionSistema(response.data.reparacion.versionSO || '');
        setIsEditing(false);
        toast.success('Diagnóstico guardado correctamente');
      }
    } catch (error) {
      console.error('Error al guardar el diagnóstico:', error);
      toast.error('Error al guardar el diagnóstico');
    } finally {
      setIsLoading(false);
    }
  };

  // Función para cargar el checklist
  const loadChecklist = async () => {
    if (!ticket?.id) return;

    try {
      const response = await axios.get(`/api/tickets/${ticket.id}/checklist`);
      if (response.data.success) {
        setChecklist(response.data.checklist.map((respuesta: any) => ({
          itemId: respuesta.checklistItem.id,
          item: respuesta.checklistItem.nombre,
          respuesta: Boolean(respuesta.respuesta),
          observacion: respuesta.observaciones || ''
        })));
      }
    } catch (error) {
      console.error('Error al cargar el checklist:', error);
      toast.error('Error al cargar el checklist');
    }
  };

  // Cargar el checklist cuando se monta el componente
  useEffect(() => {
    loadChecklist();
  }, [ticket?.id]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Diagnóstico</CardTitle>
        {!isEditing && canEditDiagnostico && (
          <Button
            variant="outline"
            onClick={() => setIsEditing(true)}
          >
            Editar Diagnóstico
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isEditing && canEditDiagnostico ? (
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
                <Label htmlFor="versionSistema">Versión del Sistema Operativo</Label>
                <Input
                  id="versionSistema"
                  value={versionSistema}
                  onChange={(e) => setVersionSistema(e.target.value)}
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
                              onChange={() => handleChecklistChange(item.itemId, 'respuesta', true)}
                              className="form-radio"
                            />
                            <span>SÍ</span>
                          </label>
                          <label className="flex items-center space-x-2">
                            <input
                              type="radio"
                              checked={item.respuesta === false}
                              onChange={() => handleChecklistChange(item.itemId, 'respuesta', false)}
                              className="form-radio"
                            />
                            <span>NO</span>
                          </label>
                        </div>
                      </div>
                      <div className="mt-4">
                        <Textarea
                          value={item.observacion || ''}
                          onChange={(e) => handleChecklistChange(item.itemId, 'observacion', e.target.value)}
                          placeholder="Observaciones (opcional)"
                          className="w-full min-h-[100px]"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isLoading}
              >
                <HiX className="h-5 w-5 mr-2" />
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                <HiSave className="h-5 w-5 mr-2" />
                {isLoading ? 'Guardando...' : 'Guardar Diagnóstico'}
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Diagnóstico</Label>
              <div className="text-lg">{diagnostico || 'No especificado'}</div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Salud de la Batería</Label>
                <div className="text-lg">{saludBateria ? `${saludBateria}%` : 'No especificado'}</div>
              </div>

              <div className="space-y-2">
                <Label>Versión del Sistema Operativo</Label>
                <div className="text-lg">{versionSistema || 'No especificado'}</div>
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
                        <span className={`px-2 py-1 rounded-full text-sm ${
                          item.respuesta ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {item.respuesta ? 'Sí' : 'No'}
                        </span>
                      </div>
                      {item.observacion && (
                        <div className="text-sm text-gray-600 mt-1">
                          {item.observacion}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 