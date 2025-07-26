import { Metadata } from 'next';
import { ClienteTicketsTable } from '@/components/cliente/ClienteTicketsTable';
import { Toaster } from 'sonner';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { ClienteService } from '@/services/clienteService';
import { redirect } from "next/navigation";
import prisma from "@/lib/db/prisma";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";
import { HiArrowLeft } from "react-icons/hi";

export const metadata: Metadata = {
  title: 'Mis Tickets | arregla.mx',
  description: 'Gestiona tus tickets de servicio',
};

export default async function ClienteTicketsPage() {
  const cookieStore = cookies();
  const token = cookieStore.get('cliente_token');

  if (!token) {
    redirect("/cliente/login");
  }

  const decoded = await verifyToken(token.value);
  if (!decoded || !decoded.id) {
    redirect("/cliente/login");
  }

  const cliente = await ClienteService.findById(decoded.id);
  if (!cliente) {
    redirect("/cliente/login");
  }

  const tickets = await prisma.tickets.findMany({
    where: {
      cliente_id: cliente.id,
    },
    include: {
      modelos: {
        include: {
          marcas: true,
        },
      },
      estatus_reparacion: true,
      presupuestos: true,
      pagos: {
        orderBy: {
          created_at: "desc",
        },
      },
    },
    orderBy: {
      created_at: "desc",
    },
  });

  // Mapear los datos a formato camelCase para el frontend
  const ticketsMapeados = tickets.map((ticket: any) => ({
    id: ticket.id,
    numeroTicket: ticket.numero_ticket,
    clienteId: ticket.cliente_id,
    tipoServicioId: ticket.tipo_servicio_id,
    modeloId: ticket.modelo_id,
    descripcionProblema: ticket.descripcion_problema,
    estatusReparacionId: ticket.estatus_reparacion_id,
    creadorId: ticket.creador_id,
    tecnicoAsignadoId: ticket.tecnico_asignado_id,
    puntoRecoleccionId: ticket.punto_recoleccion_id,
    recogida: ticket.recogida,
    fechaEntrega: ticket.fecha_entrega,
    entregado: ticket.entregado,
    cancelado: ticket.cancelado,
    motivoCancelacion: ticket.motivo_cancelacion,
    fechaInicioDiagnostico: ticket.fecha_inicio_diagnostico,
    fechaFinDiagnostico: ticket.fecha_fin_diagnostico,
    fechaInicioReparacion: ticket.fecha_inicio_reparacion,
    fechaFinReparacion: ticket.fecha_fin_reparacion,
    fechaCancelacion: ticket.fecha_cancelacion,
    direccionId: ticket.direccion_id,
    imei: ticket.imei,
    capacidad: ticket.capacidad,
    color: ticket.color,
    fechaCompra: ticket.fecha_compra,
    codigoDesbloqueo: ticket.codigo_desbloqueo,
    redCelular: ticket.red_celular,
    patronDesbloqueo: ticket.patron_desbloqueo,
    createdAt: ticket.created_at,
    updatedAt: ticket.updated_at,
    tipoDesbloqueo: ticket.tipo_desbloqueo,
    modelo: ticket.modelos ? {
      id: ticket.modelos.id,
      nombre: ticket.modelos.nombre,
      marcaId: ticket.modelos.marca_id,
      createdAt: ticket.modelos.created_at,
      updatedAt: ticket.modelos.updated_at,
      descripcion: ticket.modelos.descripcion,
      marca: ticket.modelos.marcas ? {
        id: ticket.modelos.marcas.id,
        nombre: ticket.modelos.marcas.nombre,
        descripcion: ticket.modelos.marcas.descripcion,
        createdAt: ticket.modelos.marcas.created_at,
        updatedAt: ticket.modelos.marcas.updated_at
      } : null
    } : null,
    estatusReparacion: ticket.estatus_reparacion ? {
      id: ticket.estatus_reparacion.id,
      nombre: ticket.estatus_reparacion.nombre,
      descripcion: ticket.estatus_reparacion.descripcion,
      createdAt: ticket.estatus_reparacion.created_at,
      updatedAt: ticket.estatus_reparacion.updated_at,
      activo: ticket.estatus_reparacion.activo,
      color: ticket.estatus_reparacion.color,
      orden: ticket.estatus_reparacion.orden
    } : null,
    presupuesto: ticket.presupuestos ? {
      id: ticket.presupuestos.id,
      ticketId: ticket.presupuestos.ticket_id,
      totalFinal: ticket.presupuestos.total_final,
      fechaCreacion: ticket.presupuestos.fecha_creacion,
      fechaAutorizacion: ticket.presupuestos.fecha_autorizacion,
      autorizado: ticket.presupuestos.autorizado,
      createdAt: ticket.presupuestos.created_at,
      updatedAt: ticket.presupuestos.updated_at
    } : null,
    pagos: ticket.pagos?.map((pago: any) => ({
      id: pago.id,
      ticketId: pago.ticket_id,
      monto: pago.monto,
      metodoPago: pago.metodo_pago,
      referencia: pago.referencia,
      fechaPago: pago.fecha_pago,
      createdAt: pago.created_at,
      updatedAt: pago.updated_at
    })) || []
  }));

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Mis Tickets</h1>
        <div className="flex gap-4">
          <Link href="/cliente">
            <Button variant="outline" className="flex items-center gap-2">
              <HiArrowLeft className="h-4 w-4" />
              Volver al Inicio
            </Button>
          </Link>
          <Link href="/cliente/nuevo-ticket">
            <Button>Nuevo Ticket</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ticketsMapeados.map((ticket) => (
          <Card key={ticket.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-start">
                <span>{ticket.numeroTicket}</span>
                <span
                  className="px-2 py-1 text-xs rounded-full"
                  style={{
                    backgroundColor: `${ticket.estatusReparacion?.color || '#000'}20`,
                    color: ticket.estatusReparacion?.color || '#000',
                  }}
                >
                  {ticket.estatusReparacion?.nombre}
                </span>
              </CardTitle>
              <CardDescription>
                {format(new Date(ticket.createdAt), "PPP", { locale: es })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p>
                  <span className="font-semibold">Dispositivo:</span>{" "}
                  {ticket.modelo?.marca?.nombre} {ticket.modelo?.nombre}
                </p>
                <p>
                  <span className="font-semibold">Problema:</span>{" "}
                  {ticket.descripcionProblema}
                </p>
                {ticket.presupuesto && (
                  <p>
                    <span className="font-semibold">Presupuesto:</span>{" "}
                    ${ticket.presupuesto.totalFinal.toFixed(2)}
                  </p>
                )}
                {ticket.pagos && ticket.pagos.length > 0 && (
                  <p>
                    <span className="font-semibold">Último pago:</span>{" "}
                    ${ticket.pagos[0].monto.toFixed(2)} -{" "}
                    {format(new Date(ticket.pagos[0].createdAt), "PPP", {
                      locale: es,
                    })}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Toaster />
    </div>
  );
} 