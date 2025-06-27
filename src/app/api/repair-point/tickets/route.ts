import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Si es ADMINISTRADOR, mostrar todos los tickets
    if (session.user.role === 'ADMINISTRADOR') {
      const ticketsRaw = await prisma.tickets.findMany({
        where: {
          cancelado: false
        },
        include: {
          clientes: true,
          modelos: {
            include: {
              marcas: true
            }
          },
          estatus_reparacion: true,
          puntos_recoleccion: {
            select: {
              is_repair_point: true
            }
          }
        },
        orderBy: {
          created_at: 'desc'
        }
      });

      // Mapear los datos a formato camelCase para el frontend
      const tickets = ticketsRaw.map((ticket: any) => ({
        id: ticket.id,
        numeroTicket: ticket.numero_ticket,
        fechaRecepcion: ticket.fecha_recepcion,
        descripcionProblema: ticket.descripcion_problema,
        imei: ticket.imei,
        capacidad: ticket.capacidad,
        color: ticket.color,
        fechaCompra: ticket.fecha_compra,
        tipoDesbloqueo: ticket.tipo_desbloqueo,
        codigoDesbloqueo: ticket.codigo_desbloqueo,
        patronDesbloqueo: ticket.patron_desbloqueo,
        redCelular: ticket.red_celular,
        cancelado: ticket.cancelado,
        createdAt: ticket.created_at,
        updatedAt: ticket.updated_at,
        clienteId: ticket.cliente_id,
        modeloId: ticket.modelo_id,
        creadorId: ticket.creador_id,
        estatusReparacionId: ticket.estatus_reparacion_id,
        puntoRecoleccionId: ticket.punto_recoleccion_id,
        tipoServicioId: ticket.tipo_servicio_id,
        cliente: ticket.clientes ? {
          id: ticket.clientes.id,
          nombre: ticket.clientes.nombre,
          apellidoPaterno: ticket.clientes.apellido_paterno,
          apellidoMaterno: ticket.clientes.apellido_materno,
          email: ticket.clientes.email,
          telefonoCelular: ticket.clientes.telefono_celular
        } : null,
        modelo: ticket.modelos ? {
          id: ticket.modelos.id,
          nombre: ticket.modelos.nombre,
          marcaId: ticket.modelos.marca_id,
          marca: ticket.modelos.marcas ? {
            id: ticket.modelos.marcas.id,
            nombre: ticket.modelos.marcas.nombre
          } : null
        } : null,
        estatusReparacion: ticket.estatus_reparacion ? {
          id: ticket.estatus_reparacion.id,
          nombre: ticket.estatus_reparacion.nombre,
          descripcion: ticket.estatus_reparacion.descripcion,
          color: ticket.estatus_reparacion.color
        } : null,
        puntoRecoleccion: ticket.puntos_recoleccion ? {
          isRepairPoint: ticket.puntos_recoleccion.is_repair_point
        } : null
      }));

      return NextResponse.json(tickets);
    }

    // Para otros roles, usar el punto de recolección de la sesión
    const userPointId = session.user.puntoRecoleccion?.id;
    
    if (!userPointId) {
      return NextResponse.json(
        { error: 'Usuario no asociado a un punto de recolección' },
        { status: 403 }
      );
    }

    // Obtener los tickets asociados al punto de recolección
    const ticketsRaw = await prisma.tickets.findMany({
      where: {
        punto_recoleccion_id: userPointId,
        cancelado: false
      },
      include: {
        clientes: true,
        modelos: {
          include: {
            marcas: true
          }
        },
        estatus_reparacion: true,
        puntos_recoleccion: {
          select: {
            is_repair_point: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    // Mapear los datos a formato camelCase para el frontend
    const tickets = ticketsRaw.map((ticket: any) => ({
      id: ticket.id,
      numeroTicket: ticket.numero_ticket,
      fechaRecepcion: ticket.fecha_recepcion,
      descripcionProblema: ticket.descripcion_problema,
      imei: ticket.imei,
      capacidad: ticket.capacidad,
      color: ticket.color,
      fechaCompra: ticket.fecha_compra,
      tipoDesbloqueo: ticket.tipo_desbloqueo,
      codigoDesbloqueo: ticket.codigo_desbloqueo,
      patronDesbloqueo: ticket.patron_desbloqueo,
      redCelular: ticket.red_celular,
      cancelado: ticket.cancelado,
      createdAt: ticket.created_at,
      updatedAt: ticket.updated_at,
      clienteId: ticket.cliente_id,
      modeloId: ticket.modelo_id,
      creadorId: ticket.creador_id,
      estatusReparacionId: ticket.estatus_reparacion_id,
      puntoRecoleccionId: ticket.punto_recoleccion_id,
      tipoServicioId: ticket.tipo_servicio_id,
      cliente: ticket.clientes ? {
        id: ticket.clientes.id,
        nombre: ticket.clientes.nombre,
        apellidoPaterno: ticket.clientes.apellido_paterno,
        apellidoMaterno: ticket.clientes.apellido_materno,
        email: ticket.clientes.email,
        telefonoCelular: ticket.clientes.telefono_celular
      } : null,
      modelo: ticket.modelos ? {
        id: ticket.modelos.id,
        nombre: ticket.modelos.nombre,
        marcaId: ticket.modelos.marca_id,
        marca: ticket.modelos.marcas ? {
          id: ticket.modelos.marcas.id,
          nombre: ticket.modelos.marcas.nombre
        } : null
      } : null,
      estatusReparacion: ticket.estatus_reparacion ? {
        id: ticket.estatus_reparacion.id,
        nombre: ticket.estatus_reparacion.nombre,
        descripcion: ticket.estatus_reparacion.descripcion,
        color: ticket.estatus_reparacion.color
      } : null,
      puntoRecoleccion: ticket.puntos_recoleccion ? {
        isRepairPoint: ticket.puntos_recoleccion.is_repair_point
      } : null
    }));

    return NextResponse.json(tickets);
  } catch (error) {
    console.error('Error al obtener tickets:', error);
    return NextResponse.json(
      { error: 'Error al obtener tickets' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Obtener el punto de recolección del usuario desde la sesión
    const userPointId = session.user.puntoRecoleccion?.id;
    
    if (!userPointId) {
      return NextResponse.json(
        { error: 'Usuario no asociado a un punto de recolección' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Obtener el estatus inicial "Recibido"
    const estatusInicial = await prisma.estatus_reparacion.findFirst({
      where: { 
        nombre: 'Recibido',
        activo: true
      }
    });

    if (!estatusInicial) {
      console.error('No se encontró el estatus inicial "Recibido"');
      return NextResponse.json(
        { error: 'No se encontró el estatus inicial' },
        { status: 500 }
      );
    }

    console.log('Estatus inicial encontrado:', estatusInicial);

    // Crear el ticket
    const ticketRaw = await prisma.tickets.create({
      data: {
        numero_ticket: `TICK-${Date.now()}`,
        fecha_recepcion: new Date(),
        descripcion_problema: body.descripcionProblema,
        imei: body.imei,
        capacidad: body.capacidad,
        color: body.color,
        fecha_compra: body.fechaCompra ? new Date(body.fechaCompra) : null,
        tipo_desbloqueo: body.tipoDesbloqueo,
        codigo_desbloqueo: body.tipoDesbloqueo === 'pin' ? body.codigoDesbloqueo : null,
        patron_desbloqueo: body.tipoDesbloqueo === 'patron' ? body.patronDesbloqueo.map(Number) : [],
        red_celular: body.redCelular,
        cancelado: false,
        cliente_id: parseInt(body.clienteId),
        modelo_id: parseInt(body.modeloId),
        creador_id: session.user.id,
        estatus_reparacion_id: estatusInicial.id,
        punto_recoleccion_id: userPointId,
        tipo_servicio_id: parseInt(body.tipoServicioId) || 1,
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    // Mapear a formato camelCase para el frontend
    const ticket = {
      id: ticketRaw.id,
      numeroTicket: ticketRaw.numero_ticket,
      fechaRecepcion: ticketRaw.fecha_recepcion,
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
      tipoServicioId: ticketRaw.tipo_servicio_id
    };

    console.log('Ticket creado:', ticket);

    return NextResponse.json(ticket);
  } catch (error) {
    console.error('Error al crear ticket:', error);
    return NextResponse.json(
      { error: 'Error al crear ticket' },
      { status: 500 }
    );
  }
} 