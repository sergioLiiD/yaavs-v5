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
      where: { activo: true },
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
    
    // Validar datos requeridos
    if (!body.nombre) {
      return NextResponse.json(
        { error: 'El nombre es obligatorio' },
        { status: 400 }
      );
    }

    // Crear nueva marca
    const nuevaMarca = await prisma.marca.create({
      data: {
        nombre: body.nombre,
        logo: body.logo || null,
        activo: true
      }
    });
    
    return NextResponse.json(nuevaMarca, { status: 201 });
  } catch (error) {
    console.error('Error al crear marca:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
} 