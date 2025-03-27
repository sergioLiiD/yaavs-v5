'use client';

import { useState, FormEvent, ChangeEvent } from 'react';
import { HiPlus, HiPencil, HiTrash, HiSearch } from 'react-icons/hi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProductosSelector } from '@/components/reparaciones/ProductosSelector';
import { PasosEditor } from '@/components/reparaciones/PasosEditor';

interface Producto {
  id: number;
  nombre: string;
  cantidad: number;
  precio: number;
  tipo: 'producto' | 'servicio';
}

interface Paso {
  id: string;
  contenido: string;
  orden: number;
}

interface Reparacion {
  id: number;
  nombre: string;
  descripcion: string;
  costoTotal: number;
  tiempoEstimado: {
    cantidad: number;
    unidad: 'minutos' | 'horas' | 'dias';
  };
  pasos: Paso[];
  productos: Producto[];
}

// Datos de ejemplo (después se reemplazarán con datos reales)
const reparacionesEjemplo: Reparacion[] = [
  {
    id: 1,
    nombre: 'Cambio de Pantalla iPhone 13',
    descripcion: 'Reemplazo completo de la pantalla del iPhone 13',
    costoTotal: 2500,
    tiempoEstimado: {
      cantidad: 45,
      unidad: 'minutos'
    },
    pasos: [
      { id: '1', contenido: 'Desmontar la pantalla', orden: 0 },
      { id: '2', contenido: 'Retirar la batería', orden: 1 },
      { id: '3', contenido: 'Instalar nueva pantalla', orden: 2 },
      { id: '4', contenido: 'Calibrar sensores', orden: 3 }
    ],
    productos: [
      { id: 1, nombre: 'Pantalla iPhone 13', cantidad: 1, precio: 1800, tipo: 'producto' },
      { id: 2, nombre: 'Pegamento', cantidad: 1, precio: 100, tipo: 'producto' },
      { id: 3, nombre: 'Mano de Obra', cantidad: 1, precio: 600, tipo: 'servicio' }
    ]
  }
];

export default function ReparacionesFrecuentes() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedReparacion, setSelectedReparacion] = useState<Reparacion | null>(null);
  const [reparaciones, setReparaciones] = useState<Reparacion[]>(reparacionesEjemplo);

  const handleEdit = (reparacion: Reparacion) => {
    setSelectedReparacion(reparacion);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    setReparaciones(reparaciones.filter(r => r.id !== id));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Implementar lógica de guardado
    setIsDialogOpen(false);
  };

  const handleProductosChange = (productos: Producto[]) => {
    if (!selectedReparacion) return;
    
    const costoTotal = productos.reduce((sum, p) => sum + (p.precio * p.cantidad), 0);
    setSelectedReparacion({
      ...selectedReparacion,
      productos,
      costoTotal
    });
  };

  const handlePasosChange = (pasos: Paso[]) => {
    if (!selectedReparacion) return;
    
    setSelectedReparacion({
      ...selectedReparacion,
      pasos
    });
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>, field: keyof Reparacion) => {
    if (!selectedReparacion) return;
    
    if (field === 'tiempoEstimado') {
      const target = e.target as HTMLInputElement | HTMLSelectElement;
      const isCantidad = target.name === 'tiempoCantidad';
      
      setSelectedReparacion({
        ...selectedReparacion,
        tiempoEstimado: {
          ...selectedReparacion.tiempoEstimado,
          [isCantidad ? 'cantidad' : 'unidad']: isCantidad ? parseInt(target.value) : target.value as 'minutos' | 'horas' | 'dias'
        }
      });
    } else {
      setSelectedReparacion({
        ...selectedReparacion,
        [field]: e.target.value
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Reparaciones Frecuentes</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <HiPlus className="mr-2" />
              Nueva Reparación
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white">
            <DialogHeader className="sticky top-0 bg-white z-10 pb-4 border-b border-gray-200">
              <DialogTitle className="text-xl font-semibold text-gray-900">
                {selectedReparacion ? 'Editar Reparación' : 'Nueva Reparación'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nombre" className="block text-sm font-medium text-gray-700">Nombre</Label>
                  <Input 
                    id="nombre" 
                    placeholder="Ej: Cambio de Pantalla iPhone 13"
                    value={selectedReparacion?.nombre || ''}
                    onChange={(e) => handleInputChange(e, 'nombre')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <Label className="block text-sm font-medium text-gray-700">Tiempo Estimado</Label>
                  <div className="mt-1 flex gap-2">
                    <Input 
                      type="number"
                      name="tiempoCantidad"
                      placeholder="Cantidad"
                      value={selectedReparacion?.tiempoEstimado?.cantidad || ''}
                      onChange={(e) => handleInputChange(e, 'tiempoEstimado')}
                      className="block w-24 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                    <select
                      name="tiempoUnidad"
                      value={selectedReparacion?.tiempoEstimado?.unidad || 'minutos'}
                      onChange={(e) => handleInputChange(e, 'tiempoEstimado')}
                      className="block w-32 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    >
                      <option value="minutos">Minutos</option>
                      <option value="horas">Horas</option>
                      <option value="dias">Días</option>
                    </select>
                  </div>
                </div>
              </div>
              <div>
                <Label htmlFor="descripcion" className="block text-sm font-medium text-gray-700">Descripción</Label>
                <Textarea 
                  id="descripcion" 
                  placeholder="Describe el proceso de reparación..."
                  value={selectedReparacion?.descripcion || ''}
                  onChange={(e) => handleInputChange(e, 'descripcion')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              
              {/* Sección de Productos */}
              <Card className="border border-gray-200">
                <CardHeader className="bg-gray-50">
                  <CardTitle className="text-lg font-medium text-gray-900">Productos y Servicios</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <ProductosSelector
                    productos={selectedReparacion?.productos || []}
                    onProductosChange={handleProductosChange}
                  />
                </CardContent>
              </Card>

              {/* Sección de Pasos */}
              <Card className="border border-gray-200">
                <CardHeader className="bg-gray-50">
                  <CardTitle className="text-lg font-medium text-gray-900">Pasos de la Reparación</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <PasosEditor
                    pasos={selectedReparacion?.pasos || []}
                    onPasosChange={handlePasosChange}
                  />
                </CardContent>
              </Card>

              <div className="flex justify-end space-x-2 bg-gray-50 px-4 py-3 sm:px-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                  className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
                >
                  Guardar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg">
        <div className="px-4 py-3 sm:px-6 border-b border-gray-200">
          <div className="relative">
            <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Buscar reparaciones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full max-w-md"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                  Nombre
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Descripción
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Costo Total
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Tiempo Estimado
                </th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {reparaciones.map((reparacion) => (
                <tr key={reparacion.id}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                    {reparacion.nombre}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {reparacion.descripcion}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    ${reparacion.costoTotal}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {reparacion.tiempoEstimado.cantidad} {reparacion.tiempoEstimado.unidad}
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <button
                      onClick={() => handleEdit(reparacion)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      <HiPencil className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(reparacion.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <HiTrash className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 