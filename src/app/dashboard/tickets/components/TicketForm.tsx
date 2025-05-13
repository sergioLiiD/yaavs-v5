'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface TicketFormProps {
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  isEditing?: boolean;
}

export function TicketForm({ initialData, onSubmit, isEditing = false }: TicketFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    clienteId: initialData?.clienteId || '',
    tipoServicioId: initialData?.tipoServicioId || '',
    modeloId: initialData?.modeloId || '',
    descripcion: initialData?.descripcion || '',
    tecnicoAsignadoId: initialData?.tecnicoAsignadoId || null,
    estatusReparacionId: initialData?.estatusReparacionId || '',
    imei: initialData?.imei || '',
    capacidad: initialData?.capacidad || '',
    color: initialData?.color || '',
    fechaCompra: initialData?.fechaCompra || '',
    codigoDesbloqueo: initialData?.codigoDesbloqueo || '',
    redCelular: initialData?.redCelular || '',
  });

  const [clientes, setClientes] = useState<any[]>([]);
  const [tiposServicio, setTiposServicio] = useState<any[]>([]);
  const [modelos, setModelos] = useState<any[]>([]);
  const [tecnicos, setTecnicos] = useState<any[]>([]);
  const [estatusReparacion, setEstatusReparacion] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientesRes, tiposServicioRes, modelosRes, tecnicosRes, estatusRes] = await Promise.all([
          fetch('/api/clientes').then(res => res.json()),
          fetch('/api/tipos-servicio').then(res => res.json()),
          fetch('/api/modelos').then(res => res.json()),
          fetch('/api/usuarios/tecnicos').then(res => res.json()),
          fetch('/api/estatus-reparacion').then(res => res.json()),
        ]);

        setClientes(clientesRes);
        setTiposServicio(tiposServicioRes);
        setModelos(modelosRes);
        setTecnicos(tecnicosRes);
        setEstatusReparacion(estatusRes);
      } catch (error) {
        console.error('Error al cargar datos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="clienteId">Cliente</Label>
          <Select
            value={formData.clienteId}
            onValueChange={(value) => setFormData({ ...formData, clienteId: value })}
            disabled={isEditing}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar cliente" />
            </SelectTrigger>
            <SelectContent>
              {clientes.map((cliente) => (
                <SelectItem key={cliente.id} value={cliente.id}>
                  {cliente.nombre} {cliente.apellidos}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tipoServicioId">Tipo de Servicio</Label>
          <Select
            value={formData.tipoServicioId}
            onValueChange={(value) => setFormData({ ...formData, tipoServicioId: value })}
            disabled={isEditing}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar tipo de servicio" />
            </SelectTrigger>
            <SelectContent>
              {tiposServicio.map((tipo) => (
                <SelectItem key={tipo.id} value={tipo.id}>
                  {tipo.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="modeloId">Modelo</Label>
          <Select
            value={formData.modeloId}
            onValueChange={(value) => setFormData({ ...formData, modeloId: value })}
            disabled={isEditing}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar modelo" />
            </SelectTrigger>
            <SelectContent>
              {modelos.map((modelo) => (
                <SelectItem key={modelo.id} value={modelo.id}>
                  {modelo.marca.nombre} {modelo.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="imei">IMEI</Label>
          <Input
            id="imei"
            value={formData.imei}
            onChange={(e) => setFormData({ ...formData, imei: e.target.value })}
            placeholder="Ingrese el IMEI del dispositivo"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="capacidad">Capacidad</Label>
          <Input
            id="capacidad"
            value={formData.capacidad}
            onChange={(e) => setFormData({ ...formData, capacidad: e.target.value })}
            placeholder="Ej: 128GB"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="color">Color</Label>
          <Input
            id="color"
            value={formData.color}
            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
            placeholder="Color del dispositivo"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="fechaCompra">Fecha de Compra</Label>
          <Input
            id="fechaCompra"
            type="date"
            value={formData.fechaCompra}
            onChange={(e) => setFormData({ ...formData, fechaCompra: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="codigoDesbloqueo">Código de Desbloqueo</Label>
          <Input
            id="codigoDesbloqueo"
            value={formData.codigoDesbloqueo}
            onChange={(e) => setFormData({ ...formData, codigoDesbloqueo: e.target.value })}
            placeholder="Código de desbloqueo del dispositivo"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="redCelular">Red Celular</Label>
          <Input
            id="redCelular"
            value={formData.redCelular}
            onChange={(e) => setFormData({ ...formData, redCelular: e.target.value })}
            placeholder="Ej: Telcel, AT&T, etc."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tecnicoAsignadoId">Técnico Asignado</Label>
          <Select
            value={formData.tecnicoAsignadoId?.toString() || ''}
            onValueChange={(value) => {
              setFormData(prev => ({
                ...prev,
                tecnicoAsignadoId: value ? parseInt(value, 10) : null
              }));
            }}
          >
            <SelectTrigger>
              <SelectValue>
                {formData.tecnicoAsignadoId 
                  ? tecnicos.find(t => t.id === formData.tecnicoAsignadoId)?.nombre 
                  : "Seleccionar técnico"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {tecnicos.map((tecnico) => (
                <SelectItem key={tecnico.id} value={tecnico.id.toString()}>
                  {tecnico.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="estatusReparacionId">Estado de Reparación</Label>
          <Select
            value={formData.estatusReparacionId}
            onValueChange={(value) => setFormData({ ...formData, estatusReparacionId: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar estado" />
            </SelectTrigger>
            <SelectContent>
              {estatusReparacion.map((estatus) => (
                <SelectItem key={estatus.id} value={estatus.id}>
                  {estatus.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="descripcion">Descripción del Problema</Label>
          <Textarea
            id="descripcion"
            value={formData.descripcion}
            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
            placeholder="Describe el problema o servicio requerido"
            rows={4}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/dashboard/tickets')}
        >
          Cancelar
        </Button>
        <Button type="submit">
          {isEditing ? 'Guardar Cambios' : 'Crear Ticket'}
        </Button>
      </div>
    </form>
  );
} 