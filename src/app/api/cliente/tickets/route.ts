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

    // Validar datos requeridos
    if (!body.modeloId || !body.direccion) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    // Obtener el estado inicial
    const estadoInicial = await prisma.estatusReparacion.findFirst({
      where: { nombre: 'Recibido' }
    });

    if (!estadoInicial) {
      return NextResponse.json(
        { error: 'No se encontró el estado inicial' },
        { status: 500 }
      );
    }

    // Crear el ticket con el dispositivo
    const ticket = await prisma.ticket.create({
      data: {
        numeroTicket: `TKT-${Date.now()}`,
        clienteId: Number(session.user.id),
        tipoServicioId: 1, // Servicio de reparación
        modeloId: Number(body.modeloId),
        descripcionProblema: body.descripcionProblema,
        estatusReparacionId: estadoInicial.id,
        creadorId: Number(session.user.id),
        dispositivos: {
          create: {
            capacidad: body.capacidad,
            color: body.color,
            fechaCompra: body.fechaCompra ? new Date(body.fechaCompra) : null,
            redCelular: body.redCelular,
            codigoDesbloqueo: body.codigoDesbloqueo,
            updatedAt: new Date()
          }
        }
      }
    });

    // Crear la dirección asociada al ticket
    await prisma.direcciones.create({
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
        tickets: { connect: { id: ticket.id } }
      }
    });

    // Obtener el ticket completo con sus relaciones
    const ticketCompleto = await prisma.ticket.findUnique({
      where: { id: ticket.id },
      include: {
        dispositivos: true,
        direcciones: true,
        cliente: true,
        modelo: {
          include: {
            marcas: true
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
            marcas: true,
          },
        },
        estatusReparacion: true,
        tecnicoAsignado: true,
        Presupuesto: true,
        pagos: {
          orderBy: {
            fecha: 'desc'
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