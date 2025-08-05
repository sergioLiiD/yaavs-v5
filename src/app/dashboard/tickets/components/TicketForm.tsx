"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

const ticketSchema = z.object({
  clienteId: z.number().min(1, "Debes seleccionar un cliente"),
  modeloId: z.number().min(1, "Debes seleccionar un modelo"),
  tipoServicioId: z.number().min(1, "Debes seleccionar un tipo de servicio"),
  descripcionProblema: z.string().min(1, "La descripción del problema es requerida"),
  imei: z.string().optional(),
  capacidad: z.string().optional(),
  color: z.string().optional(),
  fechaCompra: z.string().optional(),
  tipoDesbloqueo: z.enum(['pin', 'patron']).default('pin'),
  codigoDesbloqueo: z.string().optional(),
  patronDesbloqueo: z.array(z.number()).optional(),
  redCelular: z.string().optional(),
});

interface Cliente {
  id: number;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  telefonoCelular: string;
  email: string;
}

interface Modelo {
  id: number;
  nombre: string;
  marcas?: {
    id: number;
    nombre: string;
  };
  marca?: {
    id: number;
    nombre: string;
  };
}

interface TipoServicio {
  id: number;
  nombre: string;
}

interface Tecnico {
  id: number;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  email?: string;
}

interface TicketFormProps {
  clientes: Cliente[];
  marcas: any[];
  modelos: Modelo[];
  tiposServicio: TipoServicio[];
  ticket?: {
    id: number;
    clienteId: number;
    modeloId: number;
    tipoServicioId: number;
    descripcionProblema: string;
    codigoDesbloqueo?: string | null;
    patronDesbloqueo?: number[];
    imei?: string | null;
    capacidad?: string | null;
    color?: string | null;
    fechaCompra?: Date | null;
    redCelular?: string | null;
    tecnicoAsignadoId?: number | null;
  };
}

