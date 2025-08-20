import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

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

    const marca = await prisma.marcas.findUnique({
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
    const marcaActualizada = await prisma.marcas.update({
      where: { id },
      data: {
        nombre: body.nombre,
        descripcion: body.descripcion || null,
        updated_at: new Date()
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

    // Verificar que la marca existe
    const marca = await prisma.marcas.findUnique({
      where: { id },
      include: {
        modelos: {
          include: {
            tickets: true,
            productos: true
          }
        }
      }
    });

    if (!marca) {
      return NextResponse.json({ error: 'Marca no encontrada' }, { status: 404 });
    }

    // Verificar si tiene modelos con relaciones
    for (const modelo of marca.modelos) {
      if (modelo.tickets.length > 0) {
        return NextResponse.json(
          { error: `No se puede eliminar la marca porque el modelo "${modelo.nombre}" tiene tickets asociados` },
          { status: 400 }
        );
      }

      if (modelo.productos.length > 0) {
        return NextResponse.json(
          { error: `No se puede eliminar la marca porque el modelo "${modelo.nombre}" tiene productos asociados` },
          { status: 400 }
        );
      }
    }

    // Eliminar modelos (cascada)
    await prisma.modelos.deleteMany({
      where: {
        marca_id: id
      }
    });

    // Eliminar la marca
    await prisma.marcas.delete({
      where: { id }
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