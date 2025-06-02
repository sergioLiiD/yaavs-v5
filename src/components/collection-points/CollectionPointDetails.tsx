'use client';

import { CollectionPoint } from '@/types/collection-point';
import Map from './Map';
import { ArrowLeftIcon, MapPinIcon, PhoneIcon, EnvelopeIcon, ClockIcon, BuildingOfficeIcon, UserGroupIcon, ArrowsPointingOutIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import RepairPointUsers from './RepairPointUsers';

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

  useEffect(() => {
    const fetchParentName = async () => {
      if (collectionPoint.parentId) {
        try {
          const response = await fetch(`/api/puntos-recoleccion/${collectionPoint.parentId}`);
          if (response.ok) {
            const data = await response.json();
            setParentName(data.name);
          }
        } catch (error) {
          console.error('Error al cargar el punto principal:', error);
        }
      }
    };

    fetchParentName();
  }, [collectionPoint.parentId]);

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
              <h1 className="text-2xl font-bold text-gray-900">{collectionPoint.name}</h1>
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
                    {Object.entries(collectionPoint.schedule).map(([day, schedule]) => {
                      const dayName = DAYS_OF_WEEK[DAYS_MAP[day as keyof typeof DAYS_MAP] || day as keyof typeof DAYS_OF_WEEK];
                      return (
                        <div key={day} className="flex justify-between">
                          <span>{dayName}:</span>
                          <span>
                            {schedule.isOpen
                              ? `${schedule.openTime} - ${schedule.closeTime}`
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
              <div className={`h-48 rounded-lg overflow-hidden transition-all duration-300 ${isMapExpanded ? 'h-96' : ''}`} style={{ zIndex: 0 }}>
                <Map
                  selectedLocation={collectionPoint.location}
                  onLocationSelect={() => {}}
                />
              </div>
              <button
                onClick={() => setIsMapExpanded(!isMapExpanded)}
                className="absolute bottom-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FEBF19]"
                style={{ zIndex: 1 }}
              >
                <ArrowsPointingOutIcon className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6 mt-6">
            <div className="flex items-start">
              <UserGroupIcon className="h-6 w-6 text-gray-400 mt-1" />
              <div className="ml-3 flex-1">
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Usuarios del Punto</h3>
                    <button
                      onClick={() => setShowUserModal(true)}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-black bg-[#FEBF19] hover:bg-[#FEBF19]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FEBF19]"
                    >
                      <PlusIcon className="h-5 w-5 mr-2" />
                      Agregar Usuario
                    </button>
                  </div>
                  <RepairPointUsers
                    collectionPointId={collectionPoint.id}
                    isRepairPoint={collectionPoint.isRepairPoint}
                    showModal={showUserModal}
                    onCloseModal={() => setShowUserModal(false)}
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