export function TicketForm({ clientes, marcas, modelos, tiposServicio, ticket }: TicketFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([]);
  const [selectedTecnico, setSelectedTecnico] = useState<string>('');

  console.log('TicketForm - Ticket recibido:', ticket);
  console.log('TicketForm - ClienteId:', ticket?.clienteId);
  console.log('TicketForm - ModeloId:', ticket?.modeloId);
  console.log('TicketForm - TipoServicioId:', ticket?.tipoServicioId);
  console.log('TicketForm - Clientes disponibles:', clientes.length);
  console.log('TicketForm - Modelos disponibles:', modelos.length);
  console.log('TicketForm - Tipos de servicio disponibles:', tiposServicio.length);

  // Cargar técnicos cuando el componente se monta
  useEffect(() => {
    const fetchTecnicos = async () => {
      try {
        const response = await fetch('/api/usuarios/tecnicos');
        if (!response.ok) {
          throw new Error('Error al cargar técnicos');
        }
        const data = await response.json();
        setTecnicos(data);
        
        // Si hay un ticket y tiene técnico asignado, seleccionarlo
        if (ticket?.tecnicoAsignadoId) {
          setSelectedTecnico(ticket.tecnicoAsignadoId.toString());
        }
      } catch (error) {
        console.error('Error al cargar técnicos:', error);
        toast.error('Error al cargar la lista de técnicos');
      }
    };

    fetchTecnicos();
  }, [ticket?.tecnicoAsignadoId]);

  // Función para cambiar técnico asignado
  const handleTecnicoChange = async (tecnicoId: string) => {
    if (!ticket?.id) return;
    
    try {
      const response = await fetch(`/api/tickets/${ticket.id}/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tecnicoId: parseInt(tecnicoId) }),
      });

      if (!response.ok) {
        throw new Error('Error al asignar técnico');
      }

      setSelectedTecnico(tecnicoId);
      toast.success('Técnico asignado correctamente');
    } catch (error) {
      console.error('Error al asignar técnico:', error);
      toast.error('Error al asignar técnico');
    }
  };

  // Función para reiniciar patrón de desbloqueo
  const handleResetPattern = () => {
    form.setValue('patronDesbloqueo', []);
    toast.success('Patrón reiniciado');
  };

  const form = useForm<z.infer<typeof ticketSchema>>({
    resolver: zodResolver(ticketSchema),
    defaultValues: ticket ? {
      clienteId: ticket.clienteId,
      modeloId: ticket.modeloId,
      tipoServicioId: ticket.tipoServicioId,
      descripcionProblema: ticket.descripcionProblema || "",
      imei: ticket.imei || "",
      capacidad: ticket.capacidad || "",
      color: ticket.color || "",
      fechaCompra: ticket.fechaCompra ? new Date(ticket.fechaCompra).toISOString().split('T')[0] : "",
      tipoDesbloqueo: ticket.codigoDesbloqueo ? 'pin' : (ticket.patronDesbloqueo?.length ? 'patron' : 'pin'),
      codigoDesbloqueo: ticket.codigoDesbloqueo || "",
      patronDesbloqueo: ticket.patronDesbloqueo || [],
      redCelular: ticket.redCelular || "",
    } : {
      clienteId: undefined,
      modeloId: undefined,
      tipoServicioId: undefined,
      descripcionProblema: "",
      imei: "",
      capacidad: "",
      color: "",
      fechaCompra: "",
      tipoDesbloqueo: "pin",
      codigoDesbloqueo: "",
      patronDesbloqueo: [],
      redCelular: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof ticketSchema>) => {
    try {
      setIsSubmitting(true);
      const url = ticket ? `/api/tickets/${ticket.id}` : "/api/tickets";
      const method = ticket ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Error al guardar el ticket");
      }

      toast.success(ticket ? "Ticket actualizado" : "Ticket creado");
      router.push("/dashboard/tickets");
      router.refresh();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al guardar el ticket");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Cliente */}
          <FormField
            control={form.control}
            name="clienteId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cliente</FormLabel>
                {ticket ? (
                  <div className="flex items-center space-x-2">
                    <Input
                      value={(() => {
                        const cliente = clientes.find(c => c.id === field.value);
                        return cliente ? `${cliente.nombre || ''} ${cliente.apellidoPaterno || ''} ${cliente.apellidoMaterno || ""}` : 'Cliente no encontrado';
                      })()}
                      readOnly
                      className="bg-gray-50"
                    />
                    <span className="text-sm text-gray-500">(No editable)</span>
                  </div>
                ) : (
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    value={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un cliente" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {clientes.filter(cliente => cliente).map((cliente) => (
                        <SelectItem key={cliente.id} value={cliente.id.toString()}>
                          {`${cliente.nombre || ''} ${cliente.apellidoPaterno || ''} ${cliente.apellidoMaterno || ""}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Tipo de Servicio */}
          <FormField
            control={form.control}
            name="tipoServicioId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Servicio</FormLabel>
                {ticket ? (
                  <div className="flex items-center space-x-2">
                    <Input
                      value={(() => {
                        const tipo = tiposServicio.find(t => t.id === field.value);
                        return tipo ? tipo.nombre : 'Tipo no encontrado';
                      })()}
                      readOnly
                      className="bg-gray-50"
                    />
                    <span className="text-sm text-gray-500">(No editable)</span>
                  </div>
                ) : (
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    value={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un tipo de servicio" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {tiposServicio.filter(tipo => tipo).map((tipo) => (
                        <SelectItem key={tipo.id} value={tipo.id.toString()}>
                          {tipo.nombre || 'Sin nombre'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Modelo */}
          <FormField
            control={form.control}
            name="modeloId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Modelo</FormLabel>
                {ticket ? (
                  <div className="flex items-center space-x-2">
                    <Input
                      value={(() => {
                        const modelo = modelos.find(m => m.id === field.value);
                        console.log('🔍 Buscando modelo con ID:', field.value);
                        console.log('🔍 Modelos disponibles:', modelos.map(m => ({ id: m.id, nombre: m.nombre, marca: m.marcas?.nombre })));
                        console.log('🔍 Modelo encontrado:', modelo);
                        return modelo ? `${modelo.marcas?.nombre || 'Sin marca'} ${modelo.nombre || 'Sin nombre'}` : 'Modelo no encontrado';
                      })()}
                      readOnly
                      className="bg-gray-50"
                    />
                    <span className="text-sm text-gray-500">(No editable)</span>
                  </div>
                ) : (
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    value={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un modelo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {modelos.filter(modelo => modelo && (modelo.marca || modelo.marcas)).map((modelo) => (
                        <SelectItem key={modelo.id} value={modelo.id.toString()}>
                          {`${modelo.marcas?.nombre || modelo.marca?.nombre || 'Sin marca'} ${modelo.nombre || 'Sin nombre'}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Información del Dispositivo */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Información del Dispositivo</h3>
            
            <FormField
              control={form.control}
              name="imei"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>IMEI</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="Ingrese el IMEI del dispositivo (15 dígitos)"
                      pattern="[0-9]{15}"
                      title="El IMEI debe contener exactamente 15 dígitos"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="capacidad"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Capacidad</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ej: 128GB, 256GB" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ej: Rojo, Azul" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fechaCompra"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha de Compra</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tipoDesbloqueo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Desbloqueo</FormLabel>
                  <div className="flex space-x-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="pin"
                        value="pin"
                        checked={field.value === 'pin'}
                        onChange={() => field.onChange('pin')}
                        className="h-4 w-4 text-blue-600"
                      />
                      <Label htmlFor="pin">PIN</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="patron"
                        value="patron"
                        checked={field.value === 'patron'}
                        onChange={() => field.onChange('patron')}
                        className="h-4 w-4 text-blue-600"
                      />
                      <Label htmlFor="patron">Patrón</Label>
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.watch('tipoDesbloqueo') === 'pin' ? (
              <FormField
                control={form.control}
                name="codigoDesbloqueo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PIN de Desbloqueo</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ingresa el PIN" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <FormField
                control={form.control}
                name="patronDesbloqueo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Patrón de Desbloqueo</FormLabel>
                    <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((numero) => (
                        <button
                          key={numero}
                          type="button"
                          onClick={() => {
                            const currentPattern = field.value || [];
                            if (currentPattern.length < 9) {
                              field.onChange([...currentPattern, numero]);
                            }
                          }}
                          className={`aspect-square border rounded-lg flex items-center justify-center text-lg font-medium hover:bg-gray-100 ${
                            field.value?.includes(numero) ? 'bg-blue-100' : ''
                          }`}
                        >
                          {numero}
                        </button>
                      ))}
                    </div>
                    {field.value && field.value.length > 0 && (
                      <div className="mt-3 text-center">
                        <div className="text-sm font-medium text-gray-700 mb-1">Orden del Patrón:</div>
                        <div className="text-lg font-mono text-blue-600 bg-blue-50 px-3 py-2 rounded-lg inline-block mb-2">
                          {field.value.join(' → ')}
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleResetPattern}
                        >
                          Reiniciar Patrón
                        </Button>
                      </div>
                    )}
                    {field.value && field.value.length === 0 && (
                      <div className="mt-2 text-sm text-gray-500 text-center">
                        Toca los números para crear el patrón
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="redCelular"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Red Celular</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ej: Telcel, AT&T" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Técnico Asignado - Solo visible en modo edición */}
            {ticket && (
              <FormItem>
                <FormLabel>Técnico Asignado</FormLabel>
                <Select
                  value={selectedTecnico}
                  onValueChange={handleTecnicoChange}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un técnico" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {tecnicos.map((tecnico) => (
                      <SelectItem key={tecnico.id} value={tecnico.id.toString()}>
                        {`${tecnico.nombre} ${tecnico.apellidoPaterno} ${tecnico.apellidoMaterno || ''}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          </div>

          {/* Descripción del Problema */}
          <FormField
            control={form.control}
            name="descripcionProblema"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Descripción del Problema</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Describe el problema que presenta el dispositivo"
                    className="min-h-[100px]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : ticket ? "Actualizar" : "Crear"}
          </Button>
        </div>
      </form>
    </Form>
  );
} 