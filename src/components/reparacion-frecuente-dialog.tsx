"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { HiX } from "react-icons/hi"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { ProductosSelector } from "@/components/reparaciones/productos-selector"
import { TrashIcon } from "@heroicons/react/24/outline"
import { Label } from "@/components/ui/label"

const formSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  descripcion: z.string().optional(),
  activo: z.boolean().default(true),
  productos: z.array(
    z.object({
      id: z.string(),
      productoId: z.number(),
      cantidad: z.number().min(1),
      precioVenta: z.number().min(0),
      conceptoExtra: z.string().optional(),
      precioConceptoExtra: z.number().optional(),
    })
  ),
  pasos: z.array(
    z.object({
      id: z.string(),
      descripcion: z.string(),
      orden: z.number(),
    })
  ),
})

interface ReparacionFrecuenteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: z.infer<typeof formSchema>) => void
  initialData?: z.infer<typeof formSchema>
}

export function ReparacionFrecuenteDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
}: ReparacionFrecuenteDialogProps) {
  const [pasos, setPasos] = useState<{ id: string; descripcion: string; orden: number }[]>(
    initialData?.pasos || []
  );
  const [productos, setProductos] = useState<{ id: string; productoId: number; cantidad: number; precioVenta: number; conceptoExtra?: string; precioConceptoExtra?: number }[]>(
    initialData?.productos || []
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: initialData?.nombre || '',
      descripcion: initialData?.descripcion || '',
      activo: initialData?.activo ?? true,
      productos: initialData?.productos || [],
      pasos: initialData?.pasos || [],
    },
  });

  // Actualizar el formulario cuando cambia initialData
  React.useEffect(() => {
    if (initialData) {
      form.reset({
        nombre: initialData.nombre,
        descripcion: initialData.descripcion,
        activo: initialData.activo,
        productos: initialData.productos,
        pasos: initialData.pasos,
      });
      setPasos(initialData.pasos);
      setProductos(initialData.productos);
    }
  }, [initialData, form]);

  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const items = Array.from(pasos)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    // Actualizar el orden
    const itemsConOrden = items.map((item, index) => ({
      ...item,
      orden: index,
    }))

    setPasos(itemsConOrden)
    form.setValue("pasos", itemsConOrden)
  }

  const handleAddPaso = () => {
    const nuevoPaso = {
      id: Math.random().toString(36).substr(2, 9),
      descripcion: "",
      orden: pasos.length,
    }
    setPasos([...pasos, nuevoPaso])
    form.setValue("pasos", [...pasos, nuevoPaso])
  }

  const handleRemovePaso = (id: string) => {
    const nuevosPasos = pasos.filter((p) => p.id !== id)
    setPasos(nuevosPasos)
    form.setValue("pasos", nuevosPasos)
  }

  const handlePasoChange = (id: string, descripcion: string) => {
    const nuevosPasos = pasos.map((p) =>
      p.id === id ? { ...p, descripcion } : p
    )
    setPasos(nuevosPasos)
    form.setValue("pasos", nuevosPasos)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const formData = form.getValues()
    
    // Asegurar que los productos y pasos estén presentes
    if (!formData.productos || formData.productos.length === 0) {
      alert('Debe agregar al menos un producto')
      return
    }

    if (!formData.pasos || formData.pasos.length === 0) {
      alert('Debe agregar al menos un paso')
      return
    }

    // Validar que todos los pasos tengan descripción
    if (formData.pasos.some(paso => !paso.descripcion.trim())) {
      alert('Todos los pasos deben tener una descripción')
      return
    }

    onSubmit(formData)
    
    // Limpiar el formulario después de guardar
    form.reset({
      nombre: '',
      descripcion: '',
      activo: true,
      productos: [],
      pasos: []
    })
    setPasos([])
    setProductos([])
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => onOpenChange(false)} />
        
        <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6">
          <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
            <button
              type="button"
              className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              onClick={() => onOpenChange(false)}
            >
              <span className="sr-only">Cerrar</span>
              <HiX className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          <div>
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
              {initialData ? "Editar Reparación Frecuente" : "Nueva Reparación Frecuente"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="nombre">Nombre</Label>
                <Input
                  id="nombre"
                  {...form.register("nombre")}
                  className="mt-1"
                />
                {form.formState.errors.nombre && (
                  <p className="mt-1 text-sm text-red-600">
                    {form.formState.errors.nombre.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  {...form.register("descripcion")}
                  className="mt-1"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="activo"
                  checked={form.watch("activo")}
                  onCheckedChange={(checked) => form.setValue("activo", checked)}
                />
                <Label htmlFor="activo">Activo</Label>
              </div>

              <div>
                <Label>Productos</Label>
                <ProductosSelector
                  productos={form.watch("productos")}
                  onProductosChange={(productos) => form.setValue("productos", productos)}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Pasos</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddPaso}
                  >
                    Agregar Paso
                  </Button>
                </div>

                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="pasos">
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="space-y-2"
                      >
                        {pasos.map((paso, index) => (
                          <Draggable key={paso.id} draggableId={paso.id} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="flex items-center space-x-2 bg-gray-50 p-2 rounded"
                              >
                                <Input
                                  value={paso.descripcion}
                                  onChange={(e) => handlePasoChange(paso.id, e.target.value)}
                                  placeholder="Descripción del paso"
                                  className="flex-1"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleRemovePaso(paso.id)}
                                  className="text-red-600 hover:text-red-700"
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
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  {initialData ? "Actualizar" : "Crear"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
} 