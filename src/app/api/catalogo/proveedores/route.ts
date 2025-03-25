import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const proveedores = await prisma.proveedor.findMany({
      orderBy: {
        nombre: 'asc'
      }
    });

    return NextResponse.json(proveedores);
  } catch (error) {
    console.error('Error al obtener proveedores:', error);
    return NextResponse.json(
      { error: 'Error al obtener proveedores' },
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
    const proveedor = await prisma.proveedor.create({
      data: {
        tipo: data.tipo,
        nombre: data.nombre,
        personaResponsable: data.personaResponsable,
        telefono: data.telefono,
        email: data.email,
        direccion: data.direccion,
        rfc: data.rfc,
        banco: data.banco,
        cuentaBancaria: data.cuentaBancaria,
        clabeInterbancaria: data.clabeInterbancaria
      }
    });

    return NextResponse.json(proveedor);
  } catch (error) {
    console.error('Error al crear proveedor:', error);
    return NextResponse.json(
      { error: 'Error al crear proveedor' },
      { error: 'Error al crear el proveedor' },
      { status: 500 }
    );
  }
} 