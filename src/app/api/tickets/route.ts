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

    // Determinar el punto de recolección a usar
    const userRole = session.user.role;
    const userPointId = session.user.puntoRecoleccion?.id;
    let puntoRecoleccionIdToUse = puntoRecoleccionId;
    if (userRole === 'ADMINISTRADOR_PUNTO' || userRole === 'USUARIO_PUNTO') {
      if (!userPointId) {
        return NextResponse.json({ error: 'No tienes un punto de recolección asignado' }, { status: 403 });
      }
      puntoRecoleccionIdToUse = userPointId;
    }

    // Crear el ticket primero
    const ticketData: any = {
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
    };
    if (puntoRecoleccionIdToUse) {
      ticketData.puntoRecoleccion = {
        connect: {
          id: puntoRecoleccionIdToUse
        }
      };
    }

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

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse('No autorizado', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Construir el where según el rol y punto de recolección
    let where: Prisma.TicketWhereInput = {};
    const userRole = session.user.role;
    const userPointId = session.user.puntoRecoleccion?.id;

    // Si es usuario de punto de recolección, solo mostrar tickets de su punto
    if ((userRole === 'ADMINISTRADOR_PUNTO' || userRole === 'USUARIO_PUNTO') && userPointId) {
      where.puntoRecoleccionId = userPointId;
    }

    const [tickets, total] = await Promise.all([
      prisma.ticket.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          fechaRecepcion: 'desc'
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
          tecnicoAsignado: true,
          puntoRecoleccion: {
            select: {
              id: true,
              nombre: true,
              isRepairPoint: true
            }
          },
          dispositivo: true,
          creador: {
            include: {
              usuarioRoles: {
                include: {
                  rol: true
                }
              }
            }
          },
          presupuesto: {
            include: {
              conceptos: true
            }
          },
          pagos: true
        }
      }),
      prisma.ticket.count({ where })
    ]);

    // Calcular el saldo para cada ticket
    const ticketsConSaldo = tickets.map(ticket => {
      if (ticket.presupuesto) {
        const totalPagos = ticket.pagos?.reduce((sum, pago) => sum + pago.monto, 0) || 0;
        const saldoCalculado = ticket.presupuesto.total - totalPagos;
        
        return {
          ...ticket,
          presupuesto: {
            ...ticket.presupuesto,
            saldo: Math.max(0, saldoCalculado) // El saldo no puede ser negativo
          }
        };
      }
      return ticket;
    });

    // Agregar información adicional para identificar el origen del ticket
    const ticketsConOrigen = ticketsConSaldo.map(ticket => {
      // Determinar si el ticket fue creado por un cliente
      // Los tickets creados por clientes usan el formato TKT- mientras que los del dashboard usan TICK-
      const origenCliente = ticket.numeroTicket.startsWith('TKT-');

      return {
        ...ticket,
        origenCliente
      };
    });

    return NextResponse.json({
      tickets: ticketsConOrigen,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error al obtener tickets:', error);
    return NextResponse.json(
      { error: 'Error al obtener tickets' },
      { status: 500 }
    );
  }
} 