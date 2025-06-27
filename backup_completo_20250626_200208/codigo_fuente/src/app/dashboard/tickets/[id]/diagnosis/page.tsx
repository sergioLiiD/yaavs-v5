'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { HiSave, HiX, HiClock, HiCamera } from 'react-icons/hi';

interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
}

interface TicketDiagnosis {
  id: string;
  ticketId: string;
  checklistRecepcion: ChecklistItem[];
  saludBateria: number;
  versionSO: string;
  notasDiagnostico: string;
  fotos: string[];
  videos: string[];
  presupuesto: {
    items: {
      id: string;
      nombre: string;
      precio: number;
      cantidad: number;
    }[];
    total: number;
  };
  tiempoInicio: string;
}

export default function DiagnosisPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [diagnosis, setDiagnosis] = useState<TicketDiagnosis>({
    id: '',
    ticketId: params.id,
    checklistRecepcion: [
      { id: '1', label: 'Pantalla intacta', checked: false },
      { id: '2', label: 'Cámara funcional', checked: false },
      { id: '3', label: 'Batería original', checked: false },
      { id: '4', label: 'Carcasa en buen estado', checked: false },
      { id: '5', label: 'Botones funcionales', checked: false },
    ],
    saludBateria: 0,
    versionSO: '',
    notasDiagnostico: '',
    fotos: [],
    videos: [],
    presupuesto: {
      items: [],
      total: 0
    },
    tiempoInicio: new Date().toISOString()
  });

  // Estado para el cronómetro
  const [tiempoTranscurrido, setTiempoTranscurrido] = useState(0);

  // Efecto para el cronómetro
  useEffect(() => {
    const interval = setInterval(() => {
      setTiempoTranscurrido(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Formatear tiempo para mostrar
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Manejadores de cambios
  const handleChecklistChange = (itemId: string) => {
    setDiagnosis(prev => ({
      ...prev,
      checklistRecepcion: prev.checklistRecepcion.map(item =>
        item.id === itemId ? { ...item, checked: !item.checked } : item
      )
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDiagnosis(prev => ({ ...prev, [name]: value }));
  };

  const handleSaludBateriaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value >= 0 && value <= 100) {
      setDiagnosis(prev => ({ ...prev, saludBateria: value }));
    }
  };

  // Guardar diagnóstico
  const handleSave = async () => {
    try {
      setIsLoading(true);
      await axios.post(`/api/tickets/${params.id}/diagnosis`, diagnosis);
      router.push(`/dashboard/tickets/${params.id}/repair`);
    } catch (err) {
      console.error('Error al guardar diagnóstico:', err);
      setError('Error al guardar el diagnóstico');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Diagnóstico del Ticket #{params.id}</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <HiClock className="h-5 w-5 text-gray-500" />
            <span className="text-lg font-mono">{formatTime(tiempoTranscurrido)}</span>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={isLoading}
            >
              <HiSave className="mr-2 h-5 w-5" />
              Guardar y Continuar
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push(`/dashboard/tickets/${params.id}`)}
            >
              <HiX className="mr-2 h-5 w-5" />
              Cancelar
            </Button>
          </div>
        </div>
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Contenido */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Checklist de recepción */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Checklist de Recepción</h2>
          <div className="space-y-3">
            {diagnosis.checklistRecepcion.map((item) => (
              <div key={item.id} className="flex items-center space-x-2">
                <Checkbox
                  id={item.id}
                  checked={item.checked}
                  onCheckedChange={() => handleChecklistChange(item.id)}
                />
                <Label htmlFor={item.id}>{item.label}</Label>
              </div>
            ))}
          </div>
        </div>

        {/* Información del diagnóstico */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Información del Diagnóstico</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="saludBateria">Salud de la Batería (%)</Label>
              <Input
                id="saludBateria"
                name="saludBateria"
                type="number"
                min="0"
                max="100"
                value={diagnosis.saludBateria}
                onChange={handleSaludBateriaChange}
              />
            </div>
            <div>
              <Label htmlFor="versionSO">Versión del Sistema Operativo</Label>
              <Input
                id="versionSO"
                name="versionSO"
                value={diagnosis.versionSO}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="notasDiagnostico">Notas de Diagnóstico</Label>
              <Textarea
                id="notasDiagnostico"
                name="notasDiagnostico"
                value={diagnosis.notasDiagnostico}
                onChange={handleInputChange}
                rows={4}
              />
            </div>
          </div>
        </div>

        {/* Fotografías y videos */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Fotografías y Videos</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <HiCamera className="w-10 h-10 mb-2 text-gray-400" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click para subir</span> o arrastrar y soltar
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG o MP4 (MAX. 800x400px)</p>
                </div>
                <input type="file" className="hidden" multiple accept="image/*,video/*" />
              </label>
            </div>
            {/* Aquí se mostrarán las previsualizaciones de las fotos y videos */}
          </div>
        </div>

        {/* Presupuesto */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Presupuesto</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total:</span>
              <span className="text-xl font-bold">${diagnosis.presupuesto.total.toFixed(2)}</span>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push(`/dashboard/tickets/${params.id}/presupuesto`)}
            >
              Agregar Items al Presupuesto
            </Button>
            {/* Aquí se mostrará la lista de items del presupuesto */}
          </div>
        </div>
      </div>
    </div>
  );
} 