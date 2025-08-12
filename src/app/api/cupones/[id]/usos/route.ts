import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

// GET /api/cupones/[id]/usos - Obtener usos de un cupón específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
    }

    // Verificar si el cupón existe
    const cupon = await prisma.cupones.findUnique({
      where: { id },
    })

    if (!cupon) {
      return NextResponse.json({ error: 'Cupón no encontrado' }, { status: 404 })
    }

    const usos = await prisma.usos_cupon.findMany({
      where: { cupon_id: id },
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            apellido_paterno: true,
            email: true,
          },
        },
        ticket: {
          select: {
            id: true,
            numero_ticket: true,
          },
        },
        venta: {
          select: {
            id: true,
            total: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    })

    return NextResponse.json(usos)
  } catch (error) {
    console.error('Error al obtener usos del cupón:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
