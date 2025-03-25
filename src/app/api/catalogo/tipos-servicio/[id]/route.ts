import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';

// GET /api/catalogo/tipos-servicio/[id]
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

    const tipoServicio = await prisma.tipoServicio.findUnique({
      where: { id }
    });

    if (!tipoServicio) {
      return NextResponse.json(
        { error: 'Tipo de servicio no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(tipoServicio);
  } catch (error) {
    console.error('Error al obtener tipo de servicio:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}

// PUT /api/catalogo/tipos-servicio/[id]
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
    if (!body.concepto) {
      return NextResponse.json(
        { error: 'El concepto es obligatorio' },
        { status: 400 }
      );
    }

    // Actualizar el tipo de servicio
    const tipoServicioActualizado = await prisma.tipoServicio.update({
      where: { id },
      data: {
        concepto: body.concepto,
        descripcion: body.descripcion || null,
        activo: body.activo !== undefined ? body.activo : true
      }
    });

    return NextResponse.json(tipoServicioActualizado);
  } catch (error) {
    console.error('Error al actualizar tipo de servicio:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}

// DELETE /api/catalogo/tipos-servicio/[id]
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

    // En lugar de eliminar físicamente, marcar como inactivo
    await prisma.tipoServicio.update({
      where: { id },
      data: { activo: false }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error al eliminar tipo de servicio:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
} 