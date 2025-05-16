'use client';

import { useEffect, useRef, useState } from 'react';

interface MapProps {
  onLocationSelect: (location: { lat: number; lng: number }) => void;
  selectedLocation: { lat: number; lng: number };
  showMap: boolean;
}

export function Map({ onLocationSelect, selectedLocation, showMap }: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!showMap) return;

    const loadMap = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Cargar el script de Google Maps
        if (!window.google) {
          const script = document.createElement('script');
          script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places,geocoding`;
          script.async = true;
          script.defer = true;
          
          await new Promise((resolve, reject) => {
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
          });
        }

        // Esperar a que el elemento del mapa esté disponible
        if (!mapRef.current) {
          throw new Error('El elemento del mapa no está disponible');
        }

        // Crear el mapa
        const map = new google.maps.Map(mapRef.current, {
          center: selectedLocation,
          zoom: 15,
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
        });

        // Crear el marcador
        const marker = new google.maps.Marker({
          position: selectedLocation,
          map,
          draggable: true,
        });

        // Agregar listeners
        map.addListener('click', (e: google.maps.MapMouseEvent) => {
          if (!e.latLng) return;
          marker.setPosition(e.latLng);
          onLocationSelect({
            lat: e.latLng.lat(),
            lng: e.latLng.lng(),
          });
        });

        marker.addListener('dragend', (e: google.maps.MapMouseEvent) => {
          if (!e.latLng) return;
          onLocationSelect({
            lat: e.latLng.lat(),
            lng: e.latLng.lng(),
          });
        });

        setIsLoading(false);
      } catch (err) {
        console.error('Error al cargar el mapa:', err);
        setError('Error al cargar el mapa. Por favor, intente de nuevo.');
        setIsLoading(false);
      }
    };

    loadMap();
  }, [showMap, selectedLocation, onLocationSelect]);

  if (!showMap) return null;

  if (error) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center bg-gray-100 rounded-lg">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="text-gray-600">Cargando mapa...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={mapRef} 
      className="w-full h-[400px] rounded-lg"
    />
  );
} 