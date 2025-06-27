import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/catalogo/marcas/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const id = Number(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    const marca = await prisma.marca.findUnique({
      where: { id }
    });

    if (!marca) {
      return NextResponse.json(
        { error: 'Marca no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(marca);
  } catch (error) {
    console.error('Error al obtener marca:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}

// PUT /api/catalogo/marcas/[id]
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verificar rol de administrador/gerente
    if (session.user.role !== 'ADMINISTRADOR' && session.user.role !== 'GERENTE') {
      return NextResponse.json(
        { error: 'No tiene permisos para realizar esta acción' },
        { status: 403 }
      );
    }

    const id = Number(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    const body = await req.json();
    
    // Validar datos requeridos
    if (!body.nombre) {
      return NextResponse.json(
        { error: 'El nombre es obligatorio' },
        { status: 400 }
      );
    }

    // Actualizar la marca
    const marcaActualizada = await prisma.marca.update({
      where: { id },
      data: {
        nombre: body.nombre,
        descripcion: body.descripcion || null
      }
    });

    return NextResponse.json(marcaActualizada);
  } catch (error) {
    console.error('Error al actualizar marca:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}

// DELETE /api/catalogo/marcas/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verificar rol de administrador/gerente
    if (session.user.role !== 'ADMINISTRADOR' && session.user.role !== 'GERENTE') {
      return NextResponse.json(
        { error: 'No tiene permisos para realizar esta acción' },
        { status: 403 }
      );
    }

    const id = Number(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    // Obtener todos los modelos asociados a la marca
    const modelos = await prisma.modelo.findMany({
      where: {
        marcaId: id
      }
    });

    // Para cada modelo, eliminar sus relaciones
    for (const modelo of modelos) {
      // Eliminar problemas de modelo
      await prisma.problemaModelo.deleteMany({
        where: {
          modeloId: modelo.id
        }
      });

      // Eliminar tickets asociados al modelo
      const tickets = await prisma.ticket.findMany({
        where: {
          modeloId: modelo.id
        }
      });

      for (const ticket of tickets) {
        // Eliminar reparaciones asociadas al ticket
        const reparaciones = await prisma.reparacion.findMany({
          where: {
            ticketId: ticket.id
          }
        });

        for (const reparacion of reparaciones) {
          // Eliminar piezas de reparación
          await prisma.piezaReparacion.deleteMany({
            where: {
              reparacionId: reparacion.id
            }
          });
        }

        // Eliminar reparaciones
        await prisma.reparacion.deleteMany({
          where: {
            ticketId: ticket.id
          }
        });

        // Eliminar presupuestos
        await prisma.presupuesto.deleteMany({
          where: {
            ticketId: ticket.id
          }
        });
      }

      // Eliminar tickets
      await prisma.ticket.deleteMany({
        where: {
          modeloId: modelo.id
        }
      });
    }

    // Eliminar modelos
    await prisma.modelo.deleteMany({
      where: {
        marcaId: id
      }
    });

    // Finalmente, eliminar la marca
    await prisma.marca.delete({
      where: {
        id
      }
    });

    return NextResponse.json({ message: 'Marca eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar marca:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
} 