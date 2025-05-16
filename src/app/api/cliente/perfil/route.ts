import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse('No autorizado', { status: 401 });
    }

    // Obtenemos el cliente directamente usando el email del usuario
    const cliente = await prisma.cliente.findFirst({
      where: {
        email: session.user.email
      },
      select: {
        id: true,
        nombre: true,
        apellidoPaterno: true,
        apellidoMaterno: true,
        telefonoCelular: true,
        email: true,
        calle: true,
        numeroExterior: true,
        numeroInterior: true,
        colonia: true,
        ciudad: true,
        estado: true,
        codigoPostal: true,
        latitud: true,
        longitud: true
      }
    });

    if (!cliente) {
      return new NextResponse('Cliente no encontrado', { status: 404 });
    }

    return NextResponse.json(cliente);
  } catch (error) {
    console.error('Error al obtener perfil del cliente:', error);
    return new NextResponse('Error interno del servidor', { status: 500 });
  }
} 