import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const cliente = await prisma.cliente.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        nombre: true,
        apellidoPaterno: true,
        apellidoMaterno: true,
        telefonoCelular: true,
        telefonoContacto: true,
        email: true,
        calle: true,
        numeroExterior: true,
        numeroInterior: true,
        colonia: true,
        ciudad: true,
        estado: true,
        codigoPostal: true,
        latitud: true,
        longitud: true,
        fuenteReferencia: true,
        rfc: true,
        activo: true,
        tipoRegistro: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!cliente) {
      return NextResponse.json(
        { error: 'Cliente no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(cliente);
  } catch (error) {
    console.error('Error al obtener perfil del cliente:', error);
    return NextResponse.json(
      { error: 'Error al obtener el perfil del cliente' },
      { status: 500 }
    );
  }
} 