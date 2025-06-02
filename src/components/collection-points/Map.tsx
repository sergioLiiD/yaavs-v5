'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Location } from '@/types/collection-point';
import 'leaflet/dist/leaflet.css';

// Fix para los íconos de Leaflet en Next.js
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

interface MapProps {
  selectedLocation: Location;
  onLocationSelect: (location: Location) => void;
}

export default function Map({ selectedLocation, onLocationSelect }: MapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Inicializar el mapa
    mapRef.current = L.map(mapContainerRef.current).setView(
      [selectedLocation.latitude || 19.4326, selectedLocation.longitude || -99.1332] as L.LatLngExpression,
      13
    );

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(mapRef.current);

    // Crear el marcador
    markerRef.current = L.marker(
      [selectedLocation.latitude || 19.4326, selectedLocation.longitude || -99.1332] as L.LatLngExpression,
      { draggable: true }
    ).addTo(mapRef.current);

    // Agregar evento de arrastre al marcador
    markerRef.current.on('dragend', (e) => {
      const marker = e.target;
      const position = marker.getLatLng();
      onLocationSelect({
        ...selectedLocation,
        latitude: position.lat,
        longitude: position.lng,
      });
    });

    // Agregar evento de clic al mapa
    mapRef.current.on('click', (e) => {
      const { lat, lng } = e.latlng;
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
        onLocationSelect({
          ...selectedLocation,
          latitude: lat,
          longitude: lng,
        });
      }
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Actualizar el mapa cuando cambia la ubicación seleccionada
  useEffect(() => {
    if (!mapRef.current || !markerRef.current) return;

    if (selectedLocation.latitude && selectedLocation.longitude) {
      const newLatLng: L.LatLngExpression = [selectedLocation.latitude, selectedLocation.longitude];
      mapRef.current.setView(newLatLng, 15);
      markerRef.current.setLatLng(newLatLng);
    }
  }, [selectedLocation]);

  return <div ref={mapContainerRef} className="w-full h-full rounded-lg" />;
} 