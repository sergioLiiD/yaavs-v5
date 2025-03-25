import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';

// GET /api/catalogo/estados-reparacion
export async function GET(req: NextRequest) {
  try {
    // Verificar autenticación (opcional, dependiendo de tus requisitos)
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Obtener todos los estados de reparación ordenados por el campo 'orden'
    const estados = await prisma.estatusReparacion.findMany({
      where: { activo: true },
      orderBy: { orden: 'asc' }
    });
    
    return NextResponse.json(estados);
  } catch (error) {
    console.error('Error al obtener estados de reparación:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
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
    const nuevoEstado = await prisma.estatusReparacion.create({
      data: {
        nombre: body.nombre,
        descripcion: body.descripcion || null,
        orden: body.orden || 1,
        color: body.color || null,
        activo: true
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