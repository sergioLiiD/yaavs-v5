import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

// POST /api/cupones/apply-venta - Aplicar cupón a una venta
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { codigo, venta_id } = body

    if (!codigo || !venta_id) {
      return NextResponse.json(
        { error: 'Código y venta_id son requeridos' },
        { status: 400 }
      )
    }

    // Verificar que la venta existe
    const venta = await prisma.ventas.findUnique({
      where: { id: venta_id },
    })

    if (!venta) {
      return NextResponse.json(
        { error: 'Venta no encontrada' },
        { status: 404 }
      )
    }

    // Buscar el cupón
    const cupon = await prisma.cupones.findUnique({
      where: { codigo: codigo.toUpperCase() },
    })

    if (!cupon) {
      return NextResponse.json({
        success: false,
        mensaje: 'Cupón no encontrado',
      })
    }

    // Validar si está activo
    if (!cupon.activo) {
      return NextResponse.json({
        success: false,
        mensaje: 'Cupón inactivo',
      })
    }

    // Validar fecha de expiración
    const now = new Date()
    const fechaExpiracion = new Date(cupon.fecha_expiracion)
    
    if (fechaExpiracion < now) {
      return NextResponse.json({
        success: false,
        mensaje: 'Cupón expirado',
      })
    }

    // Validar fecha de inicio
    const fechaInicio = new Date(cupon.fecha_inicio)
    if (fechaInicio > now) {
      return NextResponse.json({
        success: false,
        mensaje: 'Cupón aún no está vigente',
      })
    }

    // Obtener el monto de la venta
    const montoVenta = venta.total

    // Validar monto mínimo
    if (cupon.monto_minimo && montoVenta < cupon.monto_minimo) {
      return NextResponse.json({
        success: false,
        mensaje: `Monto mínimo requerido: $${cupon.monto_minimo.toFixed(2)}`,
      })
    }

    // Validar límite de usos
    if (cupon.limite_usos && cupon.usos_actuales >= cupon.limite_usos) {
      return NextResponse.json({
        success: false,
        mensaje: 'Cupón agotado',
      })
    }

    // Verificar si el cupón ya fue usado en esta venta
    const usoExistente = await prisma.usos_cupon.findFirst({
      where: {
        cupon_id: cupon.id,
        venta_id: venta_id,
      },
    })

    if (usoExistente) {
      return NextResponse.json({
        success: false,
        mensaje: 'Este cupón ya fue aplicado a esta venta',
      })
    }

    // Calcular descuento
    let descuento = 0
    if (cupon.tipo_descuento === 'PORCENTAJE') {
      descuento = (montoVenta * cupon.valor_descuento) / 100
    } else {
      descuento = cupon.valor_descuento
    }

    // Asegurar que el descuento no exceda el monto total
    if (descuento > montoVenta) {
      descuento = montoVenta
    }

    // Registrar el uso del cupón
    await prisma.usos_cupon.create({
      data: {
        cupon_id: cupon.id,
        venta_id: venta_id,
        usuario_id: session.user.id,
        monto_descuento: descuento,
      },
    })

    // Actualizar contador de usos del cupón
    await prisma.cupones.update({
      where: { id: cupon.id },
      data: {
        usos_actuales: {
          increment: 1,
        },
      },
    })

    // Actualizar el total de la venta con el descuento
    await prisma.ventas.update({
      where: { id: venta_id },
      data: {
        total: {
          decrement: descuento,
        },
      },
    })

    return NextResponse.json({
      success: true,
      descuento,
      mensaje: `Descuento de $${descuento.toFixed(2)} aplicado exitosamente`,
    })
  } catch (error) {
    console.error('Error al aplicar cupón a la venta:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
