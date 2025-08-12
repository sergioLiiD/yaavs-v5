"use client"

import { useQuery } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeftIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import { cuponService } from '@/services/cuponService'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import Link from 'next/link'

export default function CuponDetallePage() {
  const params = useParams()
  const router = useRouter()
  const cuponId = Number(params.id)

  const { data: cupon, isLoading } = useQuery({
    queryKey: ['cupon', cuponId],
    queryFn: () => cuponService.getCupon(cuponId),
    enabled: !!cuponId,
  })

  const { data: usos = [], isLoading: isLoadingUsos } = useQuery({
    queryKey: ['cupon-usos', cuponId],
    queryFn: () => cuponService.getUsosCupon(cuponId),
    enabled: !!cuponId,
  })

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

  const getStatusBadge = () => {
    const now = new Date()
    const fechaExpiracion = new Date(cupon.fecha_expiracion)
    
    if (!cupon.activo) {
      return <Badge variant="destructive">Inactivo</Badge>
    }
    
    if (fechaExpiracion < now) {
      return <Badge variant="destructive">Expirado</Badge>
    }
    
    if (cupon.limite_usos && cupon.usos_actuales >= cupon.limite_usos) {
      return <Badge variant="destructive">Agotado</Badge>
    }
    
    return <Badge variant="default">Activo</Badge>
  }

  const formatDescuento = () => {
    if (cupon.tipo_descuento === 'PORCENTAJE') {
      return `${cupon.valor_descuento}%`
    }
    return `$${cupon.valor_descuento.toFixed(2)}`
  }

  const handleDelete = async () => {
    if (confirm('¿Estás seguro de que deseas eliminar este cupón?')) {
      try {
        await cuponService.deleteCupon(cupon.id)
        router.push('/dashboard/cupones')
      } catch (error) {
        console.error('Error al eliminar el cupón:', error)
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/cupones">
            <Button variant="outline" size="sm">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{cupon.nombre}</h1>
            <p className="text-gray-600">Detalles del cupón</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/cupones/${cupon.id}/editar`}>
            <Button variant="outline">
              <PencilIcon className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </Link>
          <Button variant="destructive" onClick={handleDelete}>
            <TrashIcon className="h-4 w-4 mr-2" />
            Eliminar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Información del cupón */}
        <Card>
          <CardHeader>
            <CardTitle>Información del Cupón</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Código</label>
                <p className="font-mono text-lg">{cupon.codigo}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Estado</label>
                <div className="mt-1">{getStatusBadge()}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Tipo</label>
                <Badge variant={cupon.tipo === 'GENERAL' ? 'default' : 'secondary'}>
                  {cupon.tipo === 'GENERAL' ? 'General' : 'Personalizado'}
                </Badge>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Descuento</label>
                <p className="text-lg font-semibold">{formatDescuento()}</p>
              </div>
            </div>

            {cupon.descripcion && (
              <div>
                <label className="text-sm font-medium text-gray-500">Descripción</label>
                <p className="mt-1">{cupon.descripcion}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Monto Mínimo</label>
                <p className="mt-1">
                  {cupon.monto_minimo && cupon.monto_minimo > 0 
                    ? `$${cupon.monto_minimo.toFixed(2)}`
                    : 'Sin mínimo'
                  }
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Usos</label>
                <p className="mt-1">
                  {cupon.usos_actuales}
                  {cupon.limite_usos && ` / ${cupon.limite_usos}`}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Fecha de Inicio</label>
                <p className="mt-1">
                  {format(new Date(cupon.fecha_inicio), 'dd/MM/yyyy', { locale: es })}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Fecha de Expiración</label>
                <p className="mt-1">
                  {format(new Date(cupon.fecha_expiracion), 'dd/MM/yyyy', { locale: es })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estadísticas */}
        <Card>
          <CardHeader>
            <CardTitle>Estadísticas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{cupon.usos_actuales}</p>
                <p className="text-sm text-gray-600">Usos Totales</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">
                  {cupon.limite_usos ? cupon.limite_usos - cupon.usos_actuales : '∞'}
                </p>
                <p className="text-sm text-gray-600">Usos Restantes</p>
              </div>
            </div>

            {cupon.limite_usos && (
              <div>
                <label className="text-sm font-medium text-gray-500">Porcentaje de Uso</label>
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(cupon.usos_actuales / cupon.limite_usos) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {((cupon.usos_actuales / cupon.limite_usos) * 100).toFixed(1)}% utilizado
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Historial de usos */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Usos</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingUsos ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-gray-600">Cargando usos...</p>
            </div>
          ) : usos.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No hay usos registrados para este cupón</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Ticket/Venta</TableHead>
                  <TableHead>Descuento Aplicado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usos.map((uso) => (
                  <TableRow key={uso.id}>
                    <TableCell>
                      {format(new Date(uso.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                    </TableCell>
                    <TableCell>
                      {uso.usuario ? (
                        <div>
                          <div className="font-medium">
                            {uso.usuario.nombre} {uso.usuario.apellido_paterno}
                          </div>
                          <div className="text-sm text-gray-500">{uso.usuario.email}</div>
                        </div>
                      ) : (
                        'Usuario no disponible'
                      )}
                    </TableCell>
                    <TableCell>
                      {uso.ticket ? (
                        <Link href={`/dashboard/tickets/${uso.ticket.id}`} className="text-blue-600 hover:underline">
                          Ticket #{uso.ticket.numero_ticket}
                        </Link>
                      ) : uso.venta ? (
                        <span>Venta #{uso.venta.id}</span>
                      ) : (
                        'N/A'
                      )}
                    </TableCell>
                    <TableCell className="font-semibold">
                      ${uso.monto_descuento.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
