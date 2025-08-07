'use client';

import React, { useState, useEffect } from 'react';
import { Cliente } from '@/types/cliente';
import { ClienteService } from '@/services/clienteService';
import { HiSearch, HiUser, HiX } from 'react-icons/hi';

interface ClienteSelectorProps {
  clienteSeleccionado: Cliente | null;
  onClienteChange: (cliente: Cliente | null) => void;
}

export function ClienteSelector({ clienteSeleccionado, onClienteChange }: ClienteSelectorProps) {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([]);

  // Cargar clientes al montar el componente
  useEffect(() => {
    cargarClientes();
  }, []);

  // Filtrar clientes cuando cambia el término de búsqueda
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredClientes(clientes);
    } else {
      const filtered = clientes.filter(cliente =>
        cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.apellido_paterno.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.telefono_celular.includes(searchTerm)
      );
      setFilteredClientes(filtered);
    }
  }, [searchTerm, clientes]);

  const cargarClientes = async () => {
    setIsLoading(true);
    try {
      const clientesData = await ClienteService.getAll();
      setClientes(clientesData);
      setFilteredClientes(clientesData);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClienteSelect = (cliente: Cliente) => {
    onClienteChange(cliente);
    setSearchTerm(`${cliente.nombre} ${cliente.apellido_paterno}`);
    setShowDropdown(false);
  };

  const handleClearSelection = () => {
    onClienteChange(null);
    setSearchTerm('');
    setShowDropdown(false);
  };

  const getClienteDisplayName = (cliente: Cliente) => {
    return `${cliente.nombre} ${cliente.apellido_paterno}${cliente.apellido_materno ? ` ${cliente.apellido_materno}` : ''}`;
  };

  return (
    <div className="relative">
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <HiSearch className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar cliente por nombre, email o teléfono..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-[#FEBF19] focus:border-[#FEBF19] sm:text-sm"
          />
          {clienteSeleccionado && (
            <button
              onClick={handleClearSelection}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <HiX className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
      </div>

      {/* Dropdown de clientes */}
      {showDropdown && (
        <div className="absolute z-10 w-full mt-1 bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
          {isLoading ? (
            <div className="px-4 py-2 text-gray-500">Cargando clientes...</div>
          ) : filteredClientes.length === 0 ? (
            <div className="px-4 py-2 text-gray-500">No se encontraron clientes</div>
          ) : (
            filteredClientes.map((cliente) => (
              <button
                key={cliente.id}
                onClick={() => handleClienteSelect(cliente)}
                className="w-full text-left px-4 py-2 text-sm text-gray-900 hover:bg-gray-100 flex items-center space-x-3"
              >
                <HiUser className="h-4 w-4 text-gray-400" />
                <div>
                  <div className="font-medium">{getClienteDisplayName(cliente)}</div>
                  <div className="text-gray-500 text-xs">
                    {cliente.email} • {cliente.telefono_celular}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      )}

      {/* Cliente seleccionado */}
      {clienteSeleccionado && (
        <div className="mt-3 p-3 bg-[#FEBF19]/10 border border-[#FEBF19]/20 rounded-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <HiUser className="h-5 w-5 text-[#FEBF19]" />
              <div>
                <div className="font-medium text-gray-900">
                  {getClienteDisplayName(clienteSeleccionado)}
                </div>
                <div className="text-sm text-gray-500">
                  {clienteSeleccionado.email} • {clienteSeleccionado.telefono_celular}
                </div>
              </div>
            </div>
            <button
              onClick={handleClearSelection}
              className="text-gray-400 hover:text-gray-600"
            >
              <HiX className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Overlay para cerrar dropdown */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
} 