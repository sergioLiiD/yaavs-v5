import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET() {
  try {
    const clientes = await prisma.cliente.findMany({
      orderBy: {
        nombre: 'asc',
      },
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