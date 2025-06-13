'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Cliente } from '@/types/cliente';

interface TipoServicio {
  id: number;
  nombre: string;
}

interface Marca {
  id: number;
  nombre: string;
}

interface Modelo {
  id: number;
  nombre: string;
  marcaId: number;
}

const formSchema = z.object({
  clienteId: z.number({
    required_error: "Por favor seleccione un cliente",
  }),
  tipoServicioId: z.number({
    required_error: "Por favor seleccione un tipo de servicio",
  }),
  marcaId: z.number({
    required_error: "Por favor seleccione una marca",
  }),
  modeloId: z.number({
    required_error: "Por favor seleccione un modelo",
  }),
  descripcionProblema: z.string().min(1, "La descripción del problema es requerida"),
  capacidad: z.string().optional(),
  color: z.string().optional(),
  fechaCompra: z.date().optional(),
  codigoDesbloqueo: z.string().optional(),
  redCelular: z.string().optional(),
  imei: z.string().optional(),
  puntoRecoleccionId: z.number().optional(),
  pinPatron: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export const PatternGrid = ({ value, onChange }: { value: string, onChange: (value: string) => void }) => {
  const [selectedPoints, setSelectedPoints] = useState<number[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);

  const handlePointClick = (point: number) => {
    if (!selectedPoints.includes(point)) {
      const newSelectedPoints = [...selectedPoints, point];
      setSelectedPoints(newSelectedPoints);
      onChange(newSelectedPoints.join('->'));
    }
  };

  const handleMouseDown = (point: number) => {
    setIsDrawing(true);
    setSelectedPoints([point]);
    onChange(point.toString());
  };

  const handleMouseEnter = (point: number) => {
    if (isDrawing && !selectedPoints.includes(point)) {
      const newSelectedPoints = [...selectedPoints, point];
      setSelectedPoints(newSelectedPoints);
      onChange(newSelectedPoints.join('->'));
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const resetPattern = () => {
    setSelectedPoints([]);
    onChange('');
  };

  return (
    <div className="space-y-4">
      <div 
        className="grid grid-cols-3 gap-2 w-48 h-48 p-2 bg-gray-100 rounded-lg"
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((point) => (
          <div
            key={point}
            className={cn(
              "w-full h-full rounded-full border-2 border-gray-400 flex items-center justify-center cursor-pointer transition-colors",
              selectedPoints.includes(point) ? "bg-blue-500 border-blue-600" : "bg-white hover:bg-gray-200"
            )}
            onMouseDown={() => handleMouseDown(point)}
            onMouseEnter={() => handleMouseEnter(point)}
          >
            <div className={cn(
              "w-2 h-2 rounded-full",
              selectedPoints.includes(point) ? "bg-white" : "bg-gray-400"
            )} />
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {value || "Dibuje el patrón"}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={resetPattern}
        >
          Reiniciar
        </Button>
      </div>
    </div>
  );
};

export function NewTicketForm() {
  const [openCliente, setOpenCliente] = useState(false);
  const [openMarca, setOpenMarca] = useState(false);
  const [openModelo, setOpenModelo] = useState(false);
  const [valueCliente, setValueCliente] = useState("");
  const [valueMarca, setValueMarca] = useState("");
  const [valueModelo, setValueModelo] = useState("");
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [modelos, setModelos] = useState<Modelo[]>([]);
  const [modelosFiltrados, setModelosFiltrados] = useState<Modelo[]>([]);
  const [tiposServicio, setTiposServicio] = useState<TipoServicio[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clienteId: undefined,
      tipoServicioId: undefined,
      marcaId: undefined,
      modeloId: undefined,
      descripcionProblema: '',
      capacidad: '',
      color: '',
      fechaCompra: undefined,
      codigoDesbloqueo: '',
      redCelular: '',
      imei: '',
      puntoRecoleccionId: undefined,
      pinPatron: '',
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Cargar clientes
        const clientesResponse = await fetch('/api/clientes');
        if (clientesResponse.ok) {
          const clientesData = await clientesResponse.json();
          setClientes(clientesData);
        }

        // Cargar tipos de servicio
        const tiposServicioResponse = await fetch('/api/tipos-servicio');
        if (tiposServicioResponse.ok) {
          const tiposServicioData = await tiposServicioResponse.json();
          setTiposServicio(tiposServicioData);
        }

        // Cargar marcas
        const marcasResponse = await fetch('/api/marcas');
        if (marcasResponse.ok) {
          const marcasData = await marcasResponse.json();
          setMarcas(marcasData);
        }

        // Cargar modelos
        const modelosResponse = await fetch('/api/modelos');
        if (modelosResponse.ok) {
          const modelosData = await modelosResponse.json();
          setModelos(modelosData);
        }
      } catch (error) {
        console.error('Error al cargar datos:', error);
        toast.error('Error al cargar los datos necesarios');
      }
    };

    fetchData();
  }, []);

  // Filtrar modelos cuando cambia la marca seleccionada
  useEffect(() => {
    const marcaId = form.watch('marcaId');
    if (marcaId) {
      const filtrados = modelos.filter(modelo => modelo.marcaId === marcaId);
      setModelosFiltrados(filtrados);
    } else {
      setModelosFiltrados([]);
    }
  }, [form.watch('marcaId'), modelos]);

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Error al crear el ticket');
      }

      toast.success('Ticket creado exitosamente');
      router.push('/dashboard/tickets');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al crear el ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="cliente">Cliente</Label>
          <Popover open={openCliente} onOpenChange={setOpenCliente}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openCliente}
                className="w-full justify-between"
              >
                {valueCliente
                  ? (() => {
                      const cliente = clientes.find((c) => c.id.toString() === valueCliente);
                      return cliente ? `${cliente.nombre} ${cliente.apellidoPaterno} ${cliente.apellidoMaterno}` : "Seleccionar cliente...";
                    })()
                  : "Seleccionar cliente..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command filter={(value, search) => {
                if (!search) return 1;
                const cliente = clientes.find(c => c.id.toString() === value);
                if (!cliente) return 0;
                const searchLower = search.toLowerCase();
                const fullName = `${cliente.nombre} ${cliente.apellidoPaterno} ${cliente.apellidoMaterno}`.toLowerCase();
                return fullName.includes(searchLower) ? 1 : 0;
              }}>
                <CommandInput placeholder="Buscar cliente..." />
                <CommandEmpty>No se encontró ningún cliente.</CommandEmpty>
                <CommandGroup>
                  {clientes.map((cliente) => (
                    <CommandItem
                      key={cliente.id}
                      value={cliente.id.toString()}
                      onSelect={(currentValue) => {
                        setValueCliente(currentValue === valueCliente ? "" : currentValue);
                        form.setValue('clienteId', parseInt(currentValue));
                        setOpenCliente(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          valueCliente === cliente.id.toString() ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {cliente.nombre} {cliente.apellidoPaterno} {cliente.apellidoMaterno}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
          {form.formState.errors.clienteId && (
            <p className="text-sm text-red-500">{form.formState.errors.clienteId.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="tipoServicio">Tipo de Servicio</Label>
          <select
            {...form.register('tipoServicioId', { valueAsNumber: true })}
            className="w-full rounded-md border border-input bg-background px-3 py-2"
          >
            <option value="">Seleccione un tipo de servicio</option>
            {tiposServicio.map((tipo) => (
              <option key={tipo.id} value={tipo.id}>
                {tipo.nombre}
              </option>
            ))}
          </select>
          {form.formState.errors.tipoServicioId && (
            <p className="text-sm text-red-500">{form.formState.errors.tipoServicioId.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="marca">Marca</Label>
          <Popover open={openMarca} onOpenChange={setOpenMarca}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openMarca}
                className="w-full justify-between"
              >
                {valueMarca
                  ? marcas.find((marca) => marca.id.toString() === valueMarca)?.nombre
                  : "Seleccionar marca..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command filter={(value, search) => {
                if (!search) return 1;
                const marca = marcas.find(m => m.id.toString() === value);
                if (!marca) return 0;
                const searchLower = search.toLowerCase();
                return marca.nombre.toLowerCase().includes(searchLower) ? 1 : 0;
              }}>
                <CommandInput placeholder="Buscar marca..." />
                <CommandEmpty>No se encontró ninguna marca.</CommandEmpty>
                <CommandGroup>
                  {marcas.map((marca) => (
                    <CommandItem
                      key={marca.id}
                      value={marca.id.toString()}
                      onSelect={(currentValue) => {
                        setValueMarca(currentValue === valueMarca ? "" : currentValue);
                        form.setValue('marcaId', parseInt(currentValue));
                        form.setValue('modeloId', undefined);
                        setValueModelo("");
                        setOpenMarca(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          valueMarca === marca.id.toString() ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {marca.nombre}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
          {form.formState.errors.marcaId && (
            <p className="text-sm text-red-500">{form.formState.errors.marcaId.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="modelo">Modelo</Label>
          <Popover open={openModelo} onOpenChange={setOpenModelo}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openModelo}
                className="w-full justify-between"
                disabled={!form.watch('marcaId')}
              >
                {valueModelo
                  ? modelosFiltrados.find((modelo) => modelo.id.toString() === valueModelo)?.nombre
                  : "Seleccionar modelo..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command filter={(value, search) => {
                if (!search) return 1;
                const modelo = modelosFiltrados.find(m => m.id.toString() === value);
                if (!modelo) return 0;
                const searchLower = search.toLowerCase();
                return modelo.nombre.toLowerCase().includes(searchLower) ? 1 : 0;
              }}>
                <CommandInput placeholder="Buscar modelo..." />
                <CommandEmpty>No se encontró ningún modelo.</CommandEmpty>
                <CommandGroup>
                  {modelosFiltrados.map((modelo) => (
                    <CommandItem
                      key={modelo.id}
                      value={modelo.id.toString()}
                      onSelect={(currentValue) => {
                        setValueModelo(currentValue === valueModelo ? "" : currentValue);
                        form.setValue('modeloId', parseInt(currentValue));
                        setOpenModelo(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          valueModelo === modelo.id.toString() ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {modelo.nombre}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
          {form.formState.errors.modeloId && (
            <p className="text-sm text-red-500">{form.formState.errors.modeloId.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="imei">IMEI</Label>
          <Input
            {...form.register('imei')}
            placeholder="Ingrese el IMEI del dispositivo (15 dígitos)"
            pattern="[0-9]{15}"
            title="El IMEI debe contener exactamente 15 dígitos"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="capacidad">Capacidad</Label>
          <Input
            {...form.register('capacidad')}
            placeholder="Ingrese la capacidad del dispositivo"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="color">Color</Label>
          <Input
            {...form.register('color')}
            placeholder="Ingrese el color del dispositivo"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="fechaCompra">Fecha de Compra</Label>
          <Input
            type="date"
            {...form.register('fechaCompra', { valueAsDate: true })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="redCelular">Red Celular</Label>
          <Input
            {...form.register('redCelular')}
            placeholder="Ingrese la red celular"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="pinPatron">PIN o Patrón</Label>
          <div className="flex items-start space-x-4">
            <Input
              {...form.register('pinPatron')}
              placeholder="Ingrese el PIN o patrón de desbloqueo"
              className="flex-1"
            />
            <div className="flex-1">
              <PatternGrid
                value={form.watch('pinPatron')}
                onChange={(value) => form.setValue('pinPatron', value)}
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="descripcionProblema">Descripción del Problema</Label>
          <textarea
            {...form.register('descripcionProblema')}
            className="w-full rounded-md border border-input bg-background px-3 py-2"
            rows={4}
          />
          {form.formState.errors.descripcionProblema && (
            <p className="text-sm text-red-500">{form.formState.errors.descripcionProblema.message}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Creando...' : 'Crear Ticket'}
        </Button>
      </div>
    </form>
  );
} 