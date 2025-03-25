'use client';

import { useState, useEffect } from 'react';
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
  categoriaId: number;
  marcaId: number;
  modeloId: number;
  proveedorId: number;
  categoria: {
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

interface Proveedor {
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
  categoriaId: number;
  marcaId: number;
  modeloId: number;
  proveedorId: number;
}

export default function CatalogoPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [tiposServicio, setTiposServicio] = useState<{ id: number; nombre: string; }[]>([]);
  const [marcas, setMarcas] = useState<{ id: number; nombre: string; }[]>([]);
  const [modelos, setModelos] = useState<{ id: number; nombre: string; }[]>([]);
  const [proveedores, setProveedores] = useState<{ id: number; nombre: string; }[]>([]);
  const [marcaSeleccionada, setMarcaSeleccionada] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    tipo: 'PRODUCTO',
    sku: '',
    descripcion: '',
    notasInternas: '',
    garantiaValor: 0,
    garantiaUnidad: 'dias',
    categoriaId: 0,
    marcaId: 0,
    modeloId: 0,
    proveedorId: 0,
  });
  const [fotos, setFotos] = useState<File[]>([]);
  const [previewFotos, setPreviewFotos] = useState<string[]>([]);
  const [detallesVisibles, setDetallesVisibles] = useState<Record<number, boolean>>({});
  
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

  const cargarDatosIniciales = async () => {
    try {
      const [tiposServicioRes, marcasRes, proveedoresRes, productosRes] = await Promise.all([
        fetch('/api/catalogo/tipos-servicio'),
        fetch('/api/catalogo/marcas'),
        fetch('/api/catalogo/proveedores'),
        fetch('/api/inventario/productos')
      ]);

      // Verificar cada respuesta individualmente
      if (!tiposServicioRes.ok) {
        throw new Error(`Error al cargar tipos de servicio: ${tiposServicioRes.status}`);
      }
      if (!marcasRes.ok) {
        throw new Error(`Error al cargar marcas: ${marcasRes.status}`);
      }
      if (!proveedoresRes.ok) {
        throw new Error(`Error al cargar proveedores: ${proveedoresRes.status}`);
      }
      if (!productosRes.ok) {
        const errorData = await productosRes.json().catch(() => null);
        if (productosRes.status === 500) {
          throw new Error(errorData?.details || 'Error interno del servidor al cargar productos. Por favor, contacte al administrador.');
        }
        throw new Error(errorData?.error || `Error al cargar productos: ${productosRes.status}`);
      }

      // Intentar obtener los datos de cada respuesta
      const [tiposServicio, marcas, proveedores, productos] = await Promise.all([
        tiposServicioRes.json(),
        marcasRes.json(),
        proveedoresRes.json(),
        productosRes.json()
      ]);

      // Validar que los datos sean arrays
      if (!Array.isArray(tiposServicio)) {
        throw new Error('El formato de tipos de servicio no es válido');
      }
      if (!Array.isArray(marcas)) {
        throw new Error('El formato de marcas no es válido');
      }
      if (!Array.isArray(proveedores)) {
        throw new Error('El formato de proveedores no es válido');
      }
      if (!Array.isArray(productos)) {
        throw new Error('El formato de productos no es válido');
      }

      // Actualizar el estado con los datos validados
      setTiposServicio(tiposServicio);
      setMarcas(marcas);
      setProveedores(proveedores);
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
    } catch (error) {
      console.error('Error al cargar modelos:', error);
      alert('Error al cargar los modelos');
    }
  };

  const handleMarcaChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const marcaId = parseInt(e.target.value);
    setMarcaSeleccionada(marcaId);
    setModelos([]);
    setFormData(prev => ({ ...prev, modeloId: 0 }));

    if (marcaId) {
      try {
        const response = await fetch(`/api/catalogo/modelos?marcaId=${marcaId}`);
        if (!response.ok) {
          throw new Error('Error al cargar los modelos');
        }
        const data = await response.json();
        setModelos(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error al cargar modelos:', error);
        alert('Error al cargar los modelos');
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'garantiaValor' ? parseInt(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = productoSeleccionado ? `/api/inventario/productos/${productoSeleccionado.id}` : '/api/inventario/productos';
      
      const method = productoSeleccionado ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al guardar el producto');
      }

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
        categoriaId: 0,
        marcaId: 0,
        modeloId: 0,
        proveedorId: 0,
      });
      setFotos([]);
      setPreviewFotos([]);
      await cargarDatosIniciales();
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
      tipo: producto.tipo,
      sku: producto.sku,
      descripcion: producto.descripcion,
      notasInternas: producto.notasInternas || '',
      garantiaValor: producto.garantiaValor,
      garantiaUnidad: producto.garantiaUnidad,
      categoriaId: producto.categoriaId,
      marcaId: producto.marcaId,
      modeloId: producto.modeloId,
      proveedorId: producto.proveedorId,
    });
    setMarcaSeleccionada(producto.marcaId);
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
                <>
                  <tr key={producto.id}>
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
                      {producto.categoria?.nombre || '-'}
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
                    <tr>
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
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Producto */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-[800px] shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">
                {productoSeleccionado ? 'Editar Producto' : 'Nuevo Producto'}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setProductoSeleccionado(null);
                  setFotos([]);
                  setPreviewFotos([]);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <HiX className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="tipo" className="block text-sm font-medium text-gray-700">
                  Tipo
                </label>
                <select
                  name="tipo"
                  id="tipo"
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value as 'PRODUCTO' | 'SERVICIO' })}
                  className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2.5 text-gray-900"
                  required
                >
                  <option value="PRODUCTO">Producto</option>
                  <option value="SERVICIO">Servicio</option>
                </select>
              </div>
              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
                  Nombre
                </label>
                <input
                  type="text"
                  name="nombre"
                  id="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2.5 text-gray-900"
                  required
                />
              </div>

              <div>
                <label htmlFor="sku" className="block text-sm font-medium text-gray-700">
                  SKU
                </label>
                <input
                  type="text"
                  name="sku"
                  id="sku"
                  value={formData.sku}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2.5 text-gray-900"
                />
              </div>

              <div>
                <label htmlFor="categoria" className="block text-sm font-medium text-gray-700">
                  Categoría
                </label>
                <select
                  name="categoriaId"
                  id="categoria"
                  value={formData.categoriaId}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2.5 text-gray-900"
                  required
                >
                  <option value="">Seleccione una categoría</option>
                  {tiposServicio.map((tipo) => (
                    <option key={tipo.id} value={tipo.id}>
                      {tipo.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="marca" className="block text-sm font-medium text-gray-700">
                  Marca
                </label>
                <select
                  name="marcaId"
                  id="marca"
                  value={formData.marcaId}
                  onChange={(e) => {
                    handleInputChange(e);
                    handleMarcaChange(e);
                  }}
                  className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2.5 text-gray-900"
                  required
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
                <label htmlFor="modelo" className="block text-sm font-medium text-gray-700">
                  Modelo
                </label>
                <select
                  name="modeloId"
                  id="modelo"
                  value={formData.modeloId}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2.5 text-gray-900"
                  required
                  disabled={!marcaSeleccionada}
                >
                  <option value="">Seleccione un modelo</option>
                  {modelos.map((modelo) => (
                    <option key={modelo.id} value={modelo.id}>
                      {modelo.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="proveedor" className="block text-sm font-medium text-gray-700">
                  Proveedor
                </label>
                <select
                  name="proveedorId"
                  id="proveedor"
                  value={formData.proveedorId}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2.5 text-gray-900"
                  required
                >
                  <option value="">Seleccione un proveedor</option>
                  {proveedores.map((proveedor) => (
                    <option key={proveedor.id} value={proveedor.id}>
                      {proveedor.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="garantia" className="block text-sm font-medium text-gray-700">
                  Garantía
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    name="garantiaValor"
                    id="garantiaValor"
                    value={formData.garantiaValor}
                    onChange={handleInputChange}
                    className="block w-24 rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2.5 text-gray-900"
                    required
                  />
                  <select
                    name="garantiaUnidad"
                    id="garantiaUnidad"
                    value={formData.garantiaUnidad}
                    onChange={handleInputChange}
                    className="block w-32 rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2.5 text-gray-900"
                    required
                  >
                    <option value="dias">Días</option>
                    <option value="meses">Meses</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700">
                  Descripción
                </label>
                <textarea
                  name="descripcion"
                  id="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2.5 text-gray-900"
                />
              </div>

              <div>
                <label htmlFor="notasInternas" className="block text-sm font-medium text-gray-700">
                  Notas Internas
                </label>
                <textarea
                  name="notasInternas"
                  id="notasInternas"
                  value={formData.notasInternas}
                  onChange={handleInputChange}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2.5 text-gray-900"
                />
              </div>

              <div className="flex justify-end space-x-3">
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
                      categoriaId: 0,
                      marcaId: 0,
                      modeloId: 0,
                      proveedorId: 0,
                    });
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                >
                  {productoSeleccionado ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 