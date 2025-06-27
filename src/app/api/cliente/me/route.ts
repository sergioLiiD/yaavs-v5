import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';
import { verifyToken } from '@/lib/jwt';
import { ClienteService } from '@/services/clienteService';

// Configurar para usar Node.js runtime
export const runtime = 'nodejs';

export async function GET() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('cliente_token');

    if (!token) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const decoded = await verifyToken(token.value);
    if (!decoded || !decoded.id) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      );
    }

    const cliente = await ClienteService.findById(decoded.id);
    if (!cliente) {
      return NextResponse.json(
        { error: 'Cliente no encontrado' },
        { status: 404 }
      );
    }

    // Remover datos sensibles
    const { passwordHash, ...clienteData } = cliente;

    return NextResponse.json({ cliente: clienteData });
  } catch (error) {
    console.error('Error en /api/cliente/me:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 