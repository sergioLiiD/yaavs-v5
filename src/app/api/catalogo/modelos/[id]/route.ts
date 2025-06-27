import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

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
    console.log('DELETE /api/catalogo/modelos/[id] - Iniciando...');
    
    const session = await getServerSession(authOptions);
    console.log('DELETE /api/catalogo/modelos/[id] - Session:', session?.user?.email);

    if (!session?.user) {
      console.log('DELETE /api/catalogo/modelos/[id] - No autorizado');
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const id = parseInt(params.id);
    console.log('DELETE /api/catalogo/modelos/[id] - ID:', id);

    // Verificar que el modelo existe
    const modelo = await prisma.modelo.findUnique({
      where: { id },
      include: {
        tickets: true,
        productos: true
      }
    });

    if (!modelo) {
      console.log('DELETE /api/catalogo/modelos/[id] - Modelo no encontrado');
      return NextResponse.json({ error: 'Modelo no encontrado' }, { status: 404 });
    }

    // Verificar si tiene relaciones
    if (modelo.tickets.length > 0) {
      console.log('DELETE /api/catalogo/modelos/[id] - Modelo tiene tickets asociados');
      return NextResponse.json(
        { 
          error: 'No se puede eliminar el modelo porque tiene tickets asociados',
          count: modelo.tickets.length
        },
        { status: 400 }
      );
    }

    if (modelo.productos.length > 0) {
      console.log('DELETE /api/catalogo/modelos/[id] - Modelo tiene productos asociados');
      return NextResponse.json(
        { error: 'No se puede eliminar el modelo porque tiene productos asociados' },
        { status: 400 }
      );
    }

    // Eliminar el modelo
    await prisma.modelo.delete({
      where: { id }
    });

    console.log('DELETE /api/catalogo/modelos/[id] - Modelo eliminado');
    return NextResponse.json({ message: 'Modelo eliminado correctamente' });
  } catch (error) {
    console.error('DELETE /api/catalogo/modelos/[id] - Error:', error);
    return NextResponse.json(
      { error: 'Error al eliminar el modelo' },
      { status: 500 }
    );
  }
} 