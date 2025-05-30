import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Prisma } from '@prisma/client';

// GET /api/catalogo/modelos/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('GET /api/catalogo/modelos/[id] - Iniciando...');
    console.log('ID del modelo:', params.id);
    
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    console.log('GET /api/catalogo/modelos/[id] - Session:', session?.user?.email);
    
    if (!session) {
      console.log('GET /api/catalogo/modelos/[id] - No autorizado');
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const id = Number(params.id);
    if (isNaN(id)) {
      console.log('GET /api/catalogo/modelos/[id] - ID inválido:', params.id);
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    try {
      // Verificar conexión a la base de datos
      await prisma.$connect();
      console.log('Conexión a la base de datos establecida');

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
        console.log('GET /api/catalogo/modelos/[id] - Modelo no encontrado');
        return NextResponse.json(
          { error: 'Modelo no encontrado' },
          { status: 404 }
        );
      }

      console.log('GET /api/catalogo/modelos/[id] - Modelo encontrado:', modelo);
      
      // Cerrar la conexión
      await prisma.$disconnect();
      
      return NextResponse.json(modelo);
    } catch (error) {
      console.error('GET /api/catalogo/modelos/[id] - Error en la consulta:', error);
      
      // Intentar cerrar la conexión en caso de error
      try {
        await prisma.$disconnect();
      } catch (disconnectError) {
        console.error('Error al cerrar la conexión:', disconnectError);
      }

      return NextResponse.json(
        { 
          error: 'Error al obtener el modelo',
          details: error instanceof Error ? error.message : 'Error desconocido',
          stack: error instanceof Error ? error.stack : undefined
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('GET /api/catalogo/modelos/[id] - Error general:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido',
        stack: error instanceof Error ? error.stack : undefined
      },
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
    console.log('PUT /api/catalogo/modelos/[id] - Iniciando...');
    console.log('ID del modelo:', params.id);
    
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    console.log('PUT /api/catalogo/modelos/[id] - Session:', session?.user?.email);
    
    if (!session) {
      console.log('PUT /api/catalogo/modelos/[id] - No autorizado');
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verificar rol de administrador/gerente
    if (session.user.role !== 'ADMINISTRADOR' && session.user.role !== 'GERENTE') {
      console.log('PUT /api/catalogo/modelos/[id] - Sin permisos');
      return NextResponse.json(
        { error: 'No tiene permisos para realizar esta acción' },
        { status: 403 }
      );
    }

    const id = Number(params.id);
    if (isNaN(id)) {
      console.log('PUT /api/catalogo/modelos/[id] - ID inválido:', params.id);
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    const body = await req.json();
    console.log('PUT /api/catalogo/modelos/[id] - Datos recibidos:', body);
    
    // Validar datos requeridos
    if (!body.nombre || !body.marcaId) {
      console.log('PUT /api/catalogo/modelos/[id] - Datos incompletos');
      return NextResponse.json(
        { error: 'El nombre y la marca son obligatorios' },
        { status: 400 }
      );
    }

    try {
      // Verificar conexión a la base de datos
      await prisma.$connect();
      console.log('Conexión a la base de datos establecida');

      // Verificar si el modelo existe
      const modeloExistente = await prisma.modelo.findUnique({
        where: { id }
      });

      if (!modeloExistente) {
        console.log('PUT /api/catalogo/modelos/[id] - Modelo no encontrado');
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
        console.log('PUT /api/catalogo/modelos/[id] - Marca no encontrada:', body.marcaId);
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

      console.log('PUT /api/catalogo/modelos/[id] - Modelo actualizado:', modeloActualizado);
      
      // Cerrar la conexión
      await prisma.$disconnect();
      
      return NextResponse.json(modeloActualizado);
    } catch (error) {
      console.error('PUT /api/catalogo/modelos/[id] - Error en la consulta:', error);
      
      // Intentar cerrar la conexión en caso de error
      try {
        await prisma.$disconnect();
      } catch (disconnectError) {
        console.error('Error al cerrar la conexión:', disconnectError);
      }

      // Manejar error de unicidad
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        return NextResponse.json(
          { error: 'Ya existe un modelo con ese nombre para la marca seleccionada' },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { 
          error: 'Error al actualizar el modelo',
          details: error instanceof Error ? error.message : 'Error desconocido',
          stack: error instanceof Error ? error.stack : undefined
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('PUT /api/catalogo/modelos/[id] - Error general:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido',
        stack: error instanceof Error ? error.stack : undefined
      },
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
    console.log('ID del modelo:', params.id);
    
    const session = await getServerSession(authOptions);
    console.log('DELETE /api/catalogo/modelos/[id] - Session:', session?.user?.email);

    if (!session?.user) {
      console.log('DELETE /api/catalogo/modelos/[id] - No autorizado');
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const id = parseInt(params.id);
    console.log('DELETE /api/catalogo/modelos/[id] - ID:', id);

    try {
      // Verificar conexión a la base de datos
      await prisma.$connect();
      console.log('Conexión a la base de datos establecida');

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
      
      // Cerrar la conexión
      await prisma.$disconnect();
      
      return NextResponse.json({ message: 'Modelo eliminado correctamente' });
    } catch (error) {
      console.error('DELETE /api/catalogo/modelos/[id] - Error en la consulta:', error);
      
      // Intentar cerrar la conexión en caso de error
      try {
        await prisma.$disconnect();
      } catch (disconnectError) {
        console.error('Error al cerrar la conexión:', disconnectError);
      }

      return NextResponse.json(
        { 
          error: 'Error al eliminar el modelo',
          details: error instanceof Error ? error.message : 'Error desconocido',
          stack: error instanceof Error ? error.stack : undefined
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('DELETE /api/catalogo/modelos/[id] - Error general:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 