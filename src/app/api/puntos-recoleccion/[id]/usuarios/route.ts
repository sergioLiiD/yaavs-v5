import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';

// GET /api/puntos-recoleccion/[id]/usuarios
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const users = await prisma.usuarios_puntos_recoleccion.findMany({
      where: {
        puntoRecoleccionId: params.id,
      },
      include: {
        Usuario: {
          select: {
            id: true,
            nombre: true,
            email: true,
            nivel: true,
          },
        },
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    return NextResponse.json(
      { error: 'Error al obtener usuarios' },
      { status: 500 }
    );
  }
}

// POST /api/puntos-recoleccion/[id]/usuarios
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { email, password, nombre, apellidoPaterno, apellidoMaterno, nivel } = body;

    // Verificar si el punto de recolección existe y es un punto de reparación
    const collectionPoint = await prisma.puntos_recoleccion.findUnique({
      where: { id: params.id },
      select: { isRepairPoint: true },
    });

    if (!collectionPoint) {
      return NextResponse.json(
        { error: 'Punto de recolección no encontrado' },
        { status: 404 }
      );
    }

    if (!collectionPoint.isRepairPoint) {
      return NextResponse.json(
        { error: 'Este punto no es un punto de reparación' },
        { status: 400 }
      );
    }

    // Verificar si ya existe un usuario con ese email
    const existingUser = await prisma.Usuario.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Ya existe un usuario con ese email' },
        { status: 400 }
      );
    }

    // Crear el usuario
    const hashedPassword = await hash(password, 12);
    const usuario = await prisma.Usuario.create({
      data: {
        email,
        nombre: `${nombre} ${apellidoPaterno} ${apellidoMaterno}`.trim(),
        passwordHash: hashedPassword,
        nivel: 'TECNICO',
        activo: true,
      },
    });

    // Asignar el usuario al punto de recolección
    const userPoint = await prisma.usuarios_puntos_recoleccion.create({
      data: {
        id: crypto.randomUUID(),
        puntoRecoleccionId: params.id,
        usuarioId: usuario.id,
        nivel: nivel as 'ADMINISTRADOR' | 'OPERADOR',
        activo: true,
      },
      include: {
        Usuario: {
          select: {
            id: true,
            nombre: true,
            email: true,
            nivel: true,
          },
        },
      },
    });

    return NextResponse.json(userPoint);
  } catch (error) {
    console.error('Error al crear usuario:', error);
    return NextResponse.json(
      { error: 'Error al crear usuario' },
      { status: 500 }
    );
  }
} 