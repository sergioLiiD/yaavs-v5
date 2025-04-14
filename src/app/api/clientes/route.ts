import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db/prisma';
import { Prisma } from '@prisma/client';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('No autorizado', { status: 401 });
    }

    const clientes = await prisma.cliente.findMany({
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
        rfc: true
      },
      orderBy: {
        nombre: 'asc'
      }
    });

    return NextResponse.json(clientes);
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Error al obtener clientes' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Limpiamos los campos undefined para que no interfieran con los campos opcionales
    const cleanedData = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => value !== undefined)
    ) as Prisma.ClienteCreateInput;

    const cliente = await prisma.cliente.create({
      data: cleanedData,
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