import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET /api/catalogo/modelos
export async function GET(req: NextRequest) {
  try {
    console.log('GET /api/catalogo/modelos - Iniciando...');
    
    // Comentamos la validación de sesión para tickets
    // const session = await getServerSession(authOptions);
    // console.log('GET /api/catalogo/modelos - Session:', session?.user?.email);

    // if (!session?.user) {
    //   console.log('GET /api/catalogo/modelos - No autorizado');
    //   return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    // }

    const { searchParams } = new URL(req.url);
    const marcaId = searchParams.get('marcaId');
    console.log('GET /api/catalogo/modelos - marcaId:', marcaId);

    if (marcaId) {
      // Verificar que la marca existe
      const marca = await prisma.marcas.findUnique({
        where: { id: parseInt(marcaId) }
      });

      if (!marca) {
        console.log('GET /api/catalogo/modelos - Marca no encontrada');
        return NextResponse.json({ error: 'Marca no encontrada' }, { status: 404 });
      }

      const modelos = await prisma.modelos.findMany({
        where: {
          marca_id: parseInt(marcaId)
        },
        include: {
          marcas: true
        },
        orderBy: {
          nombre: 'asc'
        }
      });

      console.log('GET /api/catalogo/modelos - Modelos encontrados para marca:', modelos.length);
      return NextResponse.json(modelos);
    } else {
      // Si no se proporciona marcaId, devolver todos los modelos
      console.log('GET /api/catalogo/modelos - Obteniendo todos los modelos');
      const modelos = await prisma.modelos.findMany({
        include: {
          marcas: true
        },
        orderBy: {
          nombre: 'asc'
        }
      });

      console.log('GET /api/catalogo/modelos - Todos los modelos encontrados:', modelos.length);
      return NextResponse.json(modelos);
    }
  } catch (error) {
    console.error('GET /api/catalogo/modelos - Error:', error);
    return NextResponse.json(
      { error: 'Error al obtener los modelos' },
      { status: 500 }
    );
  }
}

// POST /api/catalogo/modelos
export async function POST(req: NextRequest) {
  try {
    console.log('POST /api/catalogo/modelos - Iniciando...');
    
    // Comentamos la validación de sesión temporalmente
    // const session = await getServerSession(authOptions);
    // console.log('POST /api/catalogo/modelos - Session:', session?.user?.email);

    // if (!session?.user) {
    //   console.log('POST /api/catalogo/modelos - No autorizado');
    //   return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    // }

    const data = await req.json();
    console.log('POST /api/catalogo/modelos - Datos recibidos:', data);

    // Validar datos requeridos
    if (!data.nombre || !data.marcaId) {
      console.log('POST /api/catalogo/modelos - Datos incompletos:', { nombre: data.nombre, marcaId: data.marcaId });
      return NextResponse.json(
        { error: 'El nombre y la marca son obligatorios' },
        { status: 400 }
      );
    }

    // Verificar que la marca existe
    const marca = await prisma.marcas.findUnique({
      where: { id: parseInt(data.marcaId) }
    });

    if (!marca) {
      console.log('POST /api/catalogo/modelos - Marca no encontrada:', data.marcaId);
      return NextResponse.json({ error: 'Marca no encontrada' }, { status: 404 });
    }

    // Crear el modelo
    const modelo = await prisma.modelos.create({
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion || null,
        marca_id: parseInt(data.marcaId),
        updated_at: new Date()
      }
    });

    // Obtener el modelo con la relación a marca
    const modeloConMarca = await prisma.modelos.findUnique({
      where: { id: modelo.id },
      include: {
        marcas: true
      }
    });

    console.log('POST /api/catalogo/modelos - Modelo creado:', modeloConMarca);
    return NextResponse.json(modeloConMarca);
  } catch (error: any) {
    console.error('POST /api/catalogo/modelos - Error:', error);
    
    // Manejar errores específicos de Prisma
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Ya existe un modelo con ese nombre para la marca seleccionada' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Error al crear el modelo' },
      { status: 500 }
    );
  }
} 