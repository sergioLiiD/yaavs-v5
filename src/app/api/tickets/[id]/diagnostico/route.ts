import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma, checklistDiagnostico } from '@prisma/client';

interface ReparacionPayload {
  checklist: Array<{
    item: string;
    respuesta: boolean;
    observacion?: string;
  }>;
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
        Reparacion: {
          include: {
            checklistDiagnostico: true
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
      tecnicoId: session.user.id,
      descripcion: body.diagnostico,
      saludBateria: body.saludBateria,
      versionSO: body.versionSO,
      updatedAt: new Date()
    };

    console.log('Datos de reparación:', reparacionData);

    // Crear o actualizar la reparación
    const reparacion = await prisma.reparacion.upsert({
      where: {
        ticketId: ticketId,
      },
      create: reparacionData,
      update: {
        descripcion: body.diagnostico,
        saludBateria: body.saludBateria,
        versionSO: body.versionSO,
        updatedAt: new Date()
      }
    });

    // Eliminar los items del checklist existentes solo si hay nuevos items
    if (ticket.Reparacion && body.checklist.length > 0) {
      await prisma.checklistDiagnostico.deleteMany({
        where: {
          reparacionId: ticket.Reparacion.id
        }
      });
    }

    // Crear los nuevos items del checklist solo si hay items
    let checklistItems: checklistDiagnostico[] = [];
    if (body.checklist.length > 0) {
      checklistItems = await Promise.all(
        body.checklist.map(item =>
          prisma.checklistDiagnostico.create({
            data: {
              reparacionId: reparacion.id,
              item: item.item,
              respuesta: item.respuesta,
              observacion: item.observacion,
              updatedAt: new Date()
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
      throw new Error('No se encontró el estatus de diagnóstico');
    }

    // Actualizar el estatus del ticket
    const ticketActualizado = await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        estatusReparacionId: estatusDiagnostico.id,
        fechaInicioDiagnostico: new Date()
      },
      include: {
        Reparacion: {
          include: {
            checklistDiagnostico: true
          }
        }
      }
    });

    return NextResponse.json(ticketActualizado);
  } catch (error) {
    console.error('Error detallado en el endpoint de diagnóstico:', error);
    return NextResponse.json(
      { error: 'Error al procesar el diagnóstico: ' + (error instanceof Error ? error.message : 'Error desconocido') },
      { status: 500 }
    );
  }
} 