"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { cuponService } from '@/services/cuponService'
import { UpdateCuponData, TipoCupon, TipoDescuento } from '@/types/cupon'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import Link from 'next/link'

export default function EditarCuponPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const cuponId = Number(params.id)

  const { data: cupon, isLoading } = useQuery({
    queryKey: ['cupon', cuponId],
    queryFn: () => cuponService.getCupon(cuponId),
    enabled: !!cuponId,
  })

  const [formData, setFormData] = useState<UpdateCuponData>({})

  useEffect(() => {
    if (cupon) {
      setFormData({
        codigo: cupon.codigo,
        nombre: cupon.nombre,
        descripcion: cupon.descripcion || '',
        tipo: cupon.tipo,
        tipo_descuento: cupon.tipo_descuento,
        valor_descuento: cupon.valor_descuento,
        monto_minimo: cupon.monto_minimo || 0,
        fecha_inicio: cupon.fecha_inicio.split('T')[0],
        fecha_expiracion: cupon.fecha_expiracion.split('T')[0],
        limite_usos: cupon.limite_usos,
        activo: cupon.activo,
      })
    }
  }, [cupon])

  const updateCuponMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCuponData }) => 
      cuponService.updateCupon(id, data),
    onSuccess: () => {
      toast.success('Cupón actualizado exitosamente')
      queryClient.invalidateQueries({ queryKey: ['cupones'] })
      queryClient.invalidateQueries({ queryKey: ['cupon', cuponId] })
      router.push(`/dashboard/cupones/${cuponId}`)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al actualizar el cupón')
    },
  })

  const handleInputChange = (field: keyof UpdateCuponData, value: any) => {
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

    updateCuponMutation.mutate({ id: cuponId, data: formData })
  }

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-2 text-gray-600">Cargando cupón...</p>
      </div>
    )
  }

  if (!cupon) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Cupón no encontrado</p>
        <Link href="/dashboard/cupones">
          <Button className="mt-4">Volver a Cupones</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/cupones/${cuponId}`}>
          <Button variant="outline" size="sm">
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Editar Cupón</h1>
          <p className="text-gray-600">Modifica la información del cupón</p>
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
                  value={formData.tipo || ''}
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
                    value={formData.codigo || ''}
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
                  value={formData.nombre || ''}
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
                  value={formData.tipo_descuento || ''}
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
                  value={formData.valor_descuento || ''}
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
                {cupon.usos_actuales > 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    Ya se han usado {cupon.usos_actuales} veces
                  </p>
                )}
              </div>

              {/* Fecha de inicio */}
              <div>
                <Label htmlFor="fecha_inicio">Fecha de Inicio</Label>
                <Input
                  id="fecha_inicio"
                  type="date"
                  value={formData.fecha_inicio || ''}
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
                  value={formData.fecha_expiracion || ''}
                  onChange={(e) => handleInputChange('fecha_expiracion', e.target.value)}
                  required
                />
              </div>

              {/* Estado activo */}
              <div className="flex items-center space-x-2">
                <Switch
                  id="activo"
                  checked={formData.activo ?? true}
                  onCheckedChange={(checked) => handleInputChange('activo', checked)}
                />
                <Label htmlFor="activo">Cupón Activo</Label>
              </div>
            </div>

            <div className="flex gap-4 pt-6 border-t">
              <Button
                type="submit"
                disabled={updateCuponMutation.isPending}
              >
                {updateCuponMutation.isPending ? 'Actualizando...' : 'Actualizar Cupón'}
              </Button>

              <Link href={`/dashboard/cupones/${cuponId}`}>
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
