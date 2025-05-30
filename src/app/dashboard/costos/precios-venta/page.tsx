'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { HiPencilAlt, HiSearch, HiFilter } from 'react-icons/hi';
import axios from 'axios';

// Tipo para representar un precio de venta
interface PrecioVenta {
  id: number;
  nombre: string;
  precio_venta: number;
  tipo: 'PRODUCTO' | 'SERVICIO';
  producto_id?: number;
  servicio_id?: number;
  precio_compra_promedio: number;
  marca?: string;
  modelo?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
}

interface Producto {
  id: number;
  tipo: 'PRODUCTO' | 'SERVICIO';
  nombre: string;
  sku: string;
  marca: {
    id: number;
    nombre: string;
  };
  modelo: {
    id: number;
    nombre: string;
  };
  tipo_servicio?: string;
  proveedor?: string;
  garantia?: string;
  descripcion: string;
  notas_internas?: string;
}

interface Servicio {
  id: number;
  nombre: string;
  descripcion: string;
}

interface PrecioPromedio {
  producto_id: number;
  precio_promedio: number;
}

export default function PreciosVentaPage() {
  const { data: session } = useSession();
  
  // Estados
  const [precios, setPrecios] = useState<PrecioVenta[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [preciosPromedio, setPreciosPromedio] = useState<PrecioPromedio[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDetalles, setShowDetalles] = useState(false);
  const [detallesVisibles, setDetallesVisibles] = useState<Record<string, boolean>>({});
  
  // Estados para el modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPrecio, setCurrentPrecio] = useState<PrecioVenta | null>(null);

  // Cargar los precios al montar el componente
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('Iniciando carga de datos...');
      
      // Cargar productos del catálogo
      const productosResponse = await axios.get('/api/inventario/productos');
      console.log('Productos cargados:', productosResponse.data);
      setProductos(productosResponse.data);

      // Cargar precios de venta
      const preciosResponse = await axios.get('/api/precios-venta');
      console.log('Precios cargados:', preciosResponse.data);
      setPrecios(preciosResponse.data);

      // Cargar precios de compra promedio desde stock
      const stockResponse = await axios.get('/api/inventario/stock/precios-promedio');
      const preciosPromedioData: PrecioPromedio[] = stockResponse.data;
      console.log('Precios promedio cargados:', preciosPromedioData);
      setPreciosPromedio(preciosPromedioData);
    } catch (err) {
      console.error('Error detallado al cargar datos:', err);
      setError('Error al cargar los datos. Por favor, intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Funciones para gestionar el modal
  const openModal = (item: {
    id: number;
    nombre: string;
    tipo: 'PRODUCTO' | 'SERVICIO';
    precio: number;
    precio_id: number;
    marca: string;
    modelo: string;
    precio_compra: number;
    updated_at: string;
  }) => {
    setCurrentPrecio({
      id: item.precio_id || 0, // Si no hay precio_id, será 0 y se creará uno nuevo
      nombre: item.nombre,
      precio_venta: item.precio,
      tipo: item.tipo,
      producto_id: item.tipo === 'PRODUCTO' ? item.id : undefined,
      servicio_id: item.tipo === 'SERVICIO' ? item.id : undefined,
      precio_compra_promedio: item.precio_compra,
      marca: item.marca,
      modelo: item.modelo,
      created_at: new Date().toISOString(),
      updated_at: item.updated_at || new Date().toISOString(),
      created_by: session?.user?.email || '',
      updated_by: session?.user?.email || ''
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentPrecio(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentPrecio) return;
    
    try {
      // Si no tiene ID, crear nuevo precio
      if (!currentPrecio.id) {
        await axios.post('/api/precios-venta', {
          tipo: currentPrecio.tipo,
          nombre: currentPrecio.nombre,
          marca: currentPrecio.marca,
          modelo: currentPrecio.modelo,
          precio_compra_promedio: currentPrecio.precio_compra_promedio,
          precio_venta: currentPrecio.precio_venta,
          producto_id: currentPrecio.tipo === 'PRODUCTO' ? currentPrecio.producto_id : null,
          servicio_id: currentPrecio.tipo === 'SERVICIO' ? currentPrecio.servicio_id : null,
          created_by: session?.user?.email || '',
          updated_by: session?.user?.email || ''
        });
      } else {
        // Si tiene ID, actualizar precio existente
        await axios.put(`/api/precios-venta/${currentPrecio.id}`, {
          tipo: currentPrecio.tipo,
          nombre: currentPrecio.nombre,
          marca: currentPrecio.marca,
          modelo: currentPrecio.modelo,
          precio_compra_promedio: currentPrecio.precio_compra_promedio,
          precio_venta: currentPrecio.precio_venta,
          producto_id: currentPrecio.tipo === 'PRODUCTO' ? currentPrecio.producto_id : null,
          servicio_id: currentPrecio.tipo === 'SERVICIO' ? currentPrecio.servicio_id : null,
          updated_by: session?.user?.email || ''
        });
      }
      
      // Recargar los datos después de guardar
      await fetchData();
      closeModal();
    } catch (err) {
      console.error('Error al guardar precio:', err);
      setError('Error al guardar el precio. Por favor, intente nuevamente.');
    }
  };

  // Crear lista completa de productos y servicios con sus precios
  const allItems = useMemo(() => {
    return productos.map(item => {
      // Buscar el precio de venta existente por nombre
      const precio = precios.find(p => p.nombre === item.nombre);
      // Obtener el precio promedio directamente de la tabla de stock
      const precioPromedio = preciosPromedio.find(p => p.producto_id === item.id)?.precio_promedio || 0;
      
      return {
        id: item.id,
        nombre: String(item.nombre || ''),
        tipo: item.tipo,
        precio: precio ? Number(precio.precio_venta) : 0,
        precio_id: precio ? Number(precio.id) : 0,
        marca: item.tipo === 'PRODUCTO' ? String(item.marca?.nombre || '-') : '-',
        modelo: item.tipo === 'PRODUCTO' ? String(item.modelo?.nombre || '-') : '-',
        precio_compra: item.tipo === 'PRODUCTO' ? Number(precioPromedio) : 0,
        updated_at: precio?.updated_at || ''
      };
    });
  }, [productos, precios, preciosPromedio]);

  // Filtrar items según el término de búsqueda
  const filteredItems = useMemo(() => {
    return allItems.filter(item => 
      item.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allItems, searchTerm]);

  const toggleDetalles = (id: string) => {
    setDetallesVisibles(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const content = (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Precios de Venta</h1>
          <p className="mt-2 text-sm text-gray-700">
            Lista de precios de venta para productos
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="mt-4 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <HiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar por nombre..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={showDetalles}
              onChange={(e) => setShowDetalles(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Mostrar detalles adicionales</span>
          </label>
        </div>
      </div>

      {/* Tabla */}
      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      Tipo
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Nombre
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Marca
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Modelo
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Precio de Venta
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Precio Compra Promedio
                    </th>
                    {showDetalles && (
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Última Actualización
                      </th>
                    )}
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Acciones</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredItems.map((item) => (
                    <React.Fragment key={`${item.tipo}-${item.id}`}>
                      <tr>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            item.tipo === 'PRODUCTO' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {item.tipo === 'PRODUCTO' ? 'Producto' : 'Servicio'}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {item.nombre}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {item.marca}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {item.modelo}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-base font-semibold text-gray-900">
                          {item.precio > 0 ? `$${item.precio.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'Sin precio'}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {item.tipo === 'PRODUCTO' ? `$${item.precio_compra.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-'}
                        </td>
                        {showDetalles && (
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {item.updated_at ? new Date(item.updated_at).toLocaleDateString() : '-'}
                          </td>
                        )}
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <div className="flex justify-end space-x-3">
                            <button
                              onClick={() => toggleDetalles(`${item.tipo}-${item.id}`)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              {detallesVisibles[`${item.tipo}-${item.id}`] ? 'Ocultar' : 'Mostrar'}
                            </button>
                            <button
                              onClick={() => openModal(item)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <HiPencilAlt className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {detallesVisibles[`${item.tipo}-${item.id}`] && (
                        <tr>
                          <td colSpan={showDetalles ? 8 : 6} className="px-3 py-4 bg-gray-50">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h4 className="text-sm font-medium text-gray-900">Información General</h4>
                                <dl className="mt-2 space-y-1">
                                  <div className="flex justify-between">
                                    <dt className="text-sm text-gray-500">Tipo:</dt>
                                    <dd className="text-sm text-gray-900">{item.tipo}</dd>
                                  </div>
                                  <div className="flex justify-between">
                                    <dt className="text-sm text-gray-500">Nombre:</dt>
                                    <dd className="text-sm text-gray-900">{item.nombre}</dd>
                                  </div>
                                  <div className="flex justify-between">
                                    <dt className="text-sm text-gray-500">Marca:</dt>
                                    <dd className="text-sm text-gray-900">{item.marca}</dd>
                                  </div>
                                  <div className="flex justify-between">
                                    <dt className="text-sm text-gray-500">Modelo:</dt>
                                    <dd className="text-sm text-gray-900">{item.modelo}</dd>
                                  </div>
                                </dl>
                              </div>
                              <div>
                                <h4 className="text-sm font-medium text-gray-900">Precios</h4>
                                <dl className="mt-2 space-y-1">
                                  <div className="flex justify-between">
                                    <dt className="text-sm text-gray-500">Precio de Venta:</dt>
                                    <dd className="text-sm text-gray-900">
                                      {item.precio > 0 ? `$${item.precio.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'Sin precio'}
                                    </dd>
                                  </div>
                                  <div className="flex justify-between">
                                    <dt className="text-sm text-gray-500">Precio Compra Promedio:</dt>
                                    <dd className="text-sm text-gray-900">${item.precio_compra.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</dd>
                                  </div>
                                  <div className="flex justify-between">
                                    <dt className="text-sm text-gray-500">Última Actualización:</dt>
                                    <dd className="text-sm text-gray-900">
                                      {item.updated_at ? new Date(item.updated_at).toLocaleDateString() : '-'}
                                    </dd>
                                  </div>
                                </dl>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                  {filteredItems.length === 0 && !isLoading && (
                    <tr>
                      <td colSpan={showDetalles ? 8 : 6} className="px-6 py-4 text-center text-sm text-gray-500">
                        No hay precios registrados
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {content}

      {/* Modal para editar precio */}
      {isModalOpen && currentPrecio && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={closeModal}>
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen"></span>&#8203;

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="mb-4">
                    <h3 className="text-xl font-semibold leading-6 text-gray-900">
                      {currentPrecio.id ? 'Editar' : 'Agregar'} Precio de Venta
                    </h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-800">
                        Nombre
                      </label>
                      <input
                        type="text"
                        value={currentPrecio.nombre}
                        disabled
                        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-gray-100 rounded-md shadow-sm text-gray-700 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-800">
                        Precio de Venta <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={currentPrecio.precio_venta || ''}
                        onChange={(e) => setCurrentPrecio({
                          ...currentPrecio,
                          precio_venta: parseFloat(e.target.value) || 0
                        })}
                        className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 placeholder-gray-500"
                        min="0"
                        step="0.01"
                        required
                        placeholder="Ingresa el precio de venta"
                      />
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#FEBF19] text-base font-medium text-gray-900 hover:bg-[#FEBF19]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FEBF19] sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    {currentPrecio.id ? 'Guardar' : 'Agregar'}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FEBF19] sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 