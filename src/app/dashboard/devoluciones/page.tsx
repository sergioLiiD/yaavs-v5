'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import RouteGuard from '@/components/route-guard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { RefreshCw, CheckCircle2, XCircle, Clock, DollarSign, User, FileText, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Devolucion {
  id: number;
  pagoId: number;
  ticketId: number;
  monto: number;
  motivo: string | null;
  estado: 'PENDIENTE' | 'COMPLETADA' | 'CANCELADA';
  fechaDevolucion: string | null;
  usuarioId: number;
  observaciones: string | null;
  createdAt: string;
  updatedAt: string;
  pago: {
    id: number;
    monto: number;
    metodo: string;
    referencia: string | null;
    createdAt: string;
    estado: string;
  } | null;
  ticket: {
    id: number;
    numeroTicket: string;
    fechaRecepcion: string;
    motivoCancelacion: string | null;
    fechaCancelacion: string | null;
    cliente: {
      id: number;
      nombre: string;
      apellidoPaterno: string;
      apellidoMaterno: string;
      telefonoCelular: string | null;
      email: string | null;
      nombreCompleto: string;
    } | null;
    canceladoPor: {
      id: number;
      nombre: string;
    } | null;
  } | null;
  usuario: {
    id: number;
    nombre: string;
    email: string;
  } | null;
}

interface DevolucionesResponse {
  devoluciones: Devolucion[];
  total: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  totales: {
    pendientes: {
      cantidad: number;
      montoTotal: number;
    };
  };
}

export default function DevolucionesPage() {
  const { data: session } = useSession();
  const [devoluciones, setDevoluciones] = useState<Devolucion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [estadoFiltro, setEstadoFiltro] = useState<string>('PENDIENTE');
  const [totales, setTotales] = useState({ cantidad: 0, montoTotal: 0 });
  const [devolucionSeleccionada, setDevolucionSeleccionada] = useState<Devolucion | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [nuevoEstado, setNuevoEstado] = useState<string>('COMPLETADA');
  const [observaciones, setObservaciones] = useState<string>('');
  const [actualizando, setActualizando] = useState(false);

  const fetchDevoluciones = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/devoluciones?estado=${estadoFiltro}&page=1&limit=100`);
      
      if (!response.ok) {
        throw new Error('Error al obtener devoluciones');
      }

      const data: DevolucionesResponse = await response.json();
      setDevoluciones(data.devoluciones);
      setTotales(data.totales.pendientes);
    } catch (error: any) {
      console.error('Error al cargar devoluciones:', error);
      setError(error.message);
      toast.error('Error al cargar devoluciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchDevoluciones();
    }
  }, [session, estadoFiltro]);

  const handleActualizarEstado = async () => {
    if (!devolucionSeleccionada) return;

    try {
      setActualizando(true);
      
      const response = await fetch(`/api/devoluciones/${devolucionSeleccionada.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          estado: nuevoEstado,
          observaciones: observaciones || null,
          fechaDevolucion: nuevoEstado === 'COMPLETADA' ? new Date().toISOString() : null
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detalles || 'Error al actualizar devolución');
      }

      toast.success(`Devolución marcada como ${nuevoEstado === 'COMPLETADA' ? 'completada' : nuevoEstado.toLowerCase()}`);
      setIsDialogOpen(false);
      setDevolucionSeleccionada(null);
      setObservaciones('');
      fetchDevoluciones();
    } catch (error: any) {
      console.error('Error al actualizar devolución:', error);
      toast.error(error.message || 'Error al actualizar devolución');
    } finally {
      setActualizando(false);
    }
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'PENDIENTE':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200"><Clock className="w-3 h-3 mr-1" />Pendiente</Badge>;
      case 'COMPLETADA':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><CheckCircle2 className="w-3 h-3 mr-1" />Completada</Badge>;
      case 'CANCELADA':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200"><XCircle className="w-3 h-3 mr-1" />Cancelada</Badge>;
      default:
        return <Badge variant="outline">{estado}</Badge>;
    }
  };

  if (loading) {
    return (
      <RouteGuard requiredPermissions={[]} section="Devoluciones">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-[#FEBF19]" />
        </div>
      </RouteGuard>
    );
  }

  return (
    <RouteGuard requiredPermissions={[]} section="Devoluciones">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Devoluciones</h1>
            <p className="text-gray-600">Gestión de devoluciones de anticipos por cancelación de tickets</p>
          </div>
          <Button onClick={fetchDevoluciones} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
        </div>

        {/* Resumen de devoluciones pendientes */}
        {estadoFiltro === 'PENDIENTE' && totales.cantidad > 0 && (
          <Card className="bg-yellow-50 border-yellow-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-yellow-700" />
                <span className="text-yellow-900">Resumen de Devoluciones Pendientes</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-6">
                <div>
                  <p className="text-sm text-yellow-700">Total de devoluciones pendientes</p>
                  <p className="text-2xl font-bold text-yellow-900">{totales.cantidad}</p>
                </div>
                <div>
                  <p className="text-sm text-yellow-700">Monto total a devolver</p>
                  <p className="text-2xl font-bold text-yellow-900">${totales.montoTotal.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Label htmlFor="estado">Estado:</Label>
              <Select value={estadoFiltro} onValueChange={setEstadoFiltro}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDIENTE">Pendientes</SelectItem>
                  <SelectItem value="COMPLETADA">Completadas</SelectItem>
                  <SelectItem value="CANCELADA">Canceladas</SelectItem>
                  <SelectItem value="TODAS">Todas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Lista de devoluciones */}
        {error ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-red-600">{error}</p>
            </CardContent>
          </Card>
        ) : devoluciones.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-gray-500 text-center py-8">
                No hay devoluciones {estadoFiltro !== 'TODAS' ? estadoFiltro.toLowerCase() : ''} registradas
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {devoluciones.map((devolucion) => (
              <Card key={devolucion.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <CardTitle className="text-lg">Devolución #{devolucion.id}</CardTitle>
                        {getEstadoBadge(devolucion.estado)}
                      </div>
                      <CardDescription>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="flex items-center space-x-1">
                            <DollarSign className="w-4 h-4" />
                            <span className="font-semibold">${devolucion.monto.toFixed(2)}</span>
                          </span>
                          {devolucion.ticket && (
                            <span className="flex items-center space-x-1">
                              <FileText className="w-4 h-4" />
                              <span>Ticket: {devolucion.ticket.numeroTicket}</span>
                            </span>
                          )}
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{format(new Date(devolucion.createdAt), "dd 'de' MMMM, yyyy", { locale: es })}</span>
                          </span>
                        </div>
                      </CardDescription>
                    </div>
                    {devolucion.estado === 'PENDIENTE' && (
                      <Button
                        onClick={() => {
                          setDevolucionSeleccionada(devolucion);
                          setNuevoEstado('COMPLETADA');
                          setObservaciones('');
                          setIsDialogOpen(true);
                        }}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Marcar como Completada
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-sm text-gray-700 mb-2">Información del Cliente</h4>
                      {devolucion.ticket?.cliente ? (
                        <div className="space-y-1 text-sm">
                          <p><span className="font-medium">Cliente:</span> {devolucion.ticket.cliente.nombreCompleto}</p>
                          {devolucion.ticket.cliente.telefonoCelular && (
                            <p><span className="font-medium">Teléfono:</span> {devolucion.ticket.cliente.telefonoCelular}</p>
                          )}
                          {devolucion.ticket.cliente.email && (
                            <p><span className="font-medium">Email:</span> {devolucion.ticket.cliente.email}</p>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">No disponible</p>
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-gray-700 mb-2">Información del Pago</h4>
                      {devolucion.pago ? (
                        <div className="space-y-1 text-sm">
                          <p><span className="font-medium">Método:</span> {devolucion.pago.metodo}</p>
                          {devolucion.pago.referencia && (
                            <p><span className="font-medium">Referencia:</span> {devolucion.pago.referencia}</p>
                          )}
                          <p><span className="font-medium">Fecha de pago:</span> {format(new Date(devolucion.pago.createdAt), "dd/MM/yyyy", { locale: es })}</p>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">No disponible</p>
                      )}
                    </div>
                    {devolucion.motivo && (
                      <div className="md:col-span-2">
                        <h4 className="font-semibold text-sm text-gray-700 mb-2">Motivo</h4>
                        <p className="text-sm text-gray-600">{devolucion.motivo}</p>
                      </div>
                    )}
                    {devolucion.observaciones && (
                      <div className="md:col-span-2">
                        <h4 className="font-semibold text-sm text-gray-700 mb-2">Observaciones</h4>
                        <p className="text-sm text-gray-600">{devolucion.observaciones}</p>
                      </div>
                    )}
                    {devolucion.fechaDevolucion && (
                      <div>
                        <h4 className="font-semibold text-sm text-gray-700 mb-2">Fecha de Devolución</h4>
                        <p className="text-sm">{format(new Date(devolucion.fechaDevolucion), "dd 'de' MMMM, yyyy", { locale: es })}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Dialog para actualizar estado */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Actualizar Estado de Devolución</DialogTitle>
              <DialogDescription>
                Marca esta devolución como completada o cancelada
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="estado">Nuevo Estado</Label>
                <Select value={nuevoEstado} onValueChange={setNuevoEstado}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="COMPLETADA">Completada</SelectItem>
                    <SelectItem value="CANCELADA">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="observaciones">Observaciones (opcional)</Label>
                <Textarea
                  id="observaciones"
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  rows={4}
                  placeholder="Ej: Devolución realizada en efectivo, transferencia realizada, etc."
                />
              </div>
              {devolucionSeleccionada && (
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Monto a devolver:</span> ${devolucionSeleccionada.monto.toFixed(2)}
                  </p>
                  {devolucionSeleccionada.ticket?.cliente && (
                    <p className="text-sm text-gray-600 mt-1">
                      <span className="font-medium">Cliente:</span> {devolucionSeleccionada.ticket.cliente.nombreCompleto}
                    </p>
                  )}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={actualizando}>
                Cancelar
              </Button>
              <Button onClick={handleActualizarEstado} disabled={actualizando}>
                {actualizando ? 'Actualizando...' : 'Confirmar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </RouteGuard>
  );
}

