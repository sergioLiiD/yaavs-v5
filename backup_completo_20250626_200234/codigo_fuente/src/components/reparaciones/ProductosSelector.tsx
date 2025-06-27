'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { HiTrash } from 'react-icons/hi';

interface Producto {
  id: number;
  nombre: string;
  cantidad: number;
  precio: number;
  tipo: 'producto' | 'servicio';
}

interface ProductosSelectorProps {
  productos: Producto[];
  onProductosChange: (productos: Producto[]) => void;
}

export function ProductosSelector({ productos, onProductosChange }: ProductosSelectorProps) {
  const [nuevoProducto, setNuevoProducto] = useState<Partial<Producto>>({
    nombre: '',
    cantidad: 1,
    precio: 0,
    tipo: 'producto'
  });

  const handleAgregarProducto = () => {
    if (!nuevoProducto.nombre || !nuevoProducto.precio) return;

    const producto: Producto = {
      id: Date.now(),
      nombre: nuevoProducto.nombre,
      cantidad: nuevoProducto.cantidad || 1,
      precio: nuevoProducto.precio,
      tipo: nuevoProducto.tipo || 'producto'
    };

    onProductosChange([...productos, producto]);
    setNuevoProducto({
      nombre: '',
      cantidad: 1,
      precio: 0,
      tipo: 'producto'
    });
  };

  const handleEliminarProducto = (id: number) => {
    onProductosChange(productos.filter(p => p.id !== id));
  };

  const handleCantidadChange = (id: number, nuevaCantidad: number) => {
    onProductosChange(
      productos.map(p =>
        p.id === id ? { ...p, cantidad: nuevaCantidad } : p
      )
    );
  };

  const total = productos.reduce((sum, p) => sum + (p.precio * p.cantidad), 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-4">
        <div className="col-span-2">
          <Input
            placeholder="Nombre del producto o servicio"
            value={nuevoProducto.nombre}
            onChange={(e) => setNuevoProducto({ ...nuevoProducto, nombre: e.target.value })}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FEBF19] focus:ring-[#FEBF19] sm:text-sm"
          />
        </div>
        <div>
          <Input
            type="number"
            placeholder="Cantidad"
            value={nuevoProducto.cantidad}
            onChange={(e) => setNuevoProducto({ ...nuevoProducto, cantidad: parseInt(e.target.value) })}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FEBF19] focus:ring-[#FEBF19] sm:text-sm"
          />
        </div>
        <div>
          <Input
            type="number"
            placeholder="Precio"
            value={nuevoProducto.precio}
            onChange={(e) => setNuevoProducto({ ...nuevoProducto, precio: parseFloat(e.target.value) })}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FEBF19] focus:ring-[#FEBF19] sm:text-sm"
          />
        </div>
      </div>
      <Button 
        onClick={handleAgregarProducto} 
        className="w-full inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-[#FEBF19] focus:ring-offset-2"
      >
        Agregar Producto/Servicio
      </Button>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                Nombre
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Tipo
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Cantidad
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Precio Unitario
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Total
              </th>
              <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {productos.map((producto) => (
              <tr key={producto.id}>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                  {producto.nombre}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    producto.tipo === 'producto' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {producto.tipo === 'producto' ? 'Producto' : 'Servicio'}
                  </span>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  <Input
                    type="number"
                    value={producto.cantidad}
                    onChange={(e) => handleCantidadChange(producto.id, parseInt(e.target.value))}
                    className="w-20 block rounded-md border-gray-300 shadow-sm focus:border-[#FEBF19] focus:ring-[#FEBF19] sm:text-sm"
                  />
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  ${producto.precio}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  ${producto.precio * producto.cantidad}
                </td>
                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                  <button
                    onClick={() => handleEliminarProducto(producto.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <HiTrash className="h-4 w-4 text-[#FEBF19] focus:ring-[#FEBF19] border-gray-300" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end">
        <div className="text-lg font-semibold text-gray-900">
          Total: ${total}
        </div>
      </div>
    </div>
  );
} 