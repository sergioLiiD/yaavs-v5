'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { HiPlus } from 'react-icons/hi';

interface Cliente {
  id: number;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  telefonoCelular: string;
  email: string;
  puntoRecoleccionId?: number;
}

export default function ClientesPage() {
  const router = useRouter();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        // Obtener el punto de recolección del usuario actual
        const userResponse = await fetch('/api/repair-point/data');
        if (!userResponse.ok) {
          throw new Error('Error al obtener datos del punto de reparación');
        }
        const userData = await userResponse.json();
        
        if (!userData.puntoRecoleccion?.id) {
          throw new Error('No se encontró el punto de recolección');
        }

        // Obtener los clientes del punto de recolección
        const response = await fetch(`/api/clientes?puntoRecoleccionId=${userData.puntoRecoleccion.id}`);
        if (!response.ok) {
          throw new Error('Error al obtener los clientes');
        }
        const data = await response.json();
        setClientes(data);
      } catch (error) {
        console.error('Error:', error);
        toast.error('Error al cargar los clientes');
      } finally {
        setIsLoading(false);
      }
    };

    fetchClientes();
  }, []);

  const filteredClientes = clientes.filter(cliente => {
    const searchString = `${cliente.nombre} ${cliente.apellidoPaterno} ${cliente.apellidoMaterno || ''} ${cliente.email} ${cliente.telefonoCelular}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FEBF19]"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Clientes</h1>
        <button
          onClick={() => router.push('/repair-point/clientes/new')}
          className="px-4 py-2 bg-[#FEBF19] text-gray-900 rounded-md hover:bg-[#FEBF19]/90 focus:outline-none focus:ring-2 focus:ring-[#FEBF19] focus:ring-offset-2 flex items-center gap-2"
        >
          <HiPlus className="h-5 w-5" />
          Nuevo Cliente
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar cliente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FEBF19] focus:border-transparent"
        />
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredClientes.map((cliente) => (
            <li key={cliente.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#FEBF19] truncate">
                      {cliente.nombre} {cliente.apellidoPaterno}{' '}
                      {cliente.apellidoMaterno}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">{cliente.email}</p>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    <p className="text-sm text-gray-500">
                      {cliente.telefonoCelular}
                    </p>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
} 