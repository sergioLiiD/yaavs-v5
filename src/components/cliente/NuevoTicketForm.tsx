'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Map } from '@/components/ui/map';
import { Label } from '@/components/ui/label';
import { Loader } from '@googlemaps/js-api-loader';

// Esquema de validación
const ticketSchema = z.object({
  // Datos del dispositivo
  marcaId: z.string().min(1, 'La marca es requerida'),
  modeloId: z.string().min(1, 'El modelo es requerido'),
  capacidad: z.string().min(1, 'La capacidad es requerida'),
  color: z.string().min(1, 'El color es requerido'),
  fechaCompra: z.string().min(1, 'La fecha de compra es requerida'),
  redCelular: z.string().min(1, 'La red celular es requerida'),
  tipoDesbloqueo: z.enum(['pin', 'patron']).default('pin'),
  codigoDesbloqueo: z.string().optional(),
  patronDesbloqueo: z.array(z.string()).optional(),
  descripcionProblema: z.string().min(1, 'La descripción del problema es requerida'),

  // Tipo de recolección
  tipoRecoleccion: z.enum(['domicilio', 'oficina']).default('domicilio'),

  // Dirección de recolección (solo si es domicilio)
  calle: z.string().optional(),
  numeroExterior: z.string().optional(),
  numeroInterior: z.string().optional(),
  colonia: z.string().optional(),
  ciudad: z.string().optional(),
  estado: z.string().optional(),
  codigoPostal: z.string().optional(),
  latitud: z.number().optional(),
  longitud: z.number().optional(),
}).refine((data) => {
  if (data.tipoRecoleccion === 'domicilio') {
    return data.calle && data.numeroExterior && data.colonia && 
           data.ciudad && data.estado && data.codigoPostal;
  }
  return true;
}, {
  message: "Todos los campos de dirección son requeridos cuando se selecciona recolección a domicilio",
  path: ["calle"]
});

type TicketFormData = z.infer<typeof ticketSchema>;

