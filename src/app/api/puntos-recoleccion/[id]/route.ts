import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CollectionPoint } from '@/types/collection-point';
import { PuntoRecoleccion, Prisma } from '@prisma/client';

type PuntoRecoleccionWithRelations = PuntoRecoleccion & {
  sucursales: PuntoRecoleccion[];
  usuarios: {
    usuario: {
      id: number;
      nombre: string;
    };
  }[];
};

// GET /api/puntos-recoleccion/[id]
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "ID inválido" },
        { status: 400 }
      );
    }

    // Obtener el punto de recolección usando SQL raw
    const puntos = await prisma.$queryRaw<Array<{
      id: number;
      nombre: string;
      phone: string | null;
      email: string | null;
      url: string | null;
      is_headquarters: boolean;
      location: any;
      schedule: any;
      parent_id: number | null;
      createdAt: Date;
      updatedAt: Date;
    }>>`
      SELECT * FROM puntos_recoleccion WHERE id = ${id}
    `;

    if (puntos.length === 0) {
      return NextResponse.json(
        { error: "Punto de recolección no encontrado" },
        { status: 404 }
      );
    }

    const p = puntos[0];

    // Consulta secundaria para sucursales usando SQL raw
    const sucursales = await prisma.$queryRaw<Array<{
      id: number;
      nombre: string;
      phone: string | null;
      email: string | null;
      url: string | null;
      is_headquarters: boolean;
      location: any;
      schedule: any;
      parent_id: number | null;
      createdAt: Date;
      updatedAt: Date;
    }>>`
      SELECT * FROM puntos_recoleccion WHERE parent_id = ${id}
    `;

    // Si necesitas la sede principal (parent)
    let parent = null;
    if (p.parent_id) {
      const parentResult = await prisma.$queryRaw<Array<{
        id: number;
        nombre: string;
      }>>`
        SELECT id, nombre FROM puntos_recoleccion WHERE id = ${p.parent_id}
      `;
      if (parentResult.length > 0) {
        parent = parentResult[0];
      }
    }

    // Construye la respuesta siguiendo el estándar
    const response: CollectionPoint = {
      id: p.id,
      nombre: p.nombre,
      phone: p.phone || "",
      email: p.email || "",
      url: p.url || "",
      isHeadquarters: p.is_headquarters,
      isRepairPoint: false,
      location: p.location as any,
      schedule: p.schedule as any,
      parentId: p.parent_id || undefined,
      parent: parent ? { id: parent.id, nombre: parent.nombre } : undefined,
      children: sucursales.map(s => ({
        id: s.id,
        nombre: s.nombre,
        phone: s.phone || "",
        email: s.email || "",
        url: s.url || "",
        isHeadquarters: s.is_headquarters,
        isRepairPoint: false,
        location: s.location as any,
        schedule: s.schedule as any,
        parentId: s.parent_id || undefined,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt
      })),
      createdAt: p.createdAt,
      updatedAt: p.updatedAt
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error al obtener punto de recolección:", error);
    return NextResponse.json(
      { error: "Error al obtener punto de recolección" },
      { status: 500 }
    );
  }
}

