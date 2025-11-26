import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse('No autorizado', { status: 401 });
    }

    // Solo administradores pueden actualizar devoluciones
    if (session.user.role !== 'ADMINISTRADOR') {
      return new NextResponse('No autorizado. Solo los administradores pueden actualizar devoluciones.', { status: 403 });
    }

    const devolucionId = parseInt(params.id);
    const body = await request.json();
    const { estado, observaciones, fechaDevolucion } = body;

    if (!estado || !['PENDIENTE', 'COMPLETADA', 'CANCELADA'].includes(estado)) {
      return new NextResponse('Estado inválido. Debe ser PENDIENTE, COMPLETADA o CANCELADA', { status: 400 });
    }

    // Verificar que la devolución existe
    const devolucionExistente = await prisma.devoluciones.findUnique({
      where: { id: devolucionId }
    });

    if (!devolucionExistente) {
      return new NextResponse('Devolución no encontrada', { status: 404 });
    }

    // Actualizar la devolución
    const devolucionActualizada = await prisma.devoluciones.update({
      where: { id: devolucionId },
      data: {
        estado: estado as 'PENDIENTE' | 'COMPLETADA' | 'CANCELADA',
        observaciones: observaciones || devolucionExistente.observaciones,
        fecha_devolucion: fechaDevolucion ? new Date(fechaDevolucion) : (estado === 'COMPLETADA' ? new Date() : devolucionExistente.fecha_devolucion),
        updated_at: new Date()
      },
      include: {
        pagos: {
          select: {
            id: true,
            monto: true,
            metodo: true,
            referencia: true,
            estado: true
          }
        },
        tickets: {
          select: {
            id: true,
            numero_ticket: true,
            clientes: {
              select: {
                nombre: true,
                apellido_paterno: true,
                apellido_materno: true
              }
            }
          }
        },
        usuarios: {
          select: {
            nombre: true,
            apellido_paterno: true,
            apellido_materno: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      devolucion: {
        id: devolucionActualizada.id,
        estado: devolucionActualizada.estado,
        observaciones: devolucionActualizada.observaciones,
        fechaDevolucion: devolucionActualizada.fecha_devolucion,
        monto: devolucionActualizada.monto
      }
    });
  } catch (error) {
    console.error('Error al actualizar devolución:', error);
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json(
        { 
          error: 'Error de base de datos',
          detalles: error.message,
          codigo: error.code
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Error al actualizar devolución',
        detalles: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}

