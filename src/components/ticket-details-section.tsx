'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Ticket } from '@/types/ticket';
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
  ticket: any; // Temporalmente usando any para manejar la diferencia entre snake_case y camelCase
  onUpdate?: () => void;
}

export function TicketDetailsSection({ ticket, onUpdate }: TicketDetailsSectionProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [tecnicos, setTecnicos] = useState<Usuario[]>([]);
  const [formData, setFormData] = useState({
    descripcionProblema: ticket.descripcion_problema || '',
    tecnicoAsignadoId: ticket.tecnico_asignado_id?.toString() || '',
    estatusReparacionId: ticket.estatus_reparacion_id?.toString() || '',
    diagnostico: ticket.reparaciones?.diagnostico || '',
    capacidad: ticket.capacidad || '',
    color: ticket.color || '',
    fechaCompra: ticket.fecha_compra instanceof Date ? ticket.fecha_compra.toISOString().split('T')[0] : (ticket.fecha_compra ? new Date(ticket.fecha_compra).toISOString().split('T')[0] : ''),
    tipoDesbloqueo: ticket.tipo_desbloqueo || 'pin',
    codigoDesbloqueo: ticket.codigo_desbloqueo || '',
    patronDesbloqueo: ticket.patron_desbloqueo || [],
    redCelular: ticket.red_celular || '',
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
      const dataToSend = {
        ...formData,
        codigoDesbloqueo: formData.tipoDesbloqueo === 'pin' ? formData.codigoDesbloqueo : null,
        patronDesbloqueo: formData.tipoDesbloqueo === 'patron' ? formData.patronDesbloqueo : []
      };

      const response = await fetch(`/api/tickets/${ticket.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el ticket');
      }

      toast.success('Ticket actualizado correctamente');
      if (onUpdate) {
        onUpdate();
      }
      setIsEditing(false);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al actualizar el ticket');
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
                        {ticket.usuarios_tickets_tecnico_asignado_idTousuarios ? 
                          `${ticket.usuarios_tickets_tecnico_asignado_idTousuarios.nombre} ${ticket.usuarios_tickets_tecnico_asignado_idTousuarios.apellido_paterno} ${ticket.usuarios_tickets_tecnico_asignado_idTousuarios.apellido_materno}` : 
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
                <Label htmlFor="tipoDesbloqueo">Tipo de Desbloqueo</Label>
                <Select
                  value={formData.tipoDesbloqueo}
                  onValueChange={(value) => {
                    setFormData(prev => ({
                      ...prev,
                      tipoDesbloqueo: value,
                      codigoDesbloqueo: ''
                    }));
                  }}
                  disabled={!isEditing}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar tipo de desbloqueo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pin">PIN</SelectItem>
                    <SelectItem value="patron">Patrón</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="codigoDesbloqueo">
                  {formData.tipoDesbloqueo === 'pin' ? 'PIN' : 'Patrón de Desbloqueo'}
                </Label>
                {formData.tipoDesbloqueo === 'pin' ? (
                  <Input
                    id="codigoDesbloqueo"
                    name="codigoDesbloqueo"
                    value={formData.codigoDesbloqueo}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="Ingresa el PIN"
                  />
                ) : (
                  <div>
                    <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((numero) => (
                        <button
                          key={numero}
                          type="button"
                          className={`aspect-square border rounded-lg flex items-center justify-center text-lg font-medium hover:bg-gray-100 ${
                            formData.patronDesbloqueo?.includes(numero) ? 'bg-blue-100' : ''
                          }`}
                          onClick={() => {
                            if (!isEditing) return;
                            const currentPattern = formData.patronDesbloqueo || [];
                            if (currentPattern.length < 9) {
                              setFormData(prev => ({
                                ...prev,
                                patronDesbloqueo: [...currentPattern, numero]
                              }));
                            }
                          }}
                        >
                          {numero}
                        </button>
                      ))}
                    </div>
                    {formData.patronDesbloqueo && formData.patronDesbloqueo.length > 0 && (
                      <div className="mt-3 text-center">
                        <div className="text-sm font-medium text-gray-700 mb-1">Orden del Patrón:</div>
                        <div className="text-lg font-mono text-blue-600 bg-blue-50 px-3 py-2 rounded-lg inline-block">
                          {formData.patronDesbloqueo.join(' → ')}
                        </div>
                      </div>
                    )}
                  </div>
                )}
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