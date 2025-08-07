'use client';

import React, { useState, useEffect } from 'react';
import { ClienteServiceFrontend, Cliente } from '@/services/clienteServiceFrontend';

interface ClienteSelectorProps {
  clienteSeleccionado: Cliente | null;
  onClienteSeleccionado: (cliente: Cliente | null) => void;
}

export default function ClienteSelector({ clienteSeleccionado, onClienteSeleccionado }: ClienteSelectorProps) {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    cargarClientes();
  }, []);

  const cargarClientes = async () => {
    try {
      setIsLoading(true);
      const data = await ClienteServiceFrontend.obtenerClientes();
      setClientes(data);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const buscarClientes = async (termino: string) => {
    if (termino.length < 2) {
      setClientes([]);
      return;
    }

    try {
      setIsLoading(true);
      const data = await ClienteServiceFrontend.buscarClientes(termino);
      setClientes(data);
      setShowDropdown(true);
    } catch (error) {
      console.error('Error al buscar clientes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    setTerminoBusqueda(valor);
    
    if (valor.trim()) {
      buscarClientes(valor);
    } else {
      setClientes([]);
      setShowDropdown(false);
    }
  };

  const seleccionarCliente = (cliente: Cliente) => {
    onClienteSeleccionado(cliente);
    setTerminoBusqueda(`${cliente.nombre} ${cliente.apellido_paterno} ${cliente.apellido_materno || ''}`.trim());
    setShowDropdown(false);
  };

  const limpiarSeleccion = () => {
    onClienteSeleccionado(null);
    setTerminoBusqueda('');
    setShowDropdown(false);
  };

  return (
    <div className="relative">
      <div className="flex items-center space-x-2">
        <input
          type="text"
          placeholder="Buscar cliente por nombre, email o teléfono..."
          value={terminoBusqueda}
          onChange={handleInputChange}
          onFocus={() => setShowDropdown(true)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {clienteSeleccionado && (
          <button
            onClick={limpiarSeleccion}
            className="px-3 py-2 text-sm text-red-600 hover:text-red-800"
          >
            Limpiar
          </button>
        )}
      </div>

      {showDropdown && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {isLoading ? (
            <div className="px-4 py-2 text-gray-500">Cargando...</div>
          ) : clientes.length > 0 ? (
            clientes.map((cliente) => (
              <div
                key={cliente.id}
                onClick={() => seleccionarCliente(cliente)}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
              >
                <div className="font-medium">
                  {cliente.nombre} {cliente.apellido_paterno} {cliente.apellido_materno || ''}
                </div>
                <div className="text-sm text-gray-600">
                  {cliente.email} • {cliente.telefono_celular}
                </div>
              </div>
            ))
          ) : (
            <div className="px-4 py-2 text-gray-500">No se encontraron clientes</div>
          )}
        </div>
      )}

      {clienteSeleccionado && (
        <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
          <div className="font-medium text-green-800">
            Cliente seleccionado: {clienteSeleccionado.nombre} {clienteSeleccionado.apellido_paterno}
          </div>
          <div className="text-sm text-green-600">
            {clienteSeleccionado.email} • {clienteSeleccionado.telefono_celular}
          </div>
        </div>
      )}
    </div>
  );
} 