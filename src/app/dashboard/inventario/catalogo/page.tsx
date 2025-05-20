'use client';

import React, { useState, useEffect } from 'react';
import {
  HiPlus,
  HiPencil,
  HiTrash,
  HiPhotograph,
  HiX
} from 'react-icons/hi';

interface Producto {
  id: number;
  nombre: string;
  sku: string;
  descripcion: string;
  notasInternas: string | null;
  garantiaValor: number;
  garantiaUnidad: 'dias' | 'meses';
  tipoServicioId: number;
  marcaId: number;
  modeloId: number;
  proveedorId: number;
  tipoServicio: {
    id: number;
    nombre: string;
  };
  marca: {
    id: number;
    nombre: string;
  };
  modelo: {
    id: number;
    nombre: string;
  };
  proveedor: {
    id: number;
    nombre: string;
  };
  fotos: {
    id: number;
    url: string;
  }[];
  tipo: 'PRODUCTO' | 'SERVICIO';
  stock: number;
  precioPromedio: number;
  stockMaximo: number;
  stockMinimo: number;
  categoriaId?: number;
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
  marcaId: number;
}

interface Categoria {
  id: number;
  nombre: string;
}

interface FormData {
  nombre: string;
  tipo: 'PRODUCTO' | 'SERVICIO';
  sku: string;
  descripcion: string;
  notasInternas: string;
  garantiaValor: number;
  garantiaUnidad: 'dias' | 'meses';
  tipoServicioId: number;
  marcaId: number | null;
  modeloId: number | null;
  stock: number;
  precioPromedio: number;
  stockMaximo: number;
  stockMinimo: number;
  categoriaId: number | null;
}

