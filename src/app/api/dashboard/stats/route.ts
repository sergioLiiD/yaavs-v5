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

    // Obtener tickets abiertos (Recibido, En Diagnóstico, Diagnóstico Completado, Presupuesto Aprobado)
    const ticketsAbiertos = await prisma.tickets.count({
      where: {
        estatus_reparacion: {
          nombre: {
            in: ['Recibido', 'En Diagnóstico', 'Diagnóstico Completado', 'Presupuesto Aprobado']
          }
        }
      }
    }).catch((error: any) => {
      console.error('Error al contar tickets abiertos:', error);
      return 0;
    });

    // Obtener tickets del mes anterior para comparación
    const lastMonthTickets = await prisma.tickets.count({
      where: {
        created_at: {
          gte: lastMonth,
          lt: currentMonth
        },
        estatus_reparacion: {
          nombre: {
            in: ['Recibido', 'En Diagnóstico', 'Diagnóstico Completado', 'Presupuesto Aprobado']
          }
        }
      }
    }).catch((error: any) => {
      console.error('Error al contar tickets del mes anterior:', error);
      return 0;
    });

    // Calcular el porcentaje de cambio
    const ticketChange = lastMonthTickets === 0 ? 100 : ((ticketsAbiertos - lastMonthTickets) / lastMonthTickets) * 100;

    // Obtener tickets en reparación
    const ticketsEnReparacion = await prisma.tickets.count({
      where: {
        estatus_reparacion: {
          nombre: 'En Reparación'
        }
      }
    }).catch((error: any) => {
      console.error('Error al contar tickets en reparación:', error);
      return 0;
    });

    // Obtener tickets reparados
    const ticketsReparados = await prisma.tickets.count({
      where: {
        estatus_reparacion: {
          nombre: 'Reparado'
        }
      }
    }).catch((error: any) => {
      console.error('Error al contar tickets reparados:', error);
      return 0;
    });

    // Obtener tickets por entregar
    const ticketsPorEntregar = await prisma.tickets.count({
      where: {
        estatus_reparacion: {
          nombre: 'Listo para Entrega'
        }
      }
    }).catch((error: any) => {
      console.error('Error al contar tickets por entregar:', error);
      return 0;
    });

    // Obtener tickets recientes
    const ticketsRecientes = await prisma.tickets.findMany({
      take: 5,
      orderBy: {
        created_at: 'desc'
      },
      include: {
        direcciones: true,
        dispositivos: true,
        estatus_reparacion: true,
        clientes: {
          select: {
            nombre: true,
            apellido_paterno: true
          }
        },
        modelos: {
          include: {
            marcas: true
          }
        }
      }
    }).catch((error: any) => {
      console.error('Error al obtener tickets recientes:', error);
      return [];
    });

    return NextResponse.json({
      stats: [
        {
          title: 'Tickets Abiertos',
          value: ticketsAbiertos.toString(),
          change: `${ticketChange > 0 ? '+' : ''}${ticketChange.toFixed(0)}%`,
          isUp: ticketChange > 0,
          description: 'Tickets en proceso inicial'
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
      recentTickets: ticketsRecientes.map((ticket: any) => ({
        id: ticket.id,
        numeroTicket: ticket.numero_ticket,
        cliente: ticket.clientes ? `${ticket.clientes.nombre} ${ticket.clientes.apellido_paterno}` : '',
        modelo: ticket.modelos ? `${ticket.modelos.marcas?.nombre || ''} ${ticket.modelos.nombre}` : '',
        problema: ticket.descripcion_problema,
        estado: ticket.estatus_reparacion?.nombre || ''
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