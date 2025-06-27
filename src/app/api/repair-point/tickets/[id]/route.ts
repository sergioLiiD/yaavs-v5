import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Obtener el punto de recolección del usuario
    const userPoint = await prisma.usuarios_puntos_recoleccion.findFirst({
      where: {
        usuario_id: session.user.id
      },
      include: {
        puntos_recoleccion: true
      }
    });

    // Para ver tickets, cualquier punto de recolección puede acceder (no solo puntos de reparación)
    if (!userPoint) {
      return NextResponse.json(
        { error: 'Usuario no asociado a un punto de recolección' },
        { status: 403 }
      );
    }

    // Obtener el ticket
    const ticketRaw = await prisma.tickets.findFirst({
      where: {
        id: parseInt(params.id),
        punto_recoleccion_id: userPoint.punto_recoleccion_id,
        cancelado: false
      },
      include: {
        clientes: {
          select: {
            nombre: true,
            apellido_paterno: true,
            apellido_materno: true
          }
        },
        modelos: {
          select: {
            nombre: true,
            marcas: {
              select: {
                nombre: true
              }
            }
          }
        },
        estatus_reparacion: {
          select: {
            nombre: true
          }
        }
      }
    });

    if (!ticketRaw) {
      return NextResponse.json(
        { error: 'Ticket no encontrado' },
        { status: 404 }
      );
    }

    // Mapear los datos a formato camelCase para el frontend
    const ticket = {
      id: ticketRaw.id,
      numeroTicket: ticketRaw.numero_ticket,
      descripcionProblema: ticketRaw.descripcion_problema,
      imei: ticketRaw.imei,
      capacidad: ticketRaw.capacidad,
      color: ticketRaw.color,
      fechaCompra: ticketRaw.fecha_compra,
      tipoDesbloqueo: ticketRaw.tipo_desbloqueo,
      codigoDesbloqueo: ticketRaw.codigo_desbloqueo,
      patronDesbloqueo: ticketRaw.patron_desbloqueo,
      redCelular: ticketRaw.red_celular,
      cancelado: ticketRaw.cancelado,
      createdAt: ticketRaw.created_at,
      updatedAt: ticketRaw.updated_at,
      clienteId: ticketRaw.cliente_id,
      modeloId: ticketRaw.modelo_id,
      creadorId: ticketRaw.creador_id,
      estatusReparacionId: ticketRaw.estatus_reparacion_id,
      puntoRecoleccionId: ticketRaw.punto_recoleccion_id,
      tipoServicioId: ticketRaw.tipo_servicio_id,
      // Agregar información sobre si el punto puede realizar reparaciones
      canRepair: userPoint.puntos_recoleccion.is_repair_point,
      cliente: ticketRaw.clientes ? {
        nombre: ticketRaw.clientes.nombre,
        apellidoPaterno: ticketRaw.clientes.apellido_paterno,
        apellidoMaterno: ticketRaw.clientes.apellido_materno
      } : null,
      modelo: ticketRaw.modelos ? {
        nombre: ticketRaw.modelos.nombre,
        marca: ticketRaw.modelos.marcas ? {
          nombre: ticketRaw.modelos.marcas.nombre
        } : null
      } : null,
      estatusReparacion: ticketRaw.estatus_reparacion ? {
        nombre: ticketRaw.estatus_reparacion.nombre
      } : null
    };

    return NextResponse.json(ticket);
  } catch (error) {
    console.error('Error al obtener ticket:', error);
    return NextResponse.json(
      { error: 'Error al obtener ticket' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Obtener el punto de reparación del usuario
    const userPoint = await prisma.usuarios_puntos_recoleccion.findFirst({
      where: {
        usuario_id: session.user.id
      },
      include: {
        puntos_recoleccion: true
      }
    });

    // Para editar tickets, SOLO los puntos de reparación pueden hacerlo
    if (!userPoint || !userPoint.puntos_recoleccion.is_repair_point) {
      return NextResponse.json(
        { error: 'Usuario no autorizado para realizar reparaciones' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Verificar que el ticket existe y pertenece al punto de reparación
    const ticket = await prisma.tickets.findFirst({
      where: {
        id: parseInt(params.id),
        punto_recoleccion_id: userPoint.punto_recoleccion_id,
        cancelado: false
      }
    });

    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket no encontrado' },
        { status: 404 }
      );
    }

    // Actualizar el ticket
    const updatedTicketRaw = await prisma.tickets.update({
      where: {
        id: parseInt(params.id)
      },
      data: {
        estatus_reparacion_id: body.estatusReparacionId,
        updated_at: new Date()
      },
      include: {
        clientes: {
          select: {
            nombre: true,
            apellido_paterno: true,
            apellido_materno: true
          }
        },
        modelos: {
          select: {
            nombre: true,
            marcas: {
              select: {
                nombre: true
              }
            }
          }
        },
        estatus_reparacion: {
          select: {
            nombre: true
          }
        }
      }
    });

    // Mapear los datos a formato camelCase para el frontend
    const updatedTicket = {
      id: updatedTicketRaw.id,
      numeroTicket: updatedTicketRaw.numero_ticket,
      descripcionProblema: updatedTicketRaw.descripcion_problema,
      imei: updatedTicketRaw.imei,
      capacidad: updatedTicketRaw.capacidad,
      color: updatedTicketRaw.color,
      fechaCompra: updatedTicketRaw.fecha_compra,
      tipoDesbloqueo: updatedTicketRaw.tipo_desbloqueo,
      codigoDesbloqueo: updatedTicketRaw.codigo_desbloqueo,
      patronDesbloqueo: updatedTicketRaw.patron_desbloqueo,
      redCelular: updatedTicketRaw.red_celular,
      cancelado: updatedTicketRaw.cancelado,
      createdAt: updatedTicketRaw.created_at,
      updatedAt: updatedTicketRaw.updated_at,
      clienteId: updatedTicketRaw.cliente_id,
      modeloId: updatedTicketRaw.modelo_id,
      creadorId: updatedTicketRaw.creador_id,
      estatusReparacionId: updatedTicketRaw.estatus_reparacion_id,
      puntoRecoleccionId: updatedTicketRaw.punto_recoleccion_id,
      tipoServicioId: updatedTicketRaw.tipo_servicio_id,
      cliente: updatedTicketRaw.clientes ? {
        nombre: updatedTicketRaw.clientes.nombre,
        apellidoPaterno: updatedTicketRaw.clientes.apellido_paterno,
        apellidoMaterno: updatedTicketRaw.clientes.apellido_materno
      } : null,
      modelo: updatedTicketRaw.modelos ? {
        nombre: updatedTicketRaw.modelos.nombre,
        marca: updatedTicketRaw.modelos.marcas ? {
          nombre: updatedTicketRaw.modelos.marcas.nombre
        } : null
      } : null,
      estatusReparacion: updatedTicketRaw.estatus_reparacion ? {
        nombre: updatedTicketRaw.estatus_reparacion.nombre
      } : null
    };

    return NextResponse.json(updatedTicket);
  } catch (error) {
    console.error('Error al actualizar ticket:', error);
    return NextResponse.json(
      { error: 'Error al actualizar ticket' },
      { status: 500 }
    );
  }
} 