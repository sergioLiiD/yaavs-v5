'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { PlusIcon, TrashIcon, GripVertical } from '@heroicons/react/24/outline';
import { ProductosSelector } from '@/components/reparaciones/productos-selector';

const formSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  descripcion: z.string().optional(),
  activo: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

interface ReparacionFrecuenteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reparacion?: {
    id: number;
    nombre: string;
    descripcion: string | null;
    activo: boolean;
  };
}

export function ReparacionFrecuenteDialog({ open, onOpenChange, reparacion }: ReparacionFrecuenteDialogProps) {
  const [pasos, setPasos] = useState<{ id: string; descripcion: string; orden: number }[]>([]);
  const [productos, setProductos] = useState<{ id: string; productoId: number; cantidad: number; precioVenta: number; conceptoExtra?: string; precioConceptoExtra?: number }[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: reparacion?.nombre || '',
      descripcion: reparacion?.descripcion || '',
      activo: reparacion?.activo ?? true,
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      // TODO: Implementar guardado
      onOpenChange(false);
    } catch (error) {
      console.error('Error al guardar:', error);
    }
  };

  const handleAddPaso = () => {
    setPasos([
      ...pasos,
      {
        id: Math.random().toString(36).substr(2, 9),
        descripcion: '',
        orden: pasos.length,
      },
    ]);
  };

  const handleRemovePaso = (id: string) => {
    setPasos(pasos.filter((paso) => paso.id !== id));
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(pasos);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setPasos(items.map((item, index) => ({ ...item, orden: index })));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {reparacion ? 'Editar Reparación Frecuente' : 'Nueva Reparación Frecuente'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                {...form.register('nombre')}
                placeholder="Ej: Cambio de Pantalla iPhone 13"
              />
              {form.formState.errors.nombre && (
                <p className="text-sm text-red-500 mt-1">
                  {form.formState.errors.nombre.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                {...form.register('descripcion')}
                placeholder="Describe el proceso de reparación..."
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="activo"
                checked={form.watch('activo')}
                onCheckedChange={(checked: boolean) => form.setValue('activo', checked)}
              />
              <Label htmlFor="activo">Activo</Label>
            </div>
          </div>

          {/* Sección de Pasos */}
          <Card>
            <CardHeader>
              <CardTitle>Pasos de la Reparación</CardTitle>
            </CardHeader>
            <CardContent>
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="pasos">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef}>
                      {pasos.map((paso, index) => (
                        <Draggable key={paso.id} draggableId={paso.id} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className="flex items-center gap-2 mb-2"
                            >
                              <div {...provided.dragHandleProps}>
                                <GripVertical className="h-5 w-5 text-gray-400" />
                              </div>
                              <Input
                                value={paso.descripcion}
                                onChange={(e) => {
                                  const newPasos = [...pasos];
                                  newPasos[index].descripcion = e.target.value;
                                  setPasos(newPasos);
                                }}
                                placeholder="Describe el paso..."
                                className="flex-1"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemovePaso(paso.id)}
                              >
                                <TrashIcon className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
              <Button
                type="button"
                variant="outline"
                onClick={handleAddPaso}
                className="mt-4"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Agregar Paso
              </Button>
            </CardContent>
          </Card>

          {/* Sección de Productos */}
          <Card>
            <CardHeader>
              <CardTitle>Productos y Servicios</CardTitle>
            </CardHeader>
            <CardContent>
              <ProductosSelector
                productos={productos}
                onProductosChange={setProductos}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit">
              Guardar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 