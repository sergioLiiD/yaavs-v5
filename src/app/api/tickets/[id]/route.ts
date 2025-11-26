import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('=== INICIO DE LA CONSULTA ===');
    console.log('ID del ticket:', params.id);
    
    const session = await getServerSession(authOptions);
    console.log('Session completa:', session);
    console.log('Session user:', session?.user);
    
    if (!session?.user) {
      console.log('No hay sesión de usuario');
      return new NextResponse('No autorizado', { status: 401 });
    }
    
    console.log('Usuario autenticado:', session.user);

    // 1. Verificar el ticket básico
    console.log('1. Verificando ticket básico...');
    const ticketBasico = await prisma.tickets.findUnique({
      where: { id: parseInt(params.id) },
      select: {
        id: true,
        tecnico_asignado_id: true,
        codigo_desbloqueo: true
      }
    });
    console.log('Ticket básico:', ticketBasico);

    if (!ticketBasico) {
      console.log('Ticket no encontrado');
      return new NextResponse('Ticket no encontrado', { status: 404 });
    }

    // 2. Verificar la reparación
    console.log('2. Verificando reparación...');
    const reparacion = await prisma.reparaciones.findUnique({
      where: { ticket_id: parseInt(params.id) },
      include: {
        checklist_diagnostico: true
      }
    });
    console.log('Reparación:', reparacion);

    // 3. Obtener el ticket completo
    console.log('3. Obteniendo ticket completo...');
    const ticket = await prisma.tickets.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        clientes: true,
        tipos_servicio: true,
        modelos: {
          include: {
            marcas: true
          }
        },
        estatus_reparacion: true,
        usuarios_tickets_creador_idTousuarios: true,
        usuarios_tickets_tecnico_asignado_idTousuarios: true,
        presupuestos: {
          include: {
            conceptos_presupuesto: true
          }
        },
        reparaciones: {
          include: {
            checklist_diagnostico: {
              include: {
                checklist_respuesta_diagnostico: {
                  include: {
                    checklist_items: true
                  }
                }
              }
            },
            checklist_reparacion: {
              include: {
                checklist_respuesta_reparacion: {
                  include: {
                    checklist_items: true
                  }
                }
              }
            },
            piezas_reparacion: {
              include: {
                piezas: true
              }
            }
          }
        },
        dispositivos: true,
        entregas: true,
        pagos: true
      }
    });

    console.log('=== FIN DE LA CONSULTA ===');
    console.log('Ticket completo:', JSON.stringify(ticket, null, 2));
    console.log('=== DEBUG PRESUPUESTO ===');
    console.log('Presupuesto del ticket:', ticket?.presupuestos);
    console.log('Presupuesto total:', ticket?.presupuestos?.total);
    console.log('Pagos del ticket:', ticket?.pagos);

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
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Validar permisos: ADMINISTRADOR o TICKETS_EDIT
    const userRole = session.user.role;
    const userPermissions = session.user.permissions || [];
    
    if (userRole !== 'ADMINISTRADOR' && !userPermissions.includes('TICKETS_EDIT')) {
      return NextResponse.json(
        { error: 'No tienes permisos para editar tickets' },
        { status: 403 }
      );
    }

    const data = await req.json();
    console.log('Datos recibidos para actualización:', data);

    // Si hay presupuesto, actualizar el estado a "Presupuesto Generado"
    if (data.presupuesto) {
      console.log('Presupuesto detectado, buscando estado...');
      const estatusPresupuesto = await prisma.estatus_reparacion.findFirst({
        where: {
          nombre: 'Presupuesto Generado'
        }
      });

      console.log('Estado encontrado:', estatusPresupuesto);

      if (!estatusPresupuesto) {
        return NextResponse.json(
          { error: 'Estado "Presupuesto Generado" no encontrado' },
          { status: 404 }
        );
      }

      // Asegurarnos de que el estado se actualice
      data.estatusReparacionId = estatusPresupuesto.id;
      console.log('Estado actualizado a:', estatusPresupuesto.id);
    }

    // Actualizar el ticket
    const updatedTicket = await prisma.tickets.update({
      where: { id: parseInt(params.id) },
      data: {
        descripcion_problema: data.descripcionProblema,
        tecnico_asignado_id: data.tecnicoAsignadoId ? parseInt(data.tecnicoAsignadoId) : undefined,
        estatus_reparacion_id: data.estatusReparacionId ? parseInt(data.estatusReparacionId) : undefined,
        tipo_desbloqueo: data.tipoDesbloqueo,
        codigo_desbloqueo: data.codigoDesbloqueo,
        patron_desbloqueo: data.patronDesbloqueo,
        capacidad: data.capacidad,
        red_celular: data.redCelular,
        color: data.color,
        imei: data.imei,
        fecha_compra: data.fechaCompra ? new Date(data.fechaCompra) : undefined,
        updated_at: new Date()
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
        usuarios_tickets_creador_idTousuarios: true,
        usuarios_tickets_tecnico_asignado_idTousuarios: true,
        presupuestos: {
          include: {
            conceptos_presupuesto: true
          }
        },
        reparaciones: {
          include: {
            checklist_diagnostico: {
              include: {
                checklist_respuesta_diagnostico: {
                  include: {
                    checklist_items: true
                  }
                }
              }
            },
            checklist_reparacion: {
              include: {
                checklist_respuesta_reparacion: {
                  include: {
                    checklist_items: true
                  }
                }
              }
            },
            piezas_reparacion: {
              include: {
                piezas: true
              }
            }
          }
        },
        dispositivos: true,
        entregas: true,
        pagos: true
      }
    });

    return NextResponse.json(updatedTicket);
  } catch (error) {
    console.error('Error al actualizar el ticket:', error);
    return NextResponse.json(
      { error: 'Error al actualizar el ticket' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('=== INICIO DE CANCELACIÓN DE TICKET ===');
    console.log('ID del ticket:', params.id);

    const session = await getServerSession(authOptions);
    if (!session?.user) {
      console.log('No hay sesión de usuario');
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }
    console.log('Usuario autenticado:', session.user);

    // VALIDACIÓN 1: Verificar que el usuario sea ADMINISTRADOR
    const userRole = session.user.role;
    if (userRole !== 'ADMINISTRADOR') {
      console.log('Usuario no es administrador:', userRole);
      return NextResponse.json(
        { error: 'Solo los administradores pueden cancelar tickets' },
        { status: 403 }
      );
    }

    // Obtener el cuerpo de la solicitud
    const body = await request.json();
    console.log('Cuerpo de la solicitud:', body);
    
    const { motivoCancelacion } = body;

    if (!motivoCancelacion || motivoCancelacion.trim() === '') {
      console.log('No se proporcionó motivo de cancelación');
      return NextResponse.json(
        { error: 'Se requiere un motivo de cancelación' },
        { status: 400 }
      );
    }

    // Verificar si el ticket existe y obtener sus pagos
    const ticket = await prisma.tickets.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        dispositivos: true,
        reparaciones: true,
        pagos: {
          where: {
            estado: 'ACTIVO' // Solo procesar pagos activos
          }
        }
      }
    });

    if (!ticket) {
      console.log('Ticket no encontrado');
      return NextResponse.json(
        { error: 'Ticket no encontrado' },
        { status: 404 }
      );
    }

    // Verificar si el ticket ya está cancelado
    if (ticket.cancelado) {
      console.log('Ticket ya está cancelado');
      return NextResponse.json(
        { error: 'El ticket ya está cancelado' },
        { status: 400 }
      );
    }

    // Obtener el estado de cancelado
    const estadoCancelado = await prisma.estatus_reparacion.findFirst({
      where: { nombre: 'Cancelado' }
    });

    if (!estadoCancelado) {
      console.log('No se encontró el estado de cancelado');
      return NextResponse.json(
        { error: 'No se encontró el estado de cancelado en la base de datos' },
        { status: 500 }
      );
    }

    console.log('Estado de cancelado encontrado:', estadoCancelado);
    console.log('Pagos activos encontrados:', ticket.pagos.length);

    // Procesar todo en una transacción
    const resultado = await prisma.$transaction(async (tx) => {
      // PASO 1: Actualizar el ticket como cancelado
      const ticketActualizado = await tx.tickets.update({
        where: { id: parseInt(params.id) },
        data: {
          cancelado: true,
          motivo_cancelacion: motivoCancelacion.trim(),
          cancelado_por_id: Number(session.user.id),
          estatus_reparacion_id: estadoCancelado.id,
          fecha_cancelacion: new Date(),
          updated_at: new Date()
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
          usuarios_tickets_cancelado_por_idTousuarios: true
        }
      });

      console.log('Ticket actualizado como cancelado');

      // PASO 2: Marcar pagos como CANCELADO y crear registros de devolución
      const devolucionesCreadas = [];
      
      for (const pago of ticket.pagos) {
        // Marcar pago como cancelado
        await tx.pagos.update({
          where: { id: pago.id },
          data: {
            estado: 'CANCELADO',
            updated_at: new Date()
          }
        });

        console.log(`Pago ${pago.id} marcado como CANCELADO`);

        // Crear registro de devolución pendiente
        const devolucion = await tx.devoluciones.create({
          data: {
            pago_id: pago.id,
            ticket_id: ticket.id,
            monto: pago.monto,
            motivo: `Cancelación de ticket: ${motivoCancelacion.trim()}`,
            estado: 'PENDIENTE',
            usuario_id: Number(session.user.id),
            observaciones: `Devolución pendiente por cancelación de ticket #${ticket.numero_ticket}`,
            created_at: new Date(),
            updated_at: new Date()
          }
        });

        devolucionesCreadas.push(devolucion);
        console.log(`Devolución creada para pago ${pago.id}: ${devolucion.id}`);
      }

      return {
        ticket: ticketActualizado,
        devoluciones: devolucionesCreadas,
        totalDevoluciones: devolucionesCreadas.length,
        montoTotalDevolucion: devolucionesCreadas.reduce((sum, d) => sum + Number(d.monto), 0)
      };
    });

    console.log('=== FIN DE CANCELACIÓN DE TICKET ===');
    console.log('Resultado:', {
      ticketId: resultado.ticket.id,
      devolucionesCreadas: resultado.totalDevoluciones,
      montoTotal: resultado.montoTotalDevolucion
    });

    return NextResponse.json({
      success: true,
      ticket: resultado.ticket,
      devoluciones: {
        total: resultado.totalDevoluciones,
        montoTotal: resultado.montoTotalDevolucion,
        registros: resultado.devoluciones
      },
      mensaje: resultado.totalDevoluciones > 0
        ? `Ticket cancelado exitosamente. Se crearon ${resultado.totalDevoluciones} registro(s) de devolución pendiente por un total de $${resultado.montoTotalDevolucion.toFixed(2)}.`
        : 'Ticket cancelado exitosamente. No había pagos activos para devolver.'
    });
  } catch (error) {
    console.error('=== ERROR EN CANCELACIÓN DE TICKET ===');
    console.error('Error completo:', error);
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error('Error de Prisma:', {
        code: error.code,
        message: error.message,
        meta: error.meta
      });
      return NextResponse.json(
        { 
          error: 'Error de base de datos',
          detalles: error.message
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        detalles: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
} 