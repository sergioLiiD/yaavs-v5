import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcrypt';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  nombre: z.string(),
  apellidoPaterno: z.string(),
  apellidoMaterno: z.string().optional(),
  rolId: z.number()
});

// GET /api/puntos-recoleccion/[id]/usuarios
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const puntoRecoleccion = await prisma.puntoRecoleccion.findUnique({
      where: { id }
    });

    if (!puntoRecoleccion) {
      return NextResponse.json({ error: 'Punto de recolección no encontrado' }, { status: 404 });
    }

    const users = await prisma.usuarioPuntoRecoleccion.findMany({
      where: {
        puntoRecoleccionId: id
      },
      include: {
        usuario: {
          select: {
            id: true,
            email: true,
            nombre: true,
            apellidoPaterno: true,
            apellidoMaterno: true,
            usuarioRoles: {
              include: {
                rol: {
                  select: {
                    id: true,
                    nombre: true
                  }
                }
              }
            }
          }
        }
      }
    });

    // Transformar la respuesta para mantener el formato esperado
    const formattedUsers = users.map(user => ({
      ...user,
      usuario: {
        ...user.usuario,
        rol: user.usuario.usuarioRoles[0]?.rol
      }
    }));

    return NextResponse.json(formattedUsers);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    return NextResponse.json({ error: 'Error al obtener usuarios' }, { status: 500 });
  }
}

// POST /api/puntos-recoleccion/[id]/usuarios
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const puntoRecoleccion = await prisma.puntoRecoleccion.findUnique({
      where: { id }
    });

    if (!puntoRecoleccion) {
      return NextResponse.json({ error: 'Punto de recolección no encontrado' }, { status: 404 });
    }

    const body = await request.json();
    const validatedData = createUserSchema.parse({
      ...body,
      rolId: parseInt(body.rolId)
    });

    const existingUser = await prisma.usuario.findUnique({
      where: { email: validatedData.email }
    });

    if (existingUser) {
      return NextResponse.json({ error: 'El email ya está registrado' }, { status: 400 });
    }

    const rol = await prisma.rol.findUnique({
      where: { id: validatedData.rolId }
    });

    if (!rol) {
      return NextResponse.json({ error: 'Rol no encontrado' }, { status: 404 });
    }

    const hashedPassword = await hash(validatedData.password, 10);

    const usuario = await prisma.$transaction(async (tx) => {
      const newUser = await tx.usuario.create({
        data: {
          email: validatedData.email,
          passwordHash: hashedPassword,
          nombre: validatedData.nombre,
          apellidoPaterno: validatedData.apellidoPaterno,
          apellidoMaterno: validatedData.apellidoMaterno
        }
      });

      await tx.usuarioRol.create({
        data: {
          usuarioId: newUser.id,
          rolId: validatedData.rolId
        }
      });

      await tx.usuarioPuntoRecoleccion.create({
        data: {
          usuarioId: newUser.id,
          puntoRecoleccionId: id,
          nivel: validatedData.rolId === 4 ? 'ADMIN' : 'OPERADOR' // 4 es el ID del rol ADMINISTRADOR_PUNTO
        }
      });

      return newUser;
    });

    return NextResponse.json(usuario);
  } catch (error) {
    console.error('Error al crear usuario:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Error al crear usuario' }, { status: 500 });
  }
} 