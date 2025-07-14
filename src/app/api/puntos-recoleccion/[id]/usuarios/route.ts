import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcrypt';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

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

    const puntoRecoleccion = await prisma.puntos_recoleccion.findUnique({
      where: { id }
    });

    if (!puntoRecoleccion) {
      return NextResponse.json({ error: 'Punto de recolección no encontrado' }, { status: 404 });
    }

    const users = await prisma.usuarios_puntos_recoleccion.findMany({
      where: {
        punto_recoleccion_id: id
      },
      include: {
        usuarios: {
          select: {
            id: true,
            email: true,
            nombre: true,
            apellido_paterno: true,
            apellido_materno: true,
            usuarios_roles: {
              include: {
                roles: {
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
        ...user.usuarios,
        apellidoPaterno: user.usuarios.apellido_paterno,
        apellidoMaterno: user.usuarios.apellido_materno,
        rol: user.usuarios.usuarios_roles[0]?.roles
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

    const puntoRecoleccion = await prisma.puntos_recoleccion.findUnique({
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

    const existingUser = await prisma.usuarios.findUnique({
      where: { email: validatedData.email }
    });

    if (existingUser) {
      return NextResponse.json({ error: 'El email ya está registrado' }, { status: 400 });
    }

    const rol = await prisma.roles.findUnique({
      where: { id: validatedData.rolId }
    });

    if (!rol) {
      return NextResponse.json({ error: 'Rol no encontrado' }, { status: 404 });
    }

    const hashedPassword = await hash(validatedData.password, 10);

    const usuario = await prisma.$transaction(async (tx) => {
      const newUser = await tx.usuarios.create({
        data: {
          email: validatedData.email,
          password_hash: hashedPassword,
          nombre: validatedData.nombre,
          apellido_paterno: validatedData.apellidoPaterno,
          apellido_materno: validatedData.apellidoMaterno,
          updated_at: new Date()
        }
      });

      await tx.usuarios_roles.create({
        data: {
          usuario_id: newUser.id,
          rol_id: validatedData.rolId,
          updated_at: new Date()
        }
      });

      await tx.usuarios_puntos_recoleccion.create({
        data: {
          usuario_id: newUser.id,
          punto_recoleccion_id: id,
          nivel: validatedData.rolId === 4 ? 'ADMIN' : 'OPERADOR', // 4 es el ID del rol ADMINISTRADOR_PUNTO
          updated_at: new Date()
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