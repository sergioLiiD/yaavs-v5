'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { HiPencilAlt, HiSearch, HiFilter, HiPlus } from 'react-icons/hi';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableCell, TableHead, TableRow } from '@/components/ui/table';
import { Pencil } from 'lucide-react';

// Tipo para representar un precio de venta
interface PrecioVenta {
  id: string;
  tipo: 'PRODUCTO' | 'SERVICIO';
  nombre: string;
  marca: string;
  modelo: string;
  precio_compra_promedio: number;
  precio_venta: number;
  producto_id?: number;
  servicio_id?: number;
  created_at: Date;
  updated_at: Date;
  created_by: string;
  updated_by: string;
}

interface PrecioVentaItem {
  id: number;
  nombre: string;
  tipo: 'PRODUCTO' | 'SERVICIO';
  precio: number;
  precio_id: string;
  marca: string;
  modelo: string;
  precio_compra: number;
  updated_at: string;
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
  marcas?: {
    id: number;
    nombre: string;
  };
  modelos?: {
    id: number;
    nombre: string;
  };
  Modelo?: {
    id: number;
    nombre: string;
  };
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
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDetalles, setShowDetalles] = useState(false);
  const [detallesVisibles, setDetallesVisibles] = useState<Record<string, boolean>>({});
  
  // Estados para el modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPrecio, setCurrentPrecio] = useState<PrecioVenta | null>(null);
  
  // Estados para paginación
  const [itemsPerPage] = useState(50);
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });

  // Cargar los precios al montar el componente
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('Iniciando fetchData...');
      
      // Construir parámetros de búsqueda y paginación
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: itemsPerPage.toString()
      });
      
      if (searchTerm.trim()) {
        params.append('search', searchTerm);
      }
      
      const [productosResponse, preciosResponse, preciosPromedioResponse] = await Promise.all([
        fetch(`/api/inventario/productos?${params.toString()}`),
        fetch('/api/precios-venta'),
        fetch('/api/inventario/stock/precios-promedio')
      ]);

      const [productosResponseData, preciosData, preciosPromedioData] = await Promise.all([
        productosResponse.json(),
        preciosResponse.json(),
        preciosPromedioResponse.json()
      ]);

      // Manejar la nueva estructura de respuesta con paginación
      const productosData = productosResponseData.productos || productosResponseData;

      console.log('Datos recibidos:', {
        productos: productosData.length,
        precios: preciosData.length,
        preciosPromedio: preciosPromedioData.length
      });
      
      // Debug: mostrar estructura del primer producto
      if (productosData.length > 0) {
        console.log('Estructura del primer producto:', productosData[0]);
      }

      setProductos(productosData);
      setPrecios(preciosData);
      setPreciosPromedio(preciosPromedioData);
      
      // Actualizar estado de paginación si la respuesta incluye paginación
      if (productosResponseData.pagination) {
        setPagination(productosResponseData.pagination);
      }
    } catch (error) {
      console.error('Error al cargar los datos:', error);
      setError('Error al cargar los datos');
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, itemsPerPage, searchTerm]);

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
      id: item.precio_id.toString(),
      nombre: item.nombre,
      precio_venta: item.precio,
      tipo: item.tipo,
      producto_id: item.tipo === 'PRODUCTO' ? item.id : undefined,
      servicio_id: item.tipo === 'SERVICIO' ? item.id : undefined,
      precio_compra_promedio: item.precio_compra,
      marca: item.marca,
      modelo: item.modelo,
      created_at: new Date(item.updated_at),
      updated_at: new Date(item.updated_at),
      created_by: session?.user?.email || '',
      updated_by: session?.user?.email || ''
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentPrecio(null);
  };

  const handleEdit = (item: PrecioVentaItem) => {
    console.log('Editando precio:', item);
    setCurrentPrecio({
      id: item.precio_id,
      tipo: item.tipo,
      nombre: item.nombre,
      marca: item.marca || '-',
      modelo: item.modelo || '-',
      precio_compra_promedio: item.precio_compra || 0,
      precio_venta: item.precio || 0,
      producto_id: item.tipo === 'PRODUCTO' ? item.id : undefined,
      servicio_id: item.tipo === 'SERVICIO' ? item.id : undefined,
      created_at: new Date(),
      updated_at: new Date(),
      created_by: session?.user?.email || '',
      updated_by: session?.user?.email || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPrecio) return;

    try {
      const method = currentPrecio.id ? 'PUT' : 'POST';
      const url = '/api/precios-venta';
      
      const requestBody = {
        ...currentPrecio,
        id: currentPrecio.id ? Number(currentPrecio.id) : undefined,
        tipo: currentPrecio.tipo || 'PRODUCTO',
        nombre: currentPrecio.nombre,
        marca: currentPrecio.marca || '-',
        modelo: currentPrecio.modelo || '-',
        precioCompraPromedio: Number(currentPrecio.precio_compra_promedio) || 0,
        precioVenta: Number(currentPrecio.precio_venta) || 0,
        productoId: currentPrecio.tipo === 'PRODUCTO' ? Number(currentPrecio.producto_id) : null,
        servicioId: currentPrecio.tipo === 'SERVICIO' ? 1 : null,
        updatedBy: 'system'
      };

      console.log('Enviando datos al servidor:', requestBody);

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al guardar el precio');
      }

      const data = await response.json();
      console.log('Respuesta del servidor:', data);

      // Recargar los datos del servidor inmediatamente después de la actualización
      await fetchData();

      setIsModalOpen(false);
      setCurrentPrecio(null);
    } catch (error) {
      console.error('Error:', error);
      alert(error instanceof Error ? error.message : 'Error al guardar el precio');
    }
  };

  // Crear lista completa de productos y servicios con sus precios
  const allItems = useMemo(() => {
    // Agregar verificaciones null-safety
    if (!productos || !Array.isArray(productos)) {
      return [];
    }

    return productos.map(item => {
      // Debug: mostrar estructura del item
      if (item.tipo === 'PRODUCTO') {
        console.log('Producto:', item.nombre, 'Marca:', item.marcas?.nombre, 'Modelo:', item.modelos?.nombre);
      }
      
      // Buscar el precio de venta existente con null-safety
      const precio = (precios && Array.isArray(precios)) ? precios.find(p => {
        if (item.tipo === 'SERVICIO') {
          return p.tipo === 'SERVICIO' && p.nombre === item.nombre;
        }
        return p.nombre === item.nombre;
      }) : null;
      
      // Obtener el precio promedio directamente de la tabla de stock con null-safety
      const precioPromedio = (preciosPromedio && Array.isArray(preciosPromedio)) ? 
        preciosPromedio.find(p => p.producto_id === item.id)?.precio_promedio || 0 : 0;
      
      return {
        id: item.id,
        nombre: String(item.nombre || ''),
        tipo: item.tipo,
        precio: precio ? Number(precio.precio_venta) : 0, // Actualizado: precio_venta -> precio_venta
        precio_id: precio ? String(precio.id) : '',
        marca: item.tipo === 'PRODUCTO' ? String(item.marcas?.nombre || '-') : '-',
        modelo: item.tipo === 'PRODUCTO' ? String(item.modelos?.nombre || '-') : '-',
        precio_compra: item.tipo === 'PRODUCTO' ? Number(precioPromedio) : 0,
        updated_at: precio?.updated_at ? new Date(precio.updated_at).toISOString() : '' // Actualizado: updated_at -> updated_at
      };
    });
  }, [productos, precios, preciosPromedio]);

  // Los datos ya vienen filtrados del servidor, no necesitamos filtro local
  const filteredItems = allItems;

  // Función para cambiar de página
  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  // Resetear a la primera página cuando cambia la búsqueda
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [searchTerm]);

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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Marca</TableHead>
                    <TableHead>Modelo</TableHead>
                    <TableHead>Precio Compra Promedio</TableHead>
                    <TableHead>Precio Venta</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4">
                        Cargando...
                      </TableCell>
                    </TableRow>
                  ) : filteredItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4">
                        No hay precios de venta registrados
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredItems.map((item) => (
                      <TableRow key={`${item.id}-${item.precio_id}`}>
                        <TableCell className="font-bold dark:text-gray-100 text-gray-900">{item.nombre}</TableCell>
                        <TableCell className="font-bold dark:text-gray-100 text-gray-900">{item.tipo}</TableCell>
                        <TableCell className="font-bold dark:text-gray-100 text-gray-900">{item.marca}</TableCell>
                        <TableCell className="font-bold dark:text-gray-100 text-gray-900">{item.modelo}</TableCell>
                        <TableCell className="font-bold dark:text-gray-100 text-gray-900">${item.precio_compra?.toFixed(2) || '0.00'}</TableCell>
                        <TableCell className="font-bold text-lg dark:text-gray-100 text-gray-900">${item.precio?.toFixed(2) || '0.00'}</TableCell>
                        <TableCell className="font-bold">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(item)}
                              className="bg-[#FEBF19] text-gray-900 px-4 py-2 rounded-md hover:bg-[#FEBF19]/90 focus:outline-none focus:ring-2 focus:ring-[#FEBF19] focus:ring-offset-2"
                            >
                              <HiPencilAlt className="h-5 w-5" />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
        
        {/* Paginador */}
        {pagination.totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-4">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={!pagination.hasPrev}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={!pagination.hasNext}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Mostrando <span className="font-medium">{((pagination.page - 1) * itemsPerPage) + 1}</span> a{' '}
                  <span className="font-medium">{Math.min(pagination.page * itemsPerPage, pagination.total)}</span>{' '}
                  de <span className="font-medium">{pagination.total}</span> resultados
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={!pagination.hasPrev}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Anterior</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {/* Números de página */}
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    let pageNum;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.page <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.page >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = pagination.page - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          pageNum === pagination.page
                            ? 'z-10 bg-[#FEBF19] border-[#FEBF19] text-gray-900'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={!pagination.hasNext}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Siguiente</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
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
                        Precio de Compra Promedio (Referencia)
                      </label>
                      <input
                        type="number"
                        value={currentPrecio?.precio_compra_promedio || 0}
                        disabled
                        className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-800">
                        Precio de Venta <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={currentPrecio?.precio_venta || ''}
                        onChange={(e) => {
                          const value = e.target.value === '' ? 0 : Number(e.target.value);
                          console.log('Nuevo precio de venta:', value);
                          setCurrentPrecio(prev => prev ? {
                            ...prev,
                            precio_venta: value
                          } : null);
                        }}
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