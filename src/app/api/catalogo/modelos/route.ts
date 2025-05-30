import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Prisma } from '@prisma/client';

// GET /api/catalogo/modelos
export async function GET(req: NextRequest) {
  // Configurar headers CORS
  const headers = {
    'Access-Control-Allow-Origin': 'https://arreglamx.netlify.app',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
  };

  console.log('GET /api/catalogo/modelos - Iniciando...');
  console.log('URL de la solicitud:', req.url);
  console.log('Método de la solicitud:', req.method);
  
  try {
    // Manejar solicitud OPTIONS para CORS
    if (req.method === 'OPTIONS') {
      return new NextResponse(null, { headers });
    }

    // Verificar autenticación
    const session = await getServerSession(authOptions);
    console.log('GET /api/catalogo/modelos - Session:', session?.user?.email);

    if (!session?.user) {
      console.log('GET /api/catalogo/modelos - No autorizado');
      return NextResponse.json({ error: 'No autorizado' }, { status: 401, headers });
    }

    const { searchParams } = new URL(req.url);
    const marcaId = searchParams.get('marcaId');
    console.log('GET /api/catalogo/modelos - marcaId:', marcaId);

    if (!marcaId) {
      console.log('GET /api/catalogo/modelos - marcaId no proporcionado');
      return NextResponse.json(
        { error: 'Se requiere el ID de la marca' },
        { status: 400, headers }
      );
    }

    try {
      // Verificar que la marca existe
      console.log('Buscando marca con ID:', marcaId);
      const marca = await prisma.marca.findUnique({
        where: { id: parseInt(marcaId) }
      });

      if (!marca) {
        console.log('GET /api/catalogo/modelos - Marca no encontrada');
        return NextResponse.json(
          { error: 'Marca no encontrada' },
          { status: 404, headers }
        );
      }

      console.log('Marca encontrada:', marca.nombre);

      // Buscar modelos
      console.log('Buscando modelos para la marca:', marca.nombre);
      const modelos = await prisma.modelo.findMany({
        where: {
          marcaId: parseInt(marcaId),
          activo: true
        },
        include: {
          marca: true
        },
        orderBy: {
          nombre: 'asc'
        }
      });

      console.log('GET /api/catalogo/modelos - Modelos encontrados:', modelos.length);
      
      return NextResponse.json(modelos, { headers });
    } catch (error) {
      console.error('GET /api/catalogo/modelos - Error en la consulta:', error);
      
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        return NextResponse.json(
          { 
            error: 'Error en la base de datos',
            code: error.code,
            message: error.message
          },
          { status: 500, headers }
        );
      }

      return NextResponse.json(
        { 
          error: 'Error interno del servidor',
          details: error instanceof Error ? error.message : 'Error desconocido'
        },
        { status: 500, headers }
      );
    }
  } catch (error) {
    console.error('GET /api/catalogo/modelos - Error general:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500, headers }
    );
  }
}

// POST /api/catalogo/modelos
export async function POST(req: NextRequest) {
  // Configurar headers CORS
  const headers = {
    'Access-Control-Allow-Origin': 'https://arreglamx.netlify.app',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
  };

  try {
    console.log('POST /api/catalogo/modelos - Iniciando...');
    
    const session = await getServerSession(authOptions);
    console.log('POST /api/catalogo/modelos - Session:', session?.user?.email);

    if (!session?.user) {
      console.log('POST /api/catalogo/modelos - No autorizado');
      return NextResponse.json({ error: 'No autorizado' }, { status: 401, headers });
    }

    const data = await req.json();
    console.log('POST /api/catalogo/modelos - Datos recibidos:', data);

    // Validar datos requeridos
    if (!data.nombre || !data.marcaId) {
      console.log('POST /api/catalogo/modelos - Datos incompletos:', { nombre: data.nombre, marcaId: data.marcaId });
      return NextResponse.json(
        { error: 'Se requieren los campos nombre y marcaId' },
        { status: 400, headers }
      );
    }

    try {
      // Verificar que la marca existe
      const marca = await prisma.marca.findUnique({
        where: { id: parseInt(data.marcaId) }
      });

      if (!marca) {
        console.log('POST /api/catalogo/modelos - Marca no encontrada:', data.marcaId);
        return NextResponse.json({ error: 'Marca no encontrada' }, { status: 404, headers });
      }

      // Crear el modelo
      const modelo = await prisma.modelo.create({
        data: {
          nombre: data.nombre,
          descripcion: data.descripcion,
          marcaId: parseInt(data.marcaId),
          activo: true
        },
        include: {
          marca: true
        }
      });

      console.log('POST /api/catalogo/modelos - Modelo creado:', modelo);
      
      return NextResponse.json(modelo, { headers });
    } catch (error) {
      console.error('POST /api/catalogo/modelos - Error en la consulta:', error);
      
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          return NextResponse.json(
            { error: 'Ya existe un modelo con ese nombre para la marca seleccionada' },
            { status: 400, headers }
          );
        }
        return NextResponse.json(
          { 
            error: 'Error en la base de datos',
            code: error.code,
            message: error.message
          },
          { status: 500, headers }
        );
      }

      return NextResponse.json(
        { 
          error: 'Error interno del servidor',
          details: error instanceof Error ? error.message : 'Error desconocido'
        },
        { status: 500, headers }
      );
    }
  } catch (error) {
    console.error('POST /api/catalogo/modelos - Error general:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500, headers }
    );
  }
} 