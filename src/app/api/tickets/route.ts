import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('No autorizado', { status: 401 });
    }

    const body = await req.json();
    console.log('Datos recibidos en la API:', body);

    const {
      clienteId,
      tipoServicioId,
      modeloId,
      descripcionProblema,
      tecnicoAsignadoId,
      capacidad,
      color,
      fechaCompra,
      codigoDesbloqueo,
      redCelular,
      esReparacionDirecta = false,
    } = body;

    // Validar datos requeridos
    if (!clienteId || !tipoServicioId || !modeloId) {
      return new NextResponse('Faltan campos requeridos', { status: 400 });
    }

    // Convertir IDs a números
    const clienteIdNum = parseInt(clienteId);
    const tipoServicioIdNum = parseInt(tipoServicioId);
    const modeloIdNum = parseInt(modeloId);
    const tecnicoAsignadoIdNum = tecnicoAsignadoId ? parseInt(tecnicoAsignadoId) : null;

    // Obtener el estado inicial según el tipo de reparación
    const estatusReparacion = await prisma.estatusReparacion.findFirst({
      where: { 
        nombre: esReparacionDirecta ? 'En Reparación' : 'Recibido'
      }
    });

    if (!estatusReparacion) {
      return new NextResponse('No se encontró el estado inicial', { status: 500 });
    }

    // Crear el ticket
    const ticket = await prisma.ticket.create({
      data: {
        numeroTicket: `TKT-${Date.now()}`,
        clienteId: clienteIdNum,
        tipoServicioId: tipoServicioIdNum,
        modeloId: modeloIdNum,
        descripcionProblema: descripcionProblema || '',
        estatusReparacionId: estatusReparacion.id,
        creadorId: Number(session.user.id),
        tecnicoAsignadoId: tecnicoAsignadoIdNum,
      },
    });

    // Crear el dispositivo asociado al ticket
    await prisma.dispositivos.create({
      data: {
        capacidad,
        color,
        fechaCompra: fechaCompra ? new Date(fechaCompra) : null,
        codigoDesbloqueo,
        redCelular,
        ticketId: ticket.id,
        updatedAt: new Date()
      },
    });

    // Si es reparación directa, crear la reparación inmediatamente
    if (esReparacionDirecta) {
      await prisma.reparacion.create({
        data: {
          ticketId: ticket.id,
          tecnicoId: Number(session.user.id),
          fechaInicio: new Date(),
          updatedAt: new Date()
        },
      });
    }

    return NextResponse.json(ticket);
  } catch (error) {
    console.error('Error al crear ticket:', error);
    return NextResponse.json(
      { error: `Error al crear ticket: ${error instanceof Error ? error.message : 'Error desconocido'}` },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const tecnicoId = searchParams.get('tecnicoId');

    const tickets = await prisma.ticket.findMany({
      where: {
        ...(tecnicoId ? { tecnicoAsignadoId: parseInt(tecnicoId) } : {}),
      },
      include: {
        cliente: true,
        tipoServicio: true,
        modelo: {
          include: {
            marcas: true,
          },
        },
        estatusReparacion: {
          select: {
            id: true,
            nombre: true,
            color: true
          }
        },
        creador: {
          select: {
            id: true,
            nombre: true,
            apellidoPaterno: true,
            apellidoMaterno: true
          }
        },
        tecnicoAsignado: {
          select: {
            id: true,
            nombre: true,
            apellidoPaterno: true,
            apellidoMaterno: true
          }
        },
        Presupuesto: true,
        pagos: {
          orderBy: {
            fecha: 'desc'
          }
        },
        Reparacion: true,
        TicketProblema: true,
        dispositivos: true,
        entregas: true,
        direcciones: true
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