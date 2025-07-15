import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('No autorizado', { status: 401 });
    }

    const ticketId = parseInt(params.id);

    // Verificar que el ticket existe
    const ticket = await prisma.tickets.findUnique({
      where: { id: ticketId },
      include: {
        presupuestos: {
          include: {
            conceptos_presupuesto: true
          }
        },
      },
    });

    if (!ticket) {
      return new NextResponse('Ticket no encontrado', { status: 404 });
    }

    if (!ticket.presupuestos) {
      return NextResponse.json(null);
    }

    return NextResponse.json(ticket.presupuestos);
  } catch (error) {
    console.error('Error al obtener presupuesto:', error);
    return new NextResponse('Error interno del servidor', { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('No autorizado', { status: 401 });
    }

    const ticketId = parseInt(params.id);
    const body = await request.json();
    console.log('Datos recibidos en el servidor:', JSON.stringify(body, null, 2));

    const { conceptos, total } = body;

    if (!conceptos || !Array.isArray(conceptos)) {
      console.error('Datos de conceptos inválidos:', conceptos);
      return new NextResponse('Datos de conceptos inválidos', { status: 400 });
    }

    // Verificar que el ticket existe
    const ticket = await prisma.tickets.findUnique({
      where: { id: ticketId },
      include: {
        presupuestos: true,
        reparaciones: true,
      },
    });

    if (!ticket) {
      console.error('Ticket no encontrado:', ticketId);
      return new NextResponse('Ticket no encontrado', { status: 404 });
    }

    // Calcular subtotales
    const subtotal = conceptos.reduce((sum: number, c: any) => {
      const conceptoSubtotal = c.cantidad * c.precioUnitario;
      console.log(`Subtotal para concepto ${c.descripcion}: ${conceptoSubtotal} (cantidad: ${c.cantidad}, precio: ${c.precioUnitario})`);
      return sum + conceptoSubtotal;
    }, 0);
    
    const iva = subtotal * 0.16; // 16% IVA
    const descuento = 0; // Por defecto
    const totalFinal = total;

    console.log('Cálculos detallados:', { 
      subtotal, 
      iva, 
      descuento, 
      totalFinal,
      conceptos: conceptos.map(c => ({
        descripcion: c.descripcion,
        cantidad: c.cantidad,
        precioUnitario: c.precioUnitario,
        total: c.cantidad * c.precioUnitario
      }))
    });

    // Crear o actualizar el presupuesto
    const presupuesto = await prisma.presupuestos.upsert({
      where: {
        ticket_id: ticketId,
      },
      create: {
        ticket_id: ticketId,
        total: totalFinal,
        descuento,
        total_final: totalFinal,
        aprobado: false,
        updated_at: new Date(),
        conceptos_presupuesto: {
          create: conceptos.map((c: any) => ({
            descripcion: c.descripcion,
            cantidad: c.cantidad,
            precio_unitario: c.precioUnitario,
            total: c.cantidad * c.precioUnitario,
            updated_at: new Date()
          }))
        }
      },
      update: {
        total: totalFinal,
        descuento,
        total_final: totalFinal,
        aprobado: false,
        updated_at: new Date(),
        conceptos_presupuesto: {
          deleteMany: {},
          create: conceptos.map((c: any) => ({
            descripcion: c.descripcion,
            cantidad: c.cantidad,
            precio_unitario: c.precioUnitario,
            total: c.cantidad * c.precioUnitario,
            updated_at: new Date()
          }))
        }
      },
    });

    console.log('Presupuesto creado/actualizado:', presupuesto);

    // Buscar el estado "Presupuesto Generado"
    const estatusPresupuesto = await prisma.estatus_reparacion.findFirst({
      where: {
        nombre: 'Presupuesto Generado'
      }
    });

    if (!estatusPresupuesto) {
      console.error('Estado "Presupuesto Generado" no encontrado');
      return new NextResponse('Estado "Presupuesto Generado" no encontrado', { status: 404 });
    }

    // Actualizar el estado del ticket
    const ticketActualizado = await prisma.tickets.update({
      where: {
        id: ticketId
      },
      data: {
        estatus_reparacion_id: estatusPresupuesto.id
      },
      include: {
        estatus_reparacion: true,
        presupuestos: {
          include: {
            conceptos_presupuesto: true
          }
        }
      }
    });

    console.log('Ticket actualizado:', ticketActualizado);

    return NextResponse.json(ticketActualizado);
  } catch (error) {
    console.error('Error al guardar presupuesto:', error);
    return new NextResponse(`Error interno del servidor: ${error instanceof Error ? error.message : 'Error desconocido'}`, { status: 500 });
  }
} 