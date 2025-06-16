import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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
    const ticket = await prisma.ticket.findUnique({
      where: { id: parseInt(params.id) }
    });

    if (!ticket) {
      console.log('Ticket no encontrado');
      return NextResponse.json({ error: 'Ticket no encontrado' }, { status: 404 });
    }

    // Actualizar el ticket con el técnico asignado
    const updatedTicket = await prisma.ticket.update({
      where: {
        id: parseInt(params.id),
      },
      data: {
        tecnicoAsignadoId: tecnicoId,
      },
      include: {
        cliente: true,
        modelo: {
          include: {
            marca: true
          }
        },
        tipoServicio: true,
        estatusReparacion: true,
        tecnicoAsignado: true,
        creador: true,
        dispositivo: true,
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