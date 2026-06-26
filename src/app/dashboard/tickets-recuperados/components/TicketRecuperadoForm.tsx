'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ClienteListItem, formatClienteNombre, mapClienteFromApi } from '@/lib/cliente-mapper';
import { inferFechaRecepcionFromNumeroTicket } from '@/lib/tickets-recuperados-utils';

const formSchema = z.object({
  numeroTicket: z.string().min(1, 'Número de ticket requerido'),
  clienteId: z.number({ required_error: 'Seleccione un cliente' }).int().positive(),
  tipoServicioId: z.number({ required_error: 'Seleccione tipo de servicio' }).int().positive(),
  marcaId: z.number({ required_error: 'Seleccione marca' }).int().positive(),
  modeloId: z.number({ required_error: 'Seleccione modelo' }).int().positive(),
  descripcionProblema: z.string().min(1, 'Descripción requerida'),
  fechaRecepcion: z.string().min(1, 'Fecha de recepción requerida'),
  entregado: z.boolean(),
  fechaEntrega: z.string().optional(),
  imei: z.string().optional(),
  capacidad: z.string().optional(),
  color: z.string().optional(),
  fechaCompra: z.string().optional(),
  redCelular: z.string().optional(),
  presupuestoTotal: z.coerce.number().nonnegative().optional(),
  saldo: z.coerce.number().nonnegative().optional(),
  entregadoPorTexto: z.string().optional(),
  notasEntrega: z.string().optional(),
  pagos: z.array(
    z.object({
      metodoPago: z.enum(['EFECTIVO', 'TARJETA', 'TRANSFERENCIA']),
      monto: z.coerce.number().positive('Monto inválido'),
      referencia: z.string().optional(),
    })
  ),
});

export type TicketRecuperadoFormValues = z.infer<typeof formSchema>;

interface CatalogoItem {
  id: number;
  nombre: string;
  marca_id?: number;
  marcas?: { id: number; nombre: string };
}

