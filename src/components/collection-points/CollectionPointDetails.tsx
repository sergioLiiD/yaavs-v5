'use client';

import { CollectionPoint } from '@/types/collection-point';
import dynamic from 'next/dynamic';
import { ArrowLeftIcon, MapPinIcon, PhoneIcon, EnvelopeIcon, ClockIcon, BuildingOfficeIcon, UserGroupIcon, ArrowsPointingOutIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import RepairPointUsers from './RepairPointUsers';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

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

interface CollectionPointDetailsProps {
  collectionPoint: CollectionPoint;
}

export default function CollectionPointDetails({ collectionPoint }: CollectionPointDetailsProps) {
  const router = useRouter();
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [parentName, setParentName] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    console.log('CollectionPoint data:', collectionPoint);
    console.log('Parent data:', collectionPoint.parent);
    console.log('ParentId:', collectionPoint.parentId);
    
    // Usar la información del parent que ya viene en collectionPoint
    if (collectionPoint.parent?.nombre) {
      console.log('Setting parent name from parent object:', collectionPoint.parent.nombre);
      setParentName(collectionPoint.parent.nombre);
    } else if (collectionPoint.parentId) {
      console.log('Fetching parent name from API for ID:', collectionPoint.parentId);
      // Solo hacer la llamada adicional si no tenemos la información del parent
      const fetchParentName = async () => {
        try {
          const response = await fetch(`/api/puntos-recoleccion/${collectionPoint.parentId}`);
          if (response.ok) {
            const data = await response.json();
            console.log('Parent data from API:', data);
            setParentName(data.nombre);
          }
        } catch (error) {
          console.error('Error al cargar el punto principal:', error);
        }
      };

      fetchParentName();
    }
  }, [collectionPoint.parentId, collectionPoint.parent?.nombre]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <button
          onClick={() => router.push('/dashboard/collection-points')}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-black bg-[#FEBF19] rounded-md hover:bg-[#FEBF19]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FEBF19]"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Volver a Puntos de Recolección
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{collectionPoint.nombre}</h1>
              <div className="mt-2 flex items-center space-x-2">
                {collectionPoint.isHeadquarters && (
                  <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                    Principal
                  </span>
                )}
                {collectionPoint.isRepairPoint && (
                  <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                    Reparación
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="mb-6 flex items-center space-x-2">
            <Switch
              id="repair-point"
              checked={collectionPoint.isRepairPoint}
              onCheckedChange={async (checked) => {
                try {
                  const response = await fetch(`/api/puntos-recoleccion/${collectionPoint.id.toString()}`, {
                    method: 'PATCH',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      isRepairPoint: checked,
                    }),
                  });

                  if (!response.ok) {
                    throw new Error('Error al actualizar el punto de recolección');
                  }

                  // Recargar la página para mostrar los cambios
                  window.location.reload();
                } catch (error) {
                  console.error('Error:', error);
                  alert('Error al actualizar el punto de recolección');
                }
              }}
            />
            <Label htmlFor="repair-point">¿Puede hacer reparaciones?</Label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start">
                <MapPinIcon className="h-6 w-6 text-gray-400 mt-1" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-gray-900">Dirección</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {collectionPoint.location.address}
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <PhoneIcon className="h-6 w-6 text-gray-400 mt-1" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-gray-900">Teléfono</h3>
                  <p className="mt-1 text-sm text-gray-500">{collectionPoint.phone}</p>
                </div>
              </div>

              <div className="flex items-start">
                <EnvelopeIcon className="h-6 w-6 text-gray-400 mt-1" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-gray-900">Correo electrónico</h3>
                  <p className="mt-1 text-sm text-gray-500">{collectionPoint.email}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start">
                <BuildingOfficeIcon className="h-6 w-6 text-gray-400 mt-1" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-gray-900">Tipo de Punto</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {collectionPoint.isHeadquarters ? 'Punto Principal' : 'Sucursal'}
                  </p>
                  {collectionPoint.parentId && (
                    <p className="mt-1 text-sm text-gray-500">
                      Depende de: {parentName}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-start">
                <ClockIcon className="h-6 w-6 text-gray-400 mt-1" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-gray-900">Horario de Atención</h3>
                  <div className="mt-1 text-sm text-gray-500">
                    {Object.keys(DAYS_OF_WEEK).map((day) => {
                      const schedule = collectionPoint.schedule[day as keyof typeof DAYS_OF_WEEK];
                      const dayName = DAYS_OF_WEEK[day as keyof typeof DAYS_OF_WEEK];
                      return (
                        <div key={day} className="flex justify-between">
                          <span>{dayName}:</span>
                          <span>
                            {schedule?.open
                              ? `${schedule.start} - ${schedule.end}`
                              : 'Cerrado'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <div className="relative">
              <button
                onClick={() => setIsMapExpanded(!isMapExpanded)}
                className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-[#FEBF19] hover:bg-[#FEBF19]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FEBF19]"
              >
                <MapPinIcon className="h-5 w-5 mr-2 text-black" />
                {isMapExpanded ? 'Ocultar Mapa' : 'Ver Ubicación en el Mapa'}
              </button>
              
              {isMapExpanded && (
                <div className="mt-4 h-96 rounded-lg overflow-hidden">
                  <DynamicMap
                    selectedLocation={collectionPoint.location}
                  />
                </div>
              )}
            </div>
          </div>

          {collectionPoint.isHeadquarters && collectionPoint.children && collectionPoint.children.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Sucursales</h2>
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {collectionPoint.children.map((branch) => (
                    <li key={branch.id}>
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <p className="text-sm font-medium text-gray-900">{branch.nombre}</p>
                            {branch.isRepairPoint && (
                              <span className="ml-2 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                                Reparación
                              </span>
                            )}
                          </div>
                          <div className="ml-2 flex-shrink-0 flex">
                            <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                              {branch.phone}
                            </p>
                          </div>
                        </div>
                        <div className="mt-2 sm:flex sm:justify-between">
                          <div className="sm:flex">
                            <p className="flex items-center text-sm text-gray-500">
                              {branch.email}
                            </p>
                          </div>
                          <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                            <p>{branch.location.address}</p>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div className="border-t border-gray-200 pt-6 mt-6">
            <div className="flex items-start">
              <UserGroupIcon className="h-6 w-6 text-gray-400 mt-1" />
              <div className="ml-3 flex-1">
                <div className="mt-4">
                  <RepairPointUsers
                    collectionPointId={collectionPoint.id.toString()}
                    isRepairPoint={collectionPoint.isRepairPoint}
                    showModal={showUserModal}
                    onCloseModal={() => {
                      setShowUserModal(false);
                      setIsEditing(false);
                    }}
                    isEditing={isEditing}
                    onEditStart={() => {
                      setShowUserModal(true);
                      setIsEditing(true);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 