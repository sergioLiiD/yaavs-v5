import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const updateUserSchema = z.object({
  email: z.string().email(),
  nombre: z.string(),
  apellidoPaterno: z.string(),
  apellidoMaterno: z.string().optional(),
  rolId: z.string(),
});

// PUT /api/puntos-recoleccion/[id]/usuarios/[userId]
export async function PUT(
  request: Request,
  { params }: { params: { id: string; userId: string } }
) {
  try {
    const body = await request.json();
    const { email, nombre, apellidoPaterno, apellidoMaterno, rolId } = updateUserSchema.parse(body);

    // Validar que todos los campos requeridos estén presentes
    if (!email || !nombre || !apellidoPaterno || !rolId) {
      return NextResponse.json(
        { 
          error: 'Faltan campos requeridos',
          detalles: {
            email: !email ? 'El email es requerido' : null,
            nombre: !nombre ? 'El nombre es requerido' : null,
            apellidoPaterno: !apellidoPaterno ? 'El apellido paterno es requerido' : null,
            rolId: !rolId ? 'Debe seleccionar un rol' : null
          }
        },
        { status: 400 }
      );
    }

    // Validar formato del email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'El formato del email no es válido' },
        { status: 400 }
      );
    }

    // Verificar si el usuario existe y pertenece al punto de recolección
    const existingUserPoint = await prisma.usuarioPuntoRecoleccion.findFirst({
      where: {
        id: parseInt(params.userId),
        puntoRecoleccionId: parseInt(params.id),
      },
      include: {
        usuario: {
          include: {
            usuarioRoles: {
              include: {
                rol: true
              }
            }
          }
        }
      },
    });

    if (!existingUserPoint) {
      return NextResponse.json(
        { error: 'No se encontró el usuario en este punto de recolección' },
        { status: 404 }
      );
    }

    // Verificar si el email ya está en uso por otro usuario
    if (email !== existingUserPoint.usuario.email) {
      const emailInUse = await prisma.usuario.findUnique({
        where: { email },
      });

      if (emailInUse) {
        return NextResponse.json(
          { error: 'Ya existe un usuario registrado con ese email' },
          { status: 400 }
        );
      }
    }

    // Validar el rol
    const rolIdNum = parseInt(rolId);
    if (isNaN(rolIdNum)) {
      return NextResponse.json(
        { error: 'El rol seleccionado no es válido' },
        { status: 400 }
      );
    }

    const rol = await prisma.rol.findUnique({
      where: { id: rolIdNum },
    });

    if (!rol) {
      return NextResponse.json(
        { error: 'El rol seleccionado no existe en el sistema' },
        { status: 400 }
      );
    }

    try {
      // Actualizar el usuario
      const updatedUsuario = await prisma.usuario.update({
        where: { id: existingUserPoint.usuario.id },
        data: {
          email,
          nombre,
          apellidoPaterno,
          apellidoMaterno
        },
      });

      // Actualizar la relación con el punto de recolección
      const updatedUserPoint = await prisma.usuarioPuntoRecoleccion.update({
        where: { id: parseInt(params.userId) },
        data: {
          nivel: rolIdNum === 4 ? 'ADMIN' : 'OPERADOR'
        },
        include: {
          usuario: {
            include: {
              usuarioRoles: {
                include: {
                  rol: true
                }
              }
            }
          },
          puntoRecoleccion: {
            select: {
              id: true,
              nombre: true,
            },
          },
        },
      });

      // Transformar la respuesta para mantener el formato esperado
      const formattedResponse = {
        ...updatedUserPoint,
        usuario: {
          ...updatedUserPoint.usuario,
          rol: updatedUserPoint.usuario.usuarioRoles[0]?.rol
        }
      };

      return NextResponse.json(formattedResponse);
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      return NextResponse.json(
        { 
          error: 'No se pudo actualizar el usuario',
          detalles: 'Ocurrió un error al intentar guardar los cambios. Por favor, intente nuevamente.'
        },
        { status: 500 }
      );
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos de entrada inválidos', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error al procesar la solicitud:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE /api/puntos-recoleccion/[id]/usuarios/[userId]
export async function DELETE(
  request: Request,
  { params }: { params: { id: string; userId: string } }
) {
  try {
    // Verificar si el usuario existe y pertenece al punto de recolección
    const existingUserPoint = await prisma.usuarioPuntoRecoleccion.findFirst({
      where: {
        id: parseInt(params.userId),
        puntoRecoleccionId: parseInt(params.id),
      },
    });

    if (!existingUserPoint) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Eliminar la relación con el punto de recolección
    await prisma.usuarioPuntoRecoleccion.delete({
      where: { id: parseInt(params.userId) },
    });

    return NextResponse.json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    return NextResponse.json(
      { error: 'Error al eliminar usuario' },
      { status: 500 }
    );
  }
} 