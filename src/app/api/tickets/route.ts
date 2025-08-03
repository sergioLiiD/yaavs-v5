import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

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
    const cliente = await prisma.clientes.findUnique({
      where: { id: clienteId }
    });

    if (!cliente) {
      return NextResponse.json(
        { error: 'Cliente no encontrado' },
        { status: 400 }
      );
    }

    // Verificar que el tipo de servicio existe
    const tipoServicio = await prisma.tipos_servicio.findUnique({
      where: { id: tipoServicioId }
    });

    if (!tipoServicio) {
      return NextResponse.json(
        { error: 'Tipo de servicio no encontrado' },
        { status: 400 }
      );
    }

    // Verificar que el modelo existe
    const modelo = await prisma.modelos.findUnique({
      where: { id: modeloId }
    });

    if (!modelo) {
      return NextResponse.json(
        { error: 'Modelo no encontrado' },
        { status: 400 }
      );
    }

    // Obtener el estatus inicial
    const estatusInicial = await prisma.estatus_reparacion.findFirst({
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
      numero_ticket: `TICK-${Date.now()}`,
      descripcion_problema: descripcionProblema,
      imei,
      capacidad,
      color,
      fecha_compra: fechaCompra ? new Date(fechaCompra) : null,
      codigo_desbloqueo: tipoDesbloqueo === 'pin' ? codigoDesbloqueo : null,
      patron_desbloqueo: tipoDesbloqueo === 'patron' ? (Array.isArray(patronDesbloqueo) ? patronDesbloqueo : []) : [],
      red_celular: redCelular,
      tipo_desbloqueo: tipoDesbloqueo,
      cliente_id: clienteId,
      tipo_servicio_id: tipoServicioId,
      modelo_id: modeloId,
      estatus_reparacion_id: estatusInicial.id,
      creador_id: session.user.id,
      updated_at: new Date()
    };
    if (puntoRecoleccionIdToUse) {
      ticketData.punto_recoleccion_id = puntoRecoleccionIdToUse;
    }

    console.log('Datos del ticket a crear:', ticketData);

    try {
      const ticket = await prisma.tickets.create({
        data: ticketData,
        include: {
          clientes: true,
          tipos_servicio: true,
          modelos: {
            include: {
              marcas: true
            }
          },
          estatus_reparacion: true,
          usuarios_tickets_creador_idTousuarios: true
        }
      });

      console.log('Ticket creado:', ticket);

      // TODO: Comentado temporalmente hasta resolver el schema de dispositivos
      // // Crear el dispositivo después
      // const dispositivo = await prisma.dispositivos.create({
      //   data: {
      //     tipo: 'Celular',
      //     marca: ticket.modelos.marcas.nombre,
      //     modelo: ticket.modelos.nombre,
      //     serie: imei as string,
      //     tickets: {
      //       connect: {
      //         id: ticket.id
      //       }
      //     }
      //   }
      // });

      // console.log('Dispositivo creado:', dispositivo);

      // // Actualizar el ticket con el dispositivo
      // const ticketActualizado = await prisma.tickets.update({
      //   where: { id: ticket.id },
      //   data: {
      //     dispositivos: {
      //       connect: {
      //         id: dispositivo.id
      //       }
      //     }
      //   },
      //   include: {
      //     clientes: true,
      //     tipos_servicio: true,
      //     modelos: {
      //       include: {
      //         marcas: true
      //       }
      //     },
      //     estatus_reparacion: true,
      //     usuarios_tickets_creador_idTousuarios: true,
      //     dispositivos: true
      //   }
      // });

      // console.log('Ticket actualizado:', ticketActualizado);

      return NextResponse.json(ticket);
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
    const limit = parseInt(searchParams.get('limit') || '20'); // Aumentar límite por defecto
    const skip = (page - 1) * limit;
    const search = searchParams.get('search') || '';

    // Construir el where según el rol y punto de recolección
    let where: Prisma.ticketsWhereInput = {};
    const userRole = session.user.role;
    const userPointId = session.user.puntoRecoleccion?.id;

    // Si es usuario de punto de recolección, solo mostrar tickets de su punto
    if ((userRole === 'ADMINISTRADOR_PUNTO' || userRole === 'USUARIO_PUNTO') && userPointId) {
      where.punto_recoleccion_id = userPointId;
    }

    // Agregar filtros de búsqueda si se proporciona un término de búsqueda
    if (search.trim()) {
      where.OR = [
        // Búsqueda por número de ticket
        {
          numero_ticket: {
            contains: search,
            mode: 'insensitive'
          }
        },
        // Búsqueda por nombre de cliente
        {
          clientes: {
            OR: [
              {
                nombre: {
                  contains: search,
                  mode: 'insensitive'
                }
              },
              {
                apellido_paterno: {
                  contains: search,
                  mode: 'insensitive'
                }
              },
              {
                apellido_materno: {
                  contains: search,
                  mode: 'insensitive'
                }
              },
              {
                telefono_celular: {
                  contains: search,
                  mode: 'insensitive'
                }
              },
              {
                email: {
                  contains: search,
                  mode: 'insensitive'
                }
              }
            ]
          }
        },
        // Búsqueda por marca/modelo del dispositivo
        {
          modelos: {
            OR: [
              {
                nombre: {
                  contains: search,
                  mode: 'insensitive'
                }
              },
              {
                marcas: {
                  nombre: {
                    contains: search,
                    mode: 'insensitive'
                  }
                }
              }
            ]
          }
        },
        // Búsqueda por IMEI
        {
          imei: {
            contains: search,
            mode: 'insensitive'
          }
        },
        // Búsqueda por descripción del problema
        {
          descripcion_problema: {
            contains: search,
            mode: 'insensitive'
          }
        },
        // Búsqueda por técnico asignado
        {
          usuarios_tickets_tecnico_asignado_idTousuarios: {
            OR: [
              {
                nombre: {
                  contains: search,
                  mode: 'insensitive'
                }
              },
              {
                apellido_paterno: {
                  contains: search,
                  mode: 'insensitive'
                }
              },
              {
                apellido_materno: {
                  contains: search,
                  mode: 'insensitive'
                }
              }
            ]
          }
        }
      ];
    }

    const [tickets, total] = await Promise.all([
      prisma.tickets.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          fecha_recepcion: 'desc'
        },
        include: {
          clientes: true,
          tipos_servicio: true,
          modelos: {
            include: {
              marcas: true
            }
          },
          estatus_reparacion: true,
          usuarios_tickets_tecnico_asignado_idTousuarios: true,
          puntos_recoleccion: {
            select: {
              id: true,
              nombre: true,
              is_repair_point: true
            }
          },
          dispositivos: true,
          usuarios_tickets_creador_idTousuarios: {
            include: {
              usuarios_roles: {
                include: {
                  roles: true
                }
              }
            }
          },
          presupuestos: {
            include: {
              conceptos_presupuesto: true
            }
          },
          pagos: true
        }
      }),
      prisma.tickets.count({ where })
    ]);

    // Calcular el saldo para cada ticket
    const ticketsConSaldo = tickets.map((ticket: any) => {
      if (ticket.presupuestos) {
        const totalPagos = ticket.pagos?.reduce((sum: number, pago: any) => sum + pago.monto, 0) || 0;
        const saldoCalculado = ticket.presupuestos.total - totalPagos;
        
        return {
          ...ticket,
          presupuestos: {
            ...ticket.presupuestos,
            saldo: Math.max(0, saldoCalculado) // El saldo no puede ser negativo
          }
        };
      }
      return ticket;
    });

    // Agregar información adicional para identificar el origen del ticket y mapear a camelCase
    const ticketsConOrigen = ticketsConSaldo.map((ticket: any) => {
      // Determinar si el ticket fue creado por un cliente
      // Los tickets creados por clientes usan el formato TKT- mientras que los del dashboard usan TICK-
      const origenCliente = ticket.numero_ticket?.startsWith('TKT-') || false;

      // Mapear los datos a formato camelCase para el frontend
      return {
        id: ticket.id,
        numeroTicket: ticket.numero_ticket,
        fechaRecepcion: ticket.fecha_recepcion,
        clienteId: ticket.cliente_id,
        tipoServicioId: ticket.tipo_servicio_id,
        modeloId: ticket.modelo_id,
        descripcionProblema: ticket.descripcion_problema,
        estatusReparacionId: ticket.estatus_reparacion_id,
        creadorId: ticket.creador_id,
        tecnicoAsignadoId: ticket.tecnico_asignado_id,
        puntoRecoleccionId: ticket.punto_recoleccion_id,
        recogida: ticket.recogida,
        fechaEntrega: ticket.fecha_entrega,
        entregado: ticket.entregado,
        cancelado: ticket.cancelado,
        motivoCancelacion: ticket.motivo_cancelacion,
        fechaInicioDiagnostico: ticket.fecha_inicio_diagnostico,
        fechaFinDiagnostico: ticket.fecha_fin_diagnostico,
        fechaInicioReparacion: ticket.fecha_inicio_reparacion,
        fechaFinReparacion: ticket.fecha_fin_reparacion,
        fechaCancelacion: ticket.fecha_cancelacion,
        direccionId: ticket.direccion_id,
        imei: ticket.imei,
        capacidad: ticket.capacidad,
        color: ticket.color,
        fechaCompra: ticket.fecha_compra,
        codigoDesbloqueo: ticket.codigo_desbloqueo,
        redCelular: ticket.red_celular,
        patronDesbloqueo: ticket.patron_desbloqueo,
        createdAt: ticket.created_at,
        updatedAt: ticket.updated_at,
        tipoDesbloqueo: ticket.tipo_desbloqueo,
        origenCliente,
        cliente: ticket.clientes ? {
          id: ticket.clientes.id,
          nombre: ticket.clientes.nombre,
          apellidoPaterno: ticket.clientes.apellido_paterno,
          apellidoMaterno: ticket.clientes.apellido_materno,
          telefonoCelular: ticket.clientes.telefono_celular,
          email: ticket.clientes.email,
          puntoRecoleccionId: ticket.clientes.punto_recoleccion_id,
          createdAt: ticket.clientes.created_at,
          updatedAt: ticket.clientes.updated_at
        } : null,
        tipoServicio: ticket.tipos_servicio ? {
          id: ticket.tipos_servicio.id,
          nombre: ticket.tipos_servicio.nombre,
          descripcion: ticket.tipos_servicio.descripcion,
          createdAt: ticket.tipos_servicio.created_at,
          updatedAt: ticket.tipos_servicio.updated_at
        } : null,
        modelo: ticket.modelos ? {
          id: ticket.modelos.id,
          nombre: ticket.modelos.nombre,
          marcaId: ticket.modelos.marca_id,
          createdAt: ticket.modelos.created_at,
          updatedAt: ticket.modelos.updated_at,
          descripcion: ticket.modelos.descripcion,
          marca: ticket.modelos.marcas ? {
            id: ticket.modelos.marcas.id,
            nombre: ticket.modelos.marcas.nombre,
            descripcion: ticket.modelos.marcas.descripcion,
            createdAt: ticket.modelos.marcas.created_at,
            updatedAt: ticket.modelos.marcas.updated_at
          } : null
        } : null,
        estatusReparacion: ticket.estatus_reparacion ? {
          id: ticket.estatus_reparacion.id,
          nombre: ticket.estatus_reparacion.nombre,
          descripcion: ticket.estatus_reparacion.descripcion,
          createdAt: ticket.estatus_reparacion.created_at,
          updatedAt: ticket.estatus_reparacion.updated_at,
          activo: ticket.estatus_reparacion.activo,
          color: ticket.estatus_reparacion.color,
          orden: ticket.estatus_reparacion.orden
        } : null,
        tecnicoAsignado: ticket.usuarios_tickets_tecnico_asignado_idTousuarios ? {
          id: ticket.usuarios_tickets_tecnico_asignado_idTousuarios.id,
          nombre: ticket.usuarios_tickets_tecnico_asignado_idTousuarios.nombre,
          apellidoPaterno: ticket.usuarios_tickets_tecnico_asignado_idTousuarios.apellido_paterno,
          apellidoMaterno: ticket.usuarios_tickets_tecnico_asignado_idTousuarios.apellido_materno,
          email: ticket.usuarios_tickets_tecnico_asignado_idTousuarios.email,
          createdAt: ticket.usuarios_tickets_tecnico_asignado_idTousuarios.created_at,
          updatedAt: ticket.usuarios_tickets_tecnico_asignado_idTousuarios.updated_at
        } : null,
        dispositivo: ticket.dispositivos ? {
          id: ticket.dispositivos.id,
          tipo: ticket.dispositivos.tipo,
          marca: ticket.dispositivos.marca,
          modelo: ticket.dispositivos.modelo,
          serie: ticket.dispositivos.serie,
          ticketId: ticket.dispositivos.ticket_id,
          createdAt: ticket.dispositivos.created_at,
          updatedAt: ticket.dispositivos.updated_at
        } : null,
        presupuesto: ticket.presupuestos ? {
          id: ticket.presupuestos.id,
          ticketId: ticket.presupuestos.ticket_id,
          total: ticket.presupuestos.total,
          descuento: ticket.presupuestos.descuento || 0,
          totalFinal: ticket.presupuestos.total_final || ticket.presupuestos.total,
          aprobado: ticket.presupuestos.autorizado || false,
          fechaAprobacion: ticket.presupuestos.fecha_autorizacion,
          fechaCreacion: ticket.presupuestos.fecha_creacion,
          createdAt: ticket.presupuestos.created_at,
          updatedAt: ticket.presupuestos.updated_at,
          saldo: ticket.presupuestos.saldo || 0,
          conceptos: ticket.presupuestos.conceptos_presupuesto?.map((concepto: any) => ({
            id: concepto.id,
            descripcion: concepto.descripcion,
            cantidad: concepto.cantidad,
            precioUnitario: concepto.precio_unitario,
            total: concepto.total,
            presupuestoId: concepto.presupuesto_id,
            createdAt: concepto.created_at,
            updatedAt: concepto.updated_at
          })) || []
        } : null,
        pagos: ticket.pagos?.map((pago: any) => ({
          id: pago.id,
          ticketId: pago.ticket_id,
          monto: pago.monto,
          metodoPago: pago.metodo_pago,
          referencia: pago.referencia,
          fecha: pago.fecha_pago,
          fechaPago: pago.fecha_pago,
          createdAt: pago.created_at,
          updatedAt: pago.updated_at
        })) || [],
        // Información del creador para determinar el origen
        creador: ticket.usuarios_tickets_creador_idTousuarios ? {
          id: ticket.usuarios_tickets_creador_idTousuarios.id,
          nombre: ticket.usuarios_tickets_creador_idTousuarios.nombre,
          apellidoPaterno: ticket.usuarios_tickets_creador_idTousuarios.apellido_paterno,
          apellidoMaterno: ticket.usuarios_tickets_creador_idTousuarios.apellido_materno,
          usuarioRoles: ticket.usuarios_tickets_creador_idTousuarios.usuarios_roles?.map((ur: any) => ({
            rol: {
              nombre: ur.roles.nombre
            }
          })) || []
        } : null,
        // Información del punto de recolección para determinar el origen
        puntoRecoleccion: ticket.puntos_recoleccion ? {
          id: ticket.puntos_recoleccion.id,
          nombre: ticket.puntos_recoleccion.nombre,
          isRepairPoint: ticket.puntos_recoleccion.is_repair_point
        } : null
      };
    });

    return NextResponse.json({
      tickets: ticketsConOrigen,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1
    });
  } catch (error) {
    console.error('Error al obtener tickets:', error);
    return NextResponse.json(
      { error: 'Error al obtener tickets' },
      { status: 500 }
    );
  }
} 