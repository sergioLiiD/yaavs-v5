import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { fechaInicio, fechaFin } = await request.json();

    const fechaInicioDate = new Date(fechaInicio);
    const fechaFinDate = new Date(fechaFin);
    fechaFinDate.setHours(23, 59, 59, 999);

    // Obtener compras de insumos
    const comprasInsumos = await prisma.entradas_almacen.findMany({
      where: {
        fecha_entrada: {
          gte: fechaInicioDate,
          lte: fechaFinDate
        }
      },
      include: {
        proveedores: {
          select: {
            nombre: true
          }
        },
        detalle_entradas: {
          include: {
            productos: {
              select: {
                nombre: true
              }
            }
          }
        }
      },
      orderBy: {
        fecha_entrada: 'desc'
      }
    });

    // Transformar compras de insumos
    const egresos = comprasInsumos.map(compra => {
      const productos = compra.detalle_entradas?.map(detalle => 
        `${detalle.cantidad}x ${detalle.productos?.nombre || 'Producto'} - $${detalle.precio_unitario}`
      ) || [];

      return {
        id: compra.id,
        fecha: compra.fecha_entrada.toISOString(),
        proveedor: compra.proveedores?.nombre || 'Proveedor no especificado',
        monto: compra.costo_total,
        productos,
        notas: compra.notas || undefined
      };
    });

    return NextResponse.json(egresos);
  } catch (error) {
    console.error('Error al obtener detalle de egresos:', error);
    return NextResponse.json(
      { error: 'Error al obtener el detalle de egresos' },
      { status: 500 }
    );
  }
} 