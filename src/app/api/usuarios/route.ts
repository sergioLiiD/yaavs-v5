import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { UsuarioService } from '@/services/usuarioService';
import { CreateUsuarioDTO, NivelUsuario } from '@/types/usuario';

// GET /api/usuarios
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== NivelUsuario.ADMINISTRADOR) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const usuarios = await UsuarioService.getAll();
    return NextResponse.json(usuarios);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    return NextResponse.json(
      { error: 'Error al obtener usuarios' },
      { status: 500 }
    );
  }
}

// POST /api/usuarios
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== NivelUsuario.ADMINISTRADOR) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const data = await request.json();

    // Validar campos requeridos
    const requiredFields = ['email', 'password', 'nombre', 'apellidoPaterno', 'nivel'];
    const missingFields = requiredFields.filter(field => !data[field]);
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Campos requeridos faltantes: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Verificar si el email ya existe
    const emailExists = await UsuarioService.emailExists(data.email);
    if (emailExists) {
      return NextResponse.json(
        { error: 'El email ya está registrado' },
        { status: 400 }
      );
    }

    const newUser = await UsuarioService.create(data as CreateUsuarioDTO);
    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    return NextResponse.json(
      { error: 'Error al crear usuario' },
      { status: 500 }
    );
  }
} 