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
      patronDesbloqueo,
      redCelular,
      imei,
      puntoRecoleccionId,
      marcaId,
      tipoDesbloqueo
    } = data;

    // Validar datos requeridos
    if (!clienteId || !tipoServicioId || !modeloId || !descripcionProblema) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    // Verificar que el cliente existe
    const cliente = await prisma.cliente.findUnique({
      where: { id: clienteId }
    });

    if (!cliente) {
      return NextResponse.json(
        { error: 'Cliente no encontrado' },
        { status: 400 }
      );
    }

    // Verificar que el tipo de servicio existe
    const tipoServicio = await prisma.tipoServicio.findUnique({
      where: { id: tipoServicioId }
    });

    if (!tipoServicio) {
      return NextResponse.json(
        { error: 'Tipo de servicio no encontrado' },
        { status: 400 }
      );
    }

    // Verificar que el modelo existe
    const modelo = await prisma.modelo.findUnique({
      where: { id: modeloId }
    });

    if (!modelo) {
      return NextResponse.json(
        { error: 'Modelo no encontrado' },
        { status: 400 }
      );
    }

    // Obtener el estatus inicial
    const estatusInicial = await prisma.estatusReparacion.findFirst({
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

    // Crear el ticket primero
    const ticketData = {
      numeroTicket: `TICK-${Date.now()}`,
      descripcionProblema,
      imei,
      capacidad,
      color,
      fechaCompra: fechaCompra ? new Date(fechaCompra) : null,
      codigoDesbloqueo: tipoDesbloqueo === 'pin' ? codigoDesbloqueo : null,
      patronDesbloqueo: tipoDesbloqueo === 'patron' ? (Array.isArray(patronDesbloqueo) ? patronDesbloqueo : []) : [],
      redCelular,
      cliente: {
        connect: {
          id: clienteId
        }
      },
      tipoServicio: {
        connect: {
          id: tipoServicioId
        }
      },
      modelo: {
        connect: {
          id: modeloId
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

    console.log('Datos del ticket a crear:', ticketData);

    try {
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

      console.log('Ticket creado:', ticket);

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

      console.log('Dispositivo creado:', dispositivo);

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

      console.log('Ticket actualizado:', ticketActualizado);

      return NextResponse.json(ticketActualizado);
    } catch (error) {
      console.error('Error en la creación del ticket:', error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        return NextResponse.json(
          { error: `Error de base de datos: ${error.message}` },
          { status: 500 }
        );
      }
      return NextResponse.json(
        { error: 'Error al crear el ticket' },
        { status: 500 }
      );
    }
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
        // Quitamos el filtro de cancelado para mostrar todos los tickets
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

    // Calcular el saldo para cada ticket
    const ticketsConSaldo = tickets.map(ticket => {
      if (ticket.presupuesto) {
        const totalPagado = ticket.pagos?.reduce((sum, pago) => sum + pago.monto, 0) || 0;
        const saldo = ticket.presupuesto.total - totalPagado;
        return {
          ...ticket,
          presupuesto: {
            ...ticket.presupuesto,
            saldo
          }
        };
      }
      return ticket;
    });

    console.log('Tickets encontrados:', ticketsConSaldo.length);
    console.log('Primer ticket:', JSON.stringify(ticketsConSaldo[0], null, 2));
    console.log('=== FIN DE CONSULTA DE TICKETS ===');

    return NextResponse.json(ticketsConSaldo);
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