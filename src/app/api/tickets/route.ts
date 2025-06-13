import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

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
      puntoRecoleccionId
    } = data;

    // Validar datos requeridos
    if (!clienteId || !tipoServicioId || !modeloId || !descripcionProblema) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    // Convertir IDs a números
    const clienteIdNum = parseInt(clienteId as string);
    const tipoServicioIdNum = parseInt(tipoServicioId as string);
    const modeloIdNum = parseInt(modeloId as string);

    // Validar que los IDs sean números válidos
    if (isNaN(clienteIdNum) || isNaN(tipoServicioIdNum) || isNaN(modeloIdNum)) {
      return NextResponse.json(
        { error: 'IDs inválidos' },
        { status: 400 }
      );
    }

    // Verificar que el cliente existe
    const cliente = await prisma.cliente.findUnique({
      where: { id: clienteIdNum }
    });

    if (!cliente) {
      return NextResponse.json(
        { error: 'Cliente no encontrado' },
        { status: 400 }
      );
    }

    // Verificar que el tipo de servicio existe
    const tipoServicio = await prisma.tipoServicio.findUnique({
      where: { id: tipoServicioIdNum }
    });

    if (!tipoServicio) {
      return NextResponse.json(
        { error: 'Tipo de servicio no encontrado' },
        { status: 400 }
      );
    }

    // Verificar que el modelo existe
    const modelo = await prisma.modelo.findUnique({
      where: { id: modeloIdNum }
    });

    if (!modelo) {
      return NextResponse.json(
        { error: 'Modelo no encontrado' },
        { status: 400 }
      );
    }

    // Obtener el estatus inicial
    const estatusInicial = await prisma.estatusReparacion.findFirst({
      where: { nombre: 'Recibido' }
    });

    if (!estatusInicial) {
      return NextResponse.json(
        { error: 'No se encontró el estatus inicial' },
        { status: 500 }
      );
    }

    // Crear el dispositivo
    const dispositivo = await prisma.dispositivo.create({
      data: {
        capacidad: capacidad as string,
        color: color as string,
        fechaCompra: fechaCompra ? new Date(fechaCompra as string) : null,
        codigoDesbloqueo: codigoDesbloqueo as string,
        redCelular: redCelular as string,
        updatedAt: new Date()
      }
    });

    // Crear el ticket
    const ticketData = {
      numeroTicket: `TICK-${Date.now()}`,
      descripcionProblema,
      imei,
      capacidad,
      color,
      fechaCompra: fechaCompra ? new Date(fechaCompra as string) : null,
      codigoDesbloqueo,
      redCelular,
      cliente: {
        connect: {
          id: clienteIdNum
        }
      },
      tipoServicio: {
        connect: {
          id: tipoServicioIdNum
        }
      },
      modelo: {
        connect: {
          id: modeloIdNum
        }
      },
      estatusReparacion: {
        connect: {
          id: estatusInicial.id
        }
      },
      creador: {
        connect: {
          id: session.user.id
        }
      },
      dispositivo: {
        connect: {
          id: dispositivo.id
        }
      }
    } as Prisma.TicketCreateInput;

    if (puntoRecoleccionId) {
      Object.assign(ticketData, {
        puntoRecoleccion: {
          connect: {
            id: parseInt(puntoRecoleccionId as string)
          }
        }
      });
    }

    const ticket = await prisma.ticket.create({
      data: ticketData,
      include: {
        cliente: true,
        tipoServicio: true,
        modelo: {
          include: {
            marca: true
          }
        },
        estatusReparacion: true,
        creador: true,
        dispositivo: true
      }
    });

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
            marca: true
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
        dispositivo: true
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