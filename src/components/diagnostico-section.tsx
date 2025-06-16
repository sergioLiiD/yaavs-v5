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

  // Agregar logs para depuración
  console.log('DiagnosticoSection - Ticket recibido:', ticket);
  console.log('DiagnosticoSection - Datos del dispositivo:', {
    capacidad: ticket.capacidad,
    color: ticket.color,
    fechaCompra: ticket.fechaCompra,
    redCelular: ticket.redCelular,
    codigoDesbloqueo: ticket.codigoDesbloqueo,
    patronDesbloqueo: ticket.patronDesbloqueo
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticket?.id) return;

    try {
      setIsLoading(true);

      // Guardar el diagnóstico
      const diagnosticoResponse = await axios.post(`/api/tickets/${ticket.id}/diagnostico`, {
        diagnostico,
        saludBateria: Number(saludBateria),
        versionSO: versionSistema
      });

      if (!diagnosticoResponse.data) {
        throw new Error('Error al guardar el diagnóstico');
      }

      // Guardar el checklist de forma independiente
      const checklistResponse = await axios.post(`/api/tickets/${ticket.id}/checklist`, {
        checklist: checklist.map(item => ({
          itemId: item.itemId,
          respuesta: item.respuesta,
          observacion: item.observacion || ''
        }))
      });

      if (!checklistResponse.data.success) {
        throw new Error('Error al guardar el checklist');
      }

      // Actualizar el estado local con los datos del diagnóstico
      setDiagnostico(diagnosticoResponse.data.diagnostico || '');
      setSaludBateria(diagnosticoResponse.data.saludBateria?.toString() || '');
      setVersionSistema(diagnosticoResponse.data.versionSO || '');

      // Actualizar el estado local con las respuestas del checklist
      const respuestasActualizadas = checklistResponse.data.checklist.map((respuesta: any) => ({
        itemId: respuesta.checklistItem.id,
        item: respuesta.checklistItem.nombre,
        respuesta: Boolean(respuesta.respuesta),
        observacion: respuesta.observaciones || ''
      }));
      setChecklist(respuestasActualizadas);

      setIsEditing(false);
      toast.success('Diagnóstico y checklist guardados correctamente');
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error al guardar:', error);
      toast.error('Error al guardar los cambios');
    } finally {
      setIsLoading(false);
    }
  };

  // Función para cargar el checklist
  const loadChecklist = async () => {
    try {
      // Primero cargamos los items del catálogo
      const response = await fetch('/api/catalogo/checklist');
      if (!response.ok) throw new Error('Error al cargar items del checklist');
      const items = await response.json();
      
      // Filtrar solo los items para diagnóstico
      const diagnosticItems = items.filter((item: ChecklistItem) => item.paraDiagnostico);

      // Luego cargamos las respuestas existentes
      const checklistResponse = await fetch(`/api/tickets/${ticket.id}/checklist`);
      if (!checklistResponse.ok) throw new Error('Error al cargar respuestas del checklist');
      const { checklist: respuestasExistentes } = await checklistResponse.json();

      // Si hay respuestas existentes, las usamos
      if (respuestasExistentes && respuestasExistentes.length > 0) {
        const checklistConRespuestas = diagnosticItems.map((item: ChecklistItem) => {
          const respuestaExistente = respuestasExistentes.find(
            (r: any) => r.checklistItem.id === item.id
          );
          return {
            itemId: item.id,
            item: item.nombre,
            respuesta: respuestaExistente ? respuestaExistente.respuesta : false,
            observacion: respuestaExistente ? respuestaExistente.observaciones || '' : ''
          };
        });
        setChecklist(checklistConRespuestas);
      } else {
        // Si no hay respuestas, inicializamos con valores por defecto
        const initialChecklist = diagnosticItems.map((item: ChecklistItem) => ({
          itemId: item.id,
          item: item.nombre,
          respuesta: false,
          observacion: ''
        }));
        setChecklist(initialChecklist);
      }
    } catch (error) {
      console.error('Error al cargar items del checklist:', error);
      toast.error('Error al cargar items del checklist');
    }
  };

  // Cargar el checklist cuando se monta el componente o cambia el ticket
  useEffect(() => {
    if (ticket?.id) {
      loadChecklist();
    }
  }, [ticket?.id]);

  // Agregar un efecto para monitorear cambios en el checklist
  useEffect(() => {
    console.log('Estado actual del checklist:', checklist);
  }, [checklist]);

  // Agregar un log antes del render
  console.log('Renderizando DiagnosticoSection con checklist:', checklist);

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

  const renderDesbloqueoInfo = () => {
    if (!ticket.tipoDesbloqueo) return null;

    return (
      <div className="space-y-2">
        <h4 className="font-medium text-gray-700">Información de Desbloqueo</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Tipo de Desbloqueo</p>
            <p className="font-medium">
              {ticket.tipoDesbloqueo === 'pin' ? 'PIN' : 'Patrón'}
            </p>
          </div>
          {ticket.tipoDesbloqueo === 'pin' ? (
            <div>
              <p className="text-sm text-gray-500">Código de Desbloqueo</p>
              <p className="font-medium">{ticket.codigoDesbloqueo || 'No especificado'}</p>
            </div>
          ) : (
            <div>
              <p className="text-sm text-gray-500">Patrón de Desbloqueo</p>
              <div className="grid grid-cols-3 gap-1 w-24">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div
                    key={i}
                    className={`aspect-square border rounded ${
                      ticket.patronDesbloqueo?.includes(i + 1)
                        ? 'bg-blue-500 border-blue-600'
                        : 'bg-gray-100 border-gray-200'
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Secuencia: {ticket.patronDesbloqueo?.join(' → ') || 'No especificada'}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

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
        {/* Información del Dispositivo */}
        <div className="mb-6 space-y-4">
          <h3 className="text-lg font-semibold">Información del Dispositivo</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Capacidad</p>
              <p className="font-medium">{ticket.capacidad || 'No especificada'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Color</p>
              <p className="font-medium">{ticket.color || 'No especificado'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Fecha de Compra</p>
              <p className="font-medium">
                {ticket.fechaCompra ? new Date(ticket.fechaCompra).toLocaleDateString() : 'No especificada'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Red Celular</p>
              <p className="font-medium">{ticket.redCelular || 'No especificada'}</p>
            </div>
            {renderDesbloqueoInfo()}
          </div>
        </div>

        {/* Checklist de Verificación - Siempre visible */}
        <div className="mb-6 space-y-4">
          <h3 className="text-lg font-semibold">Checklist de Verificación</h3>
          <div className="space-y-4">
            {checklist && checklist.length > 0 ? (
              checklist.map((item, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{item.item}</span>
                    {isEditing ? (
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
                    ) : (
                      <span className={`px-2 py-1 rounded-full text-sm ${
                        item.respuesta ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {item.respuesta ? 'Sí' : 'No'}
                      </span>
                    )}
                  </div>
                  {isEditing ? (
                    <div className="mt-4">
                      <Textarea
                        value={item.observacion || ''}
                        onChange={(e) => handleChecklistChange(item.itemId, 'observacion', e.target.value)}
                        placeholder="Observaciones (opcional)"
                        className="w-full min-h-[100px]"
                      />
                    </div>
                  ) : (
                    item.observacion && (
                      <div className="text-sm text-gray-600 mt-2">
                        {item.observacion}
                      </div>
                    )
                  )}
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-4">
                No hay items en el checklist
              </div>
            )}
          </div>
        </div>

        {/* Formulario de Diagnóstico */}
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
          </div>
        )}
      </CardContent>
    </Card>
  );
} 