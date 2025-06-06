import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

// GET /api/puntos-recoleccion/[id]/usuarios
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('Obteniendo usuarios para el punto:', params.id);
    
    const users = await prisma.usuarios_puntos_recoleccion.findMany({
      where: {
        puntoRecoleccionId: params.id,
      },
      select: {
        id: true,
        puntoRecoleccionId: true,
        usuarioId: true,
        activo: true,
        Usuario: {
          select: {
            id: true,
            nombre: true,
            email: true,
            apellidoPaterno: true,
            apellidoMaterno: true,
          },
        },
      },
    });

    console.log('Usuarios encontrados:', JSON.stringify(users, null, 2));

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
    const { email, password, nombre, apellidoPaterno, apellidoMaterno, rolId } = body;

    // Verificar si el punto de recolección existe
    const collectionPoint = await prisma.puntos_recoleccion.findUnique({
      where: { id: params.id },
    });

    if (!collectionPoint) {
      return NextResponse.json(
        { error: 'Punto de recolección no encontrado' },
        { status: 404 }
      );
    }

    // Verificar si ya existe un usuario con ese email
    const existingUser = await prisma.usuario.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Ya existe un usuario con ese email' },
        { status: 400 }
      );
    }

    // Verificar si el rol existe
    const rol = await prisma.rol.findUnique({
      where: { id: rolId },
    });

    if (!rol) {
      return NextResponse.json(
        { error: 'El rol seleccionado no existe' },
        { status: 400 }
      );
    }

    // Crear el usuario
    const hashedPassword = await hash(password, 12);
    const usuario = await prisma.usuario.create({
      data: {
        email,
        nombre,
        apellidoPaterno,
        apellidoMaterno,
        passwordHash: hashedPassword,
        activo: true,
        updatedAt: new Date(),
      },
    });

    // Asignar el rol al usuario (UsuarioRol)
    await prisma.usuarioRol.create({
      data: {
        usuarioId: usuario.id,
        rolId: rolId,
      },
    });

    // Asignar el usuario al punto de recolección
    const userPoint = await prisma.usuarios_puntos_recoleccion.create({
      data: {
        id: uuidv4(),
        puntoRecoleccionId: params.id,
        usuarioId: usuario.id,
        rolId: rolId,
        activo: true,
      },
      include: {
        Usuario: {
          select: {
            id: true,
            nombre: true,
            email: true,
            apellidoPaterno: true,
            apellidoMaterno: true,
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