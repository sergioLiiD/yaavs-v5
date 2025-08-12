import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

// POST /api/cupones/validate - Validar un cupón
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { codigo, monto } = body

    if (!codigo || monto === undefined) {
      return NextResponse.json(
        { error: 'Código y monto son requeridos' },
        { status: 400 }
      )
    }

    // Buscar el cupón
    const cupon = await prisma.cupones.findUnique({
      where: { codigo: codigo.toUpperCase() },
    })

    if (!cupon) {
      return NextResponse.json({
        valido: false,
        mensaje: 'Cupón no encontrado',
      })
    }

    // Validar si está activo
    if (!cupon.activo) {
      return NextResponse.json({
        valido: false,
        mensaje: 'Cupón inactivo',
      })
    }

    // Validar fecha de expiración
    const now = new Date()
    const fechaExpiracion = new Date(cupon.fecha_expiracion)
    
    if (fechaExpiracion < now) {
      return NextResponse.json({
        valido: false,
        mensaje: 'Cupón expirado',
      })
    }

    // Validar fecha de inicio
    const fechaInicio = new Date(cupon.fecha_inicio)
    if (fechaInicio > now) {
      return NextResponse.json({
        valido: false,
        mensaje: 'Cupón aún no está vigente',
      })
    }

    // Validar monto mínimo
    if (cupon.monto_minimo && monto < cupon.monto_minimo) {
      return NextResponse.json({
        valido: false,
        mensaje: `Monto mínimo requerido: $${cupon.monto_minimo.toFixed(2)}`,
      })
    }

    // Validar límite de usos
    if (cupon.limite_usos && cupon.usos_actuales >= cupon.limite_usos) {
      return NextResponse.json({
        valido: false,
        mensaje: 'Cupón agotado',
      })
    }

    // Calcular descuento
    let descuento = 0
    if (cupon.tipo_descuento === 'PORCENTAJE') {
      descuento = (monto * cupon.valor_descuento) / 100
    } else {
      descuento = cupon.valor_descuento
    }

    // Asegurar que el descuento no exceda el monto total
    if (descuento > monto) {
      descuento = monto
    }

    return NextResponse.json({
      valido: true,
      cupon: {
        id: cupon.id,
        codigo: cupon.codigo,
        nombre: cupon.nombre,
        tipo: cupon.tipo,
        tipo_descuento: cupon.tipo_descuento,
        valor_descuento: cupon.valor_descuento,
      },
      descuento,
      mensaje: `Descuento aplicado: $${descuento.toFixed(2)}`,
    })
  } catch (error) {
    console.error('Error al validar cupón:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
