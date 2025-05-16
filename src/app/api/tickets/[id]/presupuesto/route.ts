import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface ProductoPresupuesto {
  id: string;
  productoId: number;
  cantidad: number;
  precioVenta: number;
  nombre?: string;
}

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
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        presupuesto: true,
      },
    });

    if (!ticket) {
      return new NextResponse('Ticket no encontrado', { status: 404 });
    }

    if (!ticket.presupuesto) {
      return NextResponse.json(null);
    }

    return NextResponse.json(ticket.presupuesto);
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

    const { productos, total } = body;

    if (!productos || !Array.isArray(productos)) {
      console.error('Datos de productos inválidos:', productos);
      return new NextResponse('Datos de productos inválidos', { status: 400 });
    }

    // Verificar que el ticket existe
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        presupuesto: true,
        reparacion: true,
      },
    });

    if (!ticket) {
      console.error('Ticket no encontrado:', ticketId);
      return new NextResponse('Ticket no encontrado', { status: 404 });
    }

    // Calcular subtotales
    const subtotal = productos.reduce((sum: number, p: any) => {
      const productoSubtotal = p.cantidad * p.precioUnitario;
      console.log(`Subtotal para producto ${p.piezaId}: ${productoSubtotal} (cantidad: ${p.cantidad}, precio: ${p.precioUnitario})`);
      return sum + productoSubtotal;
    }, 0);
    
    const iva = subtotal * 0.16; // 16% IVA
    const manoDeObra = total - subtotal - iva;

    console.log('Cálculos detallados:', { 
      subtotal, 
      iva, 
      manoDeObra, 
      total,
      productos: productos.map(p => ({
        piezaId: p.piezaId,
        cantidad: p.cantidad,
        precioUnitario: p.precioUnitario,
        subtotal: p.cantidad * p.precioUnitario
      }))
    });

    // Crear o actualizar el presupuesto
    const presupuesto = await prisma.presupuesto.upsert({
      where: {
        ticketId: ticketId,
      },
      create: {
        ticket: {
          connect: {
            id: ticketId
          }
        },
        manoDeObra,
        subtotal,
        iva,
        total,
        aprobado: false,
        pagado: false,
      },
      update: {
        manoDeObra,
        subtotal,
        iva,
        total,
        aprobado: false,
        pagado: false,
      },
    });

    console.log('Presupuesto creado/actualizado:', presupuesto);

    // Buscar el estado "Presupuesto Generado"
    const estatusPresupuesto = await prisma.estatusReparacion.findFirst({
      where: {
        nombre: 'Presupuesto Generado'
      }
    });

    if (!estatusPresupuesto) {
      console.error('Estado "Presupuesto Generado" no encontrado');
      return new NextResponse('Estado "Presupuesto Generado" no encontrado', { status: 404 });
    }

    // Actualizar el estado del ticket
    const ticketActualizado = await prisma.ticket.update({
      where: {
        id: ticketId
      },
      data: {
        estatusReparacionId: estatusPresupuesto.id
      },
      include: {
        estatusReparacion: true,
        presupuesto: true
      }
    });

    console.log('Ticket actualizado:', ticketActualizado);

    // Crear o actualizar la reparación
    const reparacion = await prisma.reparacion.upsert({
      where: {
        ticketId: ticketId,
      },
      create: {
        ticketId: ticketId,
        tecnicoId: parseInt(session.user.id),
      },
      update: {},
    });

    console.log('Reparación creada/actualizada:', reparacion);

    // Verificar que las piezas existen
    const piezasIds = productos
      .filter(p => p.piezaId !== null) // Filtrar los conceptos especiales (null)
      .map(p => p.piezaId);
    
    if (piezasIds.length > 0) {
      const piezasExistentes = await prisma.pieza.findMany({
        where: {
          id: {
            in: piezasIds
          }
        },
        select: {
          id: true
        }
      });

      const piezasExistentesIds = piezasExistentes.map(p => p.id);
      const piezasNoExistentes = piezasIds.filter(id => !piezasExistentesIds.includes(id));

      if (piezasNoExistentes.length > 0) {
        return new NextResponse(
          `Las siguientes piezas no existen: ${piezasNoExistentes.join(', ')}`,
          { status: 400 }
        );
      }
    }

    // Actualizar los productos del presupuesto
    await prisma.piezaReparacion.deleteMany({
      where: {
        reparacionId: reparacion.id,
      },
    });

    const piezasData = productos.map((p: any) => ({
      reparacionId: reparacion.id,
      piezaId: p.piezaId,
      cantidad: p.cantidad,
      precioUnitario: p.precioUnitario,
      conceptoExtra: p.conceptoExtra,
      precioConceptoExtra: p.precioConceptoExtra,
    }));

    console.log('Creando piezas de reparación:', piezasData);

    await prisma.piezaReparacion.createMany({
      data: piezasData,
    });

    return NextResponse.json(ticketActualizado);
  } catch (error: any) {
    console.error('Error al guardar presupuesto:', error);
    return new NextResponse(`Error interno del servidor: ${error.message}`, { status: 500 });
  }
} 