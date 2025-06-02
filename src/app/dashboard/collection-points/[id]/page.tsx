'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import CollectionPointDetails from '@/components/collection-points/CollectionPointDetails';
import { CollectionPoint } from '@/types/collection-point';

export default function CollectionPointPage() {
  const params = useParams();
  const id = params.id as string;
  const [collectionPoint, setCollectionPoint] = useState<CollectionPoint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCollectionPoint = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/puntos-recoleccion/${id}`);
        if (!response.ok) {
          throw new Error('Error al cargar el punto de recolección');
        }
        const data = await response.json();
        setCollectionPoint(data);
        setError(null);
      } catch (error) {
        console.error('Error:', error);
        setError('Error al cargar el punto de recolección');
      } finally {
        setLoading(false);
      }
    };

    fetchCollectionPoint();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Cargando punto de recolección...</p>
      </div>
    );
  }

  if (error || !collectionPoint) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">{error || 'No se encontró el punto de recolección'}</p>
      </div>
    );
  }

  return <CollectionPointDetails collectionPoint={collectionPoint} />;
} 