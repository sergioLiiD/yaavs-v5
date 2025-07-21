import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET /api/catalogo/marcas
export async function GET(req: NextRequest) {
  try {
    // Obtener todas las marcas (sin requerir sesión)
    const marcas = await prisma.marcas.findMany({
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
    console.log('=== INICIANDO POST /api/catalogo/marcas ===');
    
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    console.log('Session obtenida:', !!session);
    
    if (!session) {
      console.log('No hay sesión, retornando 401');
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    console.log('Usuario:', session.user?.email);
    console.log('Rol:', session.user?.role);

    // Verificar rol de administrador/gerente
    if (session.user.role !== 'ADMINISTRADOR' && session.user.role !== 'GERENTE') {
      console.log('Usuario sin permisos, retornando 403');
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

    // Verificar si la marca ya existe
    const marcaExistente = await prisma.marcas.findFirst({
      where: {
        nombre: body.nombre
      }
    });

    if (marcaExistente) {
      return NextResponse.json(
        { error: 'Ya existe una marca con ese nombre' },
        { status: 400 }
      );
    }

    // Crear nueva marca
    console.log('Intentando crear marca con datos:', {
      nombre: body.nombre,
      descripcion: body.descripcion || null
    });

    console.log('Verificando conexión a Prisma...');
    console.log('Prisma disponible:', !!prisma);
    console.log('Prisma.marcas disponible:', !!prisma.marcas);

    try {
      console.log('Ejecutando prisma.marcas.create...');
      const nuevaMarca = await prisma.marcas.create({
        data: {
          nombre: body.nombre,
          descripcion: body.descripcion || null,
          updated_at: new Date()
        }
      });
      
      console.log('Marca creada exitosamente:', nuevaMarca);
      return NextResponse.json(nuevaMarca, { status: 201 });
    } catch (dbError: any) {
      console.error('Error de base de datos:', {
        message: dbError.message,
        code: dbError.code,
        meta: dbError.meta,
        stack: dbError.stack
      });
      throw dbError;
    }
  } catch (error: any) {
    console.error('=== ERROR FINAL AL CREAR MARCA ===');
    console.error('Error al crear marca:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack
    });
    console.error('Tipo de error:', typeof error);
    console.error('Error es instancia de Error:', error instanceof Error);
    
    // Manejar errores específicos de Prisma
    if (error.code === 'P2002') {
      return NextResponse.json(
        { 
          error: 'Ya existe una marca con ese nombre',
          code: error.code,
          meta: error.meta
        },
        { status: 400 }
      );
    }
    
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