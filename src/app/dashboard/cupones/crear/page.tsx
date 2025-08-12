"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { cuponService } from '@/services/cuponService'
import { CreateCuponData, TipoCupon, TipoDescuento } from '@/types/cupon'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import Link from 'next/link'

export default function CrearCuponPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isGenerating, setIsGenerating] = useState(false)

  const [formData, setFormData] = useState<CreateCuponData>({
    codigo: '',
    nombre: '',
    descripcion: '',
    tipo: 'GENERAL',
    tipo_descuento: 'PORCENTAJE',
    valor_descuento: 0,
    monto_minimo: 0,
    fecha_inicio: new Date().toISOString().split('T')[0],
    fecha_expiracion: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    limite_usos: undefined,
  })

  const createCuponMutation = useMutation({
    mutationFn: cuponService.createCupon,
    onSuccess: () => {
      toast.success('Cupón creado exitosamente')
      queryClient.invalidateQueries({ queryKey: ['cupones'] })
      router.push('/dashboard/cupones')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al crear el cupón')
    },
  })

  const generateCuponesMutation = useMutation({
    mutationFn: cuponService.generateCupones,
    onSuccess: (cupones) => {
      toast.success(`${cupones.length} cupones generados exitosamente`)
      queryClient.invalidateQueries({ queryKey: ['cupones'] })
      router.push('/dashboard/cupones')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al generar los cupones')
    },
  })

  const handleInputChange = (field: keyof CreateCuponData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.tipo === 'GENERAL' && !formData.codigo) {
      toast.error('El código es requerido para cupones generales')
      return
    }

    if (formData.tipo === 'PERSONALIZADO') {
      // Para cupones personalizados, generamos el código automáticamente
      const codigoGenerado = generateUniqueCode()
      formData.codigo = codigoGenerado
    }

    createCuponMutation.mutate(formData)
  }

  const handleGenerateMultiple = () => {
    if (!formData.nombre || !formData.valor_descuento) {
      toast.error('Nombre y valor de descuento son requeridos')
      return
    }

    setIsGenerating(true)
    const cantidad = prompt('¿Cuántos cupones deseas generar?')
    setIsGenerating(false)

    if (!cantidad || isNaN(Number(cantidad))) {
      toast.error('Cantidad inválida')
      return
    }

    const generateData = {
      ...formData,
      cantidad: Number(cantidad),
      tipo: 'PERSONALIZADO' as TipoCupon,
    }

    generateCuponesMutation.mutate(generateData)
  }

  const generateUniqueCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/cupones">
          <Button variant="outline" size="sm">
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Crear Cupón</h1>
          <p className="text-gray-600">Crea un nuevo cupón de descuento</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Cupón</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tipo de cupón */}
              <div>
                <Label htmlFor="tipo">Tipo de Cupón</Label>
                <Select
                  value={formData.tipo}
                  onValueChange={(value: TipoCupon) => handleInputChange('tipo', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GENERAL">General</SelectItem>
                    <SelectItem value="PERSONALIZADO">Personalizado</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500 mt-1">
                  {formData.tipo === 'GENERAL' 
                    ? 'Cupón que puede ser usado por cualquier usuario'
                    : 'Cupón único que solo puede ser usado una vez'
                  }
                </p>
              </div>

              {/* Código */}
              {formData.tipo === 'GENERAL' && (
                <div>
                  <Label htmlFor="codigo">Código del Cupón</Label>
                  <Input
                    id="codigo"
                    value={formData.codigo}
                    onChange={(e) => handleInputChange('codigo', e.target.value.toUpperCase())}
                    placeholder="Ej: DESCUENTO10"
                    required
                  />
                </div>
              )}

              {/* Nombre */}
              <div>
                <Label htmlFor="nombre">Nombre del Cupón</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => handleInputChange('nombre', e.target.value)}
                  placeholder="Ej: Descuento de Verano"
                  required
                />
              </div>

              {/* Descripción */}
              <div>
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  value={formData.descripcion || ''}
                  onChange={(e) => handleInputChange('descripcion', e.target.value)}
                  placeholder="Descripción opcional del cupón"
                  rows={3}
                />
              </div>

              {/* Tipo de descuento */}
              <div>
                <Label htmlFor="tipo_descuento">Tipo de Descuento</Label>
                <Select
                  value={formData.tipo_descuento}
                  onValueChange={(value: TipoDescuento) => handleInputChange('tipo_descuento', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PORCENTAJE">Porcentaje (%)</SelectItem>
                    <SelectItem value="MONTO_FIJO">Monto Fijo ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Valor del descuento */}
              <div>
                <Label htmlFor="valor_descuento">
                  Valor del Descuento
                  {formData.tipo_descuento === 'PORCENTAJE' ? ' (%)' : ' ($)'}
                </Label>
                <Input
                  id="valor_descuento"
                  type="number"
                  step={formData.tipo_descuento === 'PORCENTAJE' ? '0.01' : '0.01'}
                  min="0"
                  max={formData.tipo_descuento === 'PORCENTAJE' ? '100' : undefined}
                  value={formData.valor_descuento}
                  onChange={(e) => handleInputChange('valor_descuento', parseFloat(e.target.value) || 0)}
                  required
                />
              </div>

              {/* Monto mínimo */}
              <div>
                <Label htmlFor="monto_minimo">Monto Mínimo de Compra ($)</Label>
                <Input
                  id="monto_minimo"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.monto_minimo || ''}
                  onChange={(e) => handleInputChange('monto_minimo', parseFloat(e.target.value) || 0)}
                  placeholder="0 (sin mínimo)"
                />
              </div>

              {/* Límite de usos */}
              <div>
                <Label htmlFor="limite_usos">Límite de Usos</Label>
                <Input
                  id="limite_usos"
                  type="number"
                  min="1"
                  value={formData.limite_usos || ''}
                  onChange={(e) => handleInputChange('limite_usos', parseInt(e.target.value) || undefined)}
                  placeholder="Sin límite"
                />
              </div>

              {/* Fecha de inicio */}
              <div>
                <Label htmlFor="fecha_inicio">Fecha de Inicio</Label>
                <Input
                  id="fecha_inicio"
                  type="date"
                  value={formData.fecha_inicio}
                  onChange={(e) => handleInputChange('fecha_inicio', e.target.value)}
                  required
                />
              </div>

              {/* Fecha de expiración */}
              <div>
                <Label htmlFor="fecha_expiracion">Fecha de Expiración</Label>
                <Input
                  id="fecha_expiracion"
                  type="date"
                  value={formData.fecha_expiracion}
                  onChange={(e) => handleInputChange('fecha_expiracion', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex gap-4 pt-6 border-t">
              <Button
                type="submit"
                disabled={createCuponMutation.isPending}
              >
                {createCuponMutation.isPending ? 'Creando...' : 'Crear Cupón'}
              </Button>

              {formData.tipo === 'PERSONALIZADO' && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGenerateMultiple}
                  disabled={generateCuponesMutation.isPending || isGenerating}
                >
                  {generateCuponesMutation.isPending || isGenerating ? 'Generando...' : 'Generar Múltiples'}
                </Button>
              )}

              <Link href="/dashboard/cupones">
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
