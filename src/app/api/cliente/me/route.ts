import { NextResponse } from 'next/server';
import { ClienteService } from '@/services/clienteService';
import { verify } from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    // Obtener el token de la cookie
    const token = cookies().get('cliente_token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Verificar el token
    const decoded = verify(
      token,
      process.env.JWT_SECRET || 'tu_secreto_seguro_para_jwt_aqui'
    ) as { id: number; email: string; tipo: string };

    if (decoded.tipo !== 'CLIENTE') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Obtener el cliente
    const cliente = await ClienteService.getById(decoded.id);

    if (!cliente) {
      return NextResponse.json(
        { error: 'Cliente no encontrado' },
        { status: 404 }
      );
    }

    // Omitir el passwordHash de la respuesta
    const { passwordHash, ...clienteSinPassword } = cliente;

    return NextResponse.json(clienteSinPassword);
  } catch (error) {
    console.error('Error al verificar sesión:', error);
    return NextResponse.json(
      { error: 'Error al verificar la sesión' },
      { status: 500 }
    );
  }
} 