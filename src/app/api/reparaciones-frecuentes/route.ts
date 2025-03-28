import { NextResponse } from "next/server"
import prisma from "@/lib/db/prisma"

export async function GET() {
  try {
    const reparaciones = await prisma.reparacionFrecuente.findMany({
      include: {
        pasos: {
          orderBy: {
            orden: "asc"
          }
        },
        productos: {
          include: {
            producto: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return NextResponse.json(reparaciones)
  } catch (error) {
    console.error("Error al obtener reparaciones frecuentes:", error)
    return NextResponse.json(
      { error: "Error al obtener reparaciones frecuentes" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { nombre, descripcion, activo, pasos, productos } = body

    // Validar campos requeridos
    if (!nombre) {
      return NextResponse.json(
        { error: "El nombre es requerido" },
        { status: 400 }
      )
    }

    if (!pasos || !Array.isArray(pasos) || pasos.length === 0) {
      return NextResponse.json(
        { error: "Debe incluir al menos un paso" },
        { status: 400 }
      )
    }

    if (!productos || !Array.isArray(productos) || productos.length === 0) {
      return NextResponse.json(
        { error: "Debe incluir al menos un producto" },
        { status: 400 }
      )
    }

    // Validar estructura de pasos
    for (const paso of pasos) {
      if (!paso.descripcion || typeof paso.descripcion !== 'string') {
        return NextResponse.json(
          { error: "Cada paso debe tener una descripción válida" },
          { status: 400 }
        )
      }
      if (typeof paso.orden !== 'number') {
        return NextResponse.json(
          { error: "Cada paso debe tener un orden válido" },
          { status: 400 }
        )
      }
    }

    // Validar estructura de productos
    for (const producto of productos) {
      if (!producto.productoId || typeof producto.productoId !== 'number') {
        return NextResponse.json(
          { error: "Cada producto debe tener un ID válido" },
          { status: 400 }
        )
      }
      if (!producto.cantidad || typeof producto.cantidad !== 'number' || producto.cantidad < 1) {
        return NextResponse.json(
          { error: "Cada producto debe tener una cantidad válida mayor a 0" },
          { status: 400 }
        )
      }
      if (typeof producto.precioVenta !== 'number' || producto.precioVenta < 0) {
        return NextResponse.json(
          { error: "Cada producto debe tener un precio de venta válido" },
          { status: 400 }
        )
      }
    }

    const reparacion = await prisma.reparacionFrecuente.create({
      data: {
        nombre,
        descripcion,
        activo: activo ?? true,
        pasos: {
          create: pasos.map((paso: { descripcion: string; orden: number }) => ({
            descripcion: paso.descripcion,
            orden: paso.orden
          }))
        },
        productos: {
          create: productos.map((producto: {
            productoId: number;
            cantidad: number;
            precioVenta: number;
            conceptoExtra?: string;
            precioConceptoExtra?: number;
          }) => ({
            productoId: producto.productoId,
            cantidad: producto.cantidad,
            precioVenta: producto.precioVenta,
            conceptoExtra: producto.conceptoExtra,
            precioConceptoExtra: producto.precioConceptoExtra
          }))
        }
      },
      include: {
        pasos: {
          orderBy: {
            orden: "asc"
          }
        },
        productos: {
          include: {
            producto: true
          }
        }
      }
    })

    return NextResponse.json(reparacion)
  } catch (error: any) {
    console.error("Error al crear reparación frecuente:", error)
    
    // Manejar errores específicos de Prisma
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: "Ya existe una reparación frecuente con este nombre" },
        { status: 400 }
      )
    }
    
    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: "Uno o más productos no existen" },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Error al crear reparación frecuente" },
      { status: 500 }
    )
  }
} 