export default function CatalogoPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [tiposServicio, setTiposServicio] = useState<{ id: number; nombre: string; }[]>([]);
  const [marcas, setMarcas] = useState<{ id: number; nombre: string; }[]>([]);
  const [modelos, setModelos] = useState<{ id: number; nombre: string; }[]>([]);
  const [categorias, setCategorias] = useState<{ id: number; nombre: string; }[]>([]);
  const [marcaSeleccionada, setMarcaSeleccionada] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    sku: '',
    descripcion: '',
    notasInternas: '',
    garantiaValor: 0,
    garantiaUnidad: 'dias',
    tipo: 'PRODUCTO',
    tipoServicioId: 0,
    marcaId: null,
    modeloId: null,
    stock: 0,
    precioPromedio: 0,
    stockMaximo: 0,
    stockMinimo: 0,
    categoriaId: null
  });
  const [fotos, setFotos] = useState<File[]>([]);
  const [previewFotos, setPreviewFotos] = useState<string[]>([]);
  const [detallesVisibles, setDetallesVisibles] = useState<Record<number, boolean>>({});
  const [productoExistente, setProductoExistente] = useState<{
    id: number;
    nombre: string;
    sku: string;
    tipo: string;
  } | null>(null);
  
  // Cargar datos cuando se monta el componente
  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  // Cargar modelos cuando cambia la marca seleccionada
  useEffect(() => {
    if (marcaSeleccionada) {
      cargarModelos(marcaSeleccionada);
    }
  }, [marcaSeleccionada]);

  // Función para verificar si existe un producto
  const verificarProductoExistente = async (nombre: string) => {
    if (!nombre) {
      setProductoExistente(null);
      return;
    }

    try {
      const response = await fetch(`/api/inventario/productos/verificar?nombre=${encodeURIComponent(nombre)}`);
      const data = await response.json();
      
      if (data.existe) {
        setProductoExistente(data.producto);
      } else {
        setProductoExistente(null);
      }
    } catch (error) {
      console.error('Error al verificar producto:', error);
    }
  };

  // Debounce para la verificación
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      verificarProductoExistente(formData.nombre);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData.nombre]);

  const cargarDatosIniciales = async () => {
    try {
      const [tiposServicioRes, marcasRes, categoriasRes, productosRes] = await Promise.all([
        fetch('/api/catalogo/tipos-servicio'),
        fetch('/api/catalogo/marcas'),
        fetch('/api/catalogo/categorias'),
        fetch('/api/inventario/productos')
      ]);

      // Verificar cada respuesta individualmente
      if (!tiposServicioRes.ok) {
        throw new Error(`Error al cargar tipos de servicio: ${tiposServicioRes.status}`);
      }
      if (!marcasRes.ok) {
        throw new Error(`Error al cargar marcas: ${marcasRes.status}`);
      }
      if (!categoriasRes.ok) {
        console.warn('No se pudieron cargar las categorías:', categoriasRes.status);
        setCategorias([]);
      }
      if (!productosRes.ok) {
        const errorData = await productosRes.json().catch(() => null);
        if (productosRes.status === 500) {
          throw new Error(errorData?.details || 'Error interno del servidor al cargar productos. Por favor, contacte al administrador.');
        }
        throw new Error(errorData?.error || `Error al cargar productos: ${productosRes.status}`);
      }

      // Intentar obtener los datos de cada respuesta
      const [tiposServicio, marcas, categorias, productos] = await Promise.all([
        tiposServicioRes.json(),
        marcasRes.json(),
        categoriasRes.ok ? categoriasRes.json() : [],
        productosRes.json()
      ]);

      // Validar que los datos sean arrays
      if (!Array.isArray(tiposServicio)) {
        throw new Error('El formato de tipos de servicio no es válido');
      }
      if (!Array.isArray(marcas)) {
        throw new Error('El formato de marcas no es válido');
      }
      if (!Array.isArray(productos)) {
        throw new Error('El formato de productos no es válido');
      }

      // Actualizar el estado con los datos validados
      setTiposServicio(tiposServicio);
      setMarcas(marcas);
      setCategorias(Array.isArray(categorias) ? categorias : []);
      setProductos(productos);
    } catch (error) {
      console.error('Error al cargar datos iniciales:', error);
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert('Error al cargar los datos iniciales. Por favor, intente nuevamente.');
      }
    }
  };

  const cargarDatosDropdowns = async () => {
    try {
      // Cargar tipos de servicio
      const tiposServicioRes = await fetch('/api/catalogo/tipos-servicio');
      const tiposServicioData = await tiposServicioRes.json();
      setTiposServicio(tiposServicioData);

      // Cargar marcas
      const marcasRes = await fetch('/api/catalogo/marcas');
      const marcasData = await marcasRes.json();
      setMarcas(marcasData);

      // Cargar proveedores
      const proveedoresRes = await fetch('/api/catalogo/proveedores');
      const proveedoresData = await proveedoresRes.json();
      setProveedores(proveedoresData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    }
  };

  const cargarModelos = async (marcaId: number) => {
    try {
      const response = await fetch(`/api/catalogo/modelos?marcaId=${marcaId}`);
      if (!response.ok) {
        throw new Error('Error al cargar los modelos');
      }
      const data = await response.json();
      setModelos(Array.isArray(data) ? data : []);
      setFormData(prev => ({ ...prev, modeloId: null }));
    } catch (error) {
      console.error('Error al cargar modelos:', error);
      alert('Error al cargar los modelos');
    }
  };

  const handleMarcaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const marcaId = e.target.value ? parseInt(e.target.value) : null;
    setMarcaSeleccionada(marcaId);
    if (marcaId) {
      cargarModelos(marcaId);
    } else {
      setModelos([]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const newData = { ...prev };
      
      switch (name) {
        case 'tipoServicioId':
          newData[name] = parseInt(value) || 0;
          break;
        case 'marcaId':
          newData[name] = value ? parseInt(value) : null;
          break;
        case 'modeloId':
          newData[name] = value ? parseInt(value) : null;
          break;
        case 'garantiaValor':
          newData[name] = parseInt(value) || 0;
          break;
        case 'stock':
          newData[name] = parseInt(value) || 0;
          break;
        case 'precioPromedio':
          newData[name] = parseFloat(value) || 0;
          break;
        case 'stockMaximo':
          newData[name] = parseInt(value) || 0;
          break;
        case 'stockMinimo':
          newData[name] = parseInt(value) || 0;
          break;
        case 'categoriaId':
          newData[name] = value ? parseInt(value) : null;
          break;
        case 'proveedorId':
          newData[name] = value ? parseInt(value) : null;
          break;
        default:
          (newData[name as keyof FormData] as any) = value;
      }
      
      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Validar campos requeridos
      if (!formData.nombre || !formData.tipoServicioId) {
        throw new Error('Por favor, complete los campos requeridos');
      }

      // Si es un producto, validar campos adicionales
      if (formData.tipo === 'PRODUCTO') {
        if (!formData.marcaId || !formData.modeloId) {
          throw new Error('Para productos, debe seleccionar marca y modelo');
        }
      }

      const data = {
        ...formData,
        tipoServicioId: formData.tipoServicioId,
        marcaId: formData.tipo === 'PRODUCTO' ? formData.marcaId : null,
        modeloId: formData.tipo === 'PRODUCTO' ? formData.modeloId : null,
        garantiaValor: formData.garantiaValor,
        stock: formData.stock,
        precioPromedio: formData.precioPromedio,
        stockMaximo: formData.stockMaximo,
        stockMinimo: formData.stockMinimo,
        categoriaId: formData.categoriaId || null
      };

      const response = await fetch('/api/inventario/productos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.mensaje || 'Error de validación');
      }

      // Limpiar el formulario y recargar datos
      setFormData({
        nombre: '',
        sku: '',
        descripcion: '',
        notasInternas: '',
        garantiaValor: 0,
        garantiaUnidad: 'dias',
        tipo: 'PRODUCTO',
        tipoServicioId: 0,
        marcaId: null,
        modeloId: null,
        stock: 0,
        precioPromedio: 0,
        stockMaximo: 0,
        stockMinimo: 0,
        categoriaId: null
      });
      setShowModal(false);
      cargarDatosIniciales();
    } catch (error) {
      console.error('Error:', error);
      alert(error instanceof Error ? error.message : 'Error al guardar el producto');
    }
  };

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const nuevasFotos = Array.from(e.target.files);
      setFotos([...fotos, ...nuevasFotos]);
      
      // Crear previews de las fotos
      nuevasFotos.forEach(foto => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewFotos(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(foto);
      });
    }
  };

  const eliminarFoto = (index: number) => {
    setFotos(fotos.filter((_, i) => i !== index));
    setPreviewFotos(previewFotos.filter((_, i) => i !== index));
  };

  const handleEdit = (producto: Producto) => {
    setProductoSeleccionado(producto);
    setFormData({
      nombre: producto.nombre,
      sku: producto.sku,
      descripcion: producto.descripcion || '',
      notasInternas: producto.notasInternas || '',
      garantiaValor: producto.garantiaValor,
      garantiaUnidad: producto.garantiaUnidad,
      tipo: producto.tipo,
      tipoServicioId: producto.tipoServicioId,
      marcaId: producto.marcaId,
      modeloId: producto.modeloId,
      stock: producto.stock,
      precioPromedio: producto.precioPromedio,
      stockMaximo: producto.stockMaximo,
      stockMinimo: producto.stockMinimo,
      categoriaId: producto.categoriaId || null
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Está seguro de que desea eliminar este producto?')) {
      return;
    }

    try {
      const response = await fetch(`/api/inventario/productos/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al eliminar el producto');
      }

      await cargarDatosIniciales();
    } catch (error) {
      console.error('Error:', error);
      alert(error instanceof Error ? error.message : 'Error al eliminar el producto');
    }
  };

  const toggleDetalles = (id: number) => {
    setDetallesVisibles(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Catálogo de Productos</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <HiPlus className="mr-2" />
          Nuevo Producto
        </button>
      </div>

      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg">
        <div className="overflow-x-auto">
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
                  Tipo de Servicio
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Detalles
                </th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {productos.map((producto) => (
                <React.Fragment key={producto.id}>
                  <tr>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        producto.tipo === 'PRODUCTO' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {producto.tipo === 'PRODUCTO' ? 'Producto' : 'Servicio'}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {producto.nombre}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {producto.marca?.nombre || '-'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {producto.modelo?.nombre || '-'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {producto.tipoServicio?.nombre || '-'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <button
                        onClick={() => toggleDetalles(producto.id)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        {detallesVisibles[producto.id] ? 'Ocultar' : 'Mostrar'}
                      </button>
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <button
                        onClick={() => handleEdit(producto)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(producto.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                  {detallesVisibles[producto.id] && (
                    <tr key={`detalles-${producto.id}`}>
                      <td colSpan={6} className="px-3 py-4 bg-gray-50">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">Información General</h4>
                            <dl className="mt-2 space-y-1">
                              <div className="flex justify-between">
                                <dt className="text-sm text-gray-500">SKU:</dt>
                                <dd className="text-sm text-gray-900">{producto.sku || '-'}</dd>
                              </div>
                              <div className="flex justify-between">
                                <dt className="text-sm text-gray-500">Descripción:</dt>
                                <dd className="text-sm text-gray-900">{producto.descripcion || '-'}</dd>
                              </div>
                              <div className="flex justify-between">
                                <dt className="text-sm text-gray-500">Notas Internas:</dt>
                                <dd className="text-sm text-gray-900">{producto.notasInternas || '-'}</dd>
                              </div>
                            </dl>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">Garantía</h4>
                            <dl className="mt-2 space-y-1">
                              <div className="flex justify-between">
                                <dt className="text-sm text-gray-500">Cantidad:</dt>
                                <dd className="text-sm text-gray-900">{producto.garantiaValor}</dd>
                              </div>
                              <div className="flex justify-between">
                                <dt className="text-sm text-gray-500">Unidad:</dt>
                                <dd className="text-sm text-gray-900">{producto.garantiaUnidad}</dd>
                              </div>
                            </dl>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Producto */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={() => {
              setShowModal(false);
              setProductoSeleccionado(null);
              setFotos([]);
              setPreviewFotos([]);
            }}>
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen"></span>&#8203;

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="mb-4">
                    <h3 className="text-xl font-semibold leading-6 text-gray-900">
                      {productoSeleccionado ? 'Editar Producto' : 'Nuevo Producto'}
                    </h3>
                  </div>

                  {/* Sección de advertencias */}
                  {productoExistente && (
                    <div className="mb-4 p-4 bg-amber-50 border-l-4 border-amber-400">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-amber-800">
                            Producto existente detectado
                          </h3>
                          <div className="mt-2 text-sm text-amber-700">
                            <p>Ya existe un producto con este nombre:</p>
                            <ul className="list-disc list-inside mt-1">
                              <li>SKU: {productoExistente.sku}</li>
                              <li>Tipo: {productoExistente.tipo}</li>
                            </ul>
                            <p className="mt-2">
                              Si este es un producto diferente, considera agregar más detalles al nombre para distinguirlo.
                              Por ejemplo: "Pantalla iPhone 13" en lugar de solo "Pantalla".
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <label htmlFor="tipo" className="block text-sm font-medium text-gray-800">
                        Tipo <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="tipo"
                        id="tipo"
                        value={formData.tipo}
                        onChange={(e) => {
                          const tipo = e.target.value as 'PRODUCTO' | 'SERVICIO';
                          setFormData({ 
                            ...formData, 
                            tipo,
                            // Resetear campos no necesarios para servicios
                            ...(tipo === 'SERVICIO' ? {
                              marcaId: null,
                              modeloId: null,
                              garantiaValor: 0,
                              garantiaUnidad: 'dias'
                            } : {})
                          });
                        }}
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm text-sm text-gray-900 border-gray-300 rounded-md p-2 border"
                        required
                      >
                        <option value="PRODUCTO">Producto</option>
                        <option value="SERVICIO">Servicio</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="nombre" className="block text-sm font-medium text-gray-800">
                        Nombre <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="nombre"
                        id="nombre"
                        value={formData.nombre}
                        onChange={handleInputChange}
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm text-sm text-gray-900 border-gray-300 rounded-md p-2 border"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="sku" className="block text-sm font-medium text-gray-800">
                        SKU
                      </label>
                      <input
                        type="text"
                        name="sku"
                        id="sku"
                        value={formData.sku}
                        onChange={handleInputChange}
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm text-sm text-gray-900 border-gray-300 rounded-md p-2 border"
                      />
                    </div>

                    <div>
                      <label htmlFor="tipoServicio" className="block text-sm font-medium text-gray-800">
                        Tipo de Servicio <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="tipoServicioId"
                        id="tipoServicio"
                        value={formData.tipoServicioId}
                        onChange={handleInputChange}
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm text-sm text-gray-900 border-gray-300 rounded-md p-2 border"
                        required
                      >
                        <option value="">Seleccione un tipo de servicio</option>
                        {tiposServicio.map((tipo) => (
                          <option key={tipo.id} value={tipo.id}>
                            {tipo.nombre}
                          </option>
                        ))}
                      </select>
                    </div>

                    {formData.tipo === 'PRODUCTO' && (
                      <>
                        <div>
                          <label htmlFor="marca" className="block text-sm font-medium text-gray-800">
                            Marca <span className="text-red-500">*</span>
                          </label>
                          <select
                            name="marcaId"
                            value={formData.marcaId?.toString() || ''}
                            onChange={(e) => {
                              handleInputChange(e);
                              handleMarcaChange(e);
                            }}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                            required={formData.tipo === 'PRODUCTO'}
                          >
                            <option value="" className="pl-4">Seleccione una marca</option>
                            {marcas.map(marca => (
                              <option key={marca.id} value={marca.id} className="pl-4">
                                {marca.nombre}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-900">Modelo *</label>
                          <select
                            name="modeloId"
                            value={formData.modeloId || ''}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2 text-gray-700"
                            required={formData.tipo === 'PRODUCTO'}
                            disabled={!formData.marcaId}
                          >
                            <option value="">Selecciona un modelo</option>
                            {modelos.map((modelo) => (
                              <option key={modelo.id} value={modelo.id}>
                                {modelo.nombre}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-900">Categoría</label>
                          <select
                            name="categoriaId"
                            value={formData.categoriaId?.toString() || ''}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          >
                            <option value="">Seleccione una categoría</option>
                            {categorias.map(categoria => (
                              <option key={categoria.id} value={categoria.id}>
                                {categoria.nombre}
                              </option>
                            ))}
                          </select>
                        </div>
                      </>
                    )}

                    {formData.tipo === 'PRODUCTO' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-900">Garantía</label>
                        <div className="flex space-x-2">
                          <input
                            type="number"
                            name="garantiaValor"
                            id="garantiaValor"
                            value={formData.garantiaValor}
                            onChange={handleInputChange}
                            className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-24 shadow-sm text-sm text-gray-900 border-gray-300 rounded-md p-2 border"
                            required
                          />
                          <select
                            name="garantiaUnidad"
                            id="garantiaUnidad"
                            value={formData.garantiaUnidad}
                            onChange={handleInputChange}
                            className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-32 shadow-sm text-sm text-gray-900 border-gray-300 rounded-md p-2 border"
                            required
                          >
                            <option value="dias">Días</option>
                            <option value="meses">Meses</option>
                          </select>
                        </div>
                      </div>
                    )}

                    <div>
                      <label htmlFor="descripcion" className="block text-sm font-medium text-gray-800">
                        Descripción
                      </label>
                      <textarea
                        name="descripcion"
                        id="descripcion"
                        value={formData.descripcion}
                        onChange={handleInputChange}
                        rows={3}
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm text-sm text-gray-900 border-gray-300 rounded-md p-2 border"
                      />
                    </div>

                    <div>
                      <label htmlFor="notasInternas" className="block text-sm font-medium text-gray-800">
                        Notas Internas
                      </label>
                      <textarea
                        name="notasInternas"
                        id="notasInternas"
                        value={formData.notasInternas}
                        onChange={handleInputChange}
                        rows={3}
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm text-sm text-gray-900 border-gray-300 rounded-md p-2 border"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    {productoSeleccionado ? 'Actualizar' : 'Crear'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setProductoSeleccionado(null);
                      setFormData({
                        nombre: '',
                        tipo: 'PRODUCTO',
                        sku: '',
                        descripcion: '',
                        notasInternas: '',
                        garantiaValor: 0,
                        garantiaUnidad: 'dias',
                        tipoServicioId: 0,
                        marcaId: null,
                        modeloId: null,
                        stock: 0,
                        precioPromedio: 0,
                        stockMaximo: 0,
                        stockMinimo: 0,
                        categoriaId: null
                      });
                    }}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 