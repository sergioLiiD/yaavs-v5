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

// Definición local de ChecklistItem (idéntica a la usada en los tipos de ticket)
interface ChecklistItem {
  id: number;
  nombre: string;
  descripcion?: string | null;
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
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [diagnostico, setDiagnostico] = useState('');
  const [saludBateria, setSaludBateria] = useState('');
  const [versionSO, setVersionSO] = useState('');
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [checklist, setChecklist] = useState<Array<{
    itemId: number;
    item: string;
    respuesta: boolean;
    observacion: string;
  }>>([]);
  const [isEditingChecklist, setIsEditingChecklist] = useState(false);

  // Actualizar los estados cuando cambia el ticket
  useEffect(() => {
    if (ticket?.reparacion) {
      setDiagnostico(ticket.reparacion.diagnostico || '');
      setSaludBateria(ticket.reparacion.saludBateria?.toString() || '');
      setVersionSO(ticket.reparacion.versionSO || '');
    }
  }, [ticket]);

  // Verificar si el usuario tiene permisos para editar el diagnóstico
  const canEditDiagnostico = React.useMemo(() => {
    if (!session?.user) return false;
    
    // El usuario puede editar si:
    // 1. Es el técnico asignado al ticket
    // 2. Tiene el permiso REPAIRS_EDIT
    // 3. El ticket tiene canEdit = true (para puntos de reparación)
    return (
      ticket.tecnicoAsignadoId === session.user.id ||
      session.user.permissions?.includes('REPAIRS_EDIT') ||
      ticket.canEdit === true
    );
  }, [session?.user, ticket.tecnicoAsignadoId, ticket.canEdit]);

  useEffect(() => {
    if (!canEditDiagnostico) {
      setIsEditing(false);
    }
  }, [canEditDiagnostico]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticket?.id) return;

