'use client';

import { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { TipoServicio } from '@prisma/client';

interface TipoServicioSelectProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function TipoServicioSelect({ value, onChange, error }: TipoServicioSelectProps) {
  const [tiposServicio, setTiposServicio] = useState<TipoServicio[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTiposServicio = async () => {
      try {
        const response = await fetch('/api/tipo-servicio');
        if (!response.ok) {
          throw new Error('Error al cargar tipos de servicio');
        }
        const data = await response.json();
        setTiposServicio(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTiposServicio();
  }, []);

  return (
    <div className="space-y-2">
      <Label htmlFor="tipoServicio">Tipo de Servicio</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id="tipoServicio" className={error ? 'border-red-500' : ''}>
          <SelectValue placeholder="Selecciona un tipo de servicio" />
        </SelectTrigger>
        <SelectContent>
          {loading ? (
            <SelectItem value="loading" disabled>
              Cargando...
            </SelectItem>
          ) : (
            tiposServicio.map((tipo) => (
              <SelectItem key={tipo.id} value={tipo.id.toString()}>
                {tipo.nombre}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
} 