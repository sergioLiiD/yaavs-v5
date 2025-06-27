'use client';

import { useState, useEffect } from 'react';
import { CollectionPoint } from '@/types/collection-point';
import CollectionPointDetails from '@/components/collection-points/CollectionPointDetails';

interface PageProps {
  params: {
    id: string;
  };
}

export default function CollectionPointPage({ params }: PageProps) {
  const [collectionPoint, setCollectionPoint] = useState<CollectionPoint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCollectionPoint = async () => {
      try {
        const response = await fetch(`/api/puntos-recoleccion/${params.id}`);
        if (!response.ok) throw new Error('Error al cargar el punto de recolección');
        const data = await response.json();
        data.id = parseInt(data.id);
        setCollectionPoint(data);
      } catch (error) {
        setError('Error al cargar el punto de recolección');
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCollectionPoint();
  }, [params.id]);

  if (loading) {
    return <div className="text-center py-4">Cargando...</div>;
  }

  if (error || !collectionPoint) {
    return <div className="text-red-600 text-center py-4">{error || 'Punto de recolección no encontrado'}</div>;
  }

  return (
    <div className="space-y-8">
      <div className="bg-white shadow rounded-lg p-6">
        <CollectionPointDetails collectionPoint={collectionPoint} />
      </div>
    </div>
  );
} 