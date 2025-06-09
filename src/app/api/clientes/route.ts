import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

// Esquema de validación para el registro de clientes
const clienteSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  apellidoPaterno: z.string().min(1, 'El apellido paterno es requerido'),
  apellidoMaterno: z.string().optional(),
  telefonoCelular: z.string().min(1, 'El teléfono celular es requerido'),
  telefonoContacto: z.string().optional(),
  email: z.string().email('Email inválido'),
  rfc: z.string().optional(),
  calle: z.string().optional(),
  numeroExterior: z.string().optional(),
  numeroInterior: z.string().optional(),
  colonia: z.string().optional(),
  ciudad: z.string().optional(),
  estado: z.string().optional(),
  codigoPostal: z.string().optional(),
  latitud: z.number().optional(),
  longitud: z.number().optional(),
  fuenteReferencia: z.string().optional(),
});

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const puntoRecoleccionId = searchParams.get('puntoRecoleccionId');

    const clientes = await prisma.cliente.findMany({
      where: {
        puntoRecoleccionId: puntoRecoleccionId ? parseInt(puntoRecoleccionId) : undefined
      },
      include: {
        tickets: true
      }
    });

    return NextResponse.json(clientes);
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    return NextResponse.json(
      { error: 'Error al obtener los clientes' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const data = await request.json();

    // Obtener el punto de recolección del usuario
    const userPoint = await prisma.usuarios_puntos_recoleccion.findFirst({
      where: {
        usuarioId: session.user.id
      },
      select: {
        puntoRecoleccionId: true
      }
    });

    if (!userPoint?.puntoRecoleccionId) {
      return NextResponse.json(
        { error: 'Usuario no asociado a un punto de recolección' },
        { status: 400 }
      );
    }

    // Crear el cliente con el punto de recolección
    const cliente = await prisma.cliente.create({
      data: {
        ...data,
        puntoRecoleccionId: userPoint.puntoRecoleccionId,
        activo: true,
        tipoRegistro: 'REGISTRO_TIENDA'
      }
    });

    return NextResponse.json(cliente);
  } catch (error) {
    console.error('Error al crear cliente:', error);
    return NextResponse.json(
      { error: 'Error al crear el cliente' },
      { status: 500 }
    );
  }
} 