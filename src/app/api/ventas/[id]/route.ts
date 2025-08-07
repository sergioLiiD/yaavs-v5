import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const ventaId = parseInt(params.id);
    if (isNaN(ventaId)) {
      return NextResponse.json({ error: 'ID de venta inválido' }, { status: 400 });
    }

    const venta = await prisma.ventas.findUnique({
      where: { id: ventaId },
      include: {
        clientes: {
          select: {
            id: true,
            nombre: true,
            apellido_paterno: true,
            apellido_materno: true,
            email: true,
            telefono_celular: true
          }
        },
        usuarios: {
          select: {
            id: true,
            nombre: true,
            apellido_paterno: true
          }
        },
        detalle_ventas: {
          include: {
            productos: {
              select: {
                id: true,
                nombre: true,
                sku: true,
                descripcion: true
              }
            }
          }
        }
      }
    });

    if (!venta) {
      return NextResponse.json({ error: 'Venta no encontrada' }, { status: 404 });
    }

    return NextResponse.json(venta);
  } catch (error) {
    console.error('Error al obtener venta:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 