import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface CompletarReparacionPayload {
  observaciones: string;
  checklist: Array<{
    id: number;
    item: string;
    respuesta: boolean;
    observacion: string;
  }>;
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { id } = params;
    const { observaciones, checklist, tiempoTranscurrido } = await request.json();

    // Primero actualizamos la reparación
    const reparacion = await prisma.reparacion.update({
      where: { ticketId: Number(id) },
      data: {
        fechaFin: new Date(),
        observaciones
      }
    });

    // Luego actualizamos el ticket con el estado correcto (4 = Completado)
    const ticket = await prisma.ticket.update({
      where: { id: Number(id) },
      data: {
        estatusReparacionId: 4, // ID del estado "Completado"
        fechaFinReparacion: new Date()
      }
    });

    return NextResponse.json({
      fechaFin: reparacion.fechaFin,
      ticket
    });
  } catch (error) {
    console.error('Error al completar la reparación:', error);
    return NextResponse.json(
      { error: 'Error al completar la reparación' },
      { status: 500 }
    );
  }
} 