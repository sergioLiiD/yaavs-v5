'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Ticket } from '@/types/ticket';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { HiClock, HiCamera, HiVideoCamera } from 'react-icons/hi';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

interface ChecklistItem {
  id: number;
  nombre: string;
  descripcion?: string;
  paraDiagnostico: boolean;
  paraReparacion: boolean;
}

interface ReparacionSectionProps {
  ticket: Ticket;
  onUpdate: () => void;
}

export const ReparacionSection: React.FC<ReparacionSectionProps> = ({ ticket, onUpdate }) => {
  const router = useRouter();
  const [observaciones, setObservaciones] = useState(ticket.reparacion?.observaciones || '');
  const [isLoading, setIsLoading] = useState(false);
  const [tiempoTranscurrido, setTiempoTranscurrido] = useState(0);
  const [checklist, setChecklist] = useState<Array<{
    id: number;
    item: string;
    respuesta: boolean;
    observacion: string;
  }>>([]);
  const [fotos, setFotos] = useState<string[]>(ticket.reparacion?.fotos || []);
  const [videos, setVideos] = useState<string[]>(ticket.reparacion?.videos || []);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Verificar si hay pagos realizados
  const hasPayments = ticket.pagos && ticket.pagos.length > 0;
  const totalPaid = ticket.pagos?.reduce((sum, pago) => sum + pago.monto, 0) || 0;
  const hasValidPayment = hasPayments;

  console.log('Estado del ticket:', {
    ticketId: ticket.id,
    pagos: ticket.pagos,
    hasPayments,
    totalPaid,
    hasValidPayment,
    reparacion: ticket.reparacion,
    isTimerRunning,
    isPaused
  });

  // Obtener items del checklist para reparación
  const { data: checklistItems } = useQuery({
    queryKey: ['checklistReparacion'],
    queryFn: async () => {
      const response = await axios.get('/api/catalogo/checklist');
      return response.data.filter((item: ChecklistItem) => item.paraReparacion);
    },
  });

  // Inicializar checklist cuando se cargan los items
  useEffect(() => {
    if (checklistItems && checklist.length === 0) {
      setChecklist(checklistItems.map((item: ChecklistItem) => ({
        id: item.id,
        item: item.nombre,
        respuesta: false,
        observacion: ''
      })));
    }
  }, [checklistItems]);

  // Timer para el tiempo de reparación
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isTimerRunning && !isPaused) {
      const ahora = new Date().getTime();
      const tiempoInicial = 0;
      setTiempoTranscurrido(tiempoInicial);

      interval = setInterval(() => {
        setTiempoTranscurrido(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, isPaused]);

  const handleStartTimer = async () => {
    try {
      console.log('Iniciando reparación...');
      const response = await axios.post(`/api/tickets/${ticket.id}/reparacion/iniciar`);
      console.log('Respuesta del servidor:', response.data);
      
      if (response.data.fechaInicio) {
        setIsTimerRunning(true);
        setIsPaused(false);
        setTiempoTranscurrido(0);
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

  const handlePauseTimer = async () => {
    try {
      const response = await axios.post(`/api/tickets/${ticket.id}/reparacion/pausar`);
      if (response.data.fechaPausa) {
        setIsPaused(true);
        toast.success('Reparación pausada');
        if (onUpdate) {
          onUpdate();
        }
      }
    } catch (error) {
      console.error('Error al pausar la reparación:', error);
      toast.error('Error al pausar la reparación');
    }
  };

  const handleResumeTimer = async () => {
    try {
      const response = await axios.post(`/api/tickets/${ticket.id}/reparacion/reanudar`);
      if (response.data.fechaReanudacion) {
        setIsPaused(false);
        toast.success('Reparación reanudada');
        if (onUpdate) {
          onUpdate();
        }
      }
    } catch (error) {
      console.error('Error al reanudar la reparación:', error);
      toast.error('Error al reanudar la reparación');
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleChecklistChange = (index: number, field: 'respuesta' | 'observacion', value: boolean | string) => {
    const newChecklist = [...checklist];
    newChecklist[index] = {
      ...newChecklist[index],
      [field]: value
    };
    setChecklist(newChecklist);
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

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      const response = await axios.post(`/api/tickets/${ticket.id}/reparacion`, {
        observaciones,
        checklist,
        fotos,
        videos,
        completar: true
      });

      toast.success('Reparación completada correctamente');
      if (onUpdate) {
        onUpdate();
      }
      router.refresh();
    } catch (error) {
      console.error('Error al guardar la reparación:', error);
      toast.error('Error al guardar la reparación');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reparación</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
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
          <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <HiClock className="h-5 w-5 text-gray-500" />
              <span className="text-lg font-mono">{formatTime(tiempoTranscurrido)}</span>
            </div>
            <div className="flex items-center space-x-4">
              {!isTimerRunning && (
                <Button
                  onClick={handleStartTimer}
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={!hasValidPayment}
                >
                  Iniciar Reparación
                </Button>
              )}
              {isTimerRunning && !isPaused && (
                <Button
                  onClick={handlePauseTimer}
                  className="bg-yellow-600 hover:bg-yellow-700"
                >
                  Pausar
                </Button>
              )}
              {isPaused && (
                <Button
                  onClick={handleResumeTimer}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Reanudar
                </Button>
              )}
              <span className="text-sm text-gray-500">
                {ticket.reparacion?.fechaInicio 
                  ? `Iniciado: ${new Date(ticket.reparacion.fechaInicio).toLocaleString()}`
                  : 'No iniciado'}
              </span>
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

          {/* Checklist */}
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
                      value={item.observacion}
                      onChange={(e) => handleChecklistChange(index, 'observacion', e.target.value)}
                      placeholder="Observaciones (opcional)"
                      className="mt-2"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Subida de archivos */}
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
                <label
                  htmlFor="foto-upload"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                >
                  <HiCamera className="h-5 w-5 mr-2" />
                  Subir Fotos
                </label>
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
                <label
                  htmlFor="video-upload"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                >
                  <HiVideoCamera className="h-5 w-5 mr-2" />
                  Subir Videos
                </label>
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

          {/* Botón de completar reparación */}
          <div className="flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading ? 'Guardando...' : 'Completar Reparación'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 