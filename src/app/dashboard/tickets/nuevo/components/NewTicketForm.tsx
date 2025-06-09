'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Cliente {
  id: number;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
}

interface TipoServicio {
  id: number;
  nombre: string;
}

interface Marca {
  id: number;
  nombre: string;
}

interface Modelo {
  id: number;
  nombre: string;
  marcas: {
    id: number;
    nombre: string;
  };
}

export function NewTicketForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [tiposServicio, setTiposServicio] = useState<TipoServicio[]>([]);
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [modelos, setModelos] = useState<Modelo[]>([]);
  const [modelosFiltrados, setModelosFiltrados] = useState<Modelo[]>([]);
  const [marcaSeleccionada, setMarcaSeleccionada] = useState<number | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [tipoDesbloqueo, setTipoDesbloqueo] = useState<'pin' | 'patron'>('pin');
  const [patronDesbloqueo, setPatronDesbloqueo] = useState<number[]>([]);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [clientesRes, tiposServicioRes, marcasRes, modelosRes] = await Promise.all([
          fetch('/api/clientes'),
          fetch('/api/tipos-servicio'),
          fetch('/api/marcas'),
          fetch('/api/modelos')
        ]);

        if (!clientesRes.ok || !tiposServicioRes.ok || !marcasRes.ok || !modelosRes.ok) {
          throw new Error('Error al cargar los datos');
        }

        const [clientesData, tiposServicioData, marcasData, modelosData] = await Promise.all([
          clientesRes.json(),
          tiposServicioRes.json(),
          marcasRes.json(),
          modelosRes.json()
        ]);

        setClientes(clientesData);
        setTiposServicio(tiposServicioData);
        setMarcas(marcasData);
        setModelos(modelosData);
      } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar los datos');
      } finally {
        setLoadingData(false);
      }
    };

    cargarDatos();
  }, []);

  useEffect(() => {
    if (marcaSeleccionada) {
      const filtrados = modelos.filter(modelo => modelo.marcas.id === marcaSeleccionada);
      setModelosFiltrados(filtrados);
    } else {
      setModelosFiltrados([]);
    }
  }, [marcaSeleccionada, modelos]);

  const handlePatronClick = (numero: number) => {
    if (patronDesbloqueo.length < 9) {
      setPatronDesbloqueo([...patronDesbloqueo, numero]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const data = {
        clienteId: formData.get('clienteId'),
        tipoServicioId: formData.get('tipoServicioId'),
        modeloId: formData.get('modeloId'),
        descripcionProblema: formData.get('descripcionProblema'),
        capacidad: formData.get('capacidad'),
        color: formData.get('color'),
        fechaCompra: formData.get('fechaCompra'),
        codigoDesbloqueo: tipoDesbloqueo === 'pin' ? formData.get('codigoDesbloqueo') : patronDesbloqueo.join('-'),
        redCelular: formData.get('redCelular'),
        imei: formData.get('imei'),
      };

      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Error al crear el ticket');
      }

      router.push('/dashboard/tickets');
    } catch (error) {
      console.error('Error:', error);
      alert('Error al crear el ticket');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FEBF19]"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
      <div className="space-y-6">
        <div>
          <label htmlFor="clienteId" className="block text-sm font-medium text-gray-700 mb-2">
            Cliente
          </label>
          <select
            name="clienteId"
            id="clienteId"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FEBF19] focus:ring-[#FEBF19] h-12 px-4"
          >
            <option value="">Seleccione un cliente</option>
            {clientes.map((cliente) => (
              <option key={cliente.id} value={cliente.id}>
                {cliente.nombre} {cliente.apellidoPaterno} {cliente.apellidoMaterno}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="tipoServicioId" className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Servicio
          </label>
          <select
            name="tipoServicioId"
            id="tipoServicioId"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FEBF19] focus:ring-[#FEBF19] h-12 px-4"
          >
            <option value="">Seleccione un tipo de servicio</option>
            {tiposServicio.map((tipo) => (
              <option key={tipo.id} value={tipo.id}>
                {tipo.nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="marcaId" className="block text-sm font-medium text-gray-700 mb-2">
            Marca
          </label>
          <select
            id="marcaId"
            value={marcaSeleccionada || ''}
            onChange={(e) => setMarcaSeleccionada(e.target.value ? Number(e.target.value) : null)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FEBF19] focus:ring-[#FEBF19] h-12 px-4"
          >
            <option value="">Seleccione una marca</option>
            {marcas.map((marca) => (
              <option key={marca.id} value={marca.id}>
                {marca.nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="modeloId" className="block text-sm font-medium text-gray-700 mb-2">
            Modelo
          </label>
          <select
            name="modeloId"
            id="modeloId"
            required
            disabled={!marcaSeleccionada}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FEBF19] focus:ring-[#FEBF19] h-12 px-4"
          >
            <option value="">Seleccione un modelo</option>
            {modelosFiltrados.map((modelo) => (
              <option key={modelo.id} value={modelo.id}>
                {modelo.nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="imei" className="block text-sm font-medium text-gray-700 mb-2">
            IMEI
          </label>
          <input
            type="text"
            name="imei"
            id="imei"
            pattern="[0-9]{15}"
            title="El IMEI debe contener exactamente 15 dígitos"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FEBF19] focus:ring-[#FEBF19] h-12 px-4"
            placeholder="Ingrese el IMEI del dispositivo (15 dígitos)"
          />
        </div>

        <div>
          <label htmlFor="descripcionProblema" className="block text-sm font-medium text-gray-700 mb-2">
            Descripción del Problema
          </label>
          <textarea
            name="descripcionProblema"
            id="descripcionProblema"
            rows={4}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FEBF19] focus:ring-[#FEBF19] px-4 py-3"
          />
        </div>

        <div>
          <label htmlFor="capacidad" className="block text-sm font-medium text-gray-700 mb-2">
            Capacidad
          </label>
          <input
            type="text"
            name="capacidad"
            id="capacidad"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FEBF19] focus:ring-[#FEBF19] h-12 px-4"
          />
        </div>

        <div>
          <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-2">
            Color
          </label>
          <input
            type="text"
            name="color"
            id="color"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FEBF19] focus:ring-[#FEBF19] h-12 px-4"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Desbloqueo
          </label>
          <div className="flex space-x-4 mb-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                checked={tipoDesbloqueo === 'pin'}
                onChange={() => setTipoDesbloqueo('pin')}
                className="form-radio h-4 w-4 text-[#FEBF19]"
              />
              <span className="ml-2">PIN/Contraseña</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                checked={tipoDesbloqueo === 'patron'}
                onChange={() => setTipoDesbloqueo('patron')}
                className="form-radio h-4 w-4 text-[#FEBF19]"
              />
              <span className="ml-2">Patrón</span>
            </label>
          </div>

          {tipoDesbloqueo === 'pin' ? (
            <input
              type="text"
              name="codigoDesbloqueo"
              id="codigoDesbloqueo"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FEBF19] focus:ring-[#FEBF19] h-12 px-4"
            />
          ) : (
            <div className="mt-4">
              <div className="grid grid-cols-3 gap-4 max-w-xs mx-auto">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((numero) => (
                  <button
                    key={numero}
                    type="button"
                    onClick={() => handlePatronClick(numero)}
                    className={`h-16 w-16 rounded-full border-2 ${
                      patronDesbloqueo.includes(numero)
                        ? 'border-[#FEBF19] bg-[#FEBF19] text-white'
                        : 'border-gray-300 hover:border-[#FEBF19]'
                    }`}
                  >
                    {numero}
                  </button>
                ))}
              </div>
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => setPatronDesbloqueo([])}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Limpiar patrón
                </button>
              </div>
              {patronDesbloqueo.length > 0 && (
                <div className="mt-4 text-center text-lg font-semibold text-gray-700">
                  {patronDesbloqueo.join(' → ')}
                </div>
              )}
            </div>
          )}
        </div>

        <div>
          <label htmlFor="redCelular" className="block text-sm font-medium text-gray-700 mb-2">
            Red Celular
          </label>
          <input
            type="text"
            name="redCelular"
            id="redCelular"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FEBF19] focus:ring-[#FEBF19] h-12 px-4"
          />
        </div>
      </div>

      <div className="mt-8 flex justify-end space-x-4">
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
          className="px-4 py-2 bg-[#FEBF19] text-white rounded-md hover:bg-[#E5AC17] disabled:opacity-50"
        >
          {loading ? 'Creando...' : 'Crear Ticket'}
        </button>
      </div>
    </form>
  );
} 