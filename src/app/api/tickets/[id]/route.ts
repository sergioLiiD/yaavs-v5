import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Prisma } from '@prisma/client';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('=== INICIO DE LA CONSULTA ===');
    console.log('ID del ticket:', params.id);
    
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      console.log('No hay sesión de usuario');
      return new NextResponse('No autorizado', { status: 401 });
    }
    console.log('Usuario autenticado:', session.user);

    // 1. Verificar el ticket básico
    console.log('1. Verificando ticket básico...');
    const ticketBasico = await prisma.ticket.findUnique({
      where: { id: parseInt(params.id) },
      select: {
        id: true,
        tecnicoAsignadoId: true,
        codigoDesbloqueo: true
      }
    });
    console.log('Ticket básico:', ticketBasico);

    if (!ticketBasico) {
      console.log('Ticket no encontrado');
      return new NextResponse('Ticket no encontrado', { status: 404 });
    }

    // 2. Verificar la reparación
    console.log('2. Verificando reparación...');
    const reparacion = await prisma.reparacion.findUnique({
      where: { ticketId: parseInt(params.id) },
      include: {
        checklist_diagnostico: true
      }
    });
    console.log('Reparación:', reparacion);

    // 3. Obtener el ticket completo
    console.log('3. Obteniendo ticket completo...');
    const ticket = await prisma.ticket.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        cliente: true,
        tipoServicio: true,
        modelo: {
          include: {
            marcas: true
          }
        },
        estatusReparacion: true,
        creador: true,
        tecnicoAsignado: true,
        Presupuesto: {
          include: {
            conceptos_presupuesto: true
          }
        },
        Reparacion: {
          include: {
            checklist_diagnostico: true,
            piezas_reparacion: {
              include: {
                piezas: true
              }
            }
          }
        },
        dispositivos: true,
        entregas: {
          include: {
            direcciones: true
          }
        },
        pagos: true
      }
    });

    console.log('=== FIN DE LA CONSULTA ===');
    console.log('Ticket completo:', JSON.stringify(ticket, null, 2));

    if (!ticket) {
      console.log('Error al obtener el ticket completo');
      return new NextResponse('Error al obtener el ticket', { status: 500 });
    }

    return NextResponse.json(ticket);
  } catch (error) {
    console.error('=== ERROR DETALLADO ===');
    console.error('Error completo:', error);
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error('Error de Prisma:', {
        code: error.code,
        message: error.message,
        meta: error.meta
      });
      return new NextResponse(
        `Error de base de datos: ${error.message}`,
        { status: 500 }
      );
    }
    
    return new NextResponse(
      `Error interno del servidor: ${error instanceof Error ? error.message : 'Error desconocido'}`,
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const data = await req.json();
    console.log('Datos recibidos para actualización:', data);

    // Si hay presupuesto, actualizar el estado a "Presupuesto Generado"
    if (data.presupuesto) {
      console.log('Presupuesto detectado, buscando estado...');
      const estatusPresupuesto = await prisma.estatusReparacion.findFirst({
        where: {
          nombre: 'Presupuesto Generado'
        }
      });

      console.log('Estado encontrado:', estatusPresupuesto);

      if (!estatusPresupuesto) {
        return NextResponse.json(
          { error: 'Estado "Presupuesto Generado" no encontrado' },
          { status: 404 }
        );
      }

      // Asegurarnos de que el estado se actualice
      data.estatusReparacionId = estatusPresupuesto.id;
      console.log('Estado actualizado a:', estatusPresupuesto.id);
    }

    // Separar los campos que pertenecen a dispositivos
    const {
      capacidad,
      color,
      fechaCompra,
      codigoDesbloqueo,
      redCelular,
      patronDesbloqueo,
      ...ticketData
    } = data;

    // Actualizar el ticket
    const updatedTicket = await prisma.ticket.update({
      where: { id: parseInt(params.id) },
      data: {
        codigoDesbloqueo: data.codigoDesbloqueo,
        updatedAt: new Date()
      },
      include: {
        cliente: true,
        tipoServicio: true,
        modelo: {
          include: {
            marcas: true
          }
        },
        estatusReparacion: true,
        creador: true,
        tecnicoAsignado: true,
        Presupuesto: {
          include: {
            conceptos_presupuesto: true
          }
        },
        Reparacion: {
          include: {
            checklist_diagnostico: true,
            piezas_reparacion: {
              include: {
                piezas: true
              }
            }
          }
        },
        dispositivos: true,
        entregas: {
          include: {
            direcciones: true
          }
        },
        pagos: true
      }
    });

    // Actualizar los datos del dispositivo
    if (capacidad || color || fechaCompra || codigoDesbloqueo || redCelular) {
      await prisma.dispositivos.updateMany({
        where: { ticketId: parseInt(params.id) },
        data: {
          capacidad,
          color,
          fechaCompra: fechaCompra ? new Date(fechaCompra) : undefined,
          codigoDesbloqueo,
          redCelular,
          updatedAt: new Date()
        }
      });
    }

    return NextResponse.json(updatedTicket);
  } catch (error) {
    console.error('Error al actualizar ticket:', error);
    return NextResponse.json(
      { error: 'Error al actualizar ticket' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('=== INICIO DE CANCELACIÓN DE TICKET ===');
    console.log('ID del ticket:', params.id);

    const session = await getServerSession(authOptions);
    if (!session?.user) {
      console.log('No hay sesión de usuario');
      return new NextResponse('No autorizado', { status: 401 });
    }
    console.log('Usuario autenticado:', session.user);

    // Obtener el cuerpo de la solicitud
    const body = await request.json();
    console.log('Cuerpo de la solicitud:', body);
    
    const { motivoCancelacion } = body;

    if (!motivoCancelacion) {
      console.log('No se proporcionó motivo de cancelación');
      return new NextResponse('Se requiere un motivo de cancelación', { status: 400 });
    }

    // Verificar si el ticket existe
    const ticket = await prisma.ticket.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        dispositivos: true,
        Reparacion: true
      }
    });

    if (!ticket) {
      console.log('Ticket no encontrado');
      return new NextResponse('Ticket no encontrado', { status: 404 });
    }

    // Obtener el estado de cancelado
    const estadoCancelado = await prisma.estatusReparacion.findFirst({
      where: { nombre: 'Cancelado' }
    });

    if (!estadoCancelado) {
      console.log('No se encontró el estado de cancelado');
      return new NextResponse('No se encontró el estado de cancelado', { status: 500 });
    }

    console.log('Estado de cancelado encontrado:', estadoCancelado);

    // Actualizar el ticket como cancelado
    const ticketActualizado = await prisma.ticket.update({
      where: { id: parseInt(params.id) },
      data: {
        cancelado: true,
        motivoCancelacion,
        estatusReparacionId: estadoCancelado.id,
        updatedAt: new Date()
      },
      include: {
        cliente: true,
        tipoServicio: true,
        modelo: {
          include: {
            marcas: true
          }
        },
        estatusReparacion: true,
        tecnicoAsignado: true
      }
    });

    console.log('Ticket actualizado:', ticketActualizado);
    console.log('=== FIN DE CANCELACIÓN DE TICKET ===');

    return NextResponse.json(ticketActualizado);
  } catch (error) {
    console.error('=== ERROR EN CANCELACIÓN DE TICKET ===');
    console.error('Error completo:', error);
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error('Error de Prisma:', {
        code: error.code,
        message: error.message,
        meta: error.meta
      });
      return new NextResponse(
        `Error de base de datos: ${error.message}`,
        { status: 500 }
      );
    }
    
    return new NextResponse(
      `Error interno del servidor: ${error instanceof Error ? error.message : 'Error desconocido'}`,
      { status: 500 }
    );
  }
} 