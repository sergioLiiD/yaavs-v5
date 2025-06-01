import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('=== INICIO DE CONSULTA DE TICKET CLIENTE ===');
    console.log('ID del ticket:', params.id);

    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      console.log('No hay sesión de usuario');
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    console.log('Usuario autenticado:', session.user);

    // Obtener el ticket
    const ticket = await prisma.ticket.findFirst({
      where: {
        id: parseInt(params.id),
        clienteId: Number(session.user.id)
      },
      include: {
        cliente: true,
        tipoServicio: true,
        modelo: {
          include: {
            marcas: true,
          },
        },
        estatusReparacion: true,
        tecnicoAsignado: true,
        dispositivos: true,
        direcciones: true,
        Presupuesto: {
          include: {
            conceptos_presupuesto: true
          }
        },
        pagos: {
          orderBy: {
            fecha: 'desc'
          }
        }
      },
    });

    if (!ticket) {
      console.log('Ticket no encontrado');
      return NextResponse.json(
        { error: 'Ticket no encontrado' },
        { status: 404 }
      );
    }

    console.log('Ticket encontrado:', ticket);
    console.log('=== FIN DE CONSULTA DE TICKET CLIENTE ===');

    return NextResponse.json(ticket);
  } catch (error) {
    console.error('=== ERROR EN CONSULTA DE TICKET CLIENTE ===');
    console.error('Error completo:', error);
    return NextResponse.json(
      { error: 'Error al obtener ticket' },
      { status: 500 }
    );
  }
} 