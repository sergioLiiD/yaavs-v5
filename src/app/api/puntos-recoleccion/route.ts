import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/puntos-recoleccion
export async function GET() {
  try {
    const puntos = await prisma.puntos_recoleccion.findMany({
      include: {
        branches: true,
      },
      where: {
        isHeadquarters: true, // Solo obtenemos los puntos principales
      },
    });

    return NextResponse.json(puntos);
  } catch (error) {
    console.error('Error al obtener puntos de recolección:', error);
    return NextResponse.json(
      { error: 'Error al obtener puntos de recolección' },
      { status: 500 }
    );
  }
}

// POST /api/puntos-recoleccion
export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    const punto = await prisma.puntos_recoleccion.create({
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email,
        url: data.url,
        schedule: data.schedule,
        location: data.location,
        isHeadquarters: data.isHeadquarters,
        isRepairPoint: data.isRepairPoint,
        parentId: data.parentId,
      },
    });

    return NextResponse.json(punto);
  } catch (error) {
    console.error('Error al crear punto de recolección:', error);
    return NextResponse.json(
      { error: 'Error al crear punto de recolección' },
      { status: 500 }
    );
  }
} 