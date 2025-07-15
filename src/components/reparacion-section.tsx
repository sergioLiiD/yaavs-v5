'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Ticket } from '@/types/ticket';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { HiClock, HiCamera, HiVideoCamera, HiSave, HiPause, HiPlay } from 'react-icons/hi';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

interface ChecklistItem {
  id: number;
  nombre: string;
  descripcion?: string;
  paraDiagnostico: boolean;
  paraReparacion: boolean;
}

interface ChecklistRespuesta {
  itemId: number;
  item: string;
  respuesta: boolean;
  observacion: string;
}

interface ReparacionSectionProps {
  ticket: Ticket;
  onUpdate: () => void;
}

export const ReparacionSection: React.FC<ReparacionSectionProps> = ({ ticket, onUpdate }) => {
  const router = useRouter();
  const [observaciones, setObservaciones] = useState(ticket.reparacion?.observaciones || '');
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [tiempoTranscurrido, setTiempoTranscurrido] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTime = localStorage.getItem(`timer_${ticket.id}`);
      return savedTime ? parseInt(savedTime) : 0;
    }
    return 0;
  });
  const [isPaused, setIsPaused] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedPaused = localStorage.getItem(`paused_${ticket.id}`);
      return savedPaused === 'true';
    }
    return false;
  });
  const [isTimerRunning, setIsTimerRunning] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedRunning = localStorage.getItem(`running_${ticket.id}`);
      return savedRunning === 'true';
    }
    return false;
  });
  const [checklist, setChecklist] = useState<ChecklistRespuesta[]>([]);
  const [fotos, setFotos] = useState<string[]>(ticket.reparacion?.fotos || []);
  const [videos, setVideos] = useState<string[]>(ticket.reparacion?.videos || []);

  // Verificar si hay pagos realizados
  const hasPayments = ticket.pagos && ticket.pagos.length > 0;
  const totalPaid = ticket.pagos?.reduce((sum, pago) => sum + pago.monto, 0) || 0;
  const hasValidPayment = hasPayments;

  // Mover el console.log a un useEffect para evitar re-renderizados constantes
  useEffect(() => {
    console.log('Estado del ticket:', {
      ticketId: ticket.id,
      pagos: ticket.pagos,
      hasPayments,
      totalPaid,
      hasValidPayment,
      reparacion: ticket.reparacion,
      isTimerRunning,
      isPaused,
      tiempoTranscurrido
    });
  }, [ticket, isTimerRunning, isPaused, tiempoTranscurrido]);

  // Obtener items del checklist para reparación
  const { data: checklistItems } = useQuery({
    queryKey: ['checklistReparacion'],
    queryFn: async () => {
      const response = await axios.get('/api/catalogo/checklist');
      return response.data.filter((item: ChecklistItem) => item.paraReparacion);
    },
  });

  // Cargar respuestas existentes del checklist
  useEffect(() => {
    const fetchChecklistRespuestas = async () => {
      try {
        const response = await axios.get(`/api/tickets/${ticket.id}/checklist-reparacion`);
        console.log('Respuesta del checklist:', response.data);
        
        if (response.data.success && response.data.checklist.length > 0) {
          const respuestasExistentes = response.data.checklist.map((respuesta: any) => ({
            itemId: respuesta.checklist_item_id,
            item: respuesta.checklist_items?.nombre || 'Item sin nombre',
            respuesta: respuesta.respuesta,
            observacion: respuesta.observaciones || ''
          }));
          setChecklist(respuestasExistentes);
        } else if (checklistItems) {
          console.log('No hay respuestas existentes, usando items del catálogo:', checklistItems);
          setChecklist(checklistItems.map((item: ChecklistItem) => ({
            itemId: item.id,
            item: item.nombre,
            respuesta: false,
            observacion: ''
          })));
        }
      } catch (error) {
        console.error('Error al cargar respuestas del checklist:', error);
        // Si hay error, usar los items del catálogo como fallback
        if (checklistItems) {
          setChecklist(checklistItems.map((item: ChecklistItem) => ({
            itemId: item.id,
            item: item.nombre,
            respuesta: false,
            observacion: ''
          })));
        }
      }
    };

    if (ticket.id) {
      fetchChecklistRespuestas();
    }
  }, [ticket.id, checklistItems]);

  // Timer para el tiempo de reparación
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isTimerRunning && !isPaused) {
      interval = setInterval(() => {
        setTiempoTranscurrido(prev => {
          const newTime = prev + 1;
          localStorage.setItem(`timer_${ticket.id}`, newTime.toString());
          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isTimerRunning, isPaused, ticket.id]);

  const handleChecklistChange = (index: number, field: 'respuesta' | 'observacion', value: boolean | string) => {
    const newChecklist = [...checklist];
    newChecklist[index] = {
      ...newChecklist[index],
      [field]: value
    };
    setChecklist(newChecklist);
  };

  const handleStartTimer = async () => {
    try {
      const response = await axios.post(`/api/tickets/${ticket.id}/reparacion/iniciar`);
      if (response.data.fechaInicio) {
        setIsTimerRunning(true);
        setIsPaused(false);
        setTiempoTranscurrido(0);
        localStorage.setItem(`timer_${ticket.id}`, '0');
        localStorage.setItem(`running_${ticket.id}`, 'true');
        localStorage.setItem(`paused_${ticket.id}`, 'false');
        toast.success('Reparación iniciada');
        if (onUpdate) {
          onUpdate();
        }
      }
    } catch (error) {
      console.error('Error al iniciar la reparación:', error);
      toast.error('Error al iniciar la reparación');
    }
  };

  const handlePauseTimer = () => {
    setIsPaused(true);
    localStorage.setItem(`paused_${ticket.id}`, 'true');
  };

  const handleResumeTimer = () => {
    setIsPaused(false);
    localStorage.setItem(`paused_${ticket.id}`, 'false');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticket?.id) return;

    console.log('Iniciando guardado de reparación...', {
      ticketId: ticket.id,
      observaciones,
      checklist,
      fotos,
      videos
    });

    try {
      setIsLoading(true);
      const apiUrl = ticket.canEdit 
        ? `/api/repair-point/tickets/${ticket.id}/reparacion`
        : `/api/tickets/${ticket.id}/reparacion`;

      console.log('Enviando datos a:', apiUrl);

      const response = await axios.post(apiUrl, {
        observaciones,
        checklist,
        fotos,
        videos,
        completar: true
      });

      console.log('Respuesta del servidor:', response.data);

      if (response.data.success) {
        toast.success('Reparación completada correctamente');
        if (onUpdate) {
          onUpdate();
        }
        router.refresh();
      }
    } catch (error) {
      console.error('Error al guardar la reparación:', error);
      toast.error('Error al guardar la reparación');
    } finally {
      setIsLoading(false);
    }
  };

  // Formatear el tiempo en HH:MM:SS
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'foto' | 'video') => {
    const files = e.target.files;
    if (!files) return;

    try {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('files', file);
      });

      const response = await axios.post(`/api/tickets/${ticket.id}/media`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (type === 'foto') {
        setFotos([...fotos, ...response.data.urls]);
      } else {
        setVideos([...videos, ...response.data.urls]);
      }

      toast.success('Archivos subidos correctamente');
    } catch (error) {
      console.error('Error al subir archivos:', error);
      toast.error('Error al subir los archivos');
    }
  };

  const fetchReparacion = async () => {
    try {
      const apiUrl = ticket.canEdit 
        ? `/api/repair-point/tickets/${ticket.id}/reparacion`
        : `/api/tickets/${ticket.id}/reparacion`;

      const response = await axios.get(apiUrl);
      if (response.data.success && response.data.reparacion) {
        setObservaciones(response.data.reparacion.observaciones || '');
        setFotos(response.data.reparacion.archivos?.filter((a: any) => a.tipo === 'FOTO').map((a: any) => a.url) || []);
        setVideos(response.data.reparacion.archivos?.filter((a: any) => a.tipo === 'VIDEO').map((a: any) => a.url) || []);
      }
    } catch (error) {
      console.error('Error al obtener la reparación:', error);
      toast.error('Error al obtener la reparación');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reparación</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Validación de pago */}
          {!hasValidPayment && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    No se puede iniciar la reparación hasta que se haya registrado al menos un pago.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Timer */}
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-2xl font-mono">
                  {formatTime(tiempoTranscurrido)}
                </div>
                {!isTimerRunning && !ticket.reparacion?.fechaFin && (
                  <Button
                    type="button"
                    onClick={handleStartTimer}
                    className="bg-[#FEBF19] hover:bg-[#FEBF19]/90 text-white"
                  >
                    Iniciar Reparación
                  </Button>
                )}
                {isTimerRunning && !isPaused && (
                  <Button
                    type="button"
                    onClick={handlePauseTimer}
                    variant="outline"
                    className="text-black"
                  >
                    Pausar
                  </Button>
                )}
                {isTimerRunning && isPaused && (
                  <Button
                    type="button"
                    onClick={handleResumeTimer}
                    variant="outline"
                    className="text-black"
                  >
                    Reanudar
                  </Button>
                )}
              </div>
              <Button
                type="submit"
                className="bg-[#FEBF19] hover:bg-[#FEBF19]/90 text-white"
                disabled={isLoading}
              >
                {isLoading ? 'Completando...' : 'Concluir Reparación'}
              </Button>
            </div>
          </div>

          {/* Observaciones */}
          <div className="space-y-2">
            <Label htmlFor="observaciones">Observaciones de la Reparación</Label>
            <Textarea
              id="observaciones"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Describe el proceso de reparación..."
              rows={4}
            />
          </div>

          {/* Checklist de Verificación */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Checklist de Verificación</h3>
            <div className="space-y-4">
              {checklist.map((item, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id={`check-${index}-si`}
                      name={`check-${index}`}
                      checked={item.respuesta === true}
                      onChange={() => handleChecklistChange(index, 'respuesta', true)}
                      className="w-4 h-4 text-black border-black"
                    />
                    <label htmlFor={`check-${index}-si`}>Sí</label>
                    <input
                      type="radio"
                      id={`check-${index}-no`}
                      name={`check-${index}`}
                      checked={item.respuesta === false}
                      onChange={() => handleChecklistChange(index, 'respuesta', false)}
                      className="w-4 h-4 text-black border-black"
                    />
                    <label htmlFor={`check-${index}-no`}>No</label>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{item.item}</p>
                    <input
                      type="text"
                      value={item.observacion}
                      onChange={(e) => handleChecklistChange(index, 'observacion', e.target.value)}
                      placeholder="Observaciones..."
                      className="mt-1 w-full p-2 border rounded"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Subida de archivos */}
          {/* Comentado temporalmente
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Fotos de la Reparación</Label>
              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleFileUpload(e, 'foto')}
                  className="hidden"
                  id="foto-upload"
                />
                <Button
                  type="button"
                  onClick={() => document.getElementById('foto-upload')?.click()}
                  className="flex items-center space-x-2"
                >
                  <HiCamera className="h-5 w-5 text-black" />
                  <span>Subir Fotos</span>
                </Button>
              </div>
              {fotos.length > 0 && (
                <div className="grid grid-cols-3 gap-4 mt-4">
                  {fotos.map((foto, index) => (
                    <img
                      key={index}
                      src={foto}
                      alt={`Foto ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Videos de la Reparación</Label>
              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  accept="video/*"
                  multiple
                  onChange={(e) => handleFileUpload(e, 'video')}
                  className="hidden"
                  id="video-upload"
                />
                <Button
                  type="button"
                  onClick={() => document.getElementById('video-upload')?.click()}
                  className="flex items-center space-x-2"
                >
                  <HiVideoCamera className="h-5 w-5 text-black" />
                  <span>Subir Videos</span>
                </Button>
              </div>
              {videos.length > 0 && (
                <div className="grid grid-cols-2 gap-4 mt-4">
                  {videos.map((video, index) => (
                    <video
                      key={index}
                      src={video}
                      controls
                      className="w-full rounded-lg"
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
          */}
        </form>
      </CardContent>
    </Card>
  );
}; 