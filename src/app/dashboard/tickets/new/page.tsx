'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { HiSave, HiX } from 'react-icons/hi';
import { PatternLock } from "@/components/ui/pattern-lock";
import { Timer } from "@/components/ui/timer";
import { cn } from "@/lib/utils";
import { YesNoRadioGroup } from "@/components/ui/yes-no-radio-group";

// Interfaces
interface Cliente {
  id: number;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  telefonoCelular: string;
  telefonoContacto?: string;
  email: string;
  calle?: string;
  numeroExterior?: string;
  numeroInterior?: string;
  colonia?: string;
  ciudad?: string;
  estado?: string;
  codigoPostal?: string;
  rfc?: string;
}

interface TipoReparacion {
  id: number;
  nombre: string;
  descripcion: string;
}

interface Tecnico {
  id: string;
  nombre: string;
  email?: string;
}

// Nuevas interfaces para marcas y modelos
interface Marca {
  id: number;
  nombre: string;
}

interface Modelo {
  id: number;
  nombre: string;
  marcaId: number;
}

interface ChecklistItem {
  enciende: "yes" | "no" | null;
  pantalla: "yes" | "no" | null;
  botonInicio: "yes" | "no" | null;
  botonesVolumen: "yes" | "no" | null;
  camara: "yes" | "no" | null;
  microfono: "yes" | "no" | null;
  altavoz: "yes" | "no" | null;
  wifi: "yes" | "no" | null;
  bluetooth: "yes" | "no" | null;
  gps: "yes" | "no" | null;
}

interface FormData {
  clienteId: number;
  tipoReparacionId: number;
  marca: string;
  modelo: string;
  imei: string;
  capacidad: string;
  color: string;
  fechaCompra: string;
  tipoDesbloqueo: "pin" | "patron";
  codigoDesbloqueo: string;
  patronDesbloqueo: number[];
  redCelular: string;
  tecnicoId: number;
  fechaEntrega: string;
  prioridad: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  checklistRecepcion: ChecklistItem;
  checklistPostReparacion: ChecklistItem;
  estado: 'PENDING' | 'IN_PROGRESS' | 'IN_REPAIR' | 'COMPLETED' | 'CANCELLED';
  fechaInicioDiagnostico?: Date;
}

