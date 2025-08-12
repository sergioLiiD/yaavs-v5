'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProductosSelector } from './productos-selector';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { PresupuestoIndependienteCompleto } from '@/types/presupuesto-independiente';

interface Producto {
  id: number;
  nombre: string;
  precio_promedio: number;
  tipo: string;
  sku: string;
  stock: number;
  marca?: { nombre: string };
  modelo?: { nombre: string };
}

interface ProductoSeleccionado {
  id: string;
  productoId: number;
  cantidad: number;
  precioVenta: number;
  conceptoExtra?: string;
  precioConceptoExtra?: number;
  nombre: string;
}

interface PresupuestoFormProps {
  presupuesto?: PresupuestoIndependienteCompleto;
  productos: Producto[];
  isEditing?: boolean;
}

export function PresupuestoForm({ presupuesto, productos, isEditing = false }: PresupuestoFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: presupuesto?.nombre || '',
    descripcion: presupuesto?.descripcion || '',
    cliente_nombre: presupuesto?.cliente_nombre || '',
  });
  const [selectedProductos, setSelectedProductos] = useState<ProductoSeleccionado[]>([]);

  // Cargar productos del presupuesto si estamos editando
  useEffect(() => {
    if (presupuesto && presupuesto.productos_presupuesto_independiente) {
      const productosFormateados = presupuesto.productos_presupuesto_independiente.map((p) => ({
        id: p.id.toString(),
        productoId: p.producto_id || 0,
        cantidad: p.cantidad,
        precioVenta: p.precio_venta,
        conceptoExtra: p.concepto_extra || '',
        precioConceptoExtra: p.precio_concepto_extra || 0,
        nombre: p.productos?.nombre || 'Producto no encontrado'
      }));
      setSelectedProductos(productosFormateados);
    }
  }, [presupuesto]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre.trim()) {
      toast.error('El nombre del presupuesto es requerido');
      return;
    }

    if (selectedProductos.length === 0) {
      toast.error('Debe agregar al menos un producto o servicio');
      return;
    }

    // Validar que todos los productos tengan un productoId válido
    const productosInvalidos = selectedProductos.filter(p => p.productoId === 0);
    if (productosInvalidos.length > 0) {
      toast.error('Todos los productos deben estar seleccionados');
      return;
    }

    setIsLoading(true);

    try {
      const data = {
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim(),
        cliente_nombre: formData.cliente_nombre.trim(),
        productos: selectedProductos.map(p => ({
          productoId: p.productoId,
          cantidad: p.cantidad,
          precioVenta: p.precioVenta,
          conceptoExtra: p.conceptoExtra || undefined,
          precioConceptoExtra: p.precioConceptoExtra || undefined
        }))
      };

      const url = isEditing 
        ? `/api/presupuestos-independientes/${presupuesto?.id}`
        : '/api/presupuestos-independientes';
      
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al guardar el presupuesto');
      }

      toast.success(isEditing ? 'Presupuesto actualizado correctamente' : 'Presupuesto creado correctamente');
      router.push('/dashboard/presupuestos');
    } catch (error) {
      console.error('Error al guardar presupuesto:', error);
      toast.error(error instanceof Error ? error.message : 'Error al guardar el presupuesto');
    } finally {
      setIsLoading(false);
    }
  };

  const calcularTotal = () => {
    return selectedProductos.reduce((total, producto) => {
      const subtotal = producto.precioVenta * producto.cantidad;
      const extra = producto.precioConceptoExtra || 0;
      return total + subtotal + extra;
    }, 0);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {isEditing ? 'Editar Presupuesto' : 'Nuevo Presupuesto'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nombre">Nombre del Presupuesto *</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => handleInputChange('nombre', e.target.value)}
                placeholder="Ej: Presupuesto Juan Dominguez"
                required
              />
            </div>
            <div>
              <Label htmlFor="cliente_nombre">Nombre del Cliente</Label>
              <Input
                id="cliente_nombre"
                value={formData.cliente_nombre}
                onChange={(e) => handleInputChange('cliente_nombre', e.target.value)}
                placeholder="Ej: Juan Dominguez"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              value={formData.descripcion}
              onChange={(e) => handleInputChange('descripcion', e.target.value)}
              placeholder="Descripción opcional del presupuesto"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Selector de productos */}
      <Card>
        <CardContent className="pt-6">
          <ProductosSelector
            productos={productos}
            selectedProductos={selectedProductos}
            onProductosChange={setSelectedProductos}
          />
        </CardContent>
      </Card>

      {/* Resumen y total */}
      {selectedProductos.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">Resumen</h3>
                <p className="text-sm text-gray-600">
                  {selectedProductos.length} producto(s) seleccionado(s)
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">
                  ${calcularTotal().toFixed(2)}
                </div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Botones de acción */}
      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/dashboard/presupuestos')}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isLoading || selectedProductos.length === 0}
        >
          {isLoading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear')} Presupuesto
        </Button>
      </div>
    </form>
  );
}
