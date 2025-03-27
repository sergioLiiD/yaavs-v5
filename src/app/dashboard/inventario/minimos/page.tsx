'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Producto, InventarioMinimo } from '@prisma/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Edit2, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

type ProductoConInventarioMinimo = Producto & {
  inventarioMinimo: InventarioMinimo | null;
  marca: { nombre: string };
  modelo: { nombre: string };
};

export default function InventariosMinimosPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState<ProductoConInventarioMinimo | null>(null);
  const [newMinimo, setNewMinimo] = useState('0');

  const { data: productos, refetch } = useQuery<ProductoConInventarioMinimo[]>({
    queryKey: ['productos'],
    queryFn: async () => {
      const response = await fetch('/api/productos');
      return response.json();
    },
  });

  const handleEdit = async (productoId: number, cantidadMinima: number) => {
    try {
      const response = await fetch(`/api/inventarios-minimos/${productoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cantidadMinima }),
      });

      if (!response.ok) throw new Error('Error al actualizar el inventario mínimo');

      toast.success('Inventario mínimo actualizado correctamente');
      refetch();
    } catch (error) {
      toast.error('Error al actualizar el inventario mínimo');
    }
  };

  const handleDelete = async (productoId: number) => {
    try {
      const response = await fetch(`/api/inventarios-minimos/${productoId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Error al eliminar el inventario mínimo');

      toast.success('Inventario mínimo eliminado correctamente');
      refetch();
    } catch (error) {
      toast.error('Error al eliminar el inventario mínimo');
    }
  };

  const filteredProductos = productos?.filter((producto) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      producto.marca.nombre.toLowerCase().includes(searchLower) ||
      producto.modelo.nombre.toLowerCase().includes(searchLower) ||
      producto.nombre.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Gestión de Inventarios Mínimos</h1>
      
      <div className="mb-6">
        <Input
          placeholder="Buscar por marca, modelo o nombre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Marca</TableHead>
            <TableHead>Modelo</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Stock Actual</TableHead>
            <TableHead>Inventario Mínimo</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredProductos?.map((producto) => (
            <TableRow key={producto.id}>
              <TableCell>{producto.marca.nombre}</TableCell>
              <TableCell>{producto.modelo.nombre}</TableCell>
              <TableCell>{producto.nombre}</TableCell>
              <TableCell>{producto.stock}</TableCell>
              <TableCell>{producto.inventarioMinimo?.cantidadMinima || 0}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  producto.stock <= (producto.inventarioMinimo?.cantidadMinima || 0)
                    ? 'bg-red-100 text-red-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  {producto.stock <= (producto.inventarioMinimo?.cantidadMinima || 0)
                    ? 'Stock Bajo'
                    : 'Stock Normal'}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingProduct(producto);
                          setNewMinimo(producto.inventarioMinimo?.cantidadMinima.toString() || '0');
                        }}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Editar Inventario Mínimo</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Cantidad Mínima</label>
                          <Input
                            type="number"
                            value={newMinimo}
                            onChange={(e) => setNewMinimo(e.target.value)}
                            min="0"
                          />
                        </div>
                        <Button
                          onClick={() => {
                            handleEdit(producto.id, parseInt(newMinimo));
                            setEditingProduct(null);
                          }}
                        >
                          Guardar
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(producto.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 