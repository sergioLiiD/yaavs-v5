import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';

// GET /api/catalogo/modelos/[id]
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

    const modelo = await prisma.modelo.findUnique({
      where: { id },
      include: {
        marca: {
          select: {
            id: true,
            nombre: true
          }
        }
      }
    });

    if (!modelo) {
      return NextResponse.json(
        { error: 'Modelo no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(modelo);
  } catch (error) {
    console.error('Error al obtener modelo:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}

// PUT /api/catalogo/modelos/[id]
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
    if (!body.nombre || !body.marcaId) {
      return NextResponse.json(
        { error: 'El nombre y la marca son obligatorios' },
        { status: 400 }
      );
    }

    // Verificar si el modelo existe
    const modeloExistente = await prisma.modelo.findUnique({
      where: { id }
    });

    if (!modeloExistente) {
      return NextResponse.json(
        { error: 'El modelo no existe' },
        { status: 404 }
      );
    }

    // Verificar si la marca existe
    const marca = await prisma.marca.findUnique({
      where: { id: Number(body.marcaId) }
    });

    if (!marca) {
      return NextResponse.json(
        { error: 'La marca seleccionada no existe' },
        { status: 400 }
      );
    }

    // Actualizar el modelo
    const modeloActualizado = await prisma.modelo.update({
      where: { id },
      data: {
        nombre: body.nombre,
        descripcion: body.descripcion || null,
        imagen: body.imagen || null,
        marcaId: Number(body.marcaId),
        activo: body.activo !== undefined ? body.activo : true
      }
    });

    return NextResponse.json(modeloActualizado);
  } catch (error: any) {
    console.error('Error al actualizar modelo:', error);
    
    // Manejar error de unicidad
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Ya existe un modelo con ese nombre para la marca seleccionada' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}

// DELETE /api/catalogo/modelos/[id]
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

    // Verificar si tiene tickets asociados
    const ticketsCount = await prisma.ticket.count({
      where: { modeloId: id }
    });

    if (ticketsCount > 0) {
      return NextResponse.json(
        { 
          error: 'No se puede eliminar el modelo porque tiene tickets asociados',
          count: ticketsCount
        },
        { status: 400 }
      );
    }

    // Verificar si tiene problemas frecuentes asociados
    const problemasCount = await prisma.problemaModelo.count({
      where: { modeloId: id }
    });

    if (problemasCount > 0) {
      // Opcional: Si decide eliminar también los registros asociados
      await prisma.problemaModelo.deleteMany({
        where: { modeloId: id }
      });
    }

    // En lugar de eliminar físicamente, marcar como inactivo
    await prisma.modelo.update({
      where: { id },
      data: { activo: false }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error al eliminar modelo:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
} 