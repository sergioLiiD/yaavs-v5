import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';

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
        logo: body.logo || null,
        activo: body.activo !== undefined ? body.activo : true
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

    // Verificar si tiene modelos asociados
    const modelosCount = await prisma.modelo.count({
      where: { marcaId: id }
    });

    if (modelosCount > 0) {
      return NextResponse.json(
        { 
          error: 'No se puede eliminar la marca porque tiene modelos asociados',
          count: modelosCount
        },
        { status: 400 }
      );
    }

    // En lugar de eliminar físicamente, marcar como inactivo
    await prisma.marca.update({
      where: { id },
      data: { activo: false }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error al eliminar marca:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
} 