function toDatetimeLocal(date: Date | string | null | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function toDateInput(date: Date | string | null | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

interface TicketRecuperadoFormProps {
  ticketId?: number;
  initialData?: Record<string, unknown>;
  onSuccess?: (ticketId: number) => void;
}

export function TicketRecuperadoForm({ ticketId, initialData, onSuccess }: TicketRecuperadoFormProps) {
  const router = useRouter();
  const isEdit = Boolean(ticketId);
  const [clientes, setClientes] = useState<ClienteListItem[]>([]);
  const [searchCliente, setSearchCliente] = useState('');
  const [openCliente, setOpenCliente] = useState(false);
  const [tiposServicio, setTiposServicio] = useState<CatalogoItem[]>([]);
  const [marcas, setMarcas] = useState<CatalogoItem[]>([]);
  const [modelos, setModelos] = useState<CatalogoItem[]>([]);
  const [loading, setLoading] = useState(false);

  const defaultValues = useMemo((): TicketRecuperadoFormValues => {
    if (!initialData) {
      return {
        numeroTicket: '',
        clienteId: 0,
        tipoServicioId: 0,
        marcaId: 0,
        modeloId: 0,
        descripcionProblema: '',
        fechaRecepcion: '',
        entregado: true,
        fechaEntrega: '',
        pagos: [],
      };
    }

    const pagosRaw = (initialData.pagos as Array<Record<string, unknown>>) || [];
    const presupuesto = initialData.presupuestos as Record<string, unknown> | null;
    const modelo = initialData.modelos as CatalogoItem | undefined;

    return {
      numeroTicket: String(initialData.numero_ticket || ''),
      clienteId: Number(initialData.cliente_id),
      tipoServicioId: Number(initialData.tipo_servicio_id),
      marcaId: Number(modelo?.marca_id || modelo?.marcas?.id || 0),
      modeloId: Number(initialData.modelo_id),
      descripcionProblema: String(initialData.descripcion_problema || ''),
      fechaRecepcion: toDatetimeLocal(initialData.fecha_recepcion as string),
      entregado: Boolean(initialData.entregado),
      fechaEntrega: toDatetimeLocal(initialData.fecha_entrega as string),
      imei: String(initialData.imei || ''),
      capacidad: String(initialData.capacidad || ''),
      color: String(initialData.color || ''),
      fechaCompra: toDateInput(initialData.fecha_compra as string),
      redCelular: String(initialData.red_celular || ''),
      presupuestoTotal: presupuesto ? Number(presupuesto.total) : undefined,
      saldo: presupuesto ? Number(presupuesto.saldo) : undefined,
      pagos: pagosRaw.map((p) => ({
        metodoPago: (p.metodo as 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA') || 'EFECTIVO',
        monto: Number(p.monto),
        referencia: String(p.referencia || ''),
      })),
      notasEntrega: '',
      entregadoPorTexto: '',
    };
  }, [initialData]);

  const form = useForm<TicketRecuperadoFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'pagos' });
  const entregado = form.watch('entregado');
  const marcaId = form.watch('marcaId');
  const numeroTicket = form.watch('numeroTicket');
  const presupuestoTotal = form.watch('presupuestoTotal') || 0;
  const pagos = form.watch('pagos') || [];
  const totalPagado = pagos.reduce((s, p) => s + (Number(p.monto) || 0), 0);
  const saldoCalculado = Math.max(0, presupuestoTotal - totalPagado);

  useEffect(() => {
    form.reset(defaultValues);
  }, [defaultValues, form]);

  useEffect(() => {
    const load = async () => {
      try {
        const [tiposRes, marcasRes, modelosRes] = await Promise.all([
          fetch('/api/catalogo/tipos-servicio'),
          fetch('/api/catalogo/marcas'),
          fetch('/api/catalogo/modelos'),
        ]);
        if (tiposRes.ok) setTiposServicio(await tiposRes.json());
        if (marcasRes.ok) setMarcas(await marcasRes.json());
        if (modelosRes.ok) setModelos(await modelosRes.json());
      } catch {
        toast.error('Error al cargar catálogos');
      }
    };
    load();
  }, []);

  useEffect(() => {
    const t = setTimeout(async () => {
      try {
        const q = searchCliente ? `&search=${encodeURIComponent(searchCliente)}` : '';
        const res = await fetch(`/api/clientes?format=simple&limit=50${q}`);
        if (res.ok) {
          const data = await res.json();
          setClientes(data.map((c: Record<string, unknown>) => mapClienteFromApi(c)));
        }
      } catch {
        /* ignore */
      }
    }, 300);
    return () => clearTimeout(t);
  }, [searchCliente]);

  useEffect(() => {
    if (isEdit || !numeroTicket) return;
    const inferred = inferFechaRecepcionFromNumeroTicket(numeroTicket.trim().toUpperCase());
    if (inferred && !form.getValues('fechaRecepcion')) {
      form.setValue('fechaRecepcion', toDatetimeLocal(inferred));
      toast.message('Fecha sugerida desde el número de ticket');
    }
  }, [numeroTicket, isEdit, form]);

  useEffect(() => {
    form.setValue('saldo', saldoCalculado);
  }, [saldoCalculado, form]);

  const modelosFiltrados = modelos.filter((m) => m.marca_id === marcaId);

  const selectedCliente = clientes.find((c) => c.id === form.watch('clienteId'));

  const onSubmit = async (data: TicketRecuperadoFormValues) => {
    setLoading(true);
    try {
      const payload = {
        ...data,
        presupuestoTotal: data.presupuestoTotal || 0,
        saldo: data.saldo ?? saldoCalculado,
        pagos: (data.pagos || []).filter((p) => Number(p.monto) > 0),
        fechaEntrega: data.entregado ? data.fechaEntrega || data.fechaRecepcion : null,
      };

      if (!data.clienteId || data.clienteId <= 0) {
        toast.error('Seleccione un cliente');
        setLoading(false);
        return;
      }

      const url = isEdit
        ? `/api/admin/tickets-recuperados/${ticketId}`
        : '/api/admin/tickets-recuperados';
      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Error al guardar');

      toast.success(isEdit ? 'Ticket actualizado' : 'Ticket recuperado creado');
      onSuccess?.(result.id);
      router.push('/dashboard/tickets-recuperados');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-4xl">
      <div className="rounded-lg border bg-amber-50 border-amber-200 p-4 text-sm text-amber-900">
        Registro histórico de ticket físico. Use el número exacto del ticket (ej.{' '}
        <strong>TICK-1780767396597</strong>). La fecha de recepción puede inferirse del timestamp
        embebido en ese número.
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Identificación</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="numeroTicket">Número de ticket *</Label>
            <Input
              id="numeroTicket"
              placeholder="TICK-1780767396597"
              {...form.register('numeroTicket')}
            />
            {form.formState.errors.numeroTicket && (
              <p className="text-sm text-red-600">{form.formState.errors.numeroTicket.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Fecha recepción *</Label>
            <Input type="datetime-local" {...form.register('fechaRecepcion')} />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Cliente *</Label>
          <Popover open={openCliente} onOpenChange={setOpenCliente}>
            <PopoverTrigger asChild>
              <Button variant="outline" role="combobox" className="w-full justify-between">
                {selectedCliente
                  ? formatClienteNombre(selectedCliente)
                  : 'Buscar cliente existente...'}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0">
              <Command shouldFilter={false}>
                <CommandInput
                  placeholder="Nombre o teléfono..."
                  value={searchCliente}
                  onValueChange={setSearchCliente}
                />
                <CommandEmpty>Sin resultados. Dé de alta el cliente primero.</CommandEmpty>
                <CommandGroup>
                  {clientes.map((cliente) => (
                    <CommandItem
                      key={cliente.id}
                      value={cliente.id.toString()}
                      onSelect={() => {
                        form.setValue('clienteId', cliente.id);
                        setOpenCliente(false);
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          form.watch('clienteId') === cliente.id ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      {formatClienteNombre(cliente)}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
          <p className="text-xs text-muted-foreground">
            El cliente debe existir previamente en Clientes.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Equipo</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Tipo de servicio *</Label>
            <Select
              value={form.watch('tipoServicioId')?.toString() || ''}
              onValueChange={(v) => form.setValue('tipoServicioId', Number(v))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar" />
              </SelectTrigger>
              <SelectContent>
                {tiposServicio.map((t) => (
                  <SelectItem key={t.id} value={t.id.toString()}>
                    {t.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Marca *</Label>
            <Select
              value={marcaId?.toString() || ''}
              onValueChange={(v) => {
                form.setValue('marcaId', Number(v));
                form.setValue('modeloId', 0);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar" />
              </SelectTrigger>
              <SelectContent>
                {marcas.map((m) => (
                  <SelectItem key={m.id} value={m.id.toString()}>
                    {m.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Modelo *</Label>
            <Select
              value={form.watch('modeloId')?.toString() || ''}
              onValueChange={(v) => form.setValue('modeloId', Number(v))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar" />
              </SelectTrigger>
              <SelectContent>
                {modelosFiltrados.map((m) => (
                  <SelectItem key={m.id} value={m.id.toString()}>
                    {m.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Color</Label>
            <Input {...form.register('color')} />
          </div>
          <div className="space-y-2">
            <Label>IMEI</Label>
            <Input {...form.register('imei')} />
          </div>
          <div className="space-y-2">
            <Label>Capacidad</Label>
            <Input {...form.register('capacidad')} />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Descripción del problema *</Label>
          <Textarea rows={3} {...form.register('descripcionProblema')} />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Entrega</h2>
        <div className="flex items-center gap-2">
          <Checkbox
            id="entregado"
            checked={entregado}
            onCheckedChange={(v) => form.setValue('entregado', Boolean(v))}
          />
          <Label htmlFor="entregado">Ya fue entregado al cliente</Label>
        </div>
        {entregado && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Fecha entrega</Label>
              <Input type="datetime-local" {...form.register('fechaEntrega')} />
            </div>
            <div className="space-y-2">
              <Label>Entregado por</Label>
              <Input placeholder="Nombre del staff" {...form.register('entregadoPorTexto')} />
            </div>
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Financiero (opcional)</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Presupuesto total</Label>
            <Input type="number" min={0} step="0.01" {...form.register('presupuestoTotal')} />
          </div>
          <div className="space-y-2">
            <Label>Total pagado</Label>
            <Input value={totalPagado} readOnly className="bg-muted" />
          </div>
          <div className="space-y-2">
            <Label>Saldo</Label>
            <Input type="number" min={0} readOnly className="bg-muted" {...form.register('saldo')} />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Pagos</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ metodoPago: 'EFECTIVO', monto: 0, referencia: '' })}
            >
              <Plus className="h-4 w-4 mr-1" /> Agregar pago
            </Button>
          </div>
          {fields.map((field, index) => (
            <div key={field.id} className="flex flex-wrap gap-2 items-end border p-3 rounded-md">
              <div className="space-y-1">
                <Label className="text-xs">Método</Label>
                <Select
                  value={form.watch(`pagos.${index}.metodoPago`)}
                  onValueChange={(v) =>
                    form.setValue(`pagos.${index}.metodoPago`, v as 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA')
                  }
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EFECTIVO">Efectivo</SelectItem>
                    <SelectItem value="TARJETA">Tarjeta</SelectItem>
                    <SelectItem value="TRANSFERENCIA">Transferencia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Monto</Label>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  className="w-[120px]"
                  {...form.register(`pagos.${index}.monto`, { valueAsNumber: true })}
                />
              </div>
              <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          ))}
        </div>
      </section>

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Registrar ticket recuperado'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
