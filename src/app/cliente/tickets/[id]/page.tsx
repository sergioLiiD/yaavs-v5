'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { HiArrowLeft } from 'react-icons/hi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

interface Ticket {
  id: number;
  numeroTicket: string;
  cliente: {
    nombre: string;
    apellidoPaterno: string;
    apellidoMaterno?: string;
    calle: string;
    numeroExterior: string;
    numeroInterior?: string;
    colonia: string;
    ciudad: string;
    estado: string;
    codigoPostal: string;
  };
  tipoServicio: {
    nombre: string;
  };
  modelo: {
    nombre: string;
    marca: {
      nombre: string;
    };
  };
  estatusReparacion: {
    nombre: string;
    id: number;
  };
  tecnicoAsignado: {
    nombre: string;
  } | null;
  fechaRecepcion: string;
  descripcionProblema: string | null;
  dispositivos: {
    capacidad: string;
    color: string;
    fechaCompra: string;
    redCelular: string;
    codigoDesbloqueo: string;
  } | null;
  recogida: boolean;
  presupuesto?: {
    total: number;
    anticipo: number;
    saldo: number;
    conceptos: {
      id: number;
      descripcion: string;
      cantidad: number;
      precioUnitario: number;
      subtotal: number;
    }[];
    aprobado: boolean;
    fechaAprobacion?: string;
  };
  pagos?: {
    monto: number;
    fecha: string;
    concepto: string;
    metodoPago: string;
  }[];
  cancelado: boolean;
  motivoCancelacion?: string;
  fechaCancelacion?: string;
}

export default function TicketDetailPage({ params }: { params: { id: string } }) {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [aprobarLoading, setAprobarLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const response = await fetch(`/api/cliente/tickets/${params.id}`);
        if (!response.ok) {
          throw new Error('Error al cargar el ticket');
        }
        const data = await response.json();
        console.log('Ticket cargado:', data);
        console.log('Estado del ticket:', data.estatusReparacion);
        console.log('Presupuesto:', data.presupuesto);
        setTicket(data);
      } catch (error) {
        console.error('Error:', error);
        toast.error('Error al cargar el ticket');
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [params.id]);

  const handleAprobarPresupuesto = async () => {
    try {
      setAprobarLoading(true);
      const response = await fetch(`/api/cliente/tickets/${params.id}/aprobar`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Error al aprobar el presupuesto');
      }

      const data = await response.json();
      setTicket(data);
      toast.success('Presupuesto aprobado correctamente');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al aprobar el presupuesto');
    } finally {
      setAprobarLoading(false);
    }
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!ticket) {
    return <div>Ticket no encontrado</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mr-4"
        >
          <HiArrowLeft className="h-5 w-5 mr-2" />
          Volver
        </Button>
        <h1 className="text-2xl font-bold">
          Ticket #{ticket.numeroTicket}
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Información del Cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg">
              {ticket.cliente.nombre} {ticket.cliente.apellidoPaterno} {ticket.cliente.apellidoMaterno}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Información del Equipo</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg">
              {ticket.modelo?.marca?.nombre 
                ? `${ticket.modelo.marca.nombre} ${ticket.modelo.nombre}`
                : 'Modelo no disponible'}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Capacidad: {ticket.dispositivos?.capacidad || 'No disponible'}
            </p>
            <p className="text-sm text-gray-600">
              Color: {ticket.dispositivos?.color || 'No disponible'}
            </p>
            <p className="text-sm text-gray-600">
              Fecha de compra: {ticket.dispositivos?.fechaCompra ? new Date(ticket.dispositivos.fechaCompra).toLocaleDateString() : 'No disponible'}
            </p>
            <p className="text-sm text-gray-600">
              Red celular: {ticket.dispositivos?.redCelular || 'No disponible'}
            </p>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Descripción del Problema</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg">{ticket.descripcionProblema}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {ticket.recogida ? 'Estado de Envío' : 'Dirección de Recolección'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {ticket.recogida ? (
              <div className="space-y-2">
                <p className="text-lg text-gray-600">
                  Enviado por paquetería por el cliente
                </p>
                <p className="text-sm text-gray-500">
                  No se requiere recolección en domicilio
                </p>
              </div>
            ) : (
              <>
                <p className="text-lg">
                  {ticket.cliente.calle} {ticket.cliente.numeroExterior}
                  {ticket.cliente.numeroInterior ? ` Int. ${ticket.cliente.numeroInterior}` : ''}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  {ticket.cliente.colonia}
                </p>
                <p className="text-sm text-gray-600">
                  {ticket.cliente.ciudad}, {ticket.cliente.estado}
                </p>
                <p className="text-sm text-gray-600">
                  CP: {ticket.cliente.codigoPostal}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estado del Ticket</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg">
              <span className={`inline-flex items-center rounded-md px-2 py-1 text-sm font-medium ${
                ticket.cancelado 
                  ? 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20'
                  : 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20'
              }`}>
                {ticket.estatusReparacion.nombre}
              </span>
            </p>
            {ticket.tecnicoAsignado && (
              <p className="text-sm text-gray-600 mt-2">
                Técnico asignado: {ticket.tecnicoAsignado.nombre}
              </p>
            )}
            {ticket.cancelado && (
              <>
                <p className="text-sm text-red-600 mt-2">
                  Motivo de cancelación: {ticket.motivoCancelacion}
                </p>
                <p className="text-sm text-red-600">
                  Fecha de cancelación: {new Date(ticket.fechaCancelacion!).toLocaleDateString()}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {ticket.presupuesto && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Presupuesto</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Resumen de totales */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="text-lg font-semibold">${ticket.presupuesto.total.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Anticipo</p>
                    <p className="text-lg font-semibold">${ticket.presupuesto.anticipo.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Saldo</p>
                    <p className="text-lg font-semibold">${ticket.presupuesto.saldo.toFixed(2)}</p>
                  </div>
                </div>

                {/* Botón de aprobación */}
                {ticket.estatusReparacion.nombre === 'Presupuesto Generado' && !ticket.presupuesto.aprobado && (
                  <div className="mt-6 flex justify-end">
                    <Button
                      onClick={handleAprobarPresupuesto}
                      disabled={aprobarLoading}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {aprobarLoading ? 'Aprobando...' : 'Aprobar Presupuesto'}
                    </Button>
                  </div>
                )}

                {ticket.presupuesto.aprobado && (
                  <div className="mt-4 p-4 bg-green-50 rounded-md">
                    <p className="text-green-700 font-medium">
                      Presupuesto aprobado el {new Date(ticket.presupuesto.fechaAprobacion!).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {ticket.pagos && ticket.pagos.length > 0 && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Historial de Pagos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {ticket.pagos.map((pago, index) => (
                  <div key={index} className="flex justify-between items-center border-b pb-2">
                    <div>
                      <p className="font-medium">{pago.concepto}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(pago.fecha).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${pago.monto}</p>
                      <p className="text-sm text-gray-600">{pago.metodoPago}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 