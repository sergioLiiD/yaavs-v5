import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';

// GET /api/catalogo/tipos-servicio
export async function GET(req: NextRequest) {
  try {
    // Verificar autenticación (opcional)
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Obtener todos los tipos de servicio
    const tiposServicio = await prisma.tipoServicio.findMany({
      where: { activo: true },
      orderBy: { concepto: 'asc' }
    });
    
    return NextResponse.json(tiposServicio);
  } catch (error) {
    console.error('Error al obtener tipos de servicio:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}

// POST /api/catalogo/tipos-servicio
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
    if (!body.concepto) {
      return NextResponse.json(
        { error: 'El concepto es obligatorio' },
        { status: 400 }
      );
    }

    // Crear nuevo tipo de servicio
    const nuevoTipoServicio = await prisma.tipoServicio.create({
      data: {
        concepto: body.concepto,
        descripcion: body.descripcion || null,
        activo: true
      }
    });
    
    return NextResponse.json(nuevoTipoServicio, { status: 201 });
  } catch (error) {
    console.error('Error al crear tipo de servicio:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
} 