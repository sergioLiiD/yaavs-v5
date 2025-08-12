"use client"

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { PlusIcon, MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline'
import { cuponService } from '@/services/cuponService'
import { Cupon, CuponFilters, TipoCupon } from '@/types/cupon'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import Link from 'next/link'

export default function CuponesPage() {
  const [filters, setFilters] = useState<CuponFilters>({})
  const [showFilters, setShowFilters] = useState(false)

  const { data: cupones = [], isLoading, refetch } = useQuery({
    queryKey: ['cupones', filters],
    queryFn: () => cuponService.getCupones(filters),
  })

  const handleFilterChange = (key: keyof CuponFilters, value: string | boolean | undefined) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const clearFilters = () => {
    setFilters({})
  }

  const getStatusBadge = (cupon: Cupon) => {
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

  const formatDescuento = (cupon: Cupon) => {
    if (cupon.tipo_descuento === 'PORCENTAJE') {
      return `${cupon.valor_descuento}%`
    }
    return `$${cupon.valor_descuento.toFixed(2)}`
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Cupones</h1>
          <p className="text-gray-600">Gestiona los cupones de descuento</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FunnelIcon className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          <Link href="/dashboard/cupones/crear">
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              Crear Cupón
            </Button>
          </Link>
        </div>
      </div>

      {/* Filtros */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Buscar</label>
                <Input
                  placeholder="Código o nombre..."
                  value={filters.search || ''}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tipo</label>
                <Select
                  value={filters.tipo || ''}
                  onValueChange={(value) => handleFilterChange('tipo', value || undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los tipos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos los tipos</SelectItem>
                    <SelectItem value="GENERAL">General</SelectItem>
                    <SelectItem value="PERSONALIZADO">Personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Estado</label>
                <Select
                  value={filters.activo?.toString() || ''}
                  onValueChange={(value) => handleFilterChange('activo', value === 'true' ? true : value === 'false' ? false : undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los estados" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos los estados</SelectItem>
                    <SelectItem value="true">Activo</SelectItem>
                    <SelectItem value="false">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button variant="outline" onClick={clearFilters}>
                  Limpiar Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabla de cupones */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Cupones</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-gray-600">Cargando cupones...</p>
            </div>
          ) : cupones.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No se encontraron cupones</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Descuento</TableHead>
                  <TableHead>Usos</TableHead>
                  <TableHead>Expira</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cupones.map((cupon) => (
                  <TableRow key={cupon.id}>
                    <TableCell className="font-mono">{cupon.codigo}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{cupon.nombre}</div>
                        {cupon.descripcion && (
                          <div className="text-sm text-gray-500">{cupon.descripcion}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={cupon.tipo === 'GENERAL' ? 'default' : 'secondary'}>
                        {cupon.tipo === 'GENERAL' ? 'General' : 'Personalizado'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{formatDescuento(cupon)}</div>
                      {cupon.monto_minimo && cupon.monto_minimo > 0 && (
                        <div className="text-sm text-gray-500">
                          Mín. ${cupon.monto_minimo.toFixed(2)}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {cupon.usos_actuales}
                      {cupon.limite_usos && ` / ${cupon.limite_usos}`}
                    </TableCell>
                    <TableCell>
                      {format(new Date(cupon.fecha_expiracion), 'dd/MM/yyyy', { locale: es })}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(cupon)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Link href={`/dashboard/cupones/${cupon.id}`}>
                          <Button variant="outline" size="sm">
                            Ver
                          </Button>
                        </Link>
                        <Link href={`/dashboard/cupones/${cupon.id}/editar`}>
                          <Button variant="outline" size="sm">
                            Editar
                          </Button>
                        </Link>
                      </div>
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
