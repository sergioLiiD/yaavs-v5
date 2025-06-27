import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET /api/catalogo/estados-reparacion
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('No autorizado', { status: 401 });
    }

    const estados = await prisma.estatus_reparacion.findMany({
      orderBy: {
        orden: 'asc'
      }
    });

    return NextResponse.json(estados);
  } catch (error) {
    console.error('Error al obtener estados de reparación:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Error al obtener estados de reparación' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// POST /api/catalogo/estados-reparacion
export async function POST(req: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verificar rol de administrador/gerente (opcional)
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

    // Crear nuevo estado de reparación
    const nuevoEstado = await prisma.estatus_reparacion.create({
      data: {
        nombre: body.nombre,
        descripcion: body.descripcion || null,
        orden: body.orden || 1,
        color: body.color || null,
        activo: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    });
    
    return NextResponse.json(nuevoEstado, { status: 201 });
  } catch (error) {
    console.error('Error al crear estado de reparación:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
} 