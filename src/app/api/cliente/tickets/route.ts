import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db/prisma';

export async function POST(req: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await req.json();
    console.log('Datos recibidos:', body);
    console.log('Datos de desbloqueo:', {
      tipoDesbloqueo: body.tipoDesbloqueo,
      codigoDesbloqueo: body.codigoDesbloqueo,
      patronDesbloqueo: body.patronDesbloqueo
    });

    // Validar datos requeridos
    if (!body.modeloId) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    // Validar datos de desbloqueo
    if (body.tipoDesbloqueo === 'pin' && !body.codigoDesbloqueo) {
      console.log('Error: PIN requerido pero no proporcionado');
      return NextResponse.json(
        { error: 'El código de desbloqueo es requerido cuando el tipo es PIN' },
        { status: 400 }
      );
    }

    if (body.tipoDesbloqueo === 'patron' && (!body.patronDesbloqueo || body.patronDesbloqueo.length === 0)) {
      console.log('Error: Patrón requerido pero no proporcionado');
      return NextResponse.json(
        { error: 'El patrón de desbloqueo es requerido cuando el tipo es patrón' },
        { status: 400 }
      );
    }

    // Obtener el estado inicial (RECIBIDO)
    const estadoInicial = await prisma.estatusReparacion.findFirst({
      where: {
        nombre: 'Recibido'
      }
    });

    if (!estadoInicial) {
      console.error('No se encontró el estado Recibido');
      return NextResponse.json(
        { error: 'Error al obtener el estado inicial' },
        { status: 500 }
      );
    }

    console.log('Estado inicial encontrado:', estadoInicial);

    // Obtener el modelo para obtener la marca
    const modelo = await prisma.modelo.findUnique({
      where: { id: Number(body.modeloId) },
      include: { marca: true }
    });

    if (!modelo) {
      return NextResponse.json(
        { error: 'Modelo no encontrado' },
        { status: 404 }
      );
    }

    // Crear el ticket
    const ticket = await prisma.ticket.create({
      data: {
        numeroTicket: `TKT-${Date.now()}`,
        clienteId: Number(session.user.id),
        tipoServicioId: 1, // Servicio de reparación
        modeloId: Number(body.modeloId),
        descripcionProblema: body.descripcionProblema,
        estatusReparacionId: estadoInicial.id, // Usar el ID del estado Recibido
        creadorId: Number(session.user.id),
        capacidad: body.capacidad,
        color: body.color,
        fechaCompra: body.fechaCompra ? new Date(body.fechaCompra) : null,
        tipoDesbloqueo: body.tipoDesbloqueo,
        codigoDesbloqueo: body.tipoDesbloqueo === 'pin' ? body.codigoDesbloqueo : null,
        patronDesbloqueo: body.tipoDesbloqueo === 'patron' ? body.patronDesbloqueo : [],
        redCelular: body.redCelular,
        dispositivo: {
          create: {
            tipo: 'Smartphone',
            marca: 'Apple',
            modelo: 'iPhone 16 Pro',
            updatedAt: new Date()
          }
        }
      }
    });

    console.log('Ticket creado:', ticket);

    // Crear la dirección solo si el tipo de recolección es domicilio
    if (body.tipoRecoleccion === 'domicilio' && body.direccion) {
      await prisma.direccion.create({
        data: {
          calle: body.direccion.calle,
          numeroExterior: body.direccion.numeroExterior,
          numeroInterior: body.direccion.numeroInterior,
          colonia: body.direccion.colonia,
          ciudad: body.direccion.ciudad,
          estado: body.direccion.estado,
          codigoPostal: body.direccion.codigoPostal,
          latitud: body.direccion.latitud,
          longitud: body.direccion.longitud,
          cliente: {
            connect: {
              id: Number(session.user.id)
            }
          },
          tickets: { connect: { id: ticket.id } },
          updatedAt: new Date()
        }
      });
    }

    // Obtener el ticket completo con sus relaciones
    const ticketCompleto = await prisma.ticket.findUnique({
      where: { id: ticket.id },
      include: {
        dispositivo: true,
        direccion: true,
        cliente: true,
        modelo: {
          include: {
            marca: true
          }
        },
        estatusReparacion: true
      }
    });

    return NextResponse.json(ticketCompleto);
  } catch (error) {
    console.error('Error al crear ticket:', error);
    return NextResponse.json(
      { error: `Error al crear ticket: ${error instanceof Error ? error.message : 'Error desconocido'}` },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Obtener los tickets del cliente
    const tickets = await prisma.ticket.findMany({
      where: {
        clienteId: Number(session.user.id)
      },
      include: {
        tipoServicio: true,
        modelo: {
          include: {
            marca: true,
          },
        },
        estatusReparacion: true,
        tecnicoAsignado: true,
        presupuesto: true,
        reparacion: true,
        dispositivo: true,
        pagos: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(tickets);
  } catch (error) {
    console.error('Error al obtener tickets:', error);
    return NextResponse.json(
      { error: 'Error al obtener tickets' },
      { status: 500 }
    );
  }
} 