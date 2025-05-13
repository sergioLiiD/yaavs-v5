import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma, ChecklistDiagnostico } from '@prisma/client';

interface ReparacionPayload {
  checklist: Omit<ChecklistDiagnostico, 'id' | 'reparacionId' | 'createdAt' | 'updatedAt'>[];
  saludBateria: number;
  versionSO: string;
  diagnostico: string;
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('Iniciando endpoint de diagnóstico...');
    const session = await getServerSession(authOptions);
    if (!session) {
      console.log('No hay sesión activa');
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const ticketId = parseInt(params.id);
    if (isNaN(ticketId)) {
      console.log('ID de ticket inválido:', params.id);
      return NextResponse.json({ error: 'ID de ticket inválido' }, { status: 400 });
    }

    console.log('Buscando ticket con ID:', ticketId);
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: { 
        reparacion: {
          include: {
            checklistItems: true
          }
        }
      }
    });

    if (!ticket) {
      console.log('Ticket no encontrado');
      return NextResponse.json({ error: 'Ticket no encontrado' }, { status: 404 });
    }

    console.log('Ticket encontrado:', ticket);
    const rawBody = await request.text();
    console.log('Raw body recibido:', rawBody);
    
    let body: ReparacionPayload;
    try {
      body = JSON.parse(rawBody);
      console.log('Datos parseados:', body);
    } catch (error) {
      console.error('Error al parsear JSON:', error);
      return NextResponse.json(
        { error: 'Error al procesar los datos: formato JSON inválido' },
        { status: 400 }
      );
    }

    // Validar salud de la batería
    if (typeof body.saludBateria !== 'number') {
      console.log('Salud de batería no es un número:', body.saludBateria);
      return NextResponse.json(
        { error: 'La salud de la batería debe ser un número' },
        { status: 400 }
      );
    }

    if (body.saludBateria < 0 || body.saludBateria > 100) {
      console.log('Salud de batería inválida:', body.saludBateria);
      return NextResponse.json(
        { error: 'La salud de la batería debe estar entre 0 y 100' },
        { status: 400 }
      );
    }

    console.log('Intentando crear/actualizar reparación...');
    
    const reparacionData = {
      ticketId: ticketId,
      tecnicoId: parseInt(session.user.id),
      diagnostico: body.diagnostico,
      saludBateria: body.saludBateria,
      versionSO: body.versionSO,
    };

    console.log('Datos de reparación:', reparacionData);

    // Crear o actualizar la reparación
    const reparacion = await prisma.reparacion.upsert({
      where: {
        ticketId: ticketId,
      },
      create: reparacionData,
      update: {
        diagnostico: body.diagnostico,
        saludBateria: body.saludBateria,
        versionSO: body.versionSO
      }
    });

    // Eliminar los items del checklist existentes solo si hay nuevos items
    if (ticket.reparacion && body.checklist.length > 0) {
      await prisma.checklistDiagnostico.deleteMany({
        where: {
          reparacionId: ticket.reparacion.id
        }
      });
    }

    // Crear los nuevos items del checklist solo si hay items
    let checklistItems: ChecklistDiagnostico[] = [];
    if (body.checklist.length > 0) {
      checklistItems = await Promise.all(
        body.checklist.map(item =>
          prisma.checklistDiagnostico.create({
            data: {
              reparacionId: reparacion.id,
              item: item.item,
              respuesta: item.respuesta,
              observacion: item.observacion
            }
          })
        )
      );
    }

    console.log('Reparación creada/actualizada:', reparacion);
    console.log('Items del checklist creados:', checklistItems);

    // Buscar el estatus de diagnóstico
    const estatusDiagnostico = await prisma.estatusReparacion.findFirst({
      where: { 
        nombre: 'En Diagnóstico'
      }
    });

    if (!estatusDiagnostico) {
      console.log('No se encontró el estatus de diagnóstico');
      return NextResponse.json(
        { error: 'No se encontró el estatus de diagnóstico' },
        { status: 500 }
      );
    }

    console.log('Actualizando estatus del ticket a:', estatusDiagnostico.nombre);
    // Actualizar el estatus del ticket
    await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        estatusReparacionId: estatusDiagnostico.id
      }
    });

    // Obtener la reparación actualizada con los items del checklist
    const reparacionActualizada = await prisma.reparacion.findUnique({
      where: { id: reparacion.id },
      include: {
        checklistItems: true
      }
    });

    console.log('Diagnóstico guardado exitosamente');
    return NextResponse.json(reparacionActualizada);
  } catch (error) {
    console.error('Error detallado en el endpoint de diagnóstico:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error('Error de Prisma:', error.code, error.message);
    }
    return NextResponse.json(
      { error: `Error al procesar el diagnóstico: ${error instanceof Error ? error.message : 'Error desconocido'}` },
      { status: 500 }
    );
  }
} 