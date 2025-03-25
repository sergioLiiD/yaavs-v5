'use client';

import { useState } from 'react';
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
  categoria: string;
  descripcion: string;
  marca: string;
  modelo: string;
  fotos: string[];
  notasInternas: string;
  proveedor: string;
  garantia: {
    valor: number;
    unidad: 'dias' | 'meses';
  };
  sku: string;
}

export default function CatalogoPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);
  const [fotos, setFotos] = useState<File[]>([]);
  const [previewFotos, setPreviewFotos] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Aquí manejaremos la lógica de guardado cuando implementemos el backend
    setIsModalOpen(false);
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

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Catálogo de Productos</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <HiPlus className="mr-2" />
          Nuevo Producto
        </button>
      </div>

      {/* Tabla de Productos */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marca</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Modelo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proveedor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Garantía</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {productos.map((producto) => (
              <tr key={producto.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{producto.sku}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{producto.nombre}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{producto.categoria}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{producto.marca}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{producto.modelo}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{producto.proveedor}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {producto.garantia.valor} {producto.garantia.unidad}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => {
                      setProductoSeleccionado(producto);
                      setIsModalOpen(true);
                    }}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    <HiPencil className="inline-block" />
                  </button>
                  <button
                    onClick={() => {
                      // Aquí manejaremos la eliminación cuando implementemos el backend
                    }}
                    className="text-red-600 hover:text-red-900"
                  >
                    <HiTrash className="inline-block" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de Producto */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-[800px] shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">
                {productoSeleccionado ? 'Editar Producto' : 'Nuevo Producto'}
              </h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">SKU</label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2.5 text-gray-900 placeholder-gray-400"
                    defaultValue={productoSeleccionado?.sku}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre</label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2.5 text-gray-900 placeholder-gray-400"
                    defaultValue={productoSeleccionado?.nombre}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Categoría</label>
                  <select
                    className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2.5 text-gray-900"
                    defaultValue={productoSeleccionado?.categoria}
                    required
                  >
                    <option value="">Seleccione una categoría</option>
                    {/* Aquí cargaremos las categorías desde el backend */}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Marca</label>
                  <select
                    className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2.5 text-gray-900"
                    defaultValue={productoSeleccionado?.marca}
                    required
                  >
                    <option value="">Seleccione una marca</option>
                    {/* Aquí cargaremos las marcas desde el backend */}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Modelo</label>
                  <select
                    className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2.5 text-gray-900"
                    defaultValue={productoSeleccionado?.modelo}
                    required
                  >
                    <option value="">Seleccione un modelo</option>
                    {/* Aquí cargaremos los modelos desde el backend */}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Proveedor</label>
                  <select
                    className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2.5 text-gray-900"
                    defaultValue={productoSeleccionado?.proveedor}
                    required
                  >
                    <option value="">Seleccione un proveedor</option>
                    {/* Aquí cargaremos los proveedores desde el backend */}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Descripción</label>
                  <textarea
                    className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2.5 text-gray-900 placeholder-gray-400"
                    rows={3}
                    defaultValue={productoSeleccionado?.descripcion}
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Notas Internas</label>
                  <textarea
                    className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2.5 text-gray-900 placeholder-gray-400"
                    rows={2}
                    defaultValue={productoSeleccionado?.notasInternas}
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Fotografías</label>
                  <div className="mt-1 flex items-center space-x-4">
                    <label className="flex items-center px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200">
                      <HiPhotograph className="mr-2" />
                      Agregar Fotos
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={handleFotoChange}
                      />
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {previewFotos.map((foto, index) => (
                        <div key={index} className="relative">
                          <img
                            src={foto}
                            alt={`Preview ${index + 1}`}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => eliminarFoto(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <HiX className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Garantía</label>
                  <div className="mt-1 flex space-x-2">
                    <input
                      type="number"
                      className="block w-24 rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2.5 text-gray-900 placeholder-gray-400"
                      defaultValue={productoSeleccionado?.garantia.valor}
                      required
                    />
                    <select
                      className="block w-32 rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2.5 text-gray-900"
                      defaultValue={productoSeleccionado?.garantia.unidad}
                      required
                    >
                      <option value="dias">Días</option>
                      <option value="meses">Meses</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setProductoSeleccionado(null);
                    setFotos([]);
                    setPreviewFotos([]);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {productoSeleccionado ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 