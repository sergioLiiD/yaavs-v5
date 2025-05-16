'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { HiSave, HiX } from 'react-icons/hi';
import { TipoServicioSelect } from '@/components/tickets/TipoServicioSelect';

interface Cliente {
  id: number;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  telefonoCelular: string;
  telefonoContacto?: string;
  email: string;
}

interface Tecnico {
  id: string;
  nombre: string;
  email?: string;
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

interface FormData {
  clienteId: number;
  tipoServicioId: number;
  marca: string;
  modelo: number | null;
  capacidad: string;
  color: string;
  fechaCompra: string;
  tipoDesbloqueo: "pin" | "patron";
  codigoDesbloqueo: string;
  patronDesbloqueo: string[];
  redCelular: string;
  tecnicoId: number;
  descripcionProblema: string;
}

export default function NewTicketPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([]);
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [modelos, setModelos] = useState<Modelo[]>([]);
  const [modelosFiltrados, setModelosFiltrados] = useState<Modelo[]>([]);

  const [formData, setFormData] = useState<FormData>({
    clienteId: 0,
    tipoServicioId: 0,
    marca: '',
    modelo: null,
    capacidad: '',
    color: '',
    fechaCompra: '',
    tipoDesbloqueo: "pin",
    codigoDesbloqueo: "",
    patronDesbloqueo: [],
    redCelular: '',
    tecnicoId: 0,
    descripcionProblema: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientesRes, tecnicosRes, marcasRes] = await Promise.all([
          fetch('/api/clientes'),
          fetch('/api/usuarios?nivel=TECNICO'),
          fetch('/api/catalogo/marcas'),
        ]);

        if (!clientesRes.ok || !tecnicosRes.ok || !marcasRes.ok) {
          throw new Error('Error al cargar los datos');
        }

        const [clientesData, tecnicosData, marcasData] = await Promise.all([
          clientesRes.json(),
          tecnicosRes.json(),
          marcasRes.json(),
        ]);

        setClientes(clientesData);
        setTecnicos(tecnicosData);
        setMarcas(marcasData);
      } catch (error) {
        console.error('Error:', error);
        setError('Error al cargar los datos');
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (formData.marca) {
      const fetchModelos = async () => {
        try {
          const response = await fetch(`/api/catalogo/modelos?marcaId=${formData.marca}`);
          if (!response.ok) {
            throw new Error('Error al cargar los modelos');
          }
          const data = await response.json();
          setModelos(data);
          setModelosFiltrados(data);
        } catch (error) {
          console.error('Error:', error);
          setError('Error al cargar los modelos');
        }
      };

      fetchModelos();
    }
  }, [formData.marca]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (field: keyof FormData, value: string) => {
    if (field === 'marca') {
      // Cuando cambia la marca, reseteamos el modelo
      setFormData(prev => ({
        ...prev,
        marca: value,
        modelo: null
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const dataToSubmit = {
        clienteId: formData.clienteId,
        tipoServicioId: formData.tipoServicioId,
        modeloId: formData.modelo,
        descripcionProblema: formData.descripcionProblema,
        tecnicoAsignadoId: formData.tecnicoId,
        capacidad: formData.capacidad,
        color: formData.color,
        fechaCompra: formData.fechaCompra,
        tipoDesbloqueo: formData.tipoDesbloqueo,
        codigoDesbloqueo: formData.tipoDesbloqueo === "pin" 
          ? formData.codigoDesbloqueo 
          : formData.patronDesbloqueo.join(","),
        redCelular: formData.redCelular,
      };

      console.log('Datos a enviar:', dataToSubmit);

      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSubmit),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear el ticket');
      }

      const data = await response.json();
      router.push(`/dashboard/tickets/${data.id}`);
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'Error al crear el ticket');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Nuevo Ticket de Reparación</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard/tickets')}
          >
            <HiX className="mr-2 h-5 w-5" />
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
          >
            <HiSave className="mr-2 h-5 w-5" />
            Crear Ticket
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Asignación de Técnico */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium">Asignación de Técnico</h2>
          <div className="space-y-2">
            <Label>Técnico Asignado</Label>
            <Select
              value={formData.tecnicoId?.toString()}
              onValueChange={(value) => handleSelectChange('tecnicoId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar técnico" />
              </SelectTrigger>
              <SelectContent>
                {tecnicos.map((tecnico) => (
                  <SelectItem key={tecnico.id} value={tecnico.id}>
                    {tecnico.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Información del Cliente */}
          <div className="space-y-4">
            <h2 className="text-lg font-medium">Información del Cliente</h2>
            <div className="space-y-2">
              <Label>Cliente</Label>
              <Select
                value={formData.clienteId?.toString()}
                onValueChange={(value) => handleSelectChange('clienteId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clientes.map((cliente) => (
                    <SelectItem key={cliente.id} value={cliente.id.toString()}>
                      {`${cliente.nombre} ${cliente.apellidoPaterno} ${cliente.apellidoMaterno || ''}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <TipoServicioSelect
              value={formData.tipoServicioId?.toString()}
              onChange={(value) => handleSelectChange('tipoServicioId', value)}
            />
          </div>

          {/* Información del Dispositivo */}
          <div className="space-y-4">
            <h2 className="text-lg font-medium">Información del Dispositivo</h2>
            <div className="space-y-2">
              <Label>Marca</Label>
              <Select
                value={formData.marca}
                onValueChange={(value) => handleSelectChange('marca', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar marca" />
                </SelectTrigger>
                <SelectContent>
                  {marcas.length > 0 ? (
                    marcas.map((marca) => (
                      <SelectItem key={marca.id} value={marca.id.toString()}>
                        {marca.nombre}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-data" disabled>
                      No hay marcas disponibles
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Modelo</Label>
              <Select
                value={formData.modelo?.toString() || ''}
                onValueChange={(value) => handleSelectChange('modelo', value)}
                disabled={!formData.marca}
              >
                <SelectTrigger>
                  <SelectValue placeholder={!formData.marca ? "Primero selecciona una marca" : "Seleccionar modelo"} />
                </SelectTrigger>
                <SelectContent>
                  {modelosFiltrados.length > 0 ? (
                    modelosFiltrados.map((modelo) => (
                      <SelectItem key={modelo.id} value={modelo.id.toString()}>
                        {modelo.nombre}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-data" disabled>
                      {!formData.marca ? "Primero selecciona una marca" : "No hay modelos disponibles para esta marca"}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacidad">Capacidad</Label>
              <Input
                id="capacidad"
                name="capacidad"
                value={formData.capacidad}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <Input
                id="color"
                name="color"
                value={formData.color}
                onChange={handleInputChange}
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
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="redCelular">Red Celular</Label>
              <Select
                value={formData.redCelular}
                onValueChange={(value) => handleSelectChange('redCelular', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar red" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TELCEL">Telcel</SelectItem>
                  <SelectItem value="ATT">AT&T</SelectItem>
                  <SelectItem value="MOVISTAR">Movistar</SelectItem>
                  <SelectItem value="UNEFON">Unefon</SelectItem>
                  <SelectItem value="OTRO">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <Label>Tipo de Desbloqueo</Label>
              <div className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="pin"
                    name="tipoDesbloqueo"
                    value="pin"
                    checked={formData.tipoDesbloqueo === "pin"}
                    onChange={(e) => setFormData(prev => ({ ...prev, tipoDesbloqueo: "pin" }))}
                    className="h-4 w-4 text-blue-600"
                  />
                  <Label htmlFor="pin">PIN</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="patron"
                    name="tipoDesbloqueo"
                    value="patron"
                    checked={formData.tipoDesbloqueo === "patron"}
                    onChange={(e) => setFormData(prev => ({ ...prev, tipoDesbloqueo: "patron" }))}
                    className="h-4 w-4 text-blue-600"
                  />
                  <Label htmlFor="patron">Patrón</Label>
                </div>
              </div>

              {formData.tipoDesbloqueo === "pin" ? (
                <div className="space-y-2">
                  <Label htmlFor="codigoDesbloqueo">Código de Desbloqueo</Label>
                  <Input
                    id="codigoDesbloqueo"
                    name="codigoDesbloqueo"
                    type="password"
                    value={formData.codigoDesbloqueo}
                    onChange={handleInputChange}
                    placeholder="Ingresa el PIN"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>Patrón de Desbloqueo</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
                      const posicion = formData.patronDesbloqueo.indexOf(num.toString());
                      return (
                        <button
                          key={num}
                          type="button"
                          className={`h-12 w-12 rounded-full border-2 flex items-center justify-center relative ${
                            posicion !== -1
                              ? 'border-blue-500 bg-blue-100'
                              : 'border-gray-300'
                          }`}
                          onClick={() => {
                            if (posicion === -1) {
                              // Agregar el número al final del patrón
                              setFormData(prev => ({
                                ...prev,
                                patronDesbloqueo: [...prev.patronDesbloqueo, num.toString()]
                              }));
                            } else {
                              // Si el número ya está en el patrón, eliminarlo y todos los que le siguen
                              setFormData(prev => ({
                                ...prev,
                                patronDesbloqueo: prev.patronDesbloqueo.slice(0, posicion)
                              }));
                            }
                          }}
                        >
                          {num}
                          {posicion !== -1 && (
                            <span className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                              {posicion + 1}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  {formData.patronDesbloqueo.length > 0 && (
                    <div className="mt-2 text-sm text-gray-600">
                      Patrón actual: {formData.patronDesbloqueo.join(" → ")}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcionProblema">Descripción del Problema</Label>
              <Textarea
                id="descripcionProblema"
                name="descripcionProblema"
                value={formData.descripcionProblema}
                onChange={handleInputChange}
                placeholder="Describe el problema del dispositivo..."
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
} 