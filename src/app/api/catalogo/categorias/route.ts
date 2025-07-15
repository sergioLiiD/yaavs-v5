import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    console.log('GET /api/catalogo/categorias - Session:', session?.user?.email);

    if (!session?.user) {
      console.log('GET /api/catalogo/categorias - No autorizado');
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const categorias = await prisma.categorias.findMany({
      orderBy: {
        nombre: 'asc'
      }
    });

    return NextResponse.json(categorias);
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    return NextResponse.json(
      { 
        error: 'Error al obtener categorías',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    console.log('POST /api/catalogo/categorias - Session:', session?.user?.email);

    if (!session?.user) {
      console.log('POST /api/catalogo/categorias - No autorizado');
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const data = await request.json();
    console.log('POST /api/catalogo/categorias - Datos recibidos:', data);

    // Validar campos requeridos
    if (!data.nombre) {
      return NextResponse.json(
        { error: 'El nombre es requerido' },
        { status: 400 }
      );
    }

    // Crear la categoría
    const categoria = await prisma.categorias.create({
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion || null,
        updated_at: new Date()
      }
    });

    return NextResponse.json(categoria, { status: 201 });
  } catch (error: any) {
    console.error('Error al crear categoría:', error);
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { 
          error: 'Conflicto de datos',
          mensaje: 'Ya existe una categoría con ese nombre'
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        mensaje: 'Ha ocurrido un error al crear la categoría'
      },
      { status: 500 }
    );
  }
} 