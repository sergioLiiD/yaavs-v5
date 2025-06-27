import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET /api/catalogo/estados-reparacion/[id]
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('No autorizado', { status: 401 });
    }

    const { pathname } = new URL(req.url);
    const id = parseInt(pathname.split('/').pop() || '0');
    
    if (!id) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const estado = await prisma.estatus_reparacion.findUnique({
      where: { id }
    });

    if (!estado) {
      return NextResponse.json({ error: 'Estado no encontrado' }, { status: 404 });
    }

    return NextResponse.json(estado);
  } catch (error) {
    console.error('Error al obtener estado de reparación:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Error al obtener estado de reparación' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// PUT /api/catalogo/estados-reparacion/[id]
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

    // Verificar rol de administrador/gerente (opcional)
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

    // Actualizar estado de reparación
    const estadoActualizado = await prisma.estatus_reparacion.update({
      where: { id },
      data: {
        nombre: body.nombre,
        descripcion: body.descripcion || null,
        orden: body.orden || 1,
        color: body.color || null,
        activo: body.activo !== undefined ? body.activo : true,
        updated_at: new Date()
      }
    });

    return NextResponse.json(estadoActualizado);
  } catch (error) {
    console.error('Error al actualizar estado de reparación:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}

// DELETE /api/catalogo/estados-reparacion/[id]
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

    // Verificar rol de administrador/gerente (opcional)
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

    // Soft delete: marcar como inactivo
    await prisma.estatus_reparacion.update({
      where: { id },
      data: { 
        activo: false,
        updated_at: new Date()
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error al eliminar estado de reparación:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
} 