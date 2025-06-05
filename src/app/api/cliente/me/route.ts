import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verify } from 'jsonwebtoken';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

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
    const decoded = verify(token, process.env.JWT_SECRET || 'tu_secreto_seguro_para_jwt_aqui') as { id: number, email: string };

    // Buscar el cliente en la base de datos
    const cliente = await prisma.cliente.findUnique({
      where: { 
        id: decoded.id,
        email: decoded.email,
        activo: true
      },
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
    console.error('Error al obtener información del cliente:', error);
    return NextResponse.json(
      { error: 'Error al obtener la información del cliente' },
      { status: 500 }
    );
  }
} 