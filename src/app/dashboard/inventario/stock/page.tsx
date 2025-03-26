'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { HiPlus, HiSearch, HiChevronDown, HiChevronUp, HiExclamationCircle, HiSortAscending, HiSortDescending } from 'react-icons/hi';
import { toast, Toaster } from 'react-hot-toast';
import Modal from '@/components/Modal';

interface Producto {
  id: number;
  nombre: string;
  stock: number;
  stockMinimo: number;
  stockMaximo: number;
  precioPromedio: number;
  entradas: EntradaAlmacen[];
  marca: { nombre: string };
  modelo: { nombre: string };
  sku?: string;
  descripcion?: string;
  tipo: string;
}

interface EntradaAlmacen {
  id: number;
  cantidad: number;
  precioCompra: number;
  fecha: string;
  notas?: string;
}

type Ordenamiento = {
  campo: 'nombre' | 'stock' | 'precioPromedio' | 'stockMinimo' | 'stockMaximo';
  direccion: 'asc' | 'desc';
};

export default function StockPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);
  const [formData, setFormData] = useState({
    cantidad: '',
    precioCompra: '',
    notas: '',
    productoId: '',
  });
  const [productosExpandidos, setProductosExpandidos] = useState<Set<number>>(new Set());
  const [ordenamiento, setOrdenamiento] = useState<Ordenamiento>({ campo: 'stock', direccion: 'asc' });
  const [filtroStock, setFiltroStock] = useState<'todos' | 'bajo' | 'alto'>('todos');
  const [isLoading, setIsLoading] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showSalidaModal, setShowSalidaModal] = useState(false);
  const [formDataSalida, setFormDataSalida] = useState({
    productoId: "",
    cantidad: "",
    razon: "",
    tipo: "VENTA" as "VENTA" | "DANO" | "MERMA" | "OTRO",
    referencia: "",
  });
  const [salidas, setSalidas] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          loadProductos(),
          loadSalidas()
        ]);
      } catch (error) {
        console.error('Error al cargar datos:', error);
        toast.error('Error al cargar los datos');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const loadProductos = async () => {
    try {
      const response = await fetch('/api/inventario/productos');
      if (!response.ok) throw new Error('Error al cargar productos');
      const data = await response.json();
      
      // Filtrar solo productos físicos
      const productosFisicos = data.filter((producto: Producto) => {
        const esProducto = producto.tipo === 'PRODUCTO';
        console.log(`Producto: ${producto.nombre}, Tipo: ${producto.tipo}, Es producto físico: ${esProducto}`);
        return esProducto;
      });
      
      console.log('Total de productos:', data.length);
      console.log('Productos filtrados:', productosFisicos.length);
      setProductos(productosFisicos);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar productos');
    }
  };

  const loadSalidas = async (productoId?: string) => {
    try {
      const url = productoId 
        ? `/api/inventario/stock/salidas?productoId=${productoId}`
        : '/api/inventario/stock/salidas';
      const response = await fetch(url);
      if (!response.ok) throw new Error('Error al cargar las salidas');
      const data = await response.json();
      setSalidas(data);
    } catch (error) {
      console.error('Error al cargar salidas:', error);
      toast.error('Error al cargar el historial de salidas');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('handleSubmit iniciado');
    console.log('productoSeleccionado:', productoSeleccionado);
    console.log('formData:', formData);

    if (!productoSeleccionado) {
      console.log('No hay producto seleccionado');
      return;
    }

    const cantidad = parseFloat(formData.cantidad);
    const precioCompra = parseFloat(formData.precioCompra);

    console.log('Valores convertidos:', { cantidad, precioCompra });

    if (cantidad <= 0 || precioCompra <= 0) {
      console.log('Valores inválidos');
      alert('La cantidad y el precio de compra deben ser mayores a 0');
      return;
    }

    if (!confirm('¿Estás seguro de registrar esta entrada?')) {
      console.log('Usuario canceló la operación');
      return;
    }

    try {
      console.log('Iniciando petición a la API');
      const response = await fetch(`/api/inventario/stock/entradas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productoId: productoSeleccionado.id,
          cantidad: formData.cantidad,
          precioCompra: formData.precioCompra,
          notas: formData.notas,
        }),
      });

      console.log('Respuesta de la API:', response.status);

      if (!response.ok) {
        console.log('Error en la respuesta:', await response.text());
        throw new Error('Error al registrar entrada');
      }

      const data = await response.json();
      console.log('Datos recibidos:', data);

      setIsModalOpen(false);
      setFormData({ cantidad: '', precioCompra: '', notas: '', productoId: '' });
      setProductoSeleccionado(null);
      setHasUnsavedChanges(false);
      loadProductos();
      alert('Entrada registrada exitosamente');
    } catch (error) {
      console.error('Error en handleSubmit:', error);
      alert('Error al registrar entrada');
    }
  };

  const toggleDetalles = (productoId: number) => {
    const nuevosExpandidos = new Set(productosExpandidos);
    if (nuevosExpandidos.has(productoId)) {
      nuevosExpandidos.delete(productoId);
    } else {
      nuevosExpandidos.add(productoId);
    }
    setProductosExpandidos(nuevosExpandidos);
  };

  const ordenarProductos = (productos: Producto[]) => {
    return [...productos].sort((a, b) => {
      const factor = ordenamiento.direccion === 'asc' ? 1 : -1;
      switch (ordenamiento.campo) {
        case 'nombre':
          return factor * a.nombre.localeCompare(b.nombre);
        case 'stock':
          return factor * (a.stock - b.stock);
        case 'precioPromedio':
          return factor * (a.precioPromedio - b.precioPromedio);
        case 'stockMinimo':
          return factor * (a.stockMinimo - b.stockMinimo);
        case 'stockMaximo':
          return factor * (a.stockMaximo - b.stockMaximo);
        default:
          return 0;
      }
    });
  };

  const filtrarProductos = (productos: Producto[]) => {
    return productos.filter(producto => {
      const cumpleBusqueda = producto.nombre.toLowerCase().includes(searchTerm.toLowerCase());
      const cumpleFiltroStock = filtroStock === 'todos' ||
        (filtroStock === 'bajo' && producto.stock <= producto.stockMinimo) ||
        (filtroStock === 'alto' && producto.stock >= producto.stockMaximo);
      return cumpleBusqueda && cumpleFiltroStock;
    });
  };

  const productosFiltrados = ordenarProductos(filtrarProductos(productos));

  const toggleOrdenamiento = (campo: Ordenamiento['campo']) => {
    setOrdenamiento(prev => ({
      campo,
      direccion: prev.campo === campo && prev.direccion === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleModalClose = () => {
    if (hasUnsavedChanges) {
      if (!confirm('Tienes cambios sin guardar. ¿Estás seguro de cerrar?')) {
        return;
      }
    }
    setIsModalOpen(false);
    setProductoSeleccionado(null);
    setFormData({ cantidad: '', precioCompra: '', notas: '', productoId: '' });
    setHasUnsavedChanges(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setHasUnsavedChanges(true);

    // Si es el select de producto, actualizar productoSeleccionado
    if (name === 'productoId' && value) {
      const producto = productos.find(p => p.id === parseInt(value));
      if (producto) {
        setProductoSeleccionado(producto);
      }
    }
  };

  const handleSalidaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch("/api/inventario/stock/salidas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formDataSalida),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || "Error al registrar la salida");
        return;
      }

      const data = await response.json();
      toast.success("Salida registrada correctamente");
      setShowSalidaModal(false);
      setFormDataSalida({
        productoId: "",
        cantidad: "",
        razon: "",
        tipo: "VENTA",
        referencia: "",
      });
      router.refresh();
    } catch (error) {
      console.error("Error al registrar salida:", error);
      toast.error("Error al procesar la solicitud");
    }
  };

  const renderDetalleProducto = (producto: Producto) => {
    return (
      <tr key={`detalle-${producto.id}`} className="bg-gray-50">
        <td colSpan={6} className="px-6 py-4">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Información de Stock</h4>
              <div className="mt-2 grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Stock Mínimo</p>
                  <p className="text-sm font-medium text-gray-900">{producto.stockMinimo}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Stock Máximo</p>
                  <p className="text-sm font-medium text-gray-900">{producto.stockMaximo}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Precio Promedio</p>
                  <p className="text-sm font-medium text-gray-900">${producto.precioPromedio.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-900">Historial de Movimientos</h4>
              <div className="mt-2">
                <div className="flow-root">
                  <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                      <table className="min-w-full divide-y divide-gray-300">
                        <thead>
                          <tr>
                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                              Fecha
                            </th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                              Tipo
                            </th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                              Cantidad
                            </th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                              Usuario
                            </th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                              Razón
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {salidas
                            .filter(salida => salida.productoId === producto.id)
                            .map((salida) => (
                              <tr key={salida.id}>
                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-900 sm:pl-0">
                                  {new Date(salida.fecha).toLocaleString()}
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm">
                                  <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                                    salida.tipo === 'VENTA' ? 'bg-green-100 text-green-700' :
                                    salida.tipo === 'DANO' ? 'bg-red-100 text-red-700' :
                                    salida.tipo === 'MERMA' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-gray-100 text-gray-700'
                                  }`}>
                                    {salida.tipo}
                                  </span>
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                                  {salida.cantidad}
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                                  {`${salida.usuario.nombre} ${salida.usuario.apellidoPaterno}`}
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                                  {salida.razon}
                                  {salida.referencia && (
                                    <span className="ml-2 text-gray-500">
                                      (Ref: {salida.referencia})
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="p-6">
      <Toaster position="top-right" />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Control de Stock</h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar producto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-700"
            />
            <HiSearch className="absolute left-3 top-2.5 text-gray-400" />
          </div>
          <select
            value={filtroStock}
            onChange={(e) => setFiltroStock(e.target.value as 'todos' | 'bajo' | 'alto')}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-10 text-gray-700"
          >
            <option value="todos" className="text-gray-700">Todos los productos</option>
            <option value="bajo" className="text-gray-700">Stock bajo</option>
            <option value="alto" className="text-gray-700">Stock alto</option>
          </select>
          <button
            onClick={() => {
              setProductoSeleccionado(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <HiPlus className="h-5 w-5 mr-2" />
            Nueva Entrada
          </button>
          <button
            onClick={() => setShowSalidaModal(true)}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Nueva Salida
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => toggleOrdenamiento('nombre')}>
                  <div className="flex items-center">
                    Producto
                    {ordenamiento.campo === 'nombre' && (
                      ordenamiento.direccion === 'asc' ? <HiSortAscending className="ml-1" /> : <HiSortDescending className="ml-1" />
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => toggleOrdenamiento('stock')}>
                  <div className="flex items-center">
                    Stock Actual
                    {ordenamiento.campo === 'stock' && (
                      ordenamiento.direccion === 'asc' ? <HiSortAscending className="ml-1" /> : <HiSortDescending className="ml-1" />
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => toggleOrdenamiento('precioPromedio')}>
                  <div className="flex items-center">
                    Precio Promedio
                    {ordenamiento.campo === 'precioPromedio' && (
                      ordenamiento.direccion === 'asc' ? <HiSortAscending className="ml-1" /> : <HiSortDescending className="ml-1" />
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Detalles
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {productosFiltrados.map((producto) => (
                <React.Fragment key={producto.id}>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{producto.nombre}</div>
                      <div className="text-sm text-gray-500">{producto.marca.nombre} - {producto.modelo.nombre}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${
                        producto.stock <= producto.stockMinimo 
                          ? 'text-red-600' 
                          : producto.stock >= producto.stockMaximo 
                            ? 'text-green-600' 
                            : 'text-gray-900'
                      }`}>
                        {producto.stock}
                        {producto.stock <= producto.stockMinimo && (
                          <HiExclamationCircle className="inline-block ml-1 text-red-500" title="Stock bajo" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        ${producto.precioPromedio.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleDetalles(producto.id)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Ver historial de entradas"
                      >
                        {productosExpandidos.has(producto.id) ? (
                          <HiChevronUp className="h-5 w-5" />
                        ) : (
                          <HiChevronDown className="h-5 w-5" />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => {
                          setProductoSeleccionado(producto);
                          setIsModalOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                        title="Registrar entrada"
                      >
                        <HiPlus className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                  {productosExpandidos.has(producto.id) && (
                    renderDetalleProducto(producto)
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de Entrada */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">
              {productoSeleccionado ? 'Nueva Entrada de Almacén' : 'Seleccionar Producto'}
            </h2>
            {productoSeleccionado && (
              <>
                <p className="text-sm text-gray-600 mb-2">
                  Producto: {productoSeleccionado.nombre}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  Stock actual: {productoSeleccionado.stock}
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  Precio promedio: ${productoSeleccionado.precioPromedio.toFixed(2)}
                </p>
                {productoSeleccionado.entradas.length > 0 && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-md">
                    <p className="text-sm font-medium text-gray-900 mb-1">Última entrada:</p>
                    <p className="text-sm text-gray-600">
                      {new Date(productoSeleccionado.entradas[0].fecha).toLocaleDateString()} - 
                      {productoSeleccionado.entradas[0].cantidad} unidades a 
                      ${productoSeleccionado.entradas[0].precioCompra.toFixed(2)}
                    </p>
                  </div>
                )}
              </>
            )}
            <form onSubmit={handleSubmit}>
              {!productoSeleccionado && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-900">Producto *</label>
                  <select
                    name="productoId"
                    value={formData.productoId}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2 text-gray-700"
                    required
                  >
                    <option value="" className="text-gray-700">Selecciona un producto</option>
                    {productos.map((producto) => (
                      <option key={producto.id} value={producto.id} className="text-gray-700">
                        {producto.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900">Cantidad *</label>
                  <input
                    type="number"
                    name="cantidad"
                    value={formData.cantidad}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2 [&::placeholder]:text-gray-700 text-gray-900"
                    required
                    min="0"
                    step="1"
                    placeholder="Ingresa la cantidad"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900">Precio de Compra *</label>
                  <input
                    type="number"
                    name="precioCompra"
                    value={formData.precioCompra}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2 [&::placeholder]:text-gray-700 text-gray-900"
                    required
                    min="0"
                    step="0.01"
                    placeholder="Ingresa el precio de compra"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900">Notas</label>
                  <textarea
                    name="notas"
                    value={formData.notas}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2 placeholder-gray-700"
                    rows={3}
                    placeholder="Agrega notas sobre la entrada"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleModalClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Registrar Entrada
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Salida */}
      <Modal
        isOpen={showSalidaModal}
        onClose={() => setShowSalidaModal(false)}
        title="Registrar Salida de Almacén"
      >
        <form onSubmit={handleSalidaSubmit} className="space-y-4">
          <div>
            <label htmlFor="productoSalida" className="block text-sm font-medium text-gray-900">
              Producto
            </label>
            <select
              id="productoSalida"
              name="productoId"
              value={formDataSalida.productoId}
              onChange={(e) => setFormDataSalida({ ...formDataSalida, productoId: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-12 text-base text-gray-900"
              required
            >
              <option value="">Seleccionar producto</option>
              {productos.map((producto) => (
                <option key={producto.id} value={producto.id} className="text-gray-900">
                  {producto.nombre} - Stock: {producto.stock}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="cantidadSalida" className="block text-sm font-medium text-gray-900">
              Cantidad
            </label>
            <input
              type="number"
              id="cantidadSalida"
              name="cantidad"
              value={formDataSalida.cantidad}
              onChange={(e) => setFormDataSalida({ ...formDataSalida, cantidad: e.target.value })}
              className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-12 text-base text-gray-900 px-4 [&::placeholder]:text-gray-700"
              required
              min="1"
              placeholder="Ingresa la cantidad"
            />
          </div>

          <div>
            <label htmlFor="tipoSalida" className="block text-sm font-medium text-gray-900">
              Tipo de Salida
            </label>
            <select
              id="tipoSalida"
              name="tipo"
              value={formDataSalida.tipo}
              onChange={(e) => setFormDataSalida({ ...formDataSalida, tipo: e.target.value as "VENTA" | "DANO" | "MERMA" | "OTRO" })}
              className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-12 text-base text-gray-900 px-4"
              required
            >
              <option value="VENTA" className="text-gray-900">Venta</option>
              <option value="DANO" className="text-gray-900">Daño</option>
              <option value="MERMA" className="text-gray-900">Merma</option>
              <option value="OTRO" className="text-gray-900">Otro</option>
            </select>
          </div>

          <div>
            <label htmlFor="razonSalida" className="block text-sm font-medium text-gray-900">
              Razón
            </label>
            <textarea
              id="razonSalida"
              name="razon"
              value={formDataSalida.razon}
              onChange={(e) => setFormDataSalida({ ...formDataSalida, razon: e.target.value })}
              className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-24 text-base text-gray-900 px-4 py-3 [&::placeholder]:text-gray-700"
              required
              placeholder="Ingresa la razón de la salida"
            />
          </div>

          <div>
            <label htmlFor="referenciaSalida" className="block text-sm font-medium text-gray-900">
              Referencia (opcional)
            </label>
            <input
              type="text"
              id="referenciaSalida"
              name="referencia"
              value={formDataSalida.referencia}
              onChange={(e) => setFormDataSalida({ ...formDataSalida, referencia: e.target.value })}
              className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-12 text-base text-gray-900 px-4 [&::placeholder]:text-gray-700"
              placeholder="Ingresa una referencia (opcional)"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowSalidaModal(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
            >
              Registrar Salida
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
} 