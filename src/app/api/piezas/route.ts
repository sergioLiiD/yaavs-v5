import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    console.log('Sesión completa:', JSON.stringify(session, null, 2));

    if (!session?.user) {
      return new NextResponse('No autorizado', { status: 401 });
    }

    console.log('Usuario autenticado:', session.user);
    console.log('Buscando piezas...');

    const piezas = await prisma.piezas.findMany({
      include: {
        marca: true,
        modelo: true
      }
    });

    console.log('Piezas encontradas:', piezas);
    return NextResponse.json(piezas);
  } catch (error) {
    console.error('Error al obtener piezas:', error);
    console.error('Detalles del error:', error);
    return new NextResponse('Error interno del servidor', { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('No autorizado', { status: 401 });
    }

    const body = await request.json();
    const { nombre, marcaId, modeloId, stock, precio } = body;

    console.log('Creando pieza:', body);

    const pieza = await prisma.piezas.create({
      data: {
        nombre,
        marcaId,
        modeloId,
        stock: stock || 0,
        precio,
      },
      include: {
        marca: true,
        modelo: true
      }
    });

    console.log('Pieza creada:', pieza);
    return NextResponse.json(pieza);
  } catch (error) {
    console.error('Error al crear pieza:', error);
    if (error instanceof Error) {
      console.error('Detalles del error:', error.message);
      console.error('Stack trace:', error.stack);
    }
    return new NextResponse('Error interno del servidor', { status: 500 });
  }
} 