export default function NewTicketPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('phone-info');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tiposReparacion, setTiposReparacion] = useState<TipoReparacion[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([]);
  
  // Nuevos estados para marcas y modelos
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [modelos, setModelos] = useState<Modelo[]>([]);
  const [modelosFiltrados, setModelosFiltrados] = useState<Modelo[]>([]);

  // Estados para los datos del formulario
  const [formData, setFormData] = useState<FormData>({
    clienteId: 0,
    tipoReparacionId: 0,
    marca: '',
    modelo: '',
    imei: '',
    capacidad: '',
    color: '',
    fechaCompra: '',
    tipoDesbloqueo: "pin",
    codigoDesbloqueo: "",
    patronDesbloqueo: [],
    redCelular: '',
    tecnicoId: 0,
    fechaEntrega: '',
    prioridad: 'MEDIUM',
    checklistRecepcion: {
      enciende: null,
      pantalla: null,
      botonInicio: null,
      botonesVolumen: null,
      camara: null,
      microfono: null,
      altavoz: null,
      wifi: null,
      bluetooth: null,
      gps: null,
    },
    checklistPostReparacion: {
      enciende: null,
      pantalla: null,
      botonInicio: null,
      botonesVolumen: null,
      camara: null,
      microfono: null,
      altavoz: null,
      wifi: null,
      bluetooth: null,
      gps: null,
    },
    estado: 'PENDING',
    fechaInicioDiagnostico: undefined,
  });

  // Cargar datos iniciales
  useEffect(() => {
    // Inicialmente establecemos técnicos estáticos como fallback
    const tecnicosEstaticos = [
      { id: 'T001', nombre: 'Juan Pérez', email: 'juan@example.com', telefono: '1234567890' },
      { id: 'T002', nombre: 'Ana García', email: 'ana@example.com', telefono: '0987654321' },
      { id: 'T003', nombre: 'Carlos López', email: 'carlos@example.com', telefono: '5555555555' }
    ];
    // No establecemos los técnicos estáticos inmediatamente para dar prioridad a los datos reales
    
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Cargar tipos de reparación
        try {
          const tiposReparacionRes = await fetch('/api/tipos-reparacion');
          console.log('Respuesta de tipos de reparación:', tiposReparacionRes.status, tiposReparacionRes.statusText);
          if (!tiposReparacionRes.ok) throw new Error('Error al cargar tipos de reparación');
          const tiposReparacionData = await tiposReparacionRes.json();
          setTiposReparacion(tiposReparacionData);
          console.log('Datos de tipos de reparación:', tiposReparacionData);
        } catch (err) {
          console.error('Error específico al cargar tipos de reparación:', err);
        }

        // Cargar clientes
        try {
          const clientesRes = await fetch('/api/clientes');
          console.log('Respuesta de clientes:', clientesRes.status, clientesRes.statusText);
          if (!clientesRes.ok) throw new Error('Error al cargar clientes');
          const clientesData = await clientesRes.json();
          setClientes(clientesData);
          console.log('Datos de clientes:', clientesData);
        } catch (err) {
          console.error('Error específico al cargar clientes:', err);
        }

        // Cargar técnicos reales desde la API
        try {
          console.log('Intentando cargar técnicos reales desde la API...');
          const tecnicosRes = await fetch('/api/usuarios/tecnicos');
          console.log('Respuesta de técnicos:', tecnicosRes.status, tecnicosRes.statusText);
          
          if (!tecnicosRes.ok) {
            console.error('Error al cargar técnicos - Código:', tecnicosRes.status);
            const errorText = await tecnicosRes.text();
            console.error('Detalle del error:', errorText);
            throw new Error(`Error al cargar técnicos: ${tecnicosRes.status} - ${errorText}`);
          }
          
          const tecnicosData = await tecnicosRes.json();
          console.log('Datos de técnicos recibidos desde API:', tecnicosData);
          
          if (Array.isArray(tecnicosData) && tecnicosData.length > 0) {
            setTecnicos(tecnicosData);
            console.log('Técnicos cargados desde la base de datos:', tecnicosData.length);
          } else {
            console.warn('No se recibieron técnicos o la estructura no es la esperada, usando datos estáticos');
            setTecnicos(tecnicosEstaticos);
          }
        } catch (err) {
          console.error('Error específico al cargar técnicos:', err);
          // Si falla la carga desde la API, usar los datos estáticos
          console.warn('Usando datos estáticos de técnicos como respaldo');
          setTecnicos(tecnicosEstaticos);
        }

        // Cargar marcas desde el catálogo
        try {
          console.log('Intentando cargar marcas desde el catálogo...');
          const marcasRes = await fetch('/api/catalogo/marcas');
          console.log('Respuesta de marcas:', marcasRes.status, marcasRes.statusText);
          if (!marcasRes.ok) {
            console.error('Error al cargar marcas - Código:', marcasRes.status);
            throw new Error('Error al cargar marcas');
          }
          const marcasData = await marcasRes.json();
          console.log('Datos de marcas recibidos desde API:', marcasData);
          setMarcas(marcasData);
        } catch (err) {
          console.error('Error específico al cargar marcas desde el catálogo:', err);
          // Si falla, usar datos locales como respaldo
          console.warn('Usando datos locales de marcas como respaldo');
          const marcasLocales = [
            { id: 1, nombre: 'Apple' },
            { id: 2, nombre: 'Samsung' },
            { id: 3, nombre: 'Xiaomi' },
            { id: 4, nombre: 'Huawei' },
            { id: 5, nombre: 'Motorola' },
            { id: 6, nombre: 'LG' },
            { id: 7, nombre: 'Sony' },
            { id: 8, nombre: 'OnePlus' },
            { id: 9, nombre: 'Google' }
          ];
          setMarcas(marcasLocales);
        }

        // Cargar modelos locales como respaldo
        try {
          console.log('Intentando cargar todos los modelos como respaldo...');
          // Intentamos cargar todos los modelos de todas las marcas como respaldo
          const todasLasMarcas = marcas.map(marca => {
            const marcaId = typeof marca.id === 'string' ? parseInt(marca.id) : marca.id;
            return { marcaId, nombre: marca.nombre };
          });
          
          // Modelos de respaldo por si falla la API
          const modelosRespaldo: Modelo[] = [
            // Apple
            { id: 1, nombre: 'iPhone 15 Pro Max', marcaId: 1 },
            { id: 2, nombre: 'iPhone 15 Pro', marcaId: 1 },
            { id: 3, nombre: 'iPhone 15', marcaId: 1 },
            { id: 4, nombre: 'iPhone 14 Pro Max', marcaId: 1 },
            { id: 5, nombre: 'iPhone 14 Pro', marcaId: 1 },
            // Samsung
            { id: 12, nombre: 'Galaxy S24 Ultra', marcaId: 2 },
            { id: 13, nombre: 'Galaxy S24+', marcaId: 2 },
            { id: 14, nombre: 'Galaxy S24', marcaId: 2 },
            // Xiaomi
            { id: 21, nombre: 'Redmi Note 13 Pro', marcaId: 3 },
            { id: 22, nombre: 'Redmi Note 13', marcaId: 3 },
            // Modelos para el resto de marcas
          ];
          
          // Asignar modelos de respaldo a las marcas que existen en el sistema
          const modelosAsignados = modelosRespaldo.filter(modelo => {
            return todasLasMarcas.some(marca => marca.marcaId === modelo.marcaId);
          });
          
          console.log('Modelos de respaldo preparados:', modelosAsignados.length);
          setModelos(modelosAsignados);
        } catch (err) {
          console.error('Error preparando modelos de respaldo:', err);
          // Si falla todo, al menos tenemos algunos modelos de respaldo básicos
          const modelosBasicos = [
            { id: 1, nombre: 'iPhone 15 Pro Max', marcaId: 1 },
            { id: 12, nombre: 'Galaxy S24 Ultra', marcaId: 2 },
            { id: 21, nombre: 'Redmi Note 13 Pro', marcaId: 3 },
          ];
          setModelos(modelosBasicos);
        }

      } catch (error) {
        console.error('Error general al cargar datos:', error);
        setError('Error al cargar datos iniciales');
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Manejadores de cambios
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    console.log(`handleSelectChange: ${name} = ${value}`);
    
    // Convertir a número si el campo es un ID
    if (name === 'clienteId' || name === 'tipoReparacionId' || name === 'tecnicoId') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) }));
    } else if (name === 'marca') {
      console.log('Cambiando marca a:', value);
      setFormData(prev => ({ ...prev, [name]: value, modelo: '' })); // Reset modelo cuando cambia la marca
      
      // Filtrar modelos según la marca seleccionada
      const marcaSeleccionada = marcas.find(m => m.nombre === value);
      console.log('Marca seleccionada:', marcaSeleccionada);
      
      if (marcaSeleccionada) {
        // Obtener modelos para esta marca
        const marcaId = typeof marcaSeleccionada.id === 'string' 
          ? parseInt(marcaSeleccionada.id) 
          : marcaSeleccionada.id;
        
        console.log('Obteniendo modelos para marca ID:', marcaId);
        fetchModelosPorMarca(marcaId);
      } else {
        console.log('No se encontró la marca seleccionada');
        setModelosFiltrados([]);
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Función para obtener modelos por marca
  const fetchModelosPorMarca = async (marcaId: number) => {
    try {
      console.log('Obteniendo modelos para la marca ID:', marcaId);
      
      // Obtener modelos desde el API de catálogo
      const modelosRes = await fetch(`/api/catalogo/modelos?marcaId=${marcaId}`);
      
      if (modelosRes.status === 401) {
        console.warn('No autorizado en API de modelos, usando filtrado local');
        throw new Error('No autorizado');
      }
      
      if (!modelosRes.ok) {
        console.error('Error al obtener modelos - Código:', modelosRes.status);
        const errorText = await modelosRes.text();
        console.error('Detalle del error:', errorText);
        throw new Error(`Error al obtener modelos: ${modelosRes.status} - ${errorText}`);
      }
      
      const modelosData = await modelosRes.json();
      console.log('Modelos obtenidos desde API:', modelosData);
      
      // Actualizar el estado con los modelos filtrados
      setModelosFiltrados(modelosData);
    } catch (error) {
      console.error('Error al obtener modelos por marca:', error);
      
      // Si falla, intentar filtrar localmente como respaldo
      console.warn('Usando filtrado local como respaldo');
      const modelosFiltradosLocalmente = modelos.filter(modelo => {
        const modeloMarcaId = typeof modelo.marcaId === 'string' 
          ? parseInt(modelo.marcaId) 
          : modelo.marcaId;
        
        return modeloMarcaId === marcaId;
      });
      
      if (modelosFiltradosLocalmente.length === 0) {
        console.warn('No se encontraron modelos locales para la marca ID:', marcaId);
        
        // Si no hay modelos para esta marca, crear algunos predeterminados
        if (marcaId === 1) { // Apple
          const modelosApple = [
            { id: 101, nombre: 'iPhone 15 Pro Max', marcaId: 1 },
            { id: 102, nombre: 'iPhone 15 Pro', marcaId: 1 },
            { id: 103, nombre: 'iPhone 15', marcaId: 1 },
            { id: 104, nombre: 'iPhone 14 Pro Max', marcaId: 1 },
          ];
          setModelosFiltrados(modelosApple);
        } else if (marcaId === 2) { // Samsung
          const modelosSamsung = [
            { id: 201, nombre: 'Galaxy S24 Ultra', marcaId: 2 },
            { id: 202, nombre: 'Galaxy S24+', marcaId: 2 },
            { id: 203, nombre: 'Galaxy S24', marcaId: 2 },
          ];
          setModelosFiltrados(modelosSamsung);
        } else {
          // Para otras marcas, crear un modelo genérico
          setModelosFiltrados([
            { id: 999, nombre: `Modelo genérico para marca ${marcaId}`, marcaId: marcaId }
          ]);
        }
      } else {
        setModelosFiltrados(modelosFiltradosLocalmente);
      }
    }
  };

  const handleChecklistChange = (section: 'checklistRecepcion' | 'checklistPostReparacion', field: keyof ChecklistItem) => {
    const handler: (value: "yes" | "no" | null) => void = (value) => {
      setFormData((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }));
    };
    return handler;
  };

  const handleEstadoChange = (newEstado: FormData['estado']) => {
    setFormData(prev => ({
      ...prev,
      estado: newEstado,
      fechaInicioDiagnostico: newEstado === 'IN_PROGRESS' ? new Date() : prev.fechaInicioDiagnostico
    }));
  };

  // Guardar borrador
  const handleSaveDraft = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          estado: 'PENDING',
        }),
      });

      if (!response.ok) {
        throw new Error('Error al guardar el borrador');
      }

      const data = await response.json();
      router.push(`/dashboard/tickets/${data.id}`);
    } catch (error) {
      console.error('Error:', error);
      setError('Error al guardar el borrador');
    } finally {
      setIsLoading(false);
    }
  };

  // Guardar y continuar
  const handleSaveAndContinue = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          estado: 'IN_PROGRESS',
        }),
      });

      if (!response.ok) {
        throw new Error('Error al guardar el ticket');
      }

      const data = await response.json();
      router.push(`/dashboard/tickets/${data.id}`);
    } catch (error) {
      console.error('Error:', error);
      setError('Error al guardar el ticket');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const dataToSubmit = {
        ...formData,
        codigoDesbloqueo: formData.tipoDesbloqueo === "pin" 
          ? formData.codigoDesbloqueo 
          : formData.patronDesbloqueo.join(","),
        // Asegurarnos de que marca y modelo estén correctamente establecidos
        marca: formData.marca,
        modelo: formData.modelo
      }

      console.log("Enviando datos del ticket:", dataToSubmit);
      
      await axios.post("/api/tickets", dataToSubmit)
      router.push("/dashboard/tickets")
    } catch (error) {
      console.error("Error al crear el ticket:", error)
      setError("Error al crear el ticket. Por favor, intente nuevamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-900">Nuevo Ticket de Reparación</h1>
          {formData.fechaInicioDiagnostico && (
            <Timer startTime={formData.fechaInicioDiagnostico} />
          )}
        </div>
        <div className="flex gap-2">
          <Select
            value={formData.estado}
            onValueChange={(value) => handleEstadoChange(value as FormData['estado'])}
          >
            <SelectTrigger className="w-[200px] h-[40px] rounded-md text-base">
              <SelectValue placeholder="Estado del ticket" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PENDING" className="text-base py-2">Pendiente</SelectItem>
              <SelectItem value="IN_PROGRESS" className="text-base py-2">En diagnóstico</SelectItem>
              <SelectItem value="IN_REPAIR" className="text-base py-2">En reparación</SelectItem>
              <SelectItem value="COMPLETED" className="text-base py-2">Completado</SelectItem>
              <SelectItem value="CANCELLED" className="text-base py-2">Cancelado</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={handleSaveDraft}
            disabled={isLoading}
          >
            <HiSave className="mr-2 h-5 w-5" />
            Guardar Borrador
          </Button>
          <Button
            onClick={handleSaveAndContinue}
            disabled={isLoading}
          >
            <HiSave className="mr-2 h-5 w-5" />
            Guardar y Continuar
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard/tickets')}
          >
            <HiX className="mr-2 h-5 w-5" />
            Cancelar
          </Button>
        </div>
      </div>

      {/* Indicador de Estado */}
      <div className="flex items-center justify-center space-x-4">
        <div className={cn(
          "px-6 py-3 rounded-md text-base font-medium w-[200px] text-center",
          formData.estado === 'PENDING' && "bg-yellow-100 text-yellow-800",
          formData.estado === 'IN_PROGRESS' && "bg-blue-100 text-blue-800",
          formData.estado === 'IN_REPAIR' && "bg-purple-100 text-purple-800",
          formData.estado === 'COMPLETED' && "bg-green-100 text-green-800",
          formData.estado === 'CANCELLED' && "bg-red-100 text-red-800"
        )}>
          {formData.estado === 'PENDING' && "Pendiente"}
          {formData.estado === 'IN_PROGRESS' && "En diagnóstico"}
          {formData.estado === 'IN_REPAIR' && "En reparación"}
          {formData.estado === 'COMPLETED' && "Completado"}
          {formData.estado === 'CANCELLED' && "Cancelado"}
        </div>
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="phone-info">Información del Teléfono</TabsTrigger>
          <TabsTrigger value="diagnosis">Diagnóstico</TabsTrigger>
          <TabsTrigger value="presupuesto">Presupuesto</TabsTrigger>
          <TabsTrigger value="pago">Pago</TabsTrigger>
          <TabsTrigger value="repair">Reparación</TabsTrigger>
        </TabsList>

        {/* Tab: Información del Teléfono */}
        <TabsContent value="phone-info" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div className="space-y-2">
              <Label>Tipo de Reparación</Label>
              <Select
                value={formData.tipoReparacionId?.toString()}
                onValueChange={(value) => handleSelectChange('tipoReparacionId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo de reparación" />
                </SelectTrigger>
                <SelectContent>
                  {tiposReparacion.map((tipo) => (
                    <SelectItem key={tipo.id} value={tipo.id.toString()}>
                      {tipo.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="marca">Marca</Label>
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
                      <SelectItem key={marca.id} value={marca.nombre}>
                        {marca.nombre}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-data" disabled>No hay marcas disponibles</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="modelo">Modelo</Label>
              <Select
                value={formData.modelo}
                onValueChange={(value) => handleSelectChange('modelo', value)}
                disabled={!formData.marca || modelosFiltrados.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={!formData.marca ? "Primero selecciona una marca" : "Seleccionar modelo"} />
                </SelectTrigger>
                <SelectContent>
                  {modelosFiltrados.length > 0 ? (
                    modelosFiltrados.map((modelo) => (
                      <SelectItem 
                        key={modelo.id} 
                        value={modelo.nombre}
                      >
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
              <Label htmlFor="imei">IMEI / # de Serie</Label>
              <Input
                id="imei"
                name="imei"
                value={formData.imei}
                onChange={handleInputChange}
              />
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

            <div className="space-y-2">
              <Label>Técnico</Label>
              {/* Si no hay técnicos, mostrar mensaje de depuración */}
              {tecnicos.length === 0 && (
                <div className="text-sm text-red-500 mb-1">
                  No se encontraron técnicos en la base de datos
                </div>
              )}
              <Select
                value={formData.tecnicoId?.toString()}
                onValueChange={(value) => handleSelectChange('tecnicoId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar técnico" />
                </SelectTrigger>
                <SelectContent>
                  {tecnicos.length > 0 ? (
                    tecnicos.map((tecnico) => {
                      console.log('Renderizando técnico:', tecnico);
                      return (
                        <SelectItem 
                          key={tecnico.id}
                          value={tecnico.id.toString()}
                        >
                          {tecnico.nombre} {tecnico.email && `(${tecnico.email})`}
                        </SelectItem>
                      );
                    })
                  ) : (
                    <SelectItem value="no-data" disabled>No hay técnicos disponibles</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fechaEntrega">Fecha de Entrega</Label>
              <Input
                id="fechaEntrega"
                name="fechaEntrega"
                type="datetime-local"
                value={formData.fechaEntrega}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="prioridad">Prioridad</Label>
              <Select
                value={formData.prioridad}
                onValueChange={(value) => handleSelectChange('prioridad', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar prioridad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Baja</SelectItem>
                  <SelectItem value="MEDIUM">Media</SelectItem>
                  <SelectItem value="HIGH">Alta</SelectItem>
                  <SelectItem value="URGENT">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Código de desbloqueo */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <label className="block text-sm font-medium text-gray-700">
                  Tipo de desbloqueo
                </label>
                <div className="flex space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="tipoDesbloqueo"
                      value="pin"
                      checked={formData.tipoDesbloqueo === "pin"}
                      onChange={(e) => setFormData({ ...formData, tipoDesbloqueo: "pin" })}
                      className="form-radio h-4 w-4 text-blue-600"
                    />
                    <span className="ml-2 text-sm text-gray-700">PIN</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="tipoDesbloqueo"
                      value="patron"
                      checked={formData.tipoDesbloqueo === "patron"}
                      onChange={(e) => setFormData({ ...formData, tipoDesbloqueo: "patron" })}
                      className="form-radio h-4 w-4 text-blue-600"
                    />
                    <span className="ml-2 text-sm text-gray-700">Patrón</span>
                  </label>
                </div>
              </div>

              {formData.tipoDesbloqueo === "pin" ? (
                <div className="space-y-2">
                  <Label htmlFor="codigoDesbloqueo">Código de desbloqueo</Label>
                  <Input
                    id="codigoDesbloqueo"
                    name="codigoDesbloqueo"
                    value={formData.codigoDesbloqueo}
                    onChange={handleInputChange}
                    placeholder="Ingrese el PIN"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Patrón de desbloqueo
                  </label>
                  <PatternLock
                    onPatternComplete={(pattern) => setFormData({ ...formData, patronDesbloqueo: pattern })}
                  />
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Tab: Diagnóstico */}
        <TabsContent value="diagnosis" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Checklist de Recepción */}
            <div className="col-span-2 bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Checklist de Recepción</h3>
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Checklist de Recepción</h3>
                  <div className="space-y-4">
                    <YesNoRadioGroup
                      id="check-enciende"
                      label="¿El dispositivo enciende correctamente?"
                      value={formData.checklistRecepcion.enciende}
                      onChange={handleChecklistChange("checklistRecepcion", "enciende")}
                    />
                    <YesNoRadioGroup
                      id="check-pantalla"
                      label="¿La pantalla funciona correctamente?"
                      value={formData.checklistRecepcion.pantalla}
                      onChange={handleChecklistChange("checklistRecepcion", "pantalla")}
                    />
                    <YesNoRadioGroup
                      id="check-boton-inicio"
                      label="¿El botón de inicio funciona?"
                      value={formData.checklistRecepcion.botonInicio}
                      onChange={handleChecklistChange("checklistRecepcion", "botonInicio")}
                    />
                    <YesNoRadioGroup
                      id="check-botones-volumen"
                      label="¿Los botones de volumen funcionan?"
                      value={formData.checklistRecepcion.botonesVolumen}
                      onChange={handleChecklistChange("checklistRecepcion", "botonesVolumen")}
                    />
                    <YesNoRadioGroup
                      id="check-camara"
                      label="¿La cámara funciona?"
                      value={formData.checklistRecepcion.camara}
                      onChange={handleChecklistChange("checklistRecepcion", "camara")}
                    />
                    <YesNoRadioGroup
                      id="check-microfono"
                      label="¿El micrófono funciona?"
                      value={formData.checklistRecepcion.microfono}
                      onChange={handleChecklistChange("checklistRecepcion", "microfono")}
                    />
                    <YesNoRadioGroup
                      id="check-altavoz"
                      label="¿El altavoz funciona?"
                      value={formData.checklistRecepcion.altavoz}
                      onChange={handleChecklistChange("checklistRecepcion", "altavoz")}
                    />
                    <YesNoRadioGroup
                      id="check-wifi"
                      label="¿El WiFi funciona?"
                      value={formData.checklistRecepcion.wifi}
                      onChange={handleChecklistChange("checklistRecepcion", "wifi")}
                    />
                    <YesNoRadioGroup
                      id="check-bluetooth"
                      label="¿El Bluetooth funciona?"
                      value={formData.checklistRecepcion.bluetooth}
                      onChange={handleChecklistChange("checklistRecepcion", "bluetooth")}
                    />
                    <YesNoRadioGroup
                      id="check-gps"
                      label="¿El GPS funciona?"
                      value={formData.checklistRecepcion.gps}
                      onChange={handleChecklistChange("checklistRecepcion", "gps")}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Información del Diagnóstico */}
            <div className="col-span-2 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bateria">Estado de la Batería</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EXCELENTE">Excelente (90-100%)</SelectItem>
                    <SelectItem value="BUENO">Bueno (70-89%)</SelectItem>
                    <SelectItem value="REGULAR">Regular (50-69%)</SelectItem>
                    <SelectItem value="MALO">Malo (0-49%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="versionOS">Versión del Sistema Operativo</Label>
                <Input
                  id="versionOS"
                  name="versionOS"
                  placeholder="Ej: iOS 16.0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notasDiagnostico">Notas del Diagnóstico</Label>
                <Textarea
                  id="notasDiagnostico"
                  name="notasDiagnostico"
                  placeholder="Describe los problemas encontrados..."
                  className="min-h-[100px]"
                />
              </div>

              {/* Fotos y Videos */}
              <div className="space-y-2">
                <Label>Fotos y Videos</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <input
                      type="file"
                      id="fotos"
                      accept="image/*"
                      className="hidden"
                    />
                    <label
                      htmlFor="fotos"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <svg
                        className="h-8 w-8 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span className="mt-2 text-sm text-gray-600">Agregar fotos</span>
                    </label>
                  </div>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <input
                      type="file"
                      id="videos"
                      accept="video/*"
                      className="hidden"
                    />
                    <label
                      htmlFor="videos"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <svg
                        className="h-8 w-8 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                      <span className="mt-2 text-sm text-gray-600">Agregar videos</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Tab: Presupuesto */}
        <TabsContent value="presupuesto" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {/* Reparaciones Frecuentes */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Reparaciones Frecuentes</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Seleccionar Reparación Frecuente</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar reparación frecuente" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CAMARA">Cambio de Cámara</SelectItem>
                      <SelectItem value="BATERIA">Cambio de Batería</SelectItem>
                      <SelectItem value="PANTALLA">Cambio de Pantalla</SelectItem>
                      <SelectItem value="MICROFONO">Cambio de Micrófono</SelectItem>
                      <SelectItem value="ALTavoz">Cambio de Altavoz</SelectItem>
                      <SelectItem value="BOTON_INICIO">Cambio de Botón de Inicio</SelectItem>
                      <SelectItem value="BOTON_VOLUMEN">Cambio de Botones de Volumen</SelectItem>
                      <SelectItem value="CONECTOR_CARGA">Cambio de Conector de Carga</SelectItem>
                      <SelectItem value="PLACA">Reparación de Placa</SelectItem>
                      <SelectItem value="OTRO">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Productos y Servicios */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Productos y Servicios</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Producto/Servicio</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar producto/servicio" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PANTALLA_IPHONE_13">Pantalla iPhone 13</SelectItem>
                        <SelectItem value="BATERIA_IPHONE_13">Batería iPhone 13</SelectItem>
                        <SelectItem value="CAMARA_IPHONE_13">Cámara iPhone 13</SelectItem>
                        <SelectItem value="MICROFONO_IPHONE_13">Micrófono iPhone 13</SelectItem>
                        <SelectItem value="ALTavoz_IPHONE_13">Altavoz iPhone 13</SelectItem>
                        <SelectItem value="BOTON_INICIO_IPHONE_13">Botón de Inicio iPhone 13</SelectItem>
                        <SelectItem value="BOTON_VOLUMEN_IPHONE_13">Botones de Volumen iPhone 13</SelectItem>
                        <SelectItem value="CONECTOR_CARGA_IPHONE_13">Conector de Carga iPhone 13</SelectItem>
                        <SelectItem value="PLACA_IPHONE_13">Placa iPhone 13</SelectItem>
                        <SelectItem value="OTRO">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Cantidad</Label>
                    <Input type="number" min="1" defaultValue="1" />
                  </div>
                  <div className="space-y-2">
                    <Label>Precio Unitario</Label>
                    <Input type="number" min="0" step="0.01" defaultValue="0.00" />
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  Agregar Producto/Servicio
                </Button>
              </div>

              {/* Tabla de Productos/Servicios */}
              <div className="mt-6">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto/Servicio</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio Unitario</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {/* Aquí irán los items dinámicamente */}
                  </tbody>
                </table>
              </div>

              {/* Total */}
              <div className="mt-4 flex justify-end">
                <div className="text-lg font-medium">
                  Total: $0.00
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Tab: Pago */}
        <TabsContent value="pago" className="space-y-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-center space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Pago a la Recepción</h3>
              <p className="text-gray-600">
                El pago se realizará cuando el cliente recoja el equipo.
              </p>
              <Button 
                onClick={() => handleEstadoChange('IN_REPAIR')}
                className="w-full md:w-auto"
              >
                Confirmar y Proceder a Reparación
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Tab: Reparación */}
        <TabsContent value="repair" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Descripción del Problema */}
            <div className="col-span-2 space-y-2">
              <Label htmlFor="descripcionProblema">Descripción del Problema</Label>
              <Textarea
                id="descripcionProblema"
                name="descripcionProblema"
                placeholder="Describe el problema encontrado..."
                className="min-h-[100px]"
              />
            </div>

            {/* Descripción de la Reparación */}
            <div className="col-span-2 space-y-2">
              <Label htmlFor="descripcionReparacion">Descripción de la Reparación</Label>
              <Textarea
                id="descripcionReparacion"
                name="descripcionReparacion"
                placeholder="Describe los pasos realizados para la reparación..."
                className="min-h-[100px]"
              />
            </div>

            {/* Checklist Post-Reparación */}
            <div className="col-span-2 bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Checklist Post-Reparación</h3>
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Checklist Post-Reparación</h3>
                  <div className="space-y-4">
                    <YesNoRadioGroup
                      id="post-check-enciende"
                      label="¿El dispositivo enciende correctamente?"
                      value={formData.checklistPostReparacion.enciende}
                      onChange={handleChecklistChange("checklistPostReparacion", "enciende")}
                    />
                    <YesNoRadioGroup
                      id="post-check-pantalla"
                      label="¿La pantalla funciona correctamente?"
                      value={formData.checklistPostReparacion.pantalla}
                      onChange={handleChecklistChange("checklistPostReparacion", "pantalla")}
                    />
                    <YesNoRadioGroup
                      id="post-check-boton-inicio"
                      label="¿El botón de inicio funciona?"
                      value={formData.checklistPostReparacion.botonInicio}
                      onChange={handleChecklistChange("checklistPostReparacion", "botonInicio")}
                    />
                    <YesNoRadioGroup
                      id="post-check-botones-volumen"
                      label="¿Los botones de volumen funcionan?"
                      value={formData.checklistPostReparacion.botonesVolumen}
                      onChange={handleChecklistChange("checklistPostReparacion", "botonesVolumen")}
                    />
                    <YesNoRadioGroup
                      id="post-check-camara"
                      label="¿La cámara funciona?"
                      value={formData.checklistPostReparacion.camara}
                      onChange={handleChecklistChange("checklistPostReparacion", "camara")}
                    />
                    <YesNoRadioGroup
                      id="post-check-microfono"
                      label="¿El micrófono funciona?"
                      value={formData.checklistPostReparacion.microfono}
                      onChange={handleChecklistChange("checklistPostReparacion", "microfono")}
                    />
                    <YesNoRadioGroup
                      id="post-check-altavoz"
                      label="¿El altavoz funciona?"
                      value={formData.checklistPostReparacion.altavoz}
                      onChange={handleChecklistChange("checklistPostReparacion", "altavoz")}
                    />
                    <YesNoRadioGroup
                      id="post-check-wifi"
                      label="¿El WiFi funciona?"
                      value={formData.checklistPostReparacion.wifi}
                      onChange={handleChecklistChange("checklistPostReparacion", "wifi")}
                    />
                    <YesNoRadioGroup
                      id="post-check-bluetooth"
                      label="¿El Bluetooth funciona?"
                      value={formData.checklistPostReparacion.bluetooth}
                      onChange={handleChecklistChange("checklistPostReparacion", "bluetooth")}
                    />
                    <YesNoRadioGroup
                      id="post-check-gps"
                      label="¿El GPS funciona?"
                      value={formData.checklistPostReparacion.gps}
                      onChange={handleChecklistChange("checklistPostReparacion", "gps")}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Fotos y Videos Post-Reparación */}
            <div className="col-span-2 space-y-2">
              <Label>Fotos y Videos Post-Reparación</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <input
                    type="file"
                    id="fotos-post"
                    accept="image/*"
                    className="hidden"
                  />
                  <label
                    htmlFor="fotos-post"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <svg
                      className="h-8 w-8 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="mt-2 text-sm text-gray-600">Agregar fotos</span>
                  </label>
                </div>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <input
                    type="file"
                    id="videos-post"
                    accept="video/*"
                    className="hidden"
                  />
                  <label
                    htmlFor="videos-post"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <svg
                      className="h-8 w-8 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="mt-2 text-sm text-gray-600">Agregar videos</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 