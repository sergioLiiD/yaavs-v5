import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    console.log('Sesión:', session);

    if (!session?.user) {
      console.log('No hay sesión de usuario');
      return new NextResponse('No autorizado', { status: 401 });
    }

    const data = await request.json();
    console.log('Datos recibidos:', data);

    const {
      clienteId,
      tipoServicioId,
      modeloId,
      descripcionProblema,
      capacidad,
      color,
      fechaCompra,
      codigoDesbloqueo,
      redCelular,
      imei,
    } = data;

    // Convertir IDs a números
    const clienteIdNum = parseInt(clienteId);
    const tipoServicioIdNum = parseInt(tipoServicioId);
    const modeloIdNum = parseInt(modeloId);

    if (isNaN(clienteIdNum) || isNaN(tipoServicioIdNum) || isNaN(modeloIdNum)) {
      return new NextResponse('IDs inválidos', { status: 400 });
    }

    // Obtener el estatus inicial
    const estatusInicial = await prisma.estatusReparacion.findFirst({
      where: { nombre: 'Recibido' }
    });

    if (!estatusInicial) {
      console.log('No se encontró el estatus inicial');
      return new NextResponse('No se encontró el estatus inicial', { status: 500 });
    }

    console.log('Estatus inicial encontrado:', estatusInicial);

    // Crear el dispositivo primero
    const dispositivo = await prisma.dispositivos.create({
      data: {
        capacidad,
        color,
        fechaCompra: fechaCompra ? new Date(fechaCompra) : null,
        codigoDesbloqueo,
        redCelular,
        updatedAt: new Date()
      }
    });

    console.log('Dispositivo creado:', dispositivo);

    // Crear el ticket
    const ticket = await prisma.ticket.create({
      data: {
        numeroTicket: `TICK-${Date.now()}`,
        clienteId: clienteIdNum,
        tipoServicioId: tipoServicioIdNum,
        modeloId: modeloIdNum,
        descripcionProblema,
        estatusReparacionId: estatusInicial.id,
        creadorId: session.user.id,
        imei,
        dispositivos: {
          connect: {
            id: dispositivo.id
          }
        }
      },
      include: {
        dispositivos: true
      }
    });

    console.log('Ticket creado:', ticket);
    return NextResponse.json(ticket);
  } catch (error) {
    console.error('Error al crear el ticket:', error);
    if (error instanceof Error) {
      return new NextResponse(`Error al crear el ticket: ${error.message}`, { status: 500 });
    }
    return new NextResponse('Error interno del servidor', { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    console.log('Sesión:', session);

    if (!session?.user) {
      console.log('No hay sesión de usuario');
      return new NextResponse('No autorizado', { status: 401 });
    }

    const tickets = await prisma.ticket.findMany({
      where: {
        cancelado: false
      },
      include: {
        cliente: {
          select: {
            id: true,
            nombre: true,
            apellidoPaterno: true,
            apellidoMaterno: true,
            telefonoCelular: true,
            email: true
          }
        },
        modelo: {
          include: {
            marcas: true
          }
        },
        tipoServicio: true,
        estatusReparacion: true,
        tecnicoAsignado: {
          select: {
            id: true,
            nombre: true,
            apellidoPaterno: true,
            apellidoMaterno: true
          }
        },
        creador: {
          select: {
            id: true,
            nombre: true
          }
        },
        dispositivos: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log('Tickets encontrados:', tickets.length);
    console.log('Primer ticket:', JSON.stringify(tickets[0], null, 2));

    return NextResponse.json(tickets);
  } catch (error) {
    console.error('Error al obtener tickets:', error);
    return new NextResponse('Error interno del servidor', { status: 500 });
  }
} 