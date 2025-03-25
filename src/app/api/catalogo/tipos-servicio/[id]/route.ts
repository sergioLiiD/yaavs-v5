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
    if (!body.nombre) {
      return NextResponse.json(
        { error: 'El nombre es obligatorio' },
        { status: 400 }
      );
    }

    // Actualizar el tipo de servicio
    const tipoServicioActualizado = await prisma.tipoServicio.update({
      where: { id },
      data: {
        nombre: body.nombre,
        descripcion: body.descripcion || null
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

    // Validar ID
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    // Verificar si el tipo de servicio existe
    const tipoServicio = await prisma.tipoServicio.findUnique({
      where: { id },
      include: {
        tickets: true,
        productos: true
      }
    });

    if (!tipoServicio) {
      return NextResponse.json(
        { error: 'Tipo de servicio no encontrado' },
        { status: 404 }
      );
    }

    // Verificar si hay registros relacionados
    if (tipoServicio.tickets.length > 0 || tipoServicio.productos.length > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar porque tiene registros relacionados' },
        { status: 400 }
      );
    }

    // Eliminar el tipo de servicio
    await prisma.tipoServicio.delete({
      where: { id }
    });
    
    return NextResponse.json({ message: 'Tipo de servicio eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar tipo de servicio:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
} 