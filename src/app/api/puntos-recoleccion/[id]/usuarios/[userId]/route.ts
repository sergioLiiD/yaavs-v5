import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PUT /api/puntos-recoleccion/[id]/usuarios/[userId]
export async function PUT(
  request: Request,
  { params }: { params: { id: string; userId: string } }
) {
  try {
    const body = await request.json();
    const { email, nombre, apellidoPaterno, apellidoMaterno, rolId } = body;

    // Verificar si el usuario existe y pertenece al punto de recolección
    const existingUserPoint = await prisma.usuarios_puntos_recoleccion.findFirst({
      where: {
        id: params.userId,
        puntoRecoleccionId: params.id,
      },
      include: {
        Usuario: true,
      },
    });

    if (!existingUserPoint) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Verificar si el email ya está en uso por otro usuario
    if (email !== existingUserPoint.Usuario.email) {
      const emailInUse = await prisma.usuario.findUnique({
        where: { email },
      });

      if (emailInUse) {
        return NextResponse.json(
          { error: 'Ya existe un usuario con ese email' },
          { status: 400 }
        );
      }
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

    try {
      // Actualizar el usuario
      const updatedUsuario = await prisma.usuario.update({
        where: { id: existingUserPoint.Usuario.id },
        data: {
          email,
          nombre: `${nombre} ${apellidoPaterno} ${apellidoMaterno}`.trim(),
        },
      });

      // Actualizar la relación con el punto de recolección
      const updatedUserPoint = await prisma.usuarios_puntos_recoleccion.update({
        where: { id: params.userId },
        data: {
          rolId: rolId,
        },
        include: {
          Usuario: {
            select: {
              id: true,
              nombre: true,
              email: true,
            },
          },
          Rol: {
            select: {
              id: true,
              nombre: true,
            },
          },
        },
      });

      return NextResponse.json(updatedUserPoint);
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      return NextResponse.json(
        { error: 'Error al actualizar el usuario en la base de datos' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    return NextResponse.json(
      { error: 'Error al actualizar usuario' },
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
    const existingUserPoint = await prisma.usuarios_puntos_recoleccion.findFirst({
      where: {
        id: params.userId,
        puntoRecoleccionId: params.id,
      },
    });

    if (!existingUserPoint) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Eliminar la relación con el punto de recolección
    await prisma.usuarios_puntos_recoleccion.delete({
      where: { id: params.userId },
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