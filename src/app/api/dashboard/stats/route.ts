import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Obtener el mes actual y el mes anterior
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // Obtener tickets del mes actual
    const currentMonthTickets = await prisma.ticket.count({
      where: {
        createdAt: {
          gte: currentMonth
        }
      }
    }).catch(error => {
      console.error('Error al contar tickets del mes actual:', error);
      return 0;
    });

    // Obtener tickets del mes anterior
    const lastMonthTickets = await prisma.ticket.count({
      where: {
        createdAt: {
          gte: lastMonth,
          lt: currentMonth
        }
      }
    }).catch(error => {
      console.error('Error al contar tickets del mes anterior:', error);
      return 0;
    });

    // Calcular el porcentaje de cambio
    const ticketChange = lastMonthTickets === 0 ? 100 : ((currentMonthTickets - lastMonthTickets) / lastMonthTickets) * 100;

    // Obtener tickets en reparación
    const ticketsEnReparacion = await prisma.ticket.count({
      where: {
        estatusReparacion: {
          nombre: 'En Reparación'
        }
      }
    }).catch(error => {
      console.error('Error al contar tickets en reparación:', error);
      return 0;
    });

    // Obtener tickets reparados
    const ticketsReparados = await prisma.ticket.count({
      where: {
        estatusReparacion: {
          nombre: 'Reparación Completada'
        }
      }
    }).catch(error => {
      console.error('Error al contar tickets reparados:', error);
      return 0;
    });

    // Obtener tickets por entregar
    const ticketsPorEntregar = await prisma.ticket.count({
      where: {
        estatusReparacion: {
          nombre: 'Por Entregar'
        }
      }
    }).catch(error => {
      console.error('Error al contar tickets por entregar:', error);
      return 0;
    });

    // Obtener tickets recientes
    const ticketsRecientes = await prisma.ticket.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        direcciones: true,
        dispositivos: true,
        estatusReparacion: true,
        cliente: {
          select: {
            nombre: true,
            apellidoPaterno: true
          }
        },
        modelo: {
          select: {
            nombre: true,
            marca: {
              select: {
                nombre: true
              }
            }
          }
        }
      }
    }).catch(error => {
      console.error('Error al obtener tickets recientes:', error);
      return [];
    });

    return NextResponse.json({
      stats: [
        {
          title: 'Tickets Abiertos',
          value: currentMonthTickets.toString(),
          change: `${ticketChange > 0 ? '+' : ''}${ticketChange.toFixed(0)}%`,
          isUp: ticketChange > 0,
          description: 'Comparado con el mes anterior'
        },
        {
          title: 'En Reparación',
          value: ticketsEnReparacion.toString(),
          change: '0%',
          isUp: true,
          description: 'Tickets en proceso'
        },
        {
          title: 'Reparados',
          value: ticketsReparados.toString(),
          change: '0%',
          isUp: true,
          description: 'Tickets completados'
        },
        {
          title: 'Por Entregar',
          value: ticketsPorEntregar.toString(),
          change: '0%',
          isUp: true,
          description: 'Tickets pendientes de entrega'
        }
      ],
      recentTickets: ticketsRecientes.map(ticket => ({
        id: ticket.id,
        cliente: `${ticket.cliente?.nombre || ''} ${ticket.cliente?.apellidoPaterno || ''}`,
        modelo: `${ticket.modelo?.marca?.nombre || ''} ${ticket.modelo?.nombre || ''}`,
        problema: ticket.descripcionProblema,
        estado: ticket.estatusReparacion?.nombre || ''
      }))
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    return NextResponse.json(
      { error: 'Error al obtener estadísticas', details: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    );
  }
} 