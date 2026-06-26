'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Check, ChevronsUpDown, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NuevoClienteModal } from '@/components/clientes/NuevoClienteModal';
import { ClienteListItem, formatClienteNombre } from '@/lib/cliente-mapper';

interface FormData {
  clienteId: string;
  modeloId: string;
  descripcionProblema: string;
  capacidad: string;
  color: string;
  fechaCompra: string;
  tipoDesbloqueo: 'pin' | 'patron';
  codigoDesbloqueo: string;
  patronDesbloqueo: string[];
  redCelular: string;
  imei: string;
}

export default function NewTicketPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [data, setData] = useState<any>(null);
  const [tipoDesbloqueo, setTipoDesbloqueo] = useState<'pin' | 'patron'>('pin');
  const [patronDesbloqueo, setPatronDesbloqueo] = useState<string[]>([]);
  const [formData, setFormData] = useState<FormData>({
    clienteId: '',
    modeloId: '',
    descripcionProblema: '',
    capacidad: '',
    color: '',
    fechaCompra: '',
    tipoDesbloqueo: 'pin',
    codigoDesbloqueo: '',
    patronDesbloqueo: [],
    redCelular: '',
    imei: ''
  });

  const [marcaSeleccionada, setMarcaSeleccionada] = useState<string>('none');
  const [modelosFiltrados, setModelosFiltrados] = useState<any[]>([]);
  const [clientes, setClientes] = useState<ClienteListItem[]>([]);
  const [selectedCliente, setSelectedCliente] = useState<ClienteListItem | null>(null);
  const [openCliente, setOpenCliente] = useState(false);
  const [openNuevoCliente, setOpenNuevoCliente] = useState(false);
  const [searchCliente, setSearchCliente] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/repair-point/data');
        if (!response.ok) {
          throw new Error('Error al cargar datos');
        }
        const data = await response.json();
        setData(data);
        if (data.clientes) {
          setClientes(data.clientes);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (marcaSeleccionada !== 'none' && data?.modelos) {
      const filtrados = data.modelos.filter((modelo: any) => 
        modelo?.marca?.id?.toString() === marcaSeleccionada
      );
      console.log('Modelos filtrados:', filtrados); // Para depuración
      setModelosFiltrados(filtrados);
    } else {
      setModelosFiltrados([]);
    }
  }, [marcaSeleccionada, data]);

  const clientesFiltrados = useMemo(() => {
    const query = searchCliente.trim().toLowerCase();
    if (!query) return clientes;

    return clientes.filter((cliente) => {
      const nombre = formatClienteNombre(cliente).toLowerCase();
      const telefono = cliente.telefonoCelular?.toLowerCase() ?? '';
      const email = cliente.email?.toLowerCase() ?? '';
      return nombre.includes(query) || telefono.includes(query) || email.includes(query);
    });
  }, [clientes, searchCliente]);

  const handleOpenNuevoCliente = () => {
    setOpenCliente(false);
    setOpenNuevoCliente(true);
  };

  const handleClienteCreated = (cliente: ClienteListItem) => {
    setClientes((prev) => {
      if (prev.some((c) => c.id === cliente.id)) return prev;
      return [cliente, ...prev];
    });
    setSelectedCliente(cliente);
    setFormData((prev) => ({ ...prev, clienteId: cliente.id.toString() }));
    setSearchCliente('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePatronClick = (numero: number) => {
    if (patronDesbloqueo.length < 9) {
      const nuevoPatron = [...patronDesbloqueo, numero.toString()];
      setPatronDesbloqueo(nuevoPatron);
      setFormData(prev => ({
        ...prev,
        patronDesbloqueo: nuevoPatron
      }));
    }
  };

  const handleMarcaChange = (value: string) => {
    console.log('Marca seleccionada:', value); // Para depuración
    setMarcaSeleccionada(value);
    setFormData(prev => ({ ...prev, modeloId: 'none' }));
  };

  const handleModeloChange = (value: string) => {
    console.log('Modelo seleccionado:', value); // Para depuración
    setFormData(prev => ({ ...prev, modeloId: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar campos requeridos
    if (!formData.clienteId || !formData.modeloId || !formData.descripcionProblema) {
      alert('Por favor complete todos los campos requeridos');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/repair-point/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          tipoDesbloqueo,
          patronDesbloqueo: tipoDesbloqueo === 'patron' ? patronDesbloqueo : []
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear el ticket');
      }

      router.push('/repair-point/tickets');
    } catch (error) {
      console.error('Error:', error);
      alert(error instanceof Error ? error.message : 'Error al crear el ticket');
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FEBF19]"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Nuevo Ticket</h1>
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="clienteId">Cliente</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-auto px-2 py-1 text-xs"
                onClick={handleOpenNuevoCliente}
              >
                <Plus className="mr-1 h-3 w-3" />
                Nuevo cliente
              </Button>
            </div>
            <Popover open={openCliente} onOpenChange={setOpenCliente}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openCliente}
                  className="w-full justify-between mt-1"
                >
                  {formData.clienteId
                    ? (() => {
                        const cliente =
                          selectedCliente ??
                          clientes.find((c) => c.id.toString() === formData.clienteId);
                        return cliente ? formatClienteNombre(cliente) : 'Seleccione un cliente';
                      })()
                    : 'Seleccione un cliente'}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command shouldFilter={false}>
                  <CommandInput
                    placeholder="Buscar cliente..."
                    value={searchCliente}
                    onValueChange={setSearchCliente}
                  />
                  <CommandEmpty>
                    <div className="py-3 px-2 text-center text-sm space-y-2">
                      <p>No se encontró ningún cliente.</p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleOpenNuevoCliente}
                      >
                        <Plus className="mr-1 h-3 w-3" />
                        Crear nuevo cliente
                      </Button>
                    </div>
                  </CommandEmpty>
                  <CommandGroup>
                    {clientesFiltrados.map((cliente) => (
                      <CommandItem
                        key={cliente.id}
                        value={cliente.id.toString()}
                        onSelect={(currentValue) => {
                          const clienteSeleccionado = clientes.find(
                            (c) => c.id.toString() === currentValue
                          );
                          if (currentValue === formData.clienteId) {
                            setFormData((prev) => ({ ...prev, clienteId: '' }));
                            setSelectedCliente(null);
                          } else {
                            setFormData((prev) => ({ ...prev, clienteId: currentValue }));
                            setSelectedCliente(clienteSeleccionado ?? null);
                          }
                          setOpenCliente(false);
                        }}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            formData.clienteId === cliente.id.toString() ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                        {formatClienteNombre(cliente)}
                      </CommandItem>
                    ))}
                    <CommandItem onSelect={handleOpenNuevoCliente}>
                      <Plus className="mr-2 h-4 w-4" />
                      Nuevo cliente
                    </CommandItem>
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label htmlFor="marca">Marca</Label>
            <Select
              value={marcaSeleccionada}
              onValueChange={handleMarcaChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione una marca" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Seleccione una marca</SelectItem>
                {(data?.modelos || []).reduce((marcas: any[], modelo: any) => {
                  if (modelo?.marca?.id && !marcas.find(m => m.id === modelo.marca.id)) {
                    marcas.push({
                      id: modelo.marca.id,
                      nombre: modelo.marca.nombre
                    });
                  }
                  return marcas;
                }, []).sort((a: any, b: any) => a.nombre.localeCompare(b.nombre)).map((marca: any) => (
                  <SelectItem key={marca.id} value={marca.id.toString()}>
                    {marca.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="modeloId">Modelo</Label>
            <Select
              value={formData.modeloId}
              onValueChange={handleModeloChange}
              disabled={marcaSeleccionada === 'none'}
            >
              <SelectTrigger>
                <SelectValue placeholder={marcaSeleccionada === 'none' ? "Primero seleccione una marca" : "Seleccione un modelo"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Seleccione un modelo</SelectItem>
                {modelosFiltrados?.sort((a: any, b: any) => a.nombre.localeCompare(b.nombre)).map((modelo: any) => (
                  <SelectItem key={modelo.id} value={modelo.id.toString()}>
                    {modelo.nombre}
                  </SelectItem>
                )) || []}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="imei">IMEI</Label>
            <Input
              type="text"
              id="imei"
              name="imei"
              value={formData.imei}
              onChange={handleChange}
              pattern="[0-9]{15}"
              title="El IMEI debe contener exactamente 15 dígitos"
              placeholder="Ingrese el IMEI del dispositivo (15 dígitos)"
            />
          </div>

          <div>
            <Label htmlFor="descripcionProblema">Descripción del Problema</Label>
            <Textarea
              id="descripcionProblema"
              name="descripcionProblema"
              value={formData.descripcionProblema}
              onChange={handleChange}
              rows={4}
              placeholder="Describe el problema del dispositivo..."
            />
          </div>

          <div>
            <Label htmlFor="capacidad">Capacidad</Label>
            <Input
              type="text"
              id="capacidad"
              name="capacidad"
              value={formData.capacidad}
              onChange={handleChange}
              placeholder="Ej: 128GB"
            />
          </div>

          <div>
            <Label htmlFor="color">Color</Label>
            <Input
              type="text"
              id="color"
              name="color"
              value={formData.color}
              onChange={handleChange}
              placeholder="Color del dispositivo"
            />
          </div>

          <div>
            <Label htmlFor="fechaCompra">Fecha de Compra</Label>
            <Input
              type="date"
              id="fechaCompra"
              name="fechaCompra"
              value={formData.fechaCompra}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label>Tipo de Desbloqueo</Label>
            <div className="flex space-x-4 mt-2">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="pin"
                  name="tipoDesbloqueo"
                  value="pin"
                  checked={tipoDesbloqueo === 'pin'}
                  onChange={() => setTipoDesbloqueo('pin')}
                  className="h-4 w-4 text-[#FEBF19]"
                />
                <Label htmlFor="pin">PIN/Contraseña</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="patron"
                  name="tipoDesbloqueo"
                  value="patron"
                  checked={tipoDesbloqueo === 'patron'}
                  onChange={() => setTipoDesbloqueo('patron')}
                  className="h-4 w-4 text-[#FEBF19]"
                />
                <Label htmlFor="patron">Patrón</Label>
              </div>
            </div>
          </div>

          {tipoDesbloqueo === 'pin' ? (
            <div>
              <Label htmlFor="codigoDesbloqueo">Código de Desbloqueo</Label>
              <Input
                type="text"
                id="codigoDesbloqueo"
                name="codigoDesbloqueo"
                value={formData.codigoDesbloqueo}
                onChange={handleChange}
                placeholder="Ingrese el código de desbloqueo"
              />
            </div>
          ) : (
            <div>
              <Label>Patrón de Desbloqueo</Label>
              <div className="grid grid-cols-3 gap-2 mt-2 max-w-xs mx-auto">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((numero) => (
                  <button
                    key={numero}
                    type="button"
                    onClick={() => handlePatronClick(numero)}
                    className="aspect-square border rounded-lg flex items-center justify-center text-lg font-medium hover:bg-gray-100"
                  >
                    {numero}
                  </button>
                ))}
              </div>
              {patronDesbloqueo.length > 0 && (
                <div className="mt-2 text-sm text-gray-600 text-center">
                  Patrón actual: {patronDesbloqueo.join(' → ')}
                </div>
              )}
            </div>
          )}

          <div>
            <Label htmlFor="redCelular">Red Celular</Label>
            <Input
              type="text"
              id="redCelular"
              name="redCelular"
              value={formData.redCelular}
              onChange={handleChange}
              placeholder="Ej: Telcel, AT&T, etc."
            />
          </div>
        </div>

        <div className="mt-8 flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="min-w-[100px]"
          >
            {loading ? 'Creando...' : 'Crear Ticket'}
          </Button>
        </div>
      </form>

      <NuevoClienteModal
        open={openNuevoCliente}
        onOpenChange={setOpenNuevoCliente}
        onSuccess={handleClienteCreated}
        initialSearch={searchCliente}
        apiVariant="repair-point"
      />
    </div>
  );
} 