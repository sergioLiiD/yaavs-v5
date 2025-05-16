import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { UsuarioService } from '@/services/usuarioService';
import { UpdateUsuarioDTO, NivelUsuario } from '@/types/usuario';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMINISTRADOR') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    const usuario = await UsuarioService.getById(id);
    if (!usuario) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(usuario);
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    return NextResponse.json(
      { error: 'Error al obtener usuario' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMINISTRADOR') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    const data = await request.json();
    console.log('Datos recibidos para actualización:', data);

    // Verificar si el usuario existe
    const existingUser = await UsuarioService.getById(id);
    if (!existingUser) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Si se está actualizando el email, verificar que no exista
    if (data.email && data.email !== existingUser.email) {
      const emailExists = await UsuarioService.emailExists(data.email, id);
      if (emailExists) {
        return NextResponse.json(
          { error: 'El email ya está registrado' },
          { status: 400 }
        );
      }
    }

    // Preparar los datos de actualización
    const updateData = {
      ...data,
      activo: data.activo !== undefined ? data.activo : existingUser.activo
    };

    console.log('Datos a actualizar:', updateData);

    const updatedUser = await UsuarioService.update(id, updateData as UpdateUsuarioDTO);
    console.log('Usuario actualizado:', updatedUser);
    
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    return NextResponse.json(
      { error: 'Error al actualizar usuario' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMINISTRADOR') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    // Verificar si el usuario existe
    const existingUser = await UsuarioService.getById(id);
    if (!existingUser) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // No permitir eliminar el propio usuario
    if (existingUser.email === session.user.email) {
      return NextResponse.json(
        { error: 'No puedes eliminar tu propio usuario' },
        { status: 400 }
      );
    }

    await UsuarioService.delete(id);
    return NextResponse.json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    return NextResponse.json(
      { error: 'Error al eliminar usuario' },
      { status: 500 }
    );
  }
} 