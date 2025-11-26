import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse('No autorizado', { status: 401 });
    }

    // Solo administradores pueden ver devoluciones
    if (session.user.role !== 'ADMINISTRADOR') {
      return new NextResponse('No autorizado. Solo los administradores pueden ver devoluciones.', { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const estado = searchParams.get('estado') || 'PENDIENTE'; // Por defecto mostrar pendientes
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Construir filtro de estado
    const where: Prisma.devolucionesWhereInput = {};
    
    if (estado === 'TODAS') {
      // No filtrar por estado
    } else {
      where.estado = estado as 'PENDIENTE' | 'COMPLETADA' | 'CANCELADA';
    }

    const [devoluciones, total] = await Promise.all([
      prisma.devoluciones.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          created_at: 'desc'
        },
        include: {
          pagos: {
            select: {
              id: true,
              monto: true,
              metodo: true,
              referencia: true,
              created_at: true,
              estado: true
            }
          },
          tickets: {
            select: {
              id: true,
              numero_ticket: true,
              fecha_recepcion: true,
              motivo_cancelacion: true,
              fecha_cancelacion: true,
              clientes: {
                select: {
                  id: true,
                  nombre: true,
                  apellido_paterno: true,
                  apellido_materno: true,
                  telefono_celular: true,
                  email: true
                }
              },
              usuarios_tickets_cancelado_por_idTousuarios: {
                select: {
                  id: true,
                  nombre: true,
                  apellido_paterno: true,
                  apellido_materno: true
                }
              }
            }
          },
          usuarios: {
            select: {
              id: true,
              nombre: true,
              apellido_paterno: true,
              apellido_materno: true,
              email: true
            }
          }
        }
      }),
      prisma.devoluciones.count({ where })
    ]);

    // Mapear a formato camelCase para el frontend
    const devolucionesFormateadas = devoluciones.map((devolucion) => ({
      id: devolucion.id,
      pagoId: devolucion.pago_id,
      ticketId: devolucion.ticket_id,
      monto: devolucion.monto,
      motivo: devolucion.motivo,
      estado: devolucion.estado,
      fechaDevolucion: devolucion.fecha_devolucion,
      usuarioId: devolucion.usuario_id,
      observaciones: devolucion.observaciones,
      createdAt: devolucion.created_at,
      updatedAt: devolucion.updated_at,
      pago: devolucion.pagos ? {
        id: devolucion.pagos.id,
        monto: devolucion.pagos.monto,
        metodo: devolucion.pagos.metodo,
        referencia: devolucion.pagos.referencia,
        createdAt: devolucion.pagos.created_at,
        estado: devolucion.pagos.estado
      } : null,
      ticket: devolucion.tickets ? {
        id: devolucion.tickets.id,
        numeroTicket: devolucion.tickets.numero_ticket,
        fechaRecepcion: devolucion.tickets.fecha_recepcion,
        motivoCancelacion: devolucion.tickets.motivo_cancelacion,
        fechaCancelacion: devolucion.tickets.fecha_cancelacion,
        cliente: devolucion.tickets.clientes ? {
          id: devolucion.tickets.clientes.id,
          nombre: devolucion.tickets.clientes.nombre,
          apellidoPaterno: devolucion.tickets.clientes.apellido_paterno,
          apellidoMaterno: devolucion.tickets.clientes.apellido_materno,
          telefonoCelular: devolucion.tickets.clientes.telefono_celular,
          email: devolucion.tickets.clientes.email,
          nombreCompleto: `${devolucion.tickets.clientes.nombre} ${devolucion.tickets.clientes.apellido_paterno} ${devolucion.tickets.clientes.apellido_materno}`.trim()
        } : null,
        canceladoPor: devolucion.tickets.usuarios_tickets_cancelado_por_idTousuarios ? {
          id: devolucion.tickets.usuarios_tickets_cancelado_por_idTousuarios.id,
          nombre: `${devolucion.tickets.usuarios_tickets_cancelado_por_idTousuarios.nombre} ${devolucion.tickets.usuarios_tickets_cancelado_por_idTousuarios.apellido_paterno} ${devolucion.tickets.usuarios_tickets_cancelado_por_idTousuarios.apellido_materno}`.trim()
        } : null
      } : null,
      usuario: devolucion.usuarios ? {
        id: devolucion.usuarios.id,
        nombre: `${devolucion.usuarios.nombre} ${devolucion.usuarios.apellido_paterno} ${devolucion.usuarios.apellido_materno}`.trim(),
        email: devolucion.usuarios.email
      } : null
    }));

    // Calcular totales
    const totales = await prisma.devoluciones.aggregate({
      where: {
        estado: 'PENDIENTE'
      },
      _sum: {
        monto: true
      },
      _count: {
        id: true
      }
    });

    return NextResponse.json({
      devoluciones: devolucionesFormateadas,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1,
      totales: {
        pendientes: {
          cantidad: totales._count.id || 0,
          montoTotal: totales._sum.monto || 0
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener devoluciones:', error);
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json(
        { 
          error: 'Error de base de datos',
          detalles: error.message,
          codigo: error.code
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Error al obtener devoluciones',
        detalles: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}