    try {
      setIsSaving(true);
      const apiUrl = ticket.canEdit 
        ? `/api/repair-point/tickets/${ticket.id}/diagnostico`
        : `/api/tickets/${ticket.id}/diagnostico`;

      console.log('Enviando datos al servidor:', {
        diagnostico,
        saludBateria: Number(saludBateria),
        versionSO
      });

      const response = await axios.post(apiUrl, {
        diagnostico,
        saludBateria: Number(saludBateria),
        versionSO
      });

      if (response.data.success) {
        // Actualizar el estado local con los datos devueltos
        setDiagnostico(response.data.diagnostico || '');
        setSaludBateria(response.data.saludBateria?.toString() || '');
        setVersionSO(response.data.versionSO || '');
        toast.success('Diagnóstico guardado correctamente');
        setIsEditing(false);
        if (onUpdate) onUpdate();
        router.refresh(); // Forzar actualización de la página
      }
    } catch (error) {
      toast.error('Error al guardar el diagnóstico');
    } finally {
      setIsSaving(false);
    }
  };

  // Cargar el diagnóstico al montar el componente
  useEffect(() => {
    const fetchDiagnostico = async () => {
      try {
        const apiUrl = ticket.canEdit 
          ? `/api/repair-point/tickets/${ticket.id}/diagnostico`
          : `/api/tickets/${ticket.id}/diagnostico`;

        const response = await axios.get(apiUrl);

        if (response.data.success) {
          setDiagnostico(response.data.diagnostico || '');
          setSaludBateria(response.data.saludBateria?.toString() || '');
          setVersionSO(response.data.versionSO || '');
        }
      } catch (error) {
        toast.error('Error al obtener el diagnóstico');
      }
    };

    if (ticket.id) {
      fetchDiagnostico();
    }
  }, [ticket.id, ticket.canEdit]);

  // Cargar el checklist cuando se monta el componente o cambia el ticket
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        console.log('🔍 Iniciando carga de checklist para ticket:', ticket?.id);
        
        // Primero cargamos los items del catálogo
        const response = await fetch('/api/catalogo/checklist');
        console.log('🔍 Respuesta del endpoint checklist:', response.status, response.ok);
        
        if (!response.ok) throw new Error('Error al cargar items del checklist');
        const items = await response.json();
        console.log('🔍 Items del catálogo cargados:', items);
        
        // Filtrar solo los items para diagnóstico
        const diagnosticItems = items.filter((item: any) => item.para_diagnostico);
        console.log('🔍 Items para diagnóstico filtrados:', diagnosticItems);

        // Luego cargamos las respuestas existentes del backend
        const apiUrl = ticket.canEdit 
          ? `/api/repair-point/tickets/${ticket.id}/checklist-diagnostico`
          : `/api/tickets/${ticket.id}/checklist-diagnostico`;
        const checklistResponse = await fetch(apiUrl);
        let respuestasExistentes: any[] = [];
        if (checklistResponse.ok) {
          const data = await checklistResponse.json();
          respuestasExistentes = data.checklist || [];
        }

        // Si hay respuestas existentes, las usamos
        if (!cancelled && respuestasExistentes && respuestasExistentes.length > 0) {
          const checklistConRespuestas = diagnosticItems.map((item: ChecklistItem) => {
            const respuestaExistente = respuestasExistentes.find(
              (r: any) => r.checklistItem.id === item.id
            );
            return {
              itemId: item.id,
              item: item.nombre,
              respuesta: respuestaExistente
                ? (typeof respuestaExistente.respuesta === 'boolean'
                    ? respuestaExistente.respuesta
                    : respuestaExistente.respuesta === true || respuestaExistente.respuesta === 'true')
                : false,
              observacion: respuestaExistente ? respuestaExistente.observaciones || '' : ''
            };
          });
          setChecklist(checklistConRespuestas);
        } else if (!cancelled) {
          // Si no hay respuestas del backend pero el ticket ya trae respuestas (SSR), úsalas
          const ssrRespuestas = ticket?.reparacion?.checklistDiagnostico?.respuestas;
          if (ssrRespuestas && ssrRespuestas.length > 0) {
            const checklistConSSR = diagnosticItems.map((item: ChecklistItem) => {
              const respuestaExistente = ssrRespuestas.find(
                (r: any) => r.checklistItem.id === item.id
              );
              return {
                itemId: item.id,
                item: item.nombre,
                respuesta: respuestaExistente ? Boolean(respuestaExistente.respuesta) : false,
                observacion: respuestaExistente ? respuestaExistente.observaciones || '' : ''
              };
            });
            setChecklist(checklistConSSR);
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
        }
      } catch (error) {
        toast.error('Error al cargar items del checklist');
      }
    };
    if (ticket?.id) {
      load();
    }
    return () => { cancelled = true; };
  }, [ticket?.id, ticket?.canEdit]);

  // Agregar un efecto para monitorear cambios en el checklist
  useEffect(() => {
  }, [checklist]);

  const handleChecklistChange = (itemId: number, field: 'respuesta' | 'observacion', value: boolean | string) => {
    setChecklist(prev => prev.map(item => {
      if (item.itemId === itemId) {
        const updatedItem = {
          ...item,
          [field]: value
        };
        return updatedItem;
      }
      return item;
    }));
  };

  // Función para guardar el checklist
  const handleSaveChecklist = async () => {
    try {
      setIsSaving(true);
      const apiUrl = ticket.canEdit 
        ? `/api/repair-point/tickets/${ticket.id}/checklist-diagnostico`
        : `/api/tickets/${ticket.id}/checklist-diagnostico`;

      const response = await axios.post(apiUrl, {
        checklist: checklist.map(item => ({
          itemId: item.itemId,
          respuesta: item.respuesta,
          observacion: item.observacion
        }))
      });

      if (response.data.success) {
        toast.success('Checklist guardado correctamente');
        setIsEditing(false);
        if (onUpdate) onUpdate();
      }
    } catch (error) {
      toast.error('Error al guardar el checklist');
    } finally {
      setIsSaving(false);
    }
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
          {isEditing && (
            <div className="flex justify-end mt-4">
              <Button onClick={handleSaveChecklist} disabled={isSaving}>
                {isSaving ? 'Guardando...' : 'Guardar Checklist'}
              </Button>
            </div>
          )}
        </div>

        {/* Formulario de Diagnóstico */}
        {isEditing && canEditDiagnostico ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="diagnostico">Diagnóstico</Label>
              <Textarea
                id="diagnostico"
                value={diagnostico}
                onChange={(e) => {
                  setDiagnostico(e.target.value);
                }}
                disabled={!isEditing || isLoading}
                className="min-h-[100px]"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="saludBateria">Salud de la Batería (%)</Label>
                <Input
                  id="saludBateria"
                  type="number"
                  min="0"
                  max="100"
                  value={saludBateria}
                  onChange={(e) => {
                    setSaludBateria(e.target.value);
                  }}
                  disabled={!isEditing || isLoading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="versionSO">Versión del Sistema</Label>
                <Input
                  id="versionSO"
                  value={versionSO}
                  onChange={(e) => {
                    setVersionSO(e.target.value);
                  }}
                  disabled={!isEditing || isLoading}
                  required
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              {isEditing ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      // Restaurar valores originales
                      if (ticket?.reparacion) {
                        setDiagnostico(ticket.reparacion.diagnostico || '');
                        setSaludBateria(ticket.reparacion.saludBateria?.toString() || '');
                        setVersionSO(ticket.reparacion.versionSO || '');
                      }
                    }}
                    disabled={isSaving}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSaving}
                  >
                    {isSaving ? 'Guardando...' : 'Guardar'}
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                  disabled={!canEditDiagnostico}
                >
                  Editar
                </Button>
              )}
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
                <div className="text-lg">{versionSO || 'No especificado'}</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 