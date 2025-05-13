import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Prisma } from '@prisma/client';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('=== INICIO DE LA CONSULTA ===');
    console.log('ID del ticket:', params.id);
    
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      console.log('No hay sesión de usuario');
      return new NextResponse('No autorizado', { status: 401 });
    }
    console.log('Usuario autenticado:', session.user);

    // 1. Verificar el ticket básico
    console.log('1. Verificando ticket básico...');
    const ticketBasico = await prisma.ticket.findUnique({
      where: { id: parseInt(params.id) },
      select: {
        id: true,
        tecnicoAsignadoId: true
      }
    });
    console.log('Ticket básico:', ticketBasico);

    if (!ticketBasico) {
      console.log('Ticket no encontrado');
      return new NextResponse('Ticket no encontrado', { status: 404 });
    }

    // 2. Verificar la reparación
    console.log('2. Verificando reparación...');
    const reparacion = await prisma.reparacion.findUnique({
      where: { ticketId: parseInt(params.id) },
      include: {
        tecnico: true
      }
    });
    console.log('Reparación:', reparacion);

    // 3. Obtener el ticket completo
    console.log('3. Obteniendo ticket completo...');
    const ticket = await prisma.ticket.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        cliente: true,
        tipoServicio: true,
        modelo: {
          include: {
            marca: true,
          },
        },
        estatusReparacion: true,
        reparacion: {
          include: {
            tecnico: true,
            checklistItems: true
          }
        },
        tecnicoAsignado: true,
        dispositivo: true,
        creador: true,
      },
    });

    console.log('=== FIN DE LA CONSULTA ===');
    console.log('Ticket completo:', JSON.stringify(ticket, null, 2));

    if (!ticket) {
      console.log('Error al obtener el ticket completo');
      return new NextResponse('Error al obtener el ticket', { status: 500 });
    }

    return NextResponse.json(ticket);
  } catch (error) {
    console.error('=== ERROR DETALLADO ===');
    console.error('Error completo:', error);
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error('Error de Prisma:', {
        code: error.code,
        message: error.message,
        meta: error.meta
      });
      return new NextResponse(
        `Error de base de datos: ${error.message}`,
        { status: 500 }
      );
    }
    
    return new NextResponse(
      `Error interno del servidor: ${error instanceof Error ? error.message : 'Error desconocido'}`,
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('No autorizado', { status: 401 });
    }

    const body = await request.json();
    const { 
      descripcion,
      tecnicoAsignadoId,
      estatusReparacionId,
      diagnostico,
      imei,
      capacidad,
      color,
      fechaCompra,
      codigoDesbloqueo,
      redCelular
    } = body;

    // Primero, obtener el ticket actual para verificar que existe
    const ticketExistente = await prisma.ticket.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        dispositivo: true
      }
    });

    if (!ticketExistente) {
      return new NextResponse('Ticket no encontrado', { status: 404 });
    }

    // Actualizar el ticket
    const ticket = await prisma.ticket.update({
      where: { id: parseInt(params.id) },
      data: {
        descripcion,
        tecnicoAsignadoId: parseInt(tecnicoAsignadoId),
        estatusReparacionId: parseInt(estatusReparacionId),
      },
    });

    // Actualizar el dispositivo si existe, o crearlo si no existe
    if (ticketExistente.dispositivo) {
      await prisma.dispositivo.update({
        where: { id: ticketExistente.dispositivo.id },
        data: {
          imei,
          capacidad,
          color,
          fechaCompra: fechaCompra ? new Date(fechaCompra) : null,
          codigoDesbloqueo,
          redCelular,
        },
      });
    } else {
      await prisma.dispositivo.create({
        data: {
          imei,
          capacidad,
          color,
          fechaCompra: fechaCompra ? new Date(fechaCompra) : null,
          codigoDesbloqueo,
          redCelular,
          ticketId: ticket.id,
        },
      });
    }

    // Actualizar o crear la reparación si hay diagnóstico
    if (diagnostico) {
      await prisma.reparacion.upsert({
        where: { ticketId: ticket.id },
        update: {
          diagnostico,
        },
        create: {
          ticketId: ticket.id,
          tecnicoId: parseInt(session.user.id),
          diagnostico,
        },
      });
    }

    return NextResponse.json(ticket);
  } catch (error) {
    console.error('Error al actualizar el ticket:', error);
    return new NextResponse(`Error interno del servidor: ${error instanceof Error ? error.message : 'Error desconocido'}`, { status: 500 });
  }
} 