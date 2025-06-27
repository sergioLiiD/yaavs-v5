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

const ticketSchema = z.object({
  clienteId: z.number().min(1, "Debes seleccionar un cliente"),
  modeloId: z.number().min(1, "Debes seleccionar un modelo"),
  tipoServicioId: z.number().min(1, "Debes seleccionar un tipo de servicio"),
  descripcionProblema: z.string().min(1, "La descripción del problema es requerida"),
  dispositivo: z.object({
    tipo: z.string().min(1, "El tipo de dispositivo es requerido"),
    marca: z.string().min(1, "La marca es requerida"),
    modelo: z.string().min(1, "El modelo es requerido"),
    serie: z.string().optional(),
  }),
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
  marca: {
    id: number;
    nombre: string;
  };
}

interface TipoServicio {
  id: number;
  nombre: string;
}

interface TicketFormProps {
  clientes: Cliente[];
  modelos: Modelo[];
  tiposServicio: TipoServicio[];
  ticket?: {
    id: number;
    clienteId: number;
    modeloId: number;
    tipoServicioId: number;
    descripcionProblema: string;
    dispositivo: {
      tipo: string;
      marca: string;
      modelo: string;
      serie?: string;
    };
  };
}

export function TicketForm({ clientes, modelos, tiposServicio, ticket }: TicketFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof ticketSchema>>({
    resolver: zodResolver(ticketSchema),
    defaultValues: ticket || {
      clienteId: undefined,
      modeloId: undefined,
      tipoServicioId: undefined,
      descripcionProblema: "",
      dispositivo: {
        tipo: "",
        marca: "",
        modelo: "",
        serie: "",
      },
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
                <Select
                  onValueChange={(value) => field.onChange(Number(value))}
                  defaultValue={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un cliente" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {clientes.map((cliente) => (
                      <SelectItem key={cliente.id} value={cliente.id.toString()}>
                        {`${cliente.nombre} ${cliente.apellidoPaterno} ${cliente.apellidoMaterno || ""}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                <Select
                  onValueChange={(value) => field.onChange(Number(value))}
                  defaultValue={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un modelo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {modelos.map((modelo) => (
                      <SelectItem key={modelo.id} value={modelo.id.toString()}>
                        {`${modelo.marca.nombre} ${modelo.nombre}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                <Select
                  onValueChange={(value) => field.onChange(Number(value))}
                  defaultValue={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un tipo de servicio" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {tiposServicio.map((tipo) => (
                      <SelectItem key={tipo.id} value={tipo.id.toString()}>
                        {tipo.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Información del Dispositivo */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Información del Dispositivo</h3>
            
            <FormField
              control={form.control}
              name="dispositivo.tipo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ej: Smartphone, Tablet, Laptop" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dispositivo.marca"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Marca</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ej: Samsung, Apple, HP" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dispositivo.modelo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Modelo</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ej: iPhone 13, Galaxy S21" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dispositivo.serie"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número de Serie (opcional)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Número de serie del dispositivo" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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