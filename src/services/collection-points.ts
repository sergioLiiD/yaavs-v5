import { CollectionPoint } from '@/types/collection-point';

const API_URL = '/api/puntos-recoleccion';

const defaultOptions = {
  credentials: 'include' as const,
  headers: {
    'Content-Type': 'application/json',
  },
};

export async function getCollectionPoints(): Promise<CollectionPoint[]> {
  const response = await fetch(API_URL, {
    ...defaultOptions,
  });
  if (!response.ok) {
    throw new Error('Error al obtener puntos de recolección');
  }
  return response.json();
}

export async function getCollectionPoint(id: string): Promise<CollectionPoint> {
  const response = await fetch(`${API_URL}/${id}`, {
    ...defaultOptions,
  });
  if (!response.ok) {
    throw new Error('Error al obtener punto de recolección');
  }
  return response.json();
}

export async function createCollectionPoint(data: Partial<CollectionPoint>): Promise<CollectionPoint> {
  const response = await fetch(API_URL, {
    ...defaultOptions,
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Error al crear punto de recolección');
  }
  return response.json();
}

export async function updateCollectionPoint(id: string, data: Partial<CollectionPoint>): Promise<CollectionPoint> {
  const response = await fetch(`${API_URL}/${id}`, {
    ...defaultOptions,
    method: 'PUT',
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Error al actualizar punto de recolección');
  }
  return response.json();
}

export async function deleteCollectionPoint(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/${id}`, {
    ...defaultOptions,
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Error al eliminar punto de recolección');
  }
} 