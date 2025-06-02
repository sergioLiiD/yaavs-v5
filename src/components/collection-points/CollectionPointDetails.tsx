'use client';

import { CollectionPoint } from '@/types/collection-point';
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

interface CollectionPointDetailsProps {
  collectionPoint: CollectionPoint;
}

export default function CollectionPointDetails({ collectionPoint }: CollectionPointDetailsProps) {
  return (
    <div className="container mx-auto px-4 py-8">
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
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-2">Información de Contacto</h2>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Teléfono:</span> {collectionPoint.phone}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Email:</span> {collectionPoint.email}
                  </p>
                  {collectionPoint.url && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">URL:</span>{' '}
                      <a href={collectionPoint.url} target="_blank" rel="noopener noreferrer" className="text-[#FEBF19] hover:underline">
                        {collectionPoint.url}
                      </a>
                    </p>
                  )}
                </div>
              </div>

              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-2">Horario de Atención</h2>
                <div className="space-y-1">
                  {Object.entries(collectionPoint.schedule).map(([day, { open, start, end }]) => (
                    <p key={day} className="text-sm text-gray-600">
                      <span className="font-medium">{DAYS_OF_WEEK[day as keyof typeof DAYS_OF_WEEK]}:</span>{' '}
                      {open ? `${start} - ${end}` : 'Cerrado'}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-2">Ubicación</h2>
                <p className="text-sm text-gray-600 mb-4">{collectionPoint.location.address}</p>
                <div className="h-96 rounded-lg overflow-hidden">
                  <Map
                    selectedLocation={collectionPoint.location}
                    onLocationSelect={() => {}}
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