import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';

// GET /api/catalogo/modelos
export async function GET(req: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Obtener parámetros de consulta
    const { searchParams } = new URL(req.url);
    const marcaId = searchParams.get('marcaId');
    
    // Construir la consulta base
    const whereClause = {
      activo: true,
      ...(marcaId ? { marcaId: Number(marcaId) } : {})
    };

    // Obtener todos los modelos según los filtros
    const modelos = await prisma.modelo.findMany({
      where: whereClause,
      include: {
        marca: {
          select: {
            id: true,
            nombre: true
          }
        }
      },
      orderBy: { nombre: 'asc' }
    });
    
    return NextResponse.json(modelos);
  } catch (error) {
    console.error('Error al obtener modelos:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}

// POST /api/catalogo/modelos
export async function POST(req: NextRequest) {
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

    const body = await req.json();
    
    // Validar datos requeridos
    if (!body.nombre || !body.marcaId) {
      return NextResponse.json(
        { error: 'El nombre y la marca son obligatorios' },
        { status: 400 }
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

    // Crear nuevo modelo
    const nuevoModelo = await prisma.modelo.create({
      data: {
        nombre: body.nombre,
        descripcion: body.descripcion || null,
        imagen: body.imagen || null,
        marcaId: Number(body.marcaId),
        activo: true
      }
    });
    
    return NextResponse.json(nuevoModelo, { status: 201 });
  } catch (error: any) {
    console.error('Error al crear modelo:', error);
    
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