'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { CollectionPoint, CollectionPointFormData, Location, Schedule, DaySchedule } from '@/types/collection-point';
import { createCollectionPoint, updateCollectionPoint } from '@/services/collection-points';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import Map from './Map';

const DAYS_OF_WEEK = {
  monday: 'Lunes',
  tuesday: 'Martes',
  wednesday: 'Miércoles',
  thursday: 'Jueves',
  friday: 'Viernes',
  saturday: 'Sábado',
  sunday: 'Domingo'
} as const;

const DAYS_MAP = {
  '0': 'monday',
  '1': 'tuesday',
  '2': 'wednesday',
  '3': 'thursday',
  '4': 'friday',
  '5': 'saturday',
  '6': 'sunday'
} as const;

// Importar el mapa dinámicamente con opciones específicas
const DynamicMap = dynamic(
  () => import('@/components/collection-points/Map'),
  {
    ssr: false,
    loading: () => (
      <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Cargando mapa...</p>
      </div>
    ),
  }
);

interface Headquarters {
  id: string;
  name: string;
  location: {
    address: string;
  };
}

interface CollectionPointFormProps {
  collectionPoint?: CollectionPoint | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CollectionPointForm({ collectionPoint, onClose, onSuccess }: CollectionPointFormProps) {
  const [formData, setFormData] = useState<CollectionPointFormData>({
    nombre: '',
    phone: '',
    email: '',
    url: '',
    isHeadquarters: false,
    isRepairPoint: false,
    location: {
      address: '',
      lat: 19.4326,
      lng: -99.1332,
    },
    schedule: {
      monday: { open: false, start: '09:00', end: '18:00' },
      tuesday: { open: false, start: '09:00', end: '18:00' },
      wednesday: { open: false, start: '09:00', end: '18:00' },
      thursday: { open: false, start: '09:00', end: '18:00' },
      friday: { open: false, start: '09:00', end: '18:00' },
      saturday: { open: false, start: '09:00', end: '18:00' },
      sunday: { open: false, start: '09:00', end: '18:00' },
    },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedLocation, setSelectedLocation] = useState<Location>({
    address: '',
    lat: 19.4326,
    lng: -99.1332,
  });

  const [headquarters, setHeadquarters] = useState<Headquarters[]>([]);

  useEffect(() => {
    const fetchHeadquarters = async () => {
      try {
        const response = await fetch('/api/puntos-recoleccion?isHeadquarters=true');
        if (!response.ok) {
          throw new Error('Error al cargar los puntos principales');
        }
        const data = await response.json();
        setHeadquarters(data);
      } catch (error) {
        console.error('Error al cargar los puntos principales:', error);
      }
    };

    fetchHeadquarters();
  }, []);

  // Inicializar el formulario con los datos del punto de recolección si estamos editando
  useEffect(() => {
    if (collectionPoint) {
      console.log('Datos del punto de recolección:', collectionPoint);
      console.log('Horario del punto:', collectionPoint.schedule);
      setFormData({
        nombre: collectionPoint.nombre,
        phone: collectionPoint.phone,
        email: collectionPoint.email,
        url: collectionPoint.url || '',
        isHeadquarters: collectionPoint.isHeadquarters,
        isRepairPoint: collectionPoint.isRepairPoint,
        location: collectionPoint.location,
        schedule: collectionPoint.schedule,
      });
      setSelectedLocation(collectionPoint.location);
    }
  }, [collectionPoint]);

  useEffect(() => {
    console.log('Estado inicial del horario:', formData.schedule);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked,
      }));
    } else if (name === 'parentId') {
      setFormData(prev => ({
        ...prev,
        parentId: value || undefined
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }

    // Actualizar la ubicación seleccionada cuando se cambia la dirección
    if (name === 'location.address') {
      setSelectedLocation(prev => ({
        ...prev,
        address: value,
      }));
    }
  };

  // Actualizar formData cuando cambia la ubicación seleccionada en el mapa
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      location: selectedLocation,
    }));
  }, [selectedLocation]);

  const handleScheduleChange = (day: string, field: 'open' | 'start' | 'end', value: string | boolean) => {
    console.log('Cambiando horario:', { day, field, value });
    console.log('Día en DAYS_OF_WEEK:', DAYS_OF_WEEK[day as keyof typeof DAYS_OF_WEEK]);
    setFormData(prev => {
      const newData = {
        ...prev,
        schedule: {
          ...prev.schedule,
          [day]: {
            ...prev.schedule[day as keyof Schedule],
            [field]: value
          }
        }
      };
      console.log('Nuevo estado del horario:', newData.schedule);
      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Asegurarnos de que el horario tenga el formato correcto
      const schedule = Object.entries(formData.schedule).reduce((acc, [day, schedule]) => {
        const dayKey = day as keyof Schedule;
        acc[dayKey] = {
          open: Boolean(schedule.open),
          start: schedule.start || '09:00',
          end: schedule.end || '18:00'
        };
        return acc;
      }, {} as Schedule);

      // Asegurarnos de que la ubicación tenga el formato correcto
      const location = {
        address: formData.location.address,
        lat: Number(formData.location.lat),
        lng: Number(formData.location.lng)
      };

      const data = {
        ...formData,
        schedule,
        location,
        parentId: !formData.isHeadquarters ? formData.parentId : undefined
      };

      console.log('Enviando datos:', JSON.stringify(data, null, 2));

      const response = await fetch(
        collectionPoint ? `/api/puntos-recoleccion/${collectionPoint.id}` : '/api/puntos-recoleccion',
        {
          method: collectionPoint ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Error al crear punto de recolección');
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'Error al crear punto de recolección');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSearchLocation = async () => {
    if (!formData.location?.address) {
      console.log('No hay dirección para buscar');
      return;
    }

    console.log('Buscando dirección:', formData.location.address);
    
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formData.location.address)}`;
      console.log('URL de búsqueda:', url);
      
      const response = await fetch(url);
      console.log('Respuesta recibida:', response.status);
      
      const data = await response.json();
      console.log('Datos recibidos:', data);

      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        console.log('Coordenadas encontradas:', { lat, lon, display_name });
        
        const newLocation = {
          address: display_name,
          lat: parseFloat(lat),
          lng: parseFloat(lon),
        };
        console.log('Nueva ubicación:', newLocation);
        
        // Actualizar tanto selectedLocation como formData
        setSelectedLocation(newLocation);
        setFormData(prev => ({
          ...prev,
          location: newLocation
        }));
      } else {
        console.log('No se encontraron resultados para la dirección');
      }
    } catch (error) {
      console.error('Error al buscar la ubicación:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">
        {collectionPoint ? 'Editar Punto de Recolección' : 'Nuevo Punto de Recolección'}
      </h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
            {error}
          </div>
        )}
        {/* Selector de tipo de punto */}
        {!collectionPoint && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Punto
            </label>
            <div className="flex items-center space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="isHeadquarters"
                  checked={formData.isHeadquarters}
                  onChange={() => setFormData(prev => ({ ...prev, isHeadquarters: true, parentId: undefined }))}
                  className="h-4 w-4 text-[#FEBF19] focus:ring-[#FEBF19] border-gray-300"
                />
                <span className="ml-2">Punto Principal</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="isHeadquarters"
                  checked={!formData.isHeadquarters}
                  onChange={() => setFormData(prev => ({ ...prev, isHeadquarters: false }))}
                  className="h-4 w-4 text-[#FEBF19] focus:ring-[#FEBF19] border-gray-300"
                />
                <span className="ml-2">Sucursal</span>
              </label>
            </div>
          </div>
        )}

        {/* Selector de punto principal */}
        {!formData.isHeadquarters && !collectionPoint && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Punto Principal
            </label>
            <select
              name="parentId"
              value={formData.parentId || ''}
              onChange={handleInputChange}
              className="mt-1 block w-full h-12 px-4 rounded-md border-gray-300 shadow-sm focus:border-[#FEBF19] focus:ring-[#FEBF19] focus:ring-2 text-black outline-none"
              required
            >
              <option value="">Selecciona un punto principal</option>
              {headquarters.map((hq) => (
                <option key={hq.id} value={hq.id}>
                  {hq.name} - {hq.location.address}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Información básica */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del punto de recolección
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                className="mt-1 block w-full h-12 px-4 rounded-md border-gray-300 shadow-sm focus:border-[#FEBF19] focus:ring-[#FEBF19] focus:ring-2 text-black placeholder-gray-400 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="mt-1 block w-full h-12 px-4 rounded-md border-gray-300 shadow-sm focus:border-[#FEBF19] focus:ring-[#FEBF19] focus:ring-2 text-black placeholder-gray-400 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Correo electrónico
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="mt-1 block w-full h-12 px-4 rounded-md border-gray-300 shadow-sm focus:border-[#FEBF19] focus:ring-[#FEBF19] focus:ring-2 text-black placeholder-gray-400 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL
              </label>
              <input
                type="url"
                name="url"
                value={formData.url}
                onChange={handleInputChange}
                className="mt-1 block w-full h-12 px-4 rounded-md border-gray-300 shadow-sm focus:border-[#FEBF19] focus:ring-[#FEBF19] focus:ring-2 text-black placeholder-gray-400 outline-none"
                required
              />
            </div>

            <div>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  name="isRepairPoint"
                  checked={formData.isRepairPoint}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-[#FEBF19] focus:ring-[#FEBF19] border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Este punto realiza reparaciones
                </span>
              </label>
            </div>
          </div>

          {/* Horario */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Horario de Atención</h3>
            {Object.entries(formData.schedule).map(([day, schedule]) => {
              // Determinar si el día viene como número o como texto
              const dayKey = day in DAYS_MAP ? DAYS_MAP[day as keyof typeof DAYS_MAP] : day;
              const dayName = DAYS_OF_WEEK[dayKey as keyof typeof DAYS_OF_WEEK];
              console.log('Renderizando día:', { day, dayKey, dayName, schedule });
              return (
                <div key={day} className="flex items-center space-x-4">
                  <div className="w-32">
                    <label className="block text-sm font-medium text-gray-700">
                      {dayName}
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={schedule.open}
                      onChange={(e) => handleScheduleChange(day, 'open', e.target.checked)}
                      className="h-4 w-4 text-[#FEBF19] focus:ring-[#FEBF19] border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-500">Abierto</span>
                  </div>
                  {schedule.open && (
                    <>
                      <input
                        type="time"
                        value={schedule.start}
                        onChange={(e) => handleScheduleChange(day, 'start', e.target.value)}
                        className="block w-32 rounded-md border-gray-300 shadow-sm focus:border-[#FEBF19] focus:ring-[#FEBF19] sm:text-sm"
                      />
                      <span className="text-gray-500">a</span>
                      <input
                        type="time"
                        value={schedule.end}
                        onChange={(e) => handleScheduleChange(day, 'end', e.target.value)}
                        className="block w-32 rounded-md border-gray-300 shadow-sm focus:border-[#FEBF19] focus:ring-[#FEBF19] sm:text-sm"
                      />
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Mapa */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium">Ubicación</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dirección
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                name="location.address"
                value={formData.location?.address}
                onChange={handleInputChange}
                placeholder="Ingresa la dirección completa"
                className="mt-1 block w-full h-12 px-4 rounded-md border-gray-300 shadow-sm focus:border-[#FEBF19] focus:ring-[#FEBF19] focus:ring-2 text-black placeholder-gray-400 outline-none"
                required
              />
              <button
                type="button"
                onClick={handleSearchLocation}
                className="mt-1 px-4 h-12 bg-[#FEBF19] text-black rounded-md hover:bg-[#FEBF19]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FEBF19] flex items-center"
              >
                <MagnifyingGlassIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="h-96 w-full rounded-lg overflow-hidden border border-gray-200">
            <DynamicMap
              selectedLocation={selectedLocation}
              onLocationSelect={setSelectedLocation}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          {collectionPoint && (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FEBF19]"
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-black bg-[#FEBF19] rounded-md hover:bg-[#FEBF19]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FEBF19]"
          >
            {collectionPoint ? 'Guardar Cambios' : 'Guardar Punto de Recolección'}
          </button>
        </div>
      </form>
    </div>
  );
} 