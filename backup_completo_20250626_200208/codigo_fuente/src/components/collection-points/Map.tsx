'use client';

import { useEffect, useRef } from 'react';

interface MapProps {
  selectedLocation?: {
    latitude?: number;
    longitude?: number;
    lat?: number;
    lng?: number;
    address?: string;
  };
  onLocationSelect?: (location: { lat: number; lng: number; address: string }) => void;
}

export default function Map({ selectedLocation, onLocationSelect }: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    const mapElement = mapRef.current;
    if (!mapElement) return;

    const loadMap = async () => {
      try {
        const L = (await import('leaflet')).default;
        
        // Si el mapa ya está inicializado, solo actualizamos la ubicación
        if (mapInstanceRef.current) {
          const lat = selectedLocation?.lat || selectedLocation?.latitude || 19.4326;
          const lng = selectedLocation?.lng || selectedLocation?.longitude || -99.1332;
          const address = selectedLocation?.address || 'Ciudad de México';

          mapInstanceRef.current.setView([lat, lng], 13);
          
          // Eliminar el marcador anterior si existe
          if (markerRef.current) {
            mapInstanceRef.current.removeLayer(markerRef.current);
          }
          
          // Crear nuevo marcador
          markerRef.current = L.marker([lat, lng]).addTo(mapInstanceRef.current);
          markerRef.current.bindPopup(address).openPopup();
          
          return;
        }

        // Configurar el ícono por defecto
        const DefaultIcon = L.icon({
          iconUrl: '/images/marker-icon.png',
          iconRetinaUrl: '/images/marker-icon-2x.png',
          shadowUrl: '/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        });
        L.Marker.prototype.options.icon = DefaultIcon;

        // Valores por defecto para Ciudad de México
        const lat = selectedLocation?.lat || selectedLocation?.latitude || 19.4326;
        const lng = selectedLocation?.lng || selectedLocation?.longitude || -99.1332;
        const address = selectedLocation?.address || 'Ciudad de México';

        // Crear el mapa
        const map = L.map(mapElement).setView([lat, lng], 13);
        mapInstanceRef.current = map;

        // Agregar la capa de tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        // Agregar el marcador
        markerRef.current = L.marker([lat, lng]).addTo(map);
        markerRef.current.bindPopup(address).openPopup();

        // Agregar evento de clic en el mapa
        if (onLocationSelect) {
          map.on('click', (e: any) => {
            const { lat, lng } = e.latlng;
            onLocationSelect({ lat, lng, address: '' });
          });
        }

        // Limpiar al desmontar
        return () => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.remove();
            mapInstanceRef.current = null;
            markerRef.current = null;
          }
        };
      } catch (error) {
        console.error('Error al inicializar el mapa:', error);
      }
    };

    loadMap();
  }, [selectedLocation, onLocationSelect]);

  return (
    <div className="h-full w-full">
      <div ref={mapRef} className="h-full w-full" />
    </div>
  );
} 