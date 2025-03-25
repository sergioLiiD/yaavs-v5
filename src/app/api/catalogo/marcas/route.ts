import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';

// GET /api/catalogo/marcas
export async function GET(req: NextRequest) {
  try {
    // Verificar autenticación (opcional)
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Obtener todas las marcas
    const marcas = await prisma.marca.findMany({
      orderBy: { nombre: 'asc' }
    });
    
    return NextResponse.json(marcas);
  } catch (error) {
    console.error('Error al obtener marcas:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}

// POST /api/catalogo/marcas
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
    console.log('Datos recibidos:', body);
    console.log('Usuario autenticado:', session.user);
    
    // Validar datos requeridos
    if (!body.nombre) {
      return NextResponse.json(
        { error: 'El nombre es obligatorio' },
        { status: 400 }
      );
    }

    // Crear nueva marca
    console.log('Intentando crear marca con datos:', {
      nombre: body.nombre,
      descripcion: body.descripcion || null
    });

    try {
      const nuevaMarca = await prisma.marca.create({
        data: {
          nombre: body.nombre,
          descripcion: body.descripcion || null
        }
      });
      
      console.log('Marca creada exitosamente:', nuevaMarca);
      return NextResponse.json(nuevaMarca, { status: 201 });
    } catch (dbError: any) {
      console.error('Error de base de datos:', {
        message: dbError.message,
        code: dbError.code,
        meta: dbError.meta
      });
      throw dbError;
    }
  } catch (error: any) {
    console.error('Error al crear marca:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack
    });
    return NextResponse.json(
      { 
        error: 'Error al procesar la solicitud',
        details: error.message,
        code: error.code,
        meta: error.meta
      },
      { status: 500 }
    );
  }
} 