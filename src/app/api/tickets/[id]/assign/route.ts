import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('Iniciando asignación de técnico...');
    const session = await getServerSession(authOptions);

    if (!session) {
      console.log('No hay sesión de usuario');
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { tecnicoId } = await request.json();
    console.log('ID del técnico:', tecnicoId);

    if (!tecnicoId) {
      console.log('ID de técnico no proporcionado');
      return NextResponse.json({ error: 'ID de técnico requerido' }, { status: 400 });
    }

    // Verificar que el ticket existe
    const ticket = await prisma.tickets.findUnique({
      where: { id: parseInt(params.id) }
    });

    if (!ticket) {
      console.log('Ticket no encontrado');
      return NextResponse.json({ error: 'Ticket no encontrado' }, { status: 404 });
    }

    // Actualizar el ticket con el técnico asignado
    const updatedTicket = await prisma.tickets.update({
      where: {
        id: parseInt(params.id),
      },
      data: {
        tecnico_asignado_id: tecnicoId,
      },
      include: {
        clientes: true,
        modelos: {
          include: {
            marcas: true
          }
        },
        tipos_servicio: true,
        estatus_reparacion: true,
        usuarios_tickets_tecnico_asignado_idTousuarios: true,
        usuarios_tickets_creador_idTousuarios: true,
        dispositivos: true,
      },
    });

    console.log('Ticket actualizado:', updatedTicket);
    return NextResponse.json(updatedTicket);
  } catch (error) {
    console.error('Error al asignar técnico:', error);
    return NextResponse.json(
      { error: 'Error al asignar técnico' },
      { status: 500 }
    );
  }
} 