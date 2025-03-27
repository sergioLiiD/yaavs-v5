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

    const reparacion = await prisma.reparacionFrecuente.create({
      data: {
        nombre,
        descripcion,
        activo,
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
  } catch (error) {
    console.error("Error al crear reparación frecuente:", error)
    return NextResponse.json(
      { error: "Error al crear reparación frecuente" },
      { status: 500 }
    )
  }
} 