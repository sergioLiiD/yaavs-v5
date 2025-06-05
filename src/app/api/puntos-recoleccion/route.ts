import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/puntos-recoleccion
export async function GET() {
  try {
    const puntos = await prisma.puntos_recoleccion.findMany({
      include: {
        branches: true,
        parent: true,
      },
      where: {
        activo: true,
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
    
    // Validar que si no es sede principal, debe tener un parentId
    if (!data.isHeadquarters && !data.parentId) {
      return NextResponse.json(
        { error: 'Las sucursales deben tener un punto principal asignado' },
        { status: 400 }
      );
    }

    // Validar que si es sede principal, no debe tener parentId
    if (data.isHeadquarters && data.parentId) {
      return NextResponse.json(
        { error: 'Los puntos principales no pueden tener un punto principal asignado' },
        { status: 400 }
      );
    }

    // Verificar que el parentId existe si se proporciona
    if (data.parentId) {
      const parentExists = await prisma.puntos_recoleccion.findUnique({
        where: { id: data.parentId }
      });

      if (!parentExists) {
        return NextResponse.json(
          { error: 'El punto principal seleccionado no existe' },
          { status: 400 }
        );
      }
    }
    
    // Validar el formato del horario
    let schedule;
    try {
      schedule = typeof data.schedule === 'string' ? JSON.parse(data.schedule) : data.schedule;
    } catch (error) {
      return NextResponse.json(
        { error: 'El formato del horario es inválido' },
        { status: 400 }
      );
    }

    if (!schedule || typeof schedule !== 'object') {
      return NextResponse.json(
        { error: 'El horario es requerido y debe ser un objeto' },
        { status: 400 }
      );
    }

    // Validar que cada día tenga el formato correcto
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    for (const day of days) {
      const daySchedule = schedule[day];
      if (!daySchedule || typeof daySchedule !== 'object') {
        return NextResponse.json(
          { error: `El horario para ${day} es inválido` },
          { status: 400 }
        );
      }
      if (typeof daySchedule.open !== 'boolean') {
        return NextResponse.json(
          { error: `El campo 'open' para ${day} debe ser un booleano` },
          { status: 400 }
        );
      }
      if (typeof daySchedule.start !== 'string' || typeof daySchedule.end !== 'string') {
        return NextResponse.json(
          { error: `Los campos 'start' y 'end' para ${day} deben ser strings` },
          { status: 400 }
        );
      }
    }

    // Validar el formato de la ubicación
    let location;
    try {
      location = typeof data.location === 'string' ? JSON.parse(data.location) : data.location;
    } catch (error) {
      return NextResponse.json(
        { error: 'El formato de la ubicación es inválido' },
        { status: 400 }
      );
    }

    if (!location || typeof location !== 'object') {
      return NextResponse.json(
        { error: 'La ubicación es requerida y debe ser un objeto' },
        { status: 400 }
      );
    }

    if (!location.address || typeof location.address !== 'string') {
      return NextResponse.json(
        { error: 'La dirección es requerida y debe ser un string' },
        { status: 400 }
      );
    }

    if (typeof location.lat !== 'number' || typeof location.lng !== 'number') {
      return NextResponse.json(
        { error: 'Las coordenadas deben ser números' },
        { status: 400 }
      );
    }
    
    const punto = await prisma.puntos_recoleccion.create({
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email,
        url: data.url,
        schedule,
        location,
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