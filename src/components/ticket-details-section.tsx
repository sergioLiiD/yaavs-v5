'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Ticket } from '@/types/ticket';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface Usuario {
  id: number;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  email: string;
  nivel: string;
}

interface TicketDetailsSectionProps {
  ticket: Ticket;
  onUpdate?: () => void;
}

export function TicketDetailsSection({ ticket, onUpdate }: TicketDetailsSectionProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [tecnicos, setTecnicos] = useState<Usuario[]>([]);
  const [formData, setFormData] = useState({
    descripcionProblema: ticket.descripcionProblema || '',
    tecnicoAsignadoId: ticket.tecnicoAsignadoId?.toString() || '',
    estatusReparacionId: ticket.estatusReparacionId?.toString() || '',
    diagnostico: ticket.reparacion?.diagnostico || '',
    capacidad: ticket.dispositivos?.capacidad || '',
    color: ticket.dispositivos?.color || '',
    fechaCompra: ticket.dispositivos?.fechaCompra ? new Date(ticket.dispositivos.fechaCompra).toISOString().split('T')[0] : '',
    codigoDesbloqueo: ticket.dispositivos?.codigoDesbloqueo || '',
    redCelular: ticket.dispositivos?.redCelular || '',
  });

  useEffect(() => {
    const fetchTecnicos = async () => {
      try {
        console.log('Iniciando fetch de técnicos...');
        const response = await fetch('/api/usuarios?rol=TECNICO');
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Error response:', errorData);
          throw new Error('Error al cargar los técnicos');
        }
        const data = await response.json();
        console.log('Técnicos cargados:', data);
        setTecnicos(data);
      } catch (error) {
        console.error('Error al cargar técnicos:', error);
        toast.error('Error al cargar la lista de técnicos');
      }
    };

    fetchTecnicos();
  }, []);

  console.log('Estado actual:', {
    ticket: {
      id: ticket.id,
      tecnicoAsignado: ticket.tecnicoAsignado,
      tecnicoAsignadoId: ticket.tecnicoAsignadoId
    },
    formData: {
      tecnicoAsignadoId: formData.tecnicoAsignadoId
    },
    tecnicos: tecnicos.map(t => ({ id: t.id, nombre: t.nombre })),
    isEditing
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTecnicoChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      tecnicoAsignadoId: value
    }));
  };

  const handleEstatusChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      estatusReparacionId: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`/api/tickets/${ticket.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          estatusReparacionId: ticket.estatusReparacionId
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al actualizar el ticket');
      }

      toast.success('Ticket actualizado correctamente');
      setIsEditing(false);
      if (onUpdate) {
        onUpdate();
      }
      router.refresh();
    } catch (error) {
      console.error('Error al actualizar el ticket:', error);
      toast.error(error instanceof Error ? error.message : 'Error al actualizar el ticket');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Detalles del Ticket</CardTitle>
        <Button
          variant="outline"
          onClick={() => setIsEditing(!isEditing)}
          disabled={isLoading}
        >
          {isEditing ? 'Cancelar' : 'Editar'}
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="descripcionProblema">Descripción del Problema</Label>
              <Textarea
                id="descripcionProblema"
                name="descripcionProblema"
                value={formData.descripcionProblema}
                onChange={handleInputChange}
                placeholder="Describe el problema que presenta el dispositivo..."
                className="min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tecnico">Técnico Asignado</Label>
                <div className="relative">
                  <Select
                    value={formData.tecnicoAsignadoId}
                    onValueChange={handleTecnicoChange}
                    disabled={!isEditing}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue>
                        {ticket.tecnicoAsignado ? 
                          `${ticket.tecnicoAsignado.nombre} ${ticket.tecnicoAsignado.apellidoPaterno} ${ticket.tecnicoAsignado.apellidoMaterno}` : 
                          'Seleccionar técnico'}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {tecnicos.length > 0 ? (
                        tecnicos.map((tecnico) => (
                          <SelectItem key={tecnico.id} value={tecnico.id.toString()}>
                            {tecnico.nombre} {tecnico.apellidoPaterno} {tecnico.apellidoMaterno}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm text-gray-500">
                          No hay técnicos disponibles
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="capacidad">Capacidad</Label>
                <Input
                  id="capacidad"
                  name="capacidad"
                  value={formData.capacidad}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fechaCompra">Fecha de Compra</Label>
                <Input
                  id="fechaCompra"
                  name="fechaCompra"
                  type="date"
                  value={formData.fechaCompra}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="codigoDesbloqueo">Código de Desbloqueo</Label>
                <Input
                  id="codigoDesbloqueo"
                  name="codigoDesbloqueo"
                  value={formData.codigoDesbloqueo}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="redCelular">Red Celular</Label>
                <Input
                  id="redCelular"
                  name="redCelular"
                  value={formData.redCelular}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>
            </div>
          </div>

          {isEditing && (
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          )}
        </form>
      </CardContent>
    </Card>
  );
} 