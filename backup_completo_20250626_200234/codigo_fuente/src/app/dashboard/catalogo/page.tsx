'use client';

import { HiTag, HiDeviceMobile, HiPhone, HiClipboardList, HiShoppingBag } from 'react-icons/hi';
import Link from 'next/link';

export default function CatalogoPage() {
  const secciones = [
    {
      titulo: 'Tipo de Servicio',
      descripcion: 'Gestiona los diferentes tipos de servicios que ofreces',
      icono: HiTag,
      ruta: '/dashboard/catalogo/tipo-servicio',
      color: 'bg-blue-500'
    },
    {
      titulo: 'Marcas de Celulares',
      descripcion: 'Administra las marcas de dispositivos móviles',
      icono: HiDeviceMobile,
      ruta: '/dashboard/catalogo/marcas',
      color: 'bg-green-500'
    },
    {
      titulo: 'Modelos de Celulares',
      descripcion: 'Gestiona los modelos específicos de cada marca',
      icono: HiPhone,
      ruta: '/dashboard/catalogo/modelos',
      color: 'bg-purple-500'
    },
    {
      titulo: 'Estados de Reparación',
      descripcion: 'Configura los diferentes estados de una reparación',
      icono: HiClipboardList,
      ruta: '/dashboard/catalogo/status-reparacion',
      color: 'bg-yellow-500'
    },
    {
      titulo: 'Proveedores',
      descripcion: 'Administra la información de tus proveedores',
      icono: HiShoppingBag,
      ruta: '/dashboard/catalogo/proveedores',
      color: 'bg-red-500'
    }
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Catálogo</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {secciones.map((seccion, index) => (
          <Link
            key={index}
            href={seccion.ruta}
            className="block p-6 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-200"
          >
            <div className="flex items-center mb-4">
              <div className={`p-3 rounded-lg ${seccion.color} text-white mr-4`}>
                <seccion.icono className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">{seccion.titulo}</h2>
            </div>
            <p className="text-gray-600">{seccion.descripcion}</p>
          </Link>
        ))}
      </div>
    </div>
  );
} 