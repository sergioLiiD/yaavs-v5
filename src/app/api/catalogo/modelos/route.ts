import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';

// GET /api/catalogo/modelos
export async function GET(req: NextRequest) {
  try {
    console.log('GET /api/catalogo/modelos - Iniciando...');
    
    const session = await getServerSession(authOptions);
    console.log('GET /api/catalogo/modelos - Session:', session?.user?.email);

    if (!session?.user) {
      console.log('GET /api/catalogo/modelos - No autorizado');
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const marcaId = searchParams.get('marcaId');
    console.log('GET /api/catalogo/modelos - marcaId:', marcaId);

    if (!marcaId) {
      console.log('GET /api/catalogo/modelos - marcaId no proporcionado');
      return NextResponse.json({ error: 'ID de marca no proporcionado' }, { status: 400 });
    }

    // Verificar que la marca existe
    const marca = await prisma.marca.findUnique({
      where: { id: parseInt(marcaId) }
    });

    if (!marca) {
      console.log('GET /api/catalogo/modelos - Marca no encontrada');
      return NextResponse.json({ error: 'Marca no encontrada' }, { status: 404 });
    }

    const modelos = await prisma.modelo.findMany({
      where: {
        marcaId: parseInt(marcaId)
      },
      include: {
        marca: true
      },
      orderBy: {
        nombre: 'asc'
      }
    });

    console.log('GET /api/catalogo/modelos - Modelos encontrados:', modelos.length);
    return NextResponse.json(modelos);
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
    
    const session = await getServerSession(authOptions);
    console.log('POST /api/catalogo/modelos - Session:', session?.user?.email);

    if (!session?.user) {
      console.log('POST /api/catalogo/modelos - No autorizado');
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

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
    const marca = await prisma.marca.findUnique({
      where: { id: parseInt(data.marcaId) }
    });

    if (!marca) {
      console.log('POST /api/catalogo/modelos - Marca no encontrada:', data.marcaId);
      return NextResponse.json({ error: 'Marca no encontrada' }, { status: 404 });
    }

    // Crear el modelo
    const modelo = await prisma.modelo.create({
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion || null,
        marcaId: parseInt(data.marcaId)
      },
      include: {
        marca: true
      }
    });

    console.log('POST /api/catalogo/modelos - Modelo creado:', modelo);
    return NextResponse.json(modelo);
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