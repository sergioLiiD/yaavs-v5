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
    if (!body.modeloId) {
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
        dispositivo: {
          create: {
            tipo: 'Smartphone',
            marca: modelo.marca.nombre,
            modelo: modelo.nombre,
            serie: body.imei,
            updatedAt: new Date()
          }
        }
      }
    });

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