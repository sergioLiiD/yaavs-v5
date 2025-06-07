'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { FaSpinner } from 'react-icons/fa';

interface Cliente {
  id: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
}

interface Modelo {
  id: string;
  nombre: string;
  marcas: {
    nombre: string;
  };
}

interface EstatusReparacion {
  id: string;
  nombre: string;
}

export default function NewTicketPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState<{
    clientes: Cliente[];
    modelos: Modelo[];
    estatusReparacion: EstatusReparacion[];
  } | null>(null);

  const [formData, setFormData] = useState({
    clienteId: '',
    modeloId: '',
    descripcion: '',
    observaciones: '',
    estatusReparacionId: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/repair-point/data');
        if (!response.ok) {
          throw new Error('Error al cargar los datos');
        }
        const data = await response.json();
        setData(data);
      } catch (error) {
        setError('Error al cargar los datos. Por favor, recargue la página.');
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/repair-point/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Error al crear el ticket');
      }

      router.push('/repair-point/tickets');
    } catch (error) {
      setError('Error al crear el ticket. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <FaSpinner className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <FaSpinner className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Crear Nuevo Ticket</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="clienteId" className="block text-sm font-medium text-gray-700">
              Cliente
            </label>
            <select
              id="clienteId"
              name="clienteId"
              value={formData.clienteId}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Seleccione un cliente</option>
              {data.clientes.map(cliente => (
                <option key={cliente.id} value={cliente.id}>
                  {`${cliente.nombre} ${cliente.apellidoPaterno} ${cliente.apellidoMaterno}`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="modeloId" className="block text-sm font-medium text-gray-700">
              Modelo
            </label>
            <select
              id="modeloId"
              name="modeloId"
              value={formData.modeloId}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Seleccione un modelo</option>
              {data.modelos.map(modelo => (
                <option key={modelo.id} value={modelo.id}>
                  {`${modelo.marcas.nombre} ${modelo.nombre}`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700">
              Descripción del Problema
            </label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              required
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="observaciones" className="block text-sm font-medium text-gray-700">
              Observaciones
            </label>
            <textarea
              id="observaciones"
              name="observaciones"
              value={formData.observaciones}
              onChange={handleChange}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="estatusReparacionId" className="block text-sm font-medium text-gray-700">
              Estatus de Reparación
            </label>
            <select
              id="estatusReparacionId"
              name="estatusReparacionId"
              value={formData.estatusReparacionId}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Seleccione un estatus</option>
              {data.estatusReparacion.map(estatus => (
                <option key={estatus.id} value={estatus.id}>
                  {estatus.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center">
                  <FaSpinner className="animate-spin mr-2" />
                  Creando...
                </span>
              ) : (
                'Crear Ticket'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 