export function NuevoTicketForm() {
  const router = useRouter();
  const { data: session } = useSession();
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState({ lat: 19.4326, lng: -99.1332 });
  const [patronDesbloqueo, setPatronDesbloqueo] = useState<string[]>([]);
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  const [isLoadingMaps, setIsLoadingMaps] = useState(true);
  const [showMap, setShowMap] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const form = useForm<TicketFormData>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      tipoDesbloqueo: 'pin',
      patronDesbloqueo: [],
      marcaId: '',
      modeloId: '',
      capacidad: '',
      color: '',
      fechaCompra: '',
      redCelular: '',
      codigoDesbloqueo: '',
      descripcionProblema: '',
      tipoRecoleccion: 'domicilio',
      calle: '',
      numeroExterior: '',
      numeroInterior: '',
      colonia: '',
      ciudad: '',
      estado: '',
      codigoPostal: '',
      latitud: 19.4326,
      longitud: -99.1332
    },
  });

  const selectedMarcaId = form.watch('marcaId');
  const tipoRecoleccion = form.watch('tipoRecoleccion');
  const direccion = form.watch(['calle', 'numeroExterior', 'colonia', 'ciudad', 'estado', 'codigoPostal']);

  // Cargar Google Maps
  useEffect(() => {
    const loadGoogleMaps = async () => {
      try {
        setIsLoadingMaps(true);
        console.log('Iniciando carga de Google Maps...');
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        console.log('API Key presente:', !!apiKey);
        
        if (!apiKey) {
          throw new Error('API key de Google Maps no encontrada');
        }

        const loader = new Loader({
          apiKey,
          version: 'weekly',
          libraries: ['places', 'geocoding']
        });

        console.log('Cargando bibliotecas de Google Maps...');
        await loader.load();
        console.log('Google Maps cargado exitosamente');
        setGoogleMapsLoaded(true);
      } catch (error) {
        console.error('Error al cargar Google Maps:', error);
        toast.error('Error al cargar Google Maps. Por favor, recarga la página.');
        setGoogleMapsLoaded(false);
      } finally {
        setIsLoadingMaps(false);
      }
    };

    loadGoogleMaps();
  }, []);

  // Efecto para mostrar el mapa cuando se carga Google Maps
  useEffect(() => {
    if (googleMapsLoaded && !showMap) {
      console.log('Google Maps cargado, mostrando mapa...');
      setShowMap(true);
    }
  }, [googleMapsLoaded]);

  // Inicializar el mapa cuando se muestre
  useEffect(() => {
    if (!showMap || !googleMapsLoaded) {
      console.log('No se inicializará el mapa:', { showMap, googleMapsLoaded });
      return;
    }

    let mapInstance: google.maps.Map | null = null;
    let markerInstance: google.maps.Marker | null = null;

    console.log('Preparando para inicializar el mapa...');
    console.log('Estado del contenedor:', { 
      mapContainerExists: !!mapContainerRef.current,
      selectedLocation
    });

    const initMap = async () => {
      try {
        console.log('Inicializando mapa...');
        const mapElement = mapContainerRef.current;
        if (!mapElement) {
          console.error('El elemento del mapa no está disponible');
          throw new Error('El elemento del mapa no está disponible');
        }

        // Asegurarse de que el contenedor tenga dimensiones
        if (mapElement.offsetWidth === 0 || mapElement.offsetHeight === 0) {
          console.log('El contenedor del mapa no tiene dimensiones, esperando...');
          await new Promise(resolve => setTimeout(resolve, 100));
          if (mapElement.offsetWidth === 0 || mapElement.offsetHeight === 0) {
            throw new Error('El contenedor del mapa no tiene dimensiones');
          }
        }

        console.log('Creando instancia del mapa...');
        mapInstance = new google.maps.Map(mapElement, {
          center: selectedLocation,
          zoom: 15,
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
        });

        console.log('Creando marcador...');
        markerInstance = new google.maps.Marker({
          position: selectedLocation,
          map: mapInstance,
          draggable: true,
        });

        console.log('Agregando listeners...');
        mapInstance.addListener('click', (e: google.maps.MapMouseEvent) => {
          if (!e.latLng) return;
          markerInstance?.setPosition(e.latLng);
          handleLocationSelect({
            lat: e.latLng.lat(),
            lng: e.latLng.lng(),
          });
        });

        markerInstance.addListener('dragend', (e: google.maps.MapMouseEvent) => {
          if (!e.latLng) return;
          handleLocationSelect({
            lat: e.latLng.lat(),
            lng: e.latLng.lng(),
          });
        });

        setMapLoaded(true);
        console.log('Mapa inicializado exitosamente');
      } catch (error) {
        console.error('Error al inicializar el mapa:', error);
        toast.error('Error al inicializar el mapa. Por favor, intente de nuevo.');
        setMapLoaded(false);
      }
    };

    // Pequeño retraso para asegurar que el DOM esté listo
    const timer = setTimeout(() => {
      initMap();
    }, 500);

    return () => {
      clearTimeout(timer);
      console.log('Limpiando mapa...');
      if (markerInstance) {
        try {
          markerInstance.setMap(null);
        } catch (error) {
          console.error('Error al limpiar el marcador:', error);
        }
      }
      if (mapInstance) {
        try {
          // En lugar de usar setMap, simplemente limpiamos el contenedor
          if (mapContainerRef.current) {
            mapContainerRef.current.innerHTML = '';
          }
        } catch (error) {
          console.error('Error al limpiar el mapa:', error);
        }
      }
      setMapLoaded(false);
    };
  }, [showMap, googleMapsLoaded]);

  useEffect(() => {
    // Cargar marcas
    fetch('/api/catalogo/marcas')
      .then(res => res.json())
      .then(data => setBrands(data));

    // Cargar modelos cuando se selecciona una marca
    if (selectedMarcaId) {
      fetch(`/api/catalogo/modelos?marcaId=${selectedMarcaId}`)
        .then(res => res.json())
        .then(data => setModels(data));
    }
  }, [selectedMarcaId]);

  // Efecto para actualizar el mapa cuando cambia la dirección
  useEffect(() => {
    if (!googleMapsLoaded) return;

    const [calle, numeroExterior, colonia, ciudad, estado, codigoPostal] = direccion;
    if (calle && numeroExterior && colonia && ciudad && estado && codigoPostal) {
      const direccionCompleta = `${calle} ${numeroExterior}, ${colonia}, ${ciudad}, ${estado} ${codigoPostal}`;
      
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address: direccionCompleta }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const location = results[0].geometry.location;
          const newLocation = {
            lat: location.lat(),
            lng: location.lng()
          };
          setSelectedLocation(newLocation);
          form.setValue('latitud', newLocation.lat);
          form.setValue('longitud', newLocation.lng);
        }
      });
    }
  }, [direccion, googleMapsLoaded, form]);

  const handleLocationSelect = (location: { lat: number; lng: number }) => {
    setSelectedLocation(location);
    form.setValue('latitud', location.lat);
    form.setValue('longitud', location.lng);
  };

  const handlePatternComplete = (pattern: number[]) => {
    const patternString = pattern.map(num => num.toString());
    setPatronDesbloqueo(patternString);
    form.setValue('patronDesbloqueo', patternString);
  };

  const handleSearchOnMap = () => {
    const [calle, numeroExterior, colonia, ciudad, estado, codigoPostal] = direccion;
    if (calle && numeroExterior && colonia && ciudad && estado && codigoPostal) {
      const direccionCompleta = `${calle} ${numeroExterior}, ${colonia}, ${ciudad}, ${estado} ${codigoPostal}`;
      
      if (googleMapsLoaded) {
        console.log('Buscando ubicación:', direccionCompleta);
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ address: direccionCompleta }, (results, status) => {
          console.log('Resultado de geocodificación:', { status, results });
          if (status === 'OK' && results && results[0]) {
            const location = results[0].geometry.location;
            const newLocation = {
              lat: location.lat(),
              lng: location.lng()
            };
            console.log('Nueva ubicación encontrada:', newLocation);
            setSelectedLocation(newLocation);
            form.setValue('latitud', newLocation.lat);
            form.setValue('longitud', newLocation.lng);
            
            // Actualizar el mapa si ya está inicializado
            const mapElement = mapContainerRef.current;
            if (mapElement) {
              const map = new google.maps.Map(mapElement, {
                center: newLocation,
                zoom: 15,
                mapTypeControl: true,
                streetViewControl: true,
                fullscreenControl: true,
              });

              new google.maps.Marker({
                position: newLocation,
                map,
                draggable: true,
              });

              setMapLoaded(true);
            }
          } else {
            console.error('Error en geocodificación:', status);
            toast.error('No se pudo encontrar la ubicación en el mapa');
          }
        });
      } else {
        console.error('Google Maps no está cargado');
        toast.error('Google Maps no está cargado. Por favor, intente de nuevo.');
      }
    } else {
      console.error('Faltan campos de dirección');
      toast.error('Por favor, complete todos los campos de la dirección antes de buscar en el mapa');
    }
  };

  const onSubmit = async (data: TicketFormData) => {
    try {
      const dataToSubmit = {
        modeloId: parseInt(data.modeloId),
        capacidad: data.capacidad,
        color: data.color,
        fechaCompra: data.fechaCompra,
        redCelular: data.redCelular,
        codigoDesbloqueo: data.codigoDesbloqueo,
        descripcionProblema: data.descripcionProblema,
        direccion: {
          calle: data.calle,
          numeroExterior: data.numeroExterior,
          numeroInterior: data.numeroInterior,
          colonia: data.colonia,
          ciudad: data.ciudad,
          estado: data.estado,
          codigoPostal: data.codigoPostal,
          latitud: data.latitud,
          longitud: data.longitud
        }
      };

      const response = await fetch('/api/cliente/tickets', {
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

      const responseData = await response.json();
      toast.success('Ticket creado exitosamente');
      router.push('/cliente/tickets');
    } catch (error) {
      console.error('Error:', error);
      toast.error(error instanceof Error ? error.message : 'Error al crear el ticket');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Datos del dispositivo */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Datos del Dispositivo</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="marcaId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Marca</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una marca" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {brands.map((brand: any) => (
                        <SelectItem key={brand.id} value={brand.id.toString()}>
                          {brand.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="modeloId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Modelo</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un modelo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {models.map((model: any) => (
                        <SelectItem key={model.id} value={model.id.toString()}>
                          {model.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                    <Input {...field} />
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
                    <Input type="text" {...field} />
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
                    <Input 
                      type="date" 
                      {...field} 
                      onChange={(e) => field.onChange(e.target.value)}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="redCelular"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Red Celular</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="col-span-2">
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
                          name="tipoDesbloqueo"
                          value="pin"
                          checked={field.value === "pin"}
                          onChange={() => field.onChange("pin")}
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
                          checked={field.value === "patron"}
                          onChange={() => field.onChange("patron")}
                          className="h-4 w-4 text-blue-600"
                        />
                        <Label htmlFor="patron">Patrón</Label>
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {form.watch('tipoDesbloqueo') === 'pin' ? (
              <FormField
                control={form.control}
                name="codigoDesbloqueo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código de Desbloqueo</FormLabel>
                    <FormControl>
                      <Input type="text" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <div className="col-span-2">
                <FormField
                  control={form.control}
                  name="patronDesbloqueo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Patrón de Desbloqueo</FormLabel>
                      <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
                          const posicion = patronDesbloqueo.indexOf(num.toString());
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
                                  const nuevoPatron = [...patronDesbloqueo, num.toString()];
                                  setPatronDesbloqueo(nuevoPatron);
                                  field.onChange(nuevoPatron);
                                } else {
                                  // Si el número ya está en el patrón, eliminarlo y todos los que le siguen
                                  const nuevoPatron = patronDesbloqueo.slice(0, posicion);
                                  setPatronDesbloqueo(nuevoPatron);
                                  field.onChange(nuevoPatron);
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
                      {patronDesbloqueo.length > 0 && (
                        <div className="mt-2 text-sm text-gray-600 text-center">
                          Patrón actual: {patronDesbloqueo.join(" → ")}
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </div>
          <FormField
            control={form.control}
            name="descripcionProblema"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descripción del Problema</FormLabel>
                <FormControl>
                  <Textarea {...field} rows={4} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Tipo de recolección */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Tipo de Recolección</h3>
          <FormField
            control={form.control}
            name="tipoRecoleccion"
            render={({ field }) => (
              <FormItem>
                <div className="flex space-x-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="domicilio"
                      name="tipoRecoleccion"
                      value="domicilio"
                      checked={field.value === "domicilio"}
                      onChange={() => field.onChange("domicilio")}
                      className="h-4 w-4 text-[#FEBF19]"
                    />
                    <Label htmlFor="domicilio">Recolección a Domicilio</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="oficina"
                      name="tipoRecoleccion"
                      value="oficina"
                      checked={field.value === "oficina"}
                      onChange={() => field.onChange("oficina")}
                      className="h-4 w-4 text-[#FEBF19]"
                    />
                    <Label htmlFor="oficina">Envío a Oficina Central</Label>
                  </div>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {tipoRecoleccion === 'oficina' && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-4">
              <h4 className="font-medium">Instrucciones para envío a oficina central:</h4>
              <div className="space-y-2">
                <p><strong>Dirección de envío:</strong></p>
                <p>Arregla.mx<br />
                Atenas 56 piso 1<br />
                Colonia Juárez<br />
                Delegación Cuahutemoc<br />
                CDMX</p>
                <p><strong>Whatsapp:</strong> 56 5243 5208</p>
                <div className="mt-4">
                  <p><strong>Instrucciones importantes:</strong></p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Enviar el equipo en su caja original y sellada.</li>
                    <li>Si no se tiene la caja original, enviar en caja envuelta con plástico con burbujas para evitar daños.</li>
                    <li>El equipo se evaluará en el estado en el que fue recibido, por lo que un buen empaque es muy importante para evitar daños.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {tipoRecoleccion === 'domicilio' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="calle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Calle</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="numeroExterior"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número Exterior</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="numeroInterior"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número Interior</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="colonia"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Colonia</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="ciudad"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ciudad</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="estado"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="codigoPostal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código Postal</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="flex justify-end">
                <Button 
                  type="button" 
                  onClick={handleSearchOnMap}
                  className="mb-4"
                  disabled={isLoadingMaps || !googleMapsLoaded}
                >
                  {isLoadingMaps ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Cargando Google Maps...
                    </div>
                  ) : !googleMapsLoaded ? (
                    'Error al cargar Google Maps'
                  ) : (
                    'Buscar en el mapa'
                  )}
                </Button>
              </div>

              {showMap && (
                <div className="h-[400px] w-full border rounded-lg overflow-hidden relative">
                  {!mapLoaded ? (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <div className="flex flex-col items-center gap-2">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FEBF19]"></div>
                        <p className="text-gray-600">Cargando mapa...</p>
                      </div>
                    </div>
                  ) : null}
                  <div 
                    ref={mapContainerRef} 
                    className="w-full h-full absolute inset-0"
                    style={{ minHeight: '400px' }}
                  />
                </div>
              )}
            </>
          )}
        </div>

        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Creando ticket...' : 'Crear Ticket'}
        </Button>
      </form>
    </Form>
  );
} 