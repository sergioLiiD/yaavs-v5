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

    // Crear el ticket primero
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
        creador: true
      }
    });

    // Crear el dispositivo después
    const dispositivo = await prisma.dispositivo.create({
      data: {
        tipo: 'Celular',
        marca: ticket.modelo.marca.nombre,
        modelo: ticket.modelo.nombre,
        serie: imei as string,
        ticket: {
          connect: {
            id: ticket.id
          }
        }
      }
    });

    // Actualizar el ticket con el dispositivo
    const ticketActualizado = await prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        dispositivo: {
          connect: {
            id: dispositivo.id
          }
        }
      },
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

    return NextResponse.json(ticketActualizado);
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
    console.log('=== INICIO DE CONSULTA DE TICKETS ===');
    const session = await getServerSession(authOptions);
    console.log('Sesión:', session);

    if (!session?.user) {
      console.log('No hay sesión de usuario');
      return new NextResponse('No autorizado', { status: 401 });
    }

    console.log('Usuario autenticado:', session.user);

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
        dispositivo: {
          select: {
            id: true,
            ticketId: true,
            tipo: true,
            marca: true,
            modelo: true,
            serie: true,
            createdAt: true,
            updatedAt: true
          }
        },
        presupuesto: {
          include: {
            conceptos: true
          }
        },
        pagos: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log('Tickets encontrados:', tickets.length);
    console.log('Primer ticket:', JSON.stringify(tickets[0], null, 2));
    console.log('=== FIN DE CONSULTA DE TICKETS ===');

    return NextResponse.json(tickets);
  } catch (error) {
    console.error('=== ERROR EN CONSULTA DE TICKETS ===');
    console.error('Error completo:', error);
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error('Error de Prisma:', {
        code: error.code,
        message: error.message,
        meta: error.meta
      });
      return new NextResponse(
        JSON.stringify({ 
          error: 'Error de base de datos',
          details: error.message
        }), 
        { 
          status: 500,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }
    
    return new NextResponse(
      JSON.stringify({ 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      }), 
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
} 