// PUT /api/puntos-recoleccion/[id]
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const { nombre, phone, email, url, isHeadquarters, location, schedule, parentId } = body;

    // Verificar si el punto existe
    const puntos = await prisma.$queryRaw<Array<{
      id: number;
      nombre: string;
      phone: string | null;
      email: string | null;
      url: string | null;
      is_headquarters: boolean;
      location: any;
      schedule: any;
      parent_id: number | null;
      createdAt: Date;
      updatedAt: Date;
    }>>`
      SELECT * FROM puntos_recoleccion WHERE id = ${id}
    `;

    if (puntos.length === 0) {
      return NextResponse.json(
        { error: "Punto de recolección no encontrado" },
        { status: 404 }
      );
    }

    // Verificar si el parent_id es válido
    if (parentId) {
      const parentExists = await prisma.$queryRaw<Array<{ id: number }>>`
        SELECT id FROM puntos_recoleccion WHERE id = ${parentId}
      `;
      if (parentExists.length === 0) {
        return NextResponse.json(
          { error: "El punto de recolección padre no existe" },
          { status: 400 }
        );
      }
    }

    // Actualizar el punto
    await prisma.$executeRaw`
      UPDATE puntos_recoleccion
      SET nombre = ${nombre},
          phone = ${phone},
          email = ${email},
          url = ${url},
          is_headquarters = ${isHeadquarters},
          location = ${JSON.stringify(location)}::jsonb,
          schedule = ${JSON.stringify(schedule)}::jsonb,
          parent_id = ${parentId},
          updated_at = NOW()
      WHERE id = ${id}
    `;

    // Obtener el punto actualizado
    const puntosActualizados = await prisma.$queryRaw<Array<{
      id: number;
      nombre: string;
      phone: string | null;
      email: string | null;
      url: string | null;
      is_headquarters: boolean;
      location: any;
      schedule: any;
      parent_id: number | null;
      createdAt: Date;
      updatedAt: Date;
    }>>`
      SELECT * FROM puntos_recoleccion WHERE id = ${id}
    `;

    const p = puntosActualizados[0];

    // Consulta secundaria para sucursales
    const sucursales = await prisma.$queryRaw<Array<{
      id: number;
      nombre: string;
      phone: string | null;
      email: string | null;
      url: string | null;
      is_headquarters: boolean;
      location: any;
      schedule: any;
      parent_id: number | null;
      createdAt: Date;
      updatedAt: Date;
    }>>`
      SELECT * FROM puntos_recoleccion WHERE parent_id = ${id}
    `;

    // Si necesitas la sede principal (parent)
    let parent = null;
    if (p.parent_id) {
      const parentResult = await prisma.$queryRaw<Array<{
        id: number;
        nombre: string;
      }>>`
        SELECT id, nombre FROM puntos_recoleccion WHERE id = ${p.parent_id}
      `;
      if (parentResult.length > 0) {
        parent = parentResult[0];
      }
    }

    // Construye la respuesta siguiendo el estándar
    const response: CollectionPoint = {
      id: p.id,
      nombre: p.nombre,
      phone: p.phone || "",
      email: p.email || "",
      url: p.url || "",
      isHeadquarters: p.is_headquarters,
      isRepairPoint: false,
      location: p.location as any,
      schedule: p.schedule as any,
      parentId: p.parent_id || undefined,
      parent: parent ? { id: parent.id, nombre: parent.nombre } : undefined,
      children: sucursales.map(s => ({
        id: s.id,
        nombre: s.nombre,
        phone: s.phone || "",
        email: s.email || "",
        url: s.url || "",
        isHeadquarters: s.is_headquarters,
        isRepairPoint: false,
        location: s.location as any,
        schedule: s.schedule as any,
        parentId: s.parent_id || undefined,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt
      })),
      createdAt: p.createdAt,
      updatedAt: p.updatedAt
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error al actualizar punto de recolección:", error);
    return NextResponse.json(
      { error: "Error al actualizar punto de recolección" },
      { status: 500 }
    );
  }
}

// DELETE /api/puntos-recoleccion/[id]
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    // Verificar si el punto existe
    const puntos = await prisma.$queryRaw<Array<{
      id: number;
      nombre: string;
      phone: string | null;
      email: string | null;
      url: string | null;
      is_headquarters: boolean;
      location: any;
      schedule: any;
      parent_id: number | null;
      createdAt: Date;
      updatedAt: Date;
    }>>`
      SELECT * FROM puntos_recoleccion WHERE id = ${id}
    `;

    if (puntos.length === 0) {
      return NextResponse.json(
        { error: "Punto de recolección no encontrado" },
        { status: 404 }
      );
    }

    // Verificar si tiene sucursales
    const sucursales = await prisma.$queryRaw<Array<{ id: number }>>`
      SELECT id FROM puntos_recoleccion WHERE parent_id = ${id}
    `;

    if (sucursales.length > 0) {
      return NextResponse.json(
        { error: "No se puede eliminar un punto de recolección que tiene sucursales" },
        { status: 400 }
      );
    }

    // Eliminar el punto
    await prisma.$executeRaw`
      DELETE FROM puntos_recoleccion WHERE id = ${id}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al eliminar punto de recolección:", error);
    return NextResponse.json(
      { error: "Error al eliminar punto de recolección" },
      { status: 500 }
    );